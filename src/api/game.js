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

  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }

  const state = currentGame.getGameState();
  const player = state.player;

  // Check if attacker is valid
  if (attackerIndex < 0 || attackerIndex >= player.field.length) {
    return res.status(400).json({ error: 'Invalid attacker index' });
  }

  const attacker = player.field[attackerIndex];

  // Check if attacker can attack
  if (!attacker.canAttack || attacker.hasAttacked || attacker.sleeping || attacker.frozen) {
    return res.status(400).json({ error: 'Attacker cannot attack' });
  }

  try {
    if (targetType === 'hero') {
      // Attack enemy hero
      currentGame.attackHero(player, attacker);
    } else if (targetType === 'minion') {
      // Attack enemy minion
      const opponent = state.ai;
      if (targetIndex < 0 || targetIndex >= opponent.field.length) {
        return res.status(400).json({ error: 'Invalid target index' });
      }
      const target = opponent.field[targetIndex];
      currentGame.attackMinion(player, attacker, target);
    }

    res.json(currentGame.getGameState());
  } catch (err) {
    console.error('Attack error:', err);
    res.status(500).json({ error: err.message });
  }
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

// 抉择选择
router.post('/choose', (req, res) => {
  const { option } = req.body;
  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }
  const gameState = currentGame.chooseOption(option);
  res.json(gameState);
});

// 获取当前抉择状态
router.get('/choice', (req, res) => {
  if (!currentGame || !currentGame.state.pendingChoice) {
    return res.json({ pending: false });
  }
  res.json({
    pending: true,
    card: currentGame.state.pendingChoice.card,
    choice1: currentGame.state.pendingChoice.choice1,
    choice2: currentGame.state.pendingChoice.choice2
  });
});

// 发现机制 - 选择发现的卡牌
router.post('/discover', (req, res) => {
  const { optionIndex } = req.body;
  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }
  const gameState = currentGame.selectDiscover(optionIndex);
  res.json(gameState);
});

// 获取当前发现状态
router.get('/discover', (req, res) => {
  if (!currentGame || !currentGame.state.pendingDiscover) {
    return res.json({ pending: false });
  }
  res.json({
    pending: true,
    options: currentGame.state.pendingDiscover.options.map(c => ({
      id: c.id,
      name: c.name,
      cost: c.cost,
      description: c.description
    }))
  });
});

// 保存游戏
router.post('/save', (req, res) => {
  const { profileId = 'default' } = req.body;
  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }
  try {
    const saveId = currentGame.saveCurrentGame(profileId);
    res.json({ success: true, saveId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取存档列表
router.get('/saves', (req, res) => {
  const { profileId = 'default' } = req.query;
  try {
    const ProfileData = require('../data/ProfileData');
    const profile = ProfileData.loadProfile(profileId);
    const saves = profile.gameSaves || [];
    res.json({ saves });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 加载游戏
router.post('/load', (req, res) => {
  const { saveId, profileId = 'default' } = req.body;
  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }
  try {
    currentGame.loadFromSave(profileId, saveId);
    res.json(currentGame.getGameState());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
