// src/api/game.js - Game API
const express = require('express');
const router = express.Router();
const GameEngine = require('../game/GameEngine');

// Store current game instance (simple implementation)
let currentGame = null;

router.post('/start', (req, res) => {
  const { playerClass, opponentClass, difficulty } = req.body;
  currentGame = new GameEngine();
  currentGame.startNewGame(playerClass, opponentClass, difficulty);
  res.json(currentGame.getGameState());
});

router.get('/state', (req, res) => {
  if (currentGame) {
    res.json(currentGame.getGameState());
  } else {
    res.status(400).json({ error: 'No active game' });
  }
});

router.post('/play', (req, res) => {
  const { cardIndex } = req.body;
  // Implement play card logic
  res.json(currentGame ? currentGame.getGameState() : { error: 'No active game' });
});

router.post('/attack', (req, res) => {
  const { attackerIndex, targetIndex, targetType } = req.body;
  // Implement attack logic
  res.json(currentGame ? currentGame.getGameState() : { error: 'No active game' });
});

router.post('/endTurn', (req, res) => {
  // End turn logic
  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }
  currentGame.endTurn();
  res.json(currentGame.getGameState());
});

router.post('/heroPower', (req, res) => {
  // Hero power logic
  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }
  // Placeholder - actual implementation would use GameEngine's hero power
  res.json(currentGame.getGameState());
});

router.post('/concede', (req, res) => {
  // Concede logic
  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }
  currentGame.state.player.health = 0;
  res.json(currentGame.getGameState());
});

module.exports = router;
