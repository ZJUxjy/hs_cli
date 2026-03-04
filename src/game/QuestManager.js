/**
 * 任务管理器 - 处理任务卡牌机制
 */

const Logger = require('../utils/logger');

class QuestManager {
  constructor(game) {
    this.game = game;
  }

  /**
   * 初始化任务
   * @param {object} quest - 任务卡牌
   * @param {object} player - 玩家
   */
  initQuest(quest, player) {
    if (!player.activeQuests) {
      player.activeQuests = [];
    }

    player.activeQuests.push({
      card: quest,
      progress: 0,
      target: quest.effect.questProgress || 1,
      condition: quest.effect.questCondition || 'play_card',
      reward: quest.effect.reward
    });

    Logger.info(`${player.name} 接受了任务: ${quest.name}`);
  }

  /**
   * 更新任务进度
   * @param {object} player - 玩家
   * @param {string} condition - 条件类型
   * @param {object} data - 附加数据
   */
  updateProgress(player, condition, data) {
    if (!player.activeQuests || player.activeQuests.length === 0) {
      return;
    }

    const completed = [];

    player.activeQuests.forEach((quest, index) => {
      if (quest.condition === condition) {
        quest.progress++;
        if (quest.progress >= quest.target) {
          completed.push(quest);
        }
        Logger.info(`任务进度: ${quest.progress}/${quest.target}`);
      }
    });

    completed.forEach(quest => {
      this.completeQuest(player, quest);
      player.activeQuests = player.activeQuests.filter(q => q !== quest);
    });
  }

  /**
   * 完成任务并发放奖励
   * @param {object} player - 玩家
   * @param {object} quest - 任务对象
   */
  completeQuest(player, quest) {
    Logger.info(`任务完成: ${quest.card.name}, 发放奖励`);

    const CardData = require('../data/CardData');

    const reward = quest.reward;

    if (reward.type === 'summon') {
      if (reward.card_id) {
        const card = CardData.getCard(reward.card_id);
        if (card) {
          this.game.summonMinion(player, card);
        }
      } else {
        // 如果没有指定 card_id，使用奖励数据中的属性创建临时随从
        const minion = {
          id: 'quest_reward_' + Date.now(),
          name: reward.name || '任务奖励随从',
          effect: {
            attack: reward.attack || 0,
            health: reward.health || 0
          }
        };
        this.game.summonMinion(player, minion);
      }
    } else if (reward.type === 'spell') {
      if (reward.card_id) {
        const card = CardData.getCard(reward.card_id);
        if (card) {
          this.game.addCardToHand(player, card);
        }
      }
    }
  }
}

module.exports = QuestManager;
