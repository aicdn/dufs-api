# Dufs API - EdgeOne Pages

A Node.js/Express-based proxy server for listing files from a dufs file server, deployed on EdgeOne Pages.

## Features

- List files and directories from dufs server
- Search for files
- Get file/directory information
- Health check endpoint
- Support for authentication
- Deployed on EdgeOne Pages (Serverless)

## Project Structure

```
dufs-api/
├── node-functions/
│   └── api/
│       └── [[default]].js   # Express application
├── edgeone.json             # EdgeOne Pages configuration
├── package.json
└── README.md
```

## Deployment to EdgeOne Pages

### Prerequisites

1. EdgeOne Pages account
2. EdgeOne CLI installed (`npm install -g @edgeone/cli`)
3. Git repository

### Deploy Steps

1. Push this repository to your Git provider (GitHub, GitLab, etc.)

2. Login to EdgeOne Pages:
   ```bash
   edgeone login
   ```

3. Create a new project:
   ```bash
   edgeone pages create
   ```

4. Connect your Git repository and deploy

### Environment Variables

Set the following environment variables in EdgeOne Pages dashboard:

- `DUFS_BASE_URL`: URL of your dufs server (e.g., `https://your-dufs-server.com`)
- `DUFS_AUTH_USER`: Username for dufs authentication (if required)
- `DUFS_AUTH_PASS`: Password for dufs authentication (if required)

## API Endpoints

### Root
```
GET /
```

### List Files
```
GET /files?path=/&search=*.txt&simple=false
```

### Search Files
```
GET /search?pattern=*.txt&path=/
```

### Get File Info
```
GET /file-info?path=/path/to/file
```

### Health Check
```
GET /health
```

## Example Response

```json
{
  "path": "/",
  "files": [
    {
      "name": "file.txt",
      "path": "/file.txt",
      "is_dir": false
    }
  ],
  "total": 1
}
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export DUFS_BASE_URL=http://127.0.0.1:5000
   ```

3. Run the development server:
   ```bash
   edgeone pages dev
   ```

4. Visit `http://localhost:8088` to view the application
