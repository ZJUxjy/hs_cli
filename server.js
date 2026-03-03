// server.js - Web UI Server
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes (to be added)
app.use('/api', require('./src/api'));

// Start server
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
