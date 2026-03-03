/**
 * 卡牌数据管理
 */

const fs = require('fs');
const path = require('path');

class CardData {
  constructor() {
    this.cards = {};
    this.loadAllCards();
  }

  loadAllCards() {
    const cardsDir = path.join(__dirname, '../../data/cards');
    
    if (!fs.existsSync(cardsDir)) {
      console.warn('卡牌目录不存在:', cardsDir);
      return;
    }

    const files = fs.readdirSync(cardsDir);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(cardsDir, file), 'utf8'));
          data.forEach(card => {
            this.cards[card.id] = card;
          });
        } catch (err) {
          console.error('加载卡牌文件失败:', file, err);
        }
      }
    });
  }

  /**
   * 获取卡牌
   * @param {string} id 
   * @returns {object|null}
   */
  getCard(id) {
    return this.cards[id] || null;
  }

  /**
   * 获取职业卡牌
   * @param {string} cls 
   * @returns {array}
   */
  getCardsByClass(cls) {
    return Object.values(this.cards).filter(c => c.classes && c.classes.includes(cls));
  }

  /**
   * 获取所有卡牌
   * @returns {object}
   */
  getAllCards() {
    return { ...this.cards };
  }

  /**
   * 获取所有职业
   * @returns {array}
   */
  getClasses() {
    return Object.keys(this.cards).map(id => this.cards[id].classes).flat().filter((v, i, a) => a.indexOf(v) === i);
  }
}

module.exports = new CardData();
