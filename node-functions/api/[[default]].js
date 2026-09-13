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
    usage: '/files?server=xz.posw.cn&path=/'
  });
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
    
    console.log('Fetching:', url);
    
    const response = await fetch(url);
    const text = await response.text();
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Dufs server error: ${response.statusText}`
      });
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: 'Invalid JSON from dufs server'
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
    console.error('Error:', error.message);
    res.status(503).json({
      error: `Cannot connect to dufs server: ${error.message}`
    });
  }
});

export default app;
