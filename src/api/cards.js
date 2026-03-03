// src/api/cards.js - Card API
const express = require('express');
const router = express.Router();
const CardData = require('../data/CardData');

router.get('/', (req, res) => {
  res.json(CardData.getAllCards());
});

router.get('/class/:cls', (req, res) => {
  const cards = CardData.getCardsByClass(req.params.cls);
  res.json(cards);
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
