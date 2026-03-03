// src/api/game.js - Game API
const express = require('express');
const router = express.Router();
const GameEngine = require('../game/GameEngine');
const i18n = require('../i18n');

// Store current game instance (simple implementation)
let currentGame = null;

router.post('/start', async (req, res) => {
  const { playerClass, opponentClass, difficulty, locale = 'zh' } = req.body;
  await i18n.init(locale);  // 初始化语言
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
  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }
  const gameState = currentGame.playCard(cardIndex);
  res.json(gameState || { error: 'Failed to play card' });
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

// 语言切换端点
router.post('/locale', async (req, res) => {
  const { locale } = req.body;
  const success = await i18n.setLocale(locale);
  res.json({ success, locale: i18n.getLocale() });
});

// 获取当前语言
router.get('/locale', (req, res) => {
  res.json({ locale: i18n.getLocale(), supportedLocales: i18n.getSupportedLocales() });
});

module.exports = router;
