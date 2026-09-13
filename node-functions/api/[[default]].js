import express from 'express';

const app = express();

const DUFS_SERVERS = {
  'xz.posw.cn': 'https://xz.posw.cn',
  'xz.pcpos.cn': 'https://xz.pcpos.cn'
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.json({
    name: 'Dufs API',
    version: '1.0.0',
    servers: Object.keys(DUFS_SERVERS),
    usage: '/files?server=xz.posw.cn&path=/',
    debug: '/debug?server=xz.posw.cn&path=/'
  });
});

app.get('/debug', async (req, res) => {
  const { server = 'xz.posw.cn', path = '/' } = req.query;
  const baseUrl = DUFS_SERVERS[server];
  
  const logs = [];
  logs.push({ step: '1. 开始调试', time: new Date().toISOString() });
  logs.push({ step: '2. 服务器配置', server, baseUrl, path });
  
  if (!baseUrl) {
    logs.push({ step: '3. 错误: 未知服务器', error: `Unknown server: ${server}` });
    return res.json({ success: false, logs });
  }
  
  let url = `${baseUrl}/${path.replace(/^\//, '').replace(/\/$/, '')}`;
  logs.push({ step: '3. 请求URL', url });
  
  try {
    logs.push({ step: '4. 发送请求...', time: new Date().toISOString() });
    const response = await fetch(url);
    logs.push({ step: '5. 收到响应', status: response.status, statusText: response.statusText });
    
    const text = await response.text();
    logs.push({ step: '6. 响应内容长度', length: text.length });
    logs.push({ step: '7. 响应前200字符', preview: text.substring(0, 200) });
    
    if (!response.ok) {
      logs.push({ step: '8. 错误: HTTP状态码非200', error: response.statusText });
      return res.json({ success: false, logs });
    }
    
    let data;
    try {
      data = JSON.parse(text);
      logs.push({ step: '8. JSON解析成功', keys: Object.keys(data) });
      logs.push({ step: '9. paths数组', count: (data.paths || []).length });
    } catch (e) {
      logs.push({ step: '8. 错误: JSON解析失败', error: e.message });
      return res.json({ success: false, logs });
    }
    
    logs.push({ step: '10. 完成', time: new Date().toISOString() });
    res.json({ success: true, logs, data });
  } catch (error) {
    logs.push({ step: '错误', error: error.message, stack: error.stack });
    res.json({ success: false, logs });
  }
});

app.get('/files', async (req, res) => {
  try {
    const { server = 'xz.posw.cn', path = '/', q } = req.query;
    
    const baseUrl = DUFS_SERVERS[server];
    if (!baseUrl) {
      return res.status(400).json({
        error: `Unknown server: ${server}`,
        available: Object.keys(DUFS_SERVERS)
      });
    }
    
    let url = `${baseUrl}/${path.replace(/^\//, '').replace(/\/$/, '')}`;
    
    const params = new URLSearchParams();
    if (q) {
      params.append('q', q);
    }
    params.append('json', 'true');
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url);
    const text = await response.text();
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Dufs server error: ${response.statusText}`,
        debug: { url, status: response.status, body: text.substring(0, 500) }
      });
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: 'Invalid JSON from dufs server',
        debug: { url, body: text.substring(0, 500) }
      });
    }
    
    const files = (data.paths || []).map(item => ({
      name: item.name,
      path: item.path_type === 'Dir' ? `${path}${item.name}/` : `${path}${item.name}`,
      isDir: item.path_type === 'Dir',
      size: item.size,
      mtime: item.mtime
    }));
    
    res.json({
      server,
      path,
      files,
      total: files.length
    });
  } catch (error) {
    res.status(503).json({
      error: `Cannot connect to dufs server: ${error.message}`
    });
  }
});

export default app;
