// server.js - High performance zero-dependency static server with auto-port fallback
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function resolvePath(urlPath) {
  let decoded = decodeURIComponent(urlPath.split('?')[0]);
  let safePath = path.normalize(decoded).replace(/^(\.\.[\/\\])+/, '');
  let fullPath = path.join(ROOT, safePath);

  // If path is a directory, try index.html
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    const indexPath = path.join(fullPath, 'index.html');
    if (fs.existsSync(indexPath)) return indexPath;
  }

  // If exact file exists
  if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
    return fullPath;
  }

  // Try appending .html
  if (fs.existsSync(fullPath + '.html')) {
    return fullPath + '.html';
  }

  // Try path/index.html
  const nestedIndex = path.join(fullPath, 'index.html');
  if (fs.existsSync(nestedIndex)) {
    return nestedIndex;
  }

  return null;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const filePath = resolvePath(req.url);

  if (!filePath) {
    const notFoundPage = path.join(ROOT, 'index.html');
    if (fs.existsSync(notFoundPage)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFoundPage).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache'
  });

  fs.createReadStream(filePath).pipe(res);
});

function openBrowser(url) {
  const startCmd = process.platform === 'win32' ? 'start ""' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  exec(`${startCmd} ${url}`);
}

function startServer(portToTry) {
  server.listen(portToTry, () => {
    const url = `http://localhost:${portToTry}`;
    console.log(`\n===========================================`);
    console.log(`🚀 Fatima Rashid Portfolio is LIVE!`);
    console.log(`👉 Link: ${url}`);
    console.log(`===========================================\n`);
    console.log(`Website browser mein open ho rahi hai...`);
    console.log(`(Band karne ke liye is window ko close kar dein ya Ctrl+C dabayein)\n`);

    if (process.argv.includes('--open')) {
      openBrowser(url);
    }
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} pehle se use mein hai, agla port try kar rahe hain...`);
    PORT++;
    startServer(PORT);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
