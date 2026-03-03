// server.js - Web UI Server
const express = require('express');
const path = require('path');
const net = require('net');

const app = express();
const DEFAULT_PORT = 3000;
const MAX_PORT = 3010; // 最多尝试到3010

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api', require('./src/api'));

// Find available port
function findAvailablePort(startPort, callback) {
  const server = net.createServer();

  server.listen(startPort, () => {
    server.once('close', () => {
      callback(startPort);
    });
    server.close();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`端口 ${startPort} 已被占用，尝试下一个端口...`);
      if (startPort < MAX_PORT) {
        findAvailablePort(startPort + 1, callback);
      } else {
        console.error('无法找到可用端口');
        process.exit(1);
      }
    } else {
      console.error('端口检查错误:', err);
      process.exit(1);
    }
  });
}

// Start server
findAvailablePort(DEFAULT_PORT, (port) => {
  app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
  });
});
