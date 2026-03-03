const express = require('express');
const CardEffect = require('../game/CardEffect');

// 有效的职业和难度配置
const VALID_PLAYER_CLASSES = ['mage', 'warrior'];
const VALID_DIFFICULTIES = ['easy', 'normal', 'hard'];

class RLServer {
  constructor(gameEngine, port = 3000) {
    // 验证 gameEngine 参数
    if (!gameEngine || typeof gameEngine.startNewGame !== 'function' || typeof gameEngine.getGameState !== 'function') {
      throw new Error('Invalid gameEngine: must have startNewGame and getGameState methods');
    }

    this.app = express();
    this.game = gameEngine;
    this.port = port;
    this.server = null;
    this.currentState = null;
    this.lastReward = 0;

    this.app.use(express.json());

    // 注册路由
    this.registerRoutes();
  }

  registerRoutes() {
    this.app.post('/reset', this.reset.bind(this));
    this.app.post('/step', this.step.bind(this));
    this.app.get('/action_space', this.getActionSpace.bind(this));
    this.app.get('/observation_space', this.getObservationSpace.bind(this));
    this.app.get('/game_state', this.getGameState.bind(this));
  }

  start() {
    return new Promise((resolve, reject) => {
      const tryListen = (port) => {
        const server = this.app.listen(port);

        server.on('listening', () => {
          this.server = server;
          this.port = server.address().port;
          console.log(`RL Server running on port ${this.port}`);
          resolve(this.port);
        });

        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}...`);
            tryListen(port + 1);
          } else {
            reject(err);
          }
        });
      };

      tryListen(this.port);
    });
  }

  // 优雅关闭服务器
  stop() {
    return new Promise(resolve => {
      if (this.server) {
        this.server.close(() => {
          console.log('RL Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Reset the game
  reset(req, res) {
    try {
      const { player_class = 'mage', opponent_class = 'warrior', difficulty = 'normal' } = req.body;

      // 验证 player_class 参数
      if (!VALID_PLAYER_CLASSES.includes(player_class)) {
        console.error(`Invalid player_class: ${player_class}. Valid options: ${VALID_PLAYER_CLASSES.join(', ')}`);
        return res.status(400).json({ error: `Invalid player_class: ${player_class}. Valid options: ${VALID_PLAYER_CLASSES.join(', ')}` });
      }

      // 验证 opponent_class 参数
      if (!VALID_PLAYER_CLASSES.includes(opponent_class)) {
        console.error(`Invalid opponent_class: ${opponent_class}. Valid options: ${VALID_PLAYER_CLASSES.join(', ')}`);
        return res.status(400).json({ error: `Invalid opponent_class: ${opponent_class}. Valid options: ${VALID_PLAYER_CLASSES.join(', ')}` });
      }

      // 验证 difficulty 参数
      if (!VALID_DIFFICULTIES.includes(difficulty)) {
        console.error(`Invalid difficulty: ${difficulty}. Valid options: ${VALID_DIFFICULTIES.join(', ')}`);
        return res.status(400).json({ error: `Invalid difficulty: ${difficulty}. Valid options: ${VALID_DIFFICULTIES.join(', ')}` });
      }

      console.log(`Starting new game: player=${player_class}, opponent=${opponent_class}, difficulty=${difficulty}`);

      // 使用 opponent_class 和 difficulty 参数初始化新游戏
      this.game.startNewGame(player_class, opponent_class, difficulty);

      this.currentState = this.game.getGameState();
      this.lastReward = 0;

      const response = {
        observation: this.getObservation(),
        action_mask: this.getActionMask(),
        reward: 0,
        done: false,
        info: {}
      };

      res.json(response);
    } catch (error) {
      console.error('Error in reset:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get observation of current game state
  getObservation() {
    const state = this.currentState;

    // 检查 currentState 是否为 null
    if (!state) {
      console.error('Error: currentState is null');
      return null;
    }

    // 检查必要的对象是否存在
    if (!state.player || !state.ai) {
      console.error('Error: player or ai state is missing');
      return null;
    }

    // 将 game_phase 编码为数值
    const phaseMap = {
      'init': 0,
      'mulligan': 1,
      'main': 2,
      'end': 3,
      'ended': 4
    };
    const gamePhase = phaseMap[state.phase] !== undefined ? phaseMap[state.phase] : 0;

    // 返回扁平数组格式，匹配 observation_space shape [14]:
    // [玩家生命, 玩家护甲, 玩家法力, 玩家最大法力, 玩家手牌数, 玩家随从数, 玩家牌库数,
    //  对手生命, 对手护甲, 对手手牌数, 对手随从数, 对手牌库数, 回合数, 游戏阶段]
    return [
      state.player.health || 0,
      state.player.armor || 0,
      state.player.mana || 0,
      state.player.maxMana || 0,
      state.player.hand ? state.player.hand.length : 0,
      state.player.field ? state.player.field.length : 0,
      state.player.deck ? state.player.deck.length : 0,
      state.ai.health || 0,
      state.ai.armor || 0,
      state.ai.hand ? state.ai.hand.length : 0,
      state.ai.field ? state.ai.field.length : 0,
      state.ai.deck ? state.ai.deck.length : 0,
      state.turn || 0,
      gamePhase
    ];
  }

  // Get action mask for current game state
  getActionMask() {
    const state = this.currentState;

    // 检查 currentState 是否为 null
    if (!state) {
      console.error('Error: currentState is null in getActionMask');
      return new Array(68).fill(0);
    }

    // 检查必要的对象是否存在
    if (!state.player || !state.ai) {
      console.error('Error: player or ai state is missing in getActionMask');
      return new Array(68).fill(0);
    }

    const player = state.player;
    const ai = state.ai;

    const mask = new Array(68).fill(0);

    // 出手牌
    if (player.hand) {
      player.hand.forEach((card, i) => {
        if (i < 10 && player.mana >= card.cost) {
          mask[i] = 1;
        }
      });
    }

    // 攻击
    if (player.field) {
      player.field.forEach((attacker, attackerIdx) => {
        if (attacker.canAttack && !attacker.hasAttacked && !attacker.sleeping && !attacker.frozen) {
          // 可以攻击英雄
          mask[10 + attackerIdx * 8] = 1;

          // 可以攻击随从
          const hasTaunt = ai.field ? ai.field.some(m => m.taunt) : false;
          if (ai.field) {
            ai.field.forEach((target, targetIdx) => {
              if (!hasTaunt || target.taunt) {
                mask[10 + attackerIdx * 8 + targetIdx + 2] = 1;
              }
            });
          }
        }
      });
    }

    // 结束回合总是可用
    mask[66] = 1;

    // 英雄技能
    if (!player.usedHeroPower && player.mana >= 2) {
      mask[67] = 1;
    }

    return mask;
  }

  // Take a step in the game
  async step(req, res) {
    try {
      const { action } = req.body;

      // 验证 action 参数
      if (action === undefined || action === null) {
        return res.status(400).json({ error: 'Missing required parameter: action' });
      }

      // 验证 action 结构
      if (typeof action !== 'object') {
        return res.status(400).json({ error: 'Invalid action: must be an object' });
      }

      // 检查 currentState 是否存在（确保 reset 已调用）
      if (!this.currentState) {
        return res.status(400).json({ error: 'Game not initialized. Please call reset first.' });
      }

      const state = this.currentState;

      // 检查游戏是否结束
      if (state.phase === 'ended') {
        return res.json({
          observation: this.getObservation(),
          action_mask: [],
          reward: 0,
          done: true,
          info: { winner: state.winner }
        });
      }

      // 执行动作
      const actionValid = this.executeAction(action);

      // 获取新状态
      const oldAiHealth = state.ai.health;
      this.currentState = this.game.getGameState();
      const newState = this.currentState;

      // 计算奖励
      const reward = this.calculateReward(oldAiHealth, newState);
      this.lastReward = reward;

      // 检查游戏结束
      const done = newState.phase === 'ended';

      res.json({
        observation: this.getObservation(),
        action_mask: this.getActionMask(),
        reward: reward,
        done: done,
        info: { actionValid }
      });
    } catch (error) {
      console.error('Error in step:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Execute action in the game
  executeAction(action) {
    const state = this.currentState;
    const player = state.player;
    let actionValid = true;

    switch (action.type) {
      case 'play_card': {
        // 数组边界检查
        if (!Number.isInteger(action.card_index) || action.card_index < 0 || action.card_index >= player.hand.length) {
          console.warn(`Invalid action: card_index ${action.card_index} out of bounds [0, ${player.hand.length - 1}]`);
          actionValid = false;
          break;
        }

        const card = player.hand[action.card_index];
        if (!card) {
          console.warn(`Invalid action: no card at index ${action.card_index}`);
          actionValid = false;
          break;
        }

        if (player.mana < card.cost) {
          console.warn(`Invalid action: not enough mana (required: ${card.cost}, available: ${player.mana})`);
          actionValid = false;
          break;
        }

        this.game.removeCardFromHand(player, card);
        player.mana -= card.cost;

        if (card.type === 'minion') {
          this.game.summonMinion(player, card);
        } else {
          // 法术效果需要目标
          const target = action.target === 'hero'
            ? state.ai
            : state.ai.field[action.target];

          if (!target) {
            console.warn(`Invalid action: no target at index ${action.target}`);
            actionValid = false;
            break;
          }

          const ce = new CardEffect(this.game);
          ce.execute(card, { player, target, card });
        }
        break;
      }

      case 'attack': {
        // 数组边界检查
        if (!Number.isInteger(action.attacker_index) || action.attacker_index < 0 || action.attacker_index >= player.field.length) {
          console.warn(`Invalid action: attacker_index ${action.attacker_index} out of bounds [0, ${player.field.length - 1}]`);
          actionValid = false;
          break;
        }

        const attacker = player.field[action.attacker_index];
        if (!attacker) {
          console.warn(`Invalid action: no attacker at index ${action.attacker_index}`);
          actionValid = false;
          break;
        }

        if (!attacker.canAttack) {
          console.warn(`Invalid action: attacker cannot attack`);
          actionValid = false;
          break;
        }

        if (attacker.hasAttacked) {
          console.warn(`Invalid action: attacker has already attacked`);
          actionValid = false;
          break;
        }

        let target;
        if (action.target === 'hero') {
          target = state.ai;
        } else {
          // 数组边界检查
          if (!Number.isInteger(action.target_index) || action.target_index < 0 || action.target_index >= state.ai.field.length) {
            console.warn(`Invalid action: target_index ${action.target_index} out of bounds [0, ${state.ai.field.length - 1}]`);
            actionValid = false;
            break;
          }
          target = state.ai.field[action.target_index];
        }

        if (!target) {
          console.warn(`Invalid action: no target`);
          actionValid = false;
          break;
        }

        if (target.health !== undefined) {
          target.health -= attacker.attack;
          attacker.health -= target.attack || 0;
        } else if (target.health === undefined) {
          state.ai.health -= attacker.attack;
        }
        attacker.hasAttacked = true;
        break;
      }

      case 'end_turn':
        this.game.switchTurn();
        break;

      case 'hero_power': {
        // 验证是否已使用过英雄技能
        if (player.usedHeroPower) {
          console.warn('Invalid action: hero power already used');
          actionValid = false;
          break;
        }

        // 验证法力值是否足够
        if (player.mana < 2) {
          console.warn('Invalid action: not enough mana for hero power');
          actionValid = false;
          break;
        }

        // 简化：英雄技能效果 - 对敌方英雄造成 1 点伤害
        player.usedHeroPower = true;
        player.mana -= 2;
        state.ai.health -= 1;
        break;
      }

      default:
        console.warn('Unknown action type:', action.type);
    }

    // 清理死亡随从
    this.game.removeDeadMinions();

    return actionValid;
  }

  // Calculate reward based on state changes
  calculateReward(oldAiHealth, newState) {
    let reward = 0;

    // 造成伤害奖励
    const damage = oldAiHealth - newState.ai.health;
    if (damage > 0) {
      reward += damage / 10;
    }

    // 胜负奖励
    if (newState.phase === 'ended') {
      if (newState.winner === 'player') {
        reward += 100;
      } else {
        reward -= 100;
      }
    }

    return reward;
  }

  // Get action space
  getActionSpace(req, res) {
    // 动作空间：
    // 0-9: 出手牌 (0-9号手牌)
    // 10-65: 攻击 (attacker*8 + target, target=0=英雄, 1-7=随从)
    // 66: 结束回合
    // 67: 使用英雄技能

    const actions = [];

    // 出手牌
    for (let i = 0; i < 10; i++) {
      actions.push({ id: i, type: 'play_card', card_index: i });
    }

    // 攻击
    for (let attacker = 0; attacker < 7; attacker++) {
      // 攻击英雄
      actions.push({ id: 10 + attacker * 8, type: 'attack', attacker, target: 'hero' });
      // 攻击随从
      for (let target = 0; target < 7; target++) {
        actions.push({ id: 10 + attacker * 8 + target + 1, type: 'attack', attacker, target });
      }
    }

    // 结束回合
    actions.push({ id: 66, type: 'end_turn' });

    // 英雄技能
    actions.push({ id: 67, type: 'hero_power' });

    res.json({
      n_actions: actions.length,
      actions: actions
    });
  }

  // Get observation space
  getObservationSpace(req, res) {
    // 状态向量包含14个字段:
    // player: health(0), armor(1), mana(2), maxMana(3), hand_count(4), field_count(5), deck_count(6)
    // opponent: health(7), armor(8), hand_count(9), field_count(10), deck_count(11)
    // turn(12), game_phase(13)
    res.json({
      shape: [14],
      dtype: 'float32',
      description: '状态向量: [玩家生命,玩家护甲,玩家法力,玩家最大法力,玩家手牌数,玩家随从数,玩家牌库数,对手生命,对手护甲,对手手牌数,对手随从数,对手牌库数,回合数,游戏阶段]'
    });
  }

  // Get current game state
  getGameState(req, res) {
    try {
      const state = this.game.getGameState();
      res.json(state);
    } catch (error) {
      console.error('Error in getGameState:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = RLServer;
