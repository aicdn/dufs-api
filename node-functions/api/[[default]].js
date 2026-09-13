import express from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const DUFS_BASE_URL = process.env.DUFS_BASE_URL || 'http://127.0.0.1:5000';
const DUFS_AUTH_USER = process.env.DUFS_AUTH_USER || '';
const DUFS_AUTH_PASS = process.env.DUFS_AUTH_PASS || '';

app.use(express.json());

const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dufs API - 使用文档</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .content { padding: 40px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #667eea; font-size: 1.5rem; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #eee; }
        .section h3 { color: #555; font-size: 1.2rem; margin: 20px 0 10px; }
        .endpoint { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px 20px; margin: 15px 0; border-radius: 0 8px 8px 0; }
        .endpoint .method { display: inline-block; background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; margin-right: 10px; }
        .endpoint .path { font-family: monospace; color: #333; font-weight: 500; }
        .endpoint .description { color: #666; margin-top: 8px; font-size: 0.95rem; }
        pre { background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 0.9rem; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        pre code { background: none; padding: 0; }
        .env-var { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; flex-wrap: wrap; }
        .env-var:last-child { border-bottom: none; }
        .env-var .name { font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 4px; min-width: 180px; font-weight: 500; }
        .env-var .desc { color: #666; margin-left: 15px; }
        .badge { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; margin-left: 10px; }
        .badge.optional { background: #6c757d; }
        .footer { background: #f8f9fa; padding: 20px 40px; text-align: center; color: #666; font-size: 0.9rem; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; transition: transform 0.2s, box-shadow 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
        .tree { font-family: monospace; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
        .tree .folder { color: #667eea; font-weight: bold; }
        .tree .file { color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dufs API</h1>
            <p>基于 EdgeOne Pages 的 dufs 文件服务器代理 API</p>
        </div>
        <div class="content">
            <div class="section">
                <h2>功能特性</h2>
                <ul>
                    <li>列出 dufs 服务器中的文件和目录</li>
                    <li>搜索文件</li>
                    <li>获取文件/目录信息</li>
                    <li>健康检查端点</li>
                    <li>支持认证</li>
                    <li>部署在 EdgeOne Pages (Serverless)</li>
                </ul>
            </div>
            <div class="section">
                <h2>项目结构</h2>
                <div class="tree">
                    <div><span class="folder">dufs-api/</span></div>
                    <div>&nbsp;&nbsp;├── <span class="folder">node-functions/</span></div>
                    <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span class="folder">api/</span></div>
                    <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <span class="file">[[default]].js</span> &nbsp;&nbsp;<span class="badge">Express 应用</span></div>
                    <div>&nbsp;&nbsp;├── <span class="file">edgeone.json</span> &nbsp;&nbsp;<span class="badge">EdgeOne 配置</span></div>
                    <div>&nbsp;&nbsp;├── <span class="file">package.json</span></div>
                    <div>&nbsp;&nbsp;└── <span class="file">README.md</span></div>
                </div>
            </div>
            <div class="section">
                <h2>部署到 EdgeOne Pages</h2>
                <h3>前置要求</h3>
                <ul>
                    <li>EdgeOne Pages 账号</li>
                    <li>已安装 EdgeOne CLI</li>
                    <li>Git 仓库</li>
                </ul>
                <h3>部署步骤</h3>
                <pre><code># 1. 克隆仓库
git clone https://github.com/your-repo/dufs-api.git
cd dufs-api

# 2. 安装依赖
npm install

# 3. 登录 EdgeOne
edgeone login

# 4. 创建项目
edgeone pages create

# 5. 连接 Git 仓库并部署</code></pre>
            </div>
            <div class="section">
                <h2>环境变量</h2>
                <div class="env-var">
                    <span class="name">DUFS_BASE_URL</span>
                    <span class="desc">dufs 服务器地址，例如: <code>https://your-dufs-server.com</code></span>
                </div>
                <div class="env-var">
                    <span class="name">DUFS_AUTH_USER</span>
                    <span class="desc">认证用户名 <span class="badge optional">可选</span></span>
                </div>
                <div class="env-var">
                    <span class="name">DUFS_AUTH_PASS</span>
                    <span class="desc">认证密码 <span class="badge optional">可选</span></span>
                </div>
            </div>
            <div class="section">
                <h2>API 端点</h2>
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/api/</span>
                    <div class="description">根路径 - 返回 API 基本信息</div>
                </div>
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/api/files?path=/&search=*.txt&simple=false</span>
                    <div class="description">列出文件 - 获取指定目录下的文件列表</div>
                </div>
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/api/search?pattern=*.txt&path=/</span>
                    <div class="description">搜索文件 - 按模式搜索文件</div>
                </div>
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/api/file-info?path=/path/to/file</span>
                    <div class="description">获取文件信息</div>
                </div>
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/api/health</span>
                    <div class="description">健康检查</div>
                </div>
            </div>
            <div class="section">
                <h2>使用示例</h2>
                <pre><code># 列出根目录文件
curl https://your-project.edgeone.app/api/files?path=/

# 搜索 txt 文件
curl https://your-project.edgeone.app/api/search?pattern=*.txt

# 健康检查
curl https://your-project.edgeone.app/api/health</code></pre>
            </div>
        </div>
        <div class="footer">
            <p>Dufs API - 基于 EdgeOne Pages 的文件服务器代理</p>
        </div>
    </div>
</body>
</html>`;

app.get('/', (req, res) => {
  res.type('html').send(indexHtml);
});

app.get('/files', async (req, res) => {
  try {
    const { path = '/', search, simple = false } = req.query;
    let url = \`\${DUFS_BASE_URL}/\${path.replace(/^\\//, '')}\`;
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (simple === 'true') {
      params.append('simple', 'true');
    } else {
      params.append('json', 'true');
    }
    const queryString = params.toString();
    if (queryString) url += \`?\${queryString}\`;
    const headers = {};
    if (DUFS_AUTH_USER && DUFS_AUTH_PASS) {
      headers['Authorization'] = \`Basic \${Buffer.from(\`\${DUFS_AUTH_USER}:\${DUFS_AUTH_PASS}\`).toString('base64')}\`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      return res.status(response.status).json({ error: \`Dufs server error: \${response.statusText}\` });
    }
    let files;
    if (simple === 'true') {
      const text = await response.text();
      const fileNames = text.trim().split('\\n').filter(Boolean);
      files = fileNames.map(name => ({
        name,
        path: \`\${path.replace(/\\/$/, '')}/\${name}\`,
        is_dir: name.endsWith('/')
      }));
    } else {
      const data = await response.json();
      files = (data.paths || []).map(filePath => {
        const name = filePath.split('/').pop() || filePath;
        return { name, path: filePath, is_dir: filePath.endsWith('/') };
      });
    }
    res.json({ path, files, total: files.length });
  } catch (error) {
    res.status(503).json({ error: \`Cannot connect to dufs server: \${error.message}\` });
  }
});

app.get('/search', async (req, res) => {
  const { pattern, path = '/' } = req.query;
  if (!pattern) return res.status(400).json({ error: 'pattern is required' });
  req.query.search = pattern;
  req.query.path = path;
  return app.handle(req, res);
});

app.get('/file-info', async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) return res.status(400).json({ error: 'path is required' });
    const url = \`\${DUFS_BASE_URL}/\${path.replace(/^\\//, '')}\`;
    const headers = {};
    if (DUFS_AUTH_USER && DUFS_AUTH_PASS) {
      headers['Authorization'] = \`Basic \${Buffer.from(\`\${DUFS_AUTH_USER}:\${DUFS_AUTH_PASS}\`).toString('base64')}\`;
    }
    const response = await fetch(\`\${url}?json=true\`, { headers });
    if (response.ok) {
      const data = await response.json();
      res.json({ path, type: 'directory', contents: data.paths || [] });
    } else if (response.status === 404) {
      const headResponse = await fetch(url, { method: 'HEAD', headers });
      if (headResponse.ok) {
        res.json({ path, type: 'file', headers: Object.fromEntries(headResponse.headers.entries()) });
      } else {
        res.status(404).json({ error: 'File or directory not found' });
      }
    } else {
      res.status(response.status).json({ error: \`Dufs server error: \${response.statusText}\` });
    }
  } catch (error) {
    res.status(503).json({ error: \`Cannot connect to dufs server: \${error.message}\` });
  }
});

app.get('/health', async (req, res) => {
  try {
    const response = await fetch(DUFS_BASE_URL, { signal: AbortSignal.timeout(5000) });
    res.json({ status: 'healthy', dufs_server: DUFS_BASE_URL, dufs_status: response.status });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', dufs_server: DUFS_BASE_URL, error: error.message });
  }
});

export default app;
