// src/api/decks.js - Deck API
const express = require('express');
const router = express.Router();
const DeckBuilder = require('../data/DeckBuilder');

router.get('/', (req, res) => {
  res.json(DeckBuilder.list());
});

router.post('/', (req, res) => {
  const { name, hero, mode } = req.body;
  const deck = DeckBuilder.create(name, hero, mode || 'standard');
  res.json(deck);
});

router.get('/:id', (req, res) => {
  const deck = DeckBuilder.getDeck(req.params.id);
  if (deck) {
    res.json(deck);
  } else {
    res.status(404).json({ error: 'Deck not found' });
  }
});

router.put('/:id', (req, res) => {
  const deck = DeckBuilder.update(req.params.id, req.body);
  res.json(deck);
});

router.delete('/:id', (req, res) => {
  DeckBuilder.delete(req.params.id);
  res.json({ success: true });
});

router.post('/:id/cards', (req, res) => {
  const { cardId } = req.body;
  if (!cardId) {
    return res.status(400).json({ error: 'cardId is required' });
  }
  const deck = DeckBuilder.addCard(req.params.id, cardId);
  if (!deck) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  res.json(deck);
});

// Remove a card from deck
router.delete('/:id/cards', (req, res) => {
  const { cardId } = req.body;
  if (!cardId) {
    return res.status(400).json({ error: 'cardId is required' });
  }
  const deck = DeckBuilder.removeCard(req.params.id, cardId);
  if (!deck) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  res.json(deck);
});

module.exports = router;
