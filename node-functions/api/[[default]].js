import express from 'express';

const app = express();

const DUFS_BASE_URL = process.env.DUFS_BASE_URL || 'http://127.0.0.1:5000';

app.get('/', (req, res) => {
  res.json({
    name: 'Dufs API',
    version: '1.0.0',
    usage: {
      list: '/files?path=/',
      search: '/files?path=/&q=*.txt'
    }
  });
});

app.get('/files', async (req, res) => {
  try {
    const { path = '/', q } = req.query;
    
    let url = `${DUFS_BASE_URL}/${path.replace(/^\//, '')}`;
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
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Dufs server error: ${response.statusText}`
      });
    }
    
    const data = await response.json();
    
    const files = (data.paths || []).map(filePath => {
      const name = filePath.split('/').pop() || filePath;
      const isDir = filePath.endsWith('/');
      const downloadUrl = `${DUFS_BASE_URL}/${filePath}`;
      
      return {
        name,
        path: filePath,
        isDir,
        url: downloadUrl
      };
    });
    
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

export default app;
