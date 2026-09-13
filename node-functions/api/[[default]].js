import express from 'express';

const app = express();

const DUFS_BASE_URL = process.env.DUFS_BASE_URL || 'http://127.0.0.1:5000';
const DUFS_AUTH_USER = process.env.DUFS_AUTH_USER || '';
const DUFS_AUTH_PASS = process.env.DUFS_AUTH_PASS || '';

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Dufs API Server',
    version: '1.0.0',
    dufs_server: DUFS_BASE_URL
  });
});

app.get('/files', async (req, res) => {
  try {
    const { path = '/', search, simple = false } = req.query;
    
    let url = `${DUFS_BASE_URL}/${path.replace(/^\//, '')}`;
    const params = new URLSearchParams();
    
    if (search) {
      params.append('q', search);
    }
    
    if (simple === 'true') {
      params.append('simple', 'true');
    } else {
      params.append('json', 'true');
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const headers = {};
    if (DUFS_AUTH_USER && DUFS_AUTH_PASS) {
      const auth = Buffer.from(`${DUFS_AUTH_USER}:${DUFS_AUTH_PASS}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Dufs server returned error: ${response.statusText}`
      });
    }
    
    let files;
    
    if (simple === 'true') {
      const text = await response.text();
      const fileNames = text.trim().split('\n').filter(Boolean);
      files = fileNames.map(name => ({
        name,
        path: `${path.replace(/\/$/, '')}/${name}`,
        is_dir: name.endsWith('/')
      }));
    } else {
      const data = await response.json();
      files = (data.paths || []).map(filePath => {
        const name = filePath.split('/').pop() || filePath;
        const is_dir = filePath.endsWith('/');
        return { name, path: filePath, is_dir };
      });
    }
    
    res.json({
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

app.get('/search', async (req, res) => {
  const { pattern, path = '/' } = req.query;
  
  if (!pattern) {
    return res.status(400).json({ error: 'pattern is required' });
  }
  
  req.query.search = pattern;
  req.query.path = path;
  
  return app.handle(req, res);
});

app.get('/file-info', async (req, res) => {
  try {
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'path is required' });
    }
    
    const url = `${DUFS_BASE_URL}/${path.replace(/^\//, '')}`;
    
    const headers = {};
    if (DUFS_AUTH_USER && DUFS_AUTH_PASS) {
      const auth = Buffer.from(`${DUFS_AUTH_USER}:${DUFS_AUTH_PASS}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    const response = await fetch(`${url}?json=true`, { headers });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        path,
        type: 'directory',
        contents: data.paths || []
      });
    } else if (response.status === 404) {
      const headResponse = await fetch(url, { method: 'HEAD', headers });
      
      if (headResponse.ok) {
        res.json({
          path,
          type: 'file',
          headers: Object.fromEntries(headResponse.headers.entries())
        });
      } else {
        res.status(404).json({ error: 'File or directory not found' });
      }
    } else {
      res.status(response.status).json({
        error: `Dufs server returned error: ${response.statusText}`
      });
    }
  } catch (error) {
    res.status(503).json({
      error: `Cannot connect to dufs server: ${error.message}`
    });
  }
});

app.get('/health', async (req, res) => {
  try {
    const response = await fetch(DUFS_BASE_URL, { signal: AbortSignal.timeout(5000) });
    
    res.json({
      status: 'healthy',
      dufs_server: DUFS_BASE_URL,
      dufs_status: response.status
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      dufs_server: DUFS_BASE_URL,
      error: error.message
    });
  }
});

export default app;
