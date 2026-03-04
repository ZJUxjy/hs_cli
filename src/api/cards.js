// src/api/cards.js - Card API
const express = require('express');
const router = express.Router();
const CardData = require('../data/CardData');
const fs = require('fs');
const path = require('path');

// 加载翻译数据
let translationCache = null;
function getTranslation() {
  if (!translationCache) {
    const transPath = path.join(__dirname, '../../data/cards/translation.json');
    try {
      translationCache = JSON.parse(fs.readFileSync(transPath, 'utf8'));
    } catch (e) {
      translationCache = {};
    }
  }
  return translationCache;
}

router.get('/', (req, res) => {
  res.json(CardData.getAllCards());
});

router.get('/class/:cls', (req, res) => {
  const cards = CardData.getCardsByClass(req.params.cls);
  res.json(cards);
});

router.get('/translation', (req, res) => {
  const locale = req.query.locale || 'zh';
  // 目前只支持中文
  if (locale === 'zh') {
    res.json(getTranslation());
  } else {
    res.json({});
  }
});

router.get('/:id', (req, res) => {
  const card = CardData.getCard(req.params.id);
  if (card) {
    res.json(card);
  } else {
    res.status(404).json({ error: 'Card not found' });
  }
});

module.exports = router;
