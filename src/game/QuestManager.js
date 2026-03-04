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

  // ==================== 任务线 (Questline) 机制 ====================

  /**
   * 初始化任务线
   * @param {object} questlineCard - 任务线卡牌
   * @param {object} player - 玩家
   */
  initQuestline(questlineCard, player) {
    if (!player.questlines) {
      player.questlines = [];
    }

    const stages = questlineCard.effect.stages || [];
    const questline = {
      id: questlineCard.id,
      name: questlineCard.name,
      progress: 0,
      stages: stages,
      currentStage: 0,
      completed: false,
      rewardClaimed: false
    };

    player.questlines.push(questline);

    Logger.info(`${player.name} 开始了任务线: ${questlineCard.name}`);

    if (stages.length > 0) {
      const firstStage = stages[0];
      Logger.info(`任务线阶段 1: ${firstStage.description || firstStage.condition} (${firstStage.progress}/${firstStage.requirement})`);
    }

    return questline;
  }

  /**
   * 更新任务线进度
   * @param {object} player - 玩家
   * @param {string} condition - 条件类型
   * @param {number} amount - 进度增量
   * @param {object} data - 附加数据
   */
  updateQuestlineProgress(player, condition, amount = 1, data = {}) {
    if (!player.questlines || player.questlines.length === 0) {
      return;
    }

    const completedStages = [];

    player.questlines.forEach(questline => {
      if (questline.completed || questline.rewardClaimed) {
        return;
      }

      const currentStage = questline.stages[questline.currentStage];
      if (!currentStage) {
        return;
      }

      // 检查条件是否匹配
      if (currentStage.condition === condition) {
        questline.progress += amount;
        Logger.info(`任务线进度 [${questline.name}]: ${questline.progress}/${currentStage.requirement} (${condition})`);

        // 检查是否完成当前阶段
        if (questline.progress >= currentStage.requirement) {
          questline.currentStage++;

          if (questline.currentStage < questline.stages.length) {
            // 进入下一阶段
            const nextStage = questline.stages[questline.currentStage];
            Logger.info(`任务线阶段完成: ${questline.name}, 进入阶段 ${questline.currentStage + 1}`);
            Logger.info(`下一阶段: ${nextStage.description || nextStage.condition} (${nextStage.progress || 0}/${nextStage.requirement})`);

            // 如果阶段有奖励，发放阶段性奖励
            if (nextStage.stageReward) {
              this.giveQuestlineStageReward(player, questline, nextStage.stageReward);
            }
          } else {
            // 任务线完成
            questline.completed = true;
            Logger.info(`任务线完成: ${questline.name}!`);

            // 发放最终奖励
            this.claimQuestlineReward(player, questline);
          }
        }
      }
    });
  }

  /**
   * 发放任务线阶段性奖励
   * @param {object} player - 玩家
   * @param {object} questline - 任务线对象
   * @param {object} stageReward - 阶段奖励
   */
  giveQuestlineStageReward(player, questline, stageReward) {
    const CardData = require('../data/CardData');

    Logger.info(`任务线阶段性奖励: ${stageReward.description || '奖励'}`);

    if (stageReward.type === 'summon') {
      if (stageReward.card_id) {
        const card = CardData.getCard(stageReward.card_id);
        if (card) {
          this.game.summonMinion(player, card);
        }
      } else {
        const minion = {
          id: 'questline_stage_' + Date.now(),
          name: stageReward.name || '任务线奖励随从',
          effect: {
            attack: stageReward.attack || 0,
            health: stageReward.health || 0
          }
        };
        this.game.summonMinion(player, minion);
      }
    } else if (stageReward.type === 'spell') {
      if (stageReward.card_id) {
        const card = CardData.getCard(stageReward.card_id);
        if (card) {
          this.game.addCardToHand(player, card);
        }
      }
    } else if (stageReward.type === 'card_draw') {
      this.game.drawCard(player, stageReward.count || 1);
    }
  }

  /**
   * 领取任务线最终奖励
   * @param {object} player - 玩家
   * @param {object} questline - 任务线对象
   */
  claimQuestlineReward(player, questline) {
    const finalStage = questline.stages[questline.stages.length - 1];

    if (finalStage && finalStage.reward) {
      Logger.info(`任务线最终奖励: ${finalStage.reward.description || '最终奖励'}`);

      const reward = finalStage.reward;

      if (reward.type === 'summon') {
        if (reward.card_id) {
          const CardData = require('../data/CardData');
          const card = CardData.getCard(reward.card_id);
          if (card) {
            this.game.summonMinion(player, card);
          }
        } else {
          const minion = {
            id: 'questline_final_' + Date.now(),
            name: reward.name || '任务线最终奖励随从',
            effect: {
              attack: reward.attack || 0,
              health: reward.health || 0
            }
          };
          this.game.summonMinion(player, minion);
        }
      } else if (reward.type === 'spell') {
        const CardData = require('../data/CardData');
        if (reward.card_id) {
          const card = CardData.getCard(reward.card_id);
          if (card) {
            this.game.addCardToHand(player, card);
          }
        }
      } else if (reward.type === 'card_draw') {
        this.game.drawCard(player, reward.count || 1);
      }
    }

    questline.rewardClaimed = true;
  }
}

module.exports = QuestManager;
