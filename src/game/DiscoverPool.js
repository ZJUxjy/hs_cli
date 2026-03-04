/**
 * 发现卡牌池管理
 */

class DiscoverPool {
  constructor(game) {
    this.game = game;
  }

  /**
   * 获取发现选项
   * @param {string} type - 发现类型: spell, minion, weapon, class, 或 all
   * @param {string} playerClass - 玩家职业
   * @param {number} count - 选项数量
   * @returns {Array} 卡牌数组
   */
  getDiscoverOptions(type, playerClass, count = 3) {
    const CardData = require('../data/CardData');
    let pool = [];

    switch (type) {
      case 'spell':
        pool = CardData.getAllCards().filter(c => c.type === 'spell');
        break;
      case 'minion':
        pool = CardData.getAllCards().filter(c => c.type === 'minion');
        break;
      case 'weapon':
        pool = CardData.getAllCards().filter(c => c.type === 'weapon');
        break;
      case 'class':
        pool = CardData.getCardsByClass(playerClass);
        break;
      default:
        pool = CardData.getAllCards();
    }

    // 过滤掉冒险模式卡牌
    pool = pool.filter(c => !c.id.startsWith(' Adventure'));

    // 随机打乱并取前count张
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}

module.exports = DiscoverPool;
