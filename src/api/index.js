// src/api/index.js - API Router
const express = require('express');
const router = express.Router();
const ConfigData = require('../data/ConfigData');

router.use('/cards', require('./cards'));
router.use('/decks', require('./decks'));
router.use('/game', require('./game'));

// 获取所有职业
router.get('/classes', (req, res) => {
  const classes = ConfigData.getAllClasses();
  res.json(classes);
});

module.exports = router;
