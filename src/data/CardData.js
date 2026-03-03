/**
 * 卡牌数据管理
 */

const fs = require('fs');
const path = require('path');

class CardData {
  constructor() {
    this.cards = [];
    this.byClass = {};
    this.byId = {};
    this.byType = {};
    this.byRarity = {};
    this.byCost = {};
    this.load();
  }

  load() {
    // 优先加载官方数据格式
    const officialPath = path.join(__dirname, '../../data/cards/all.json');
    if (fs.existsSync(officialPath)) {
      const data = fs.readFileSync(officialPath, 'utf8');
      this.cards = JSON.parse(data);
      this.index();
      return;
    }

    // 回退到旧格式
    const cardsDir = path.join(__dirname, '../../data/cards');
    if (!fs.existsSync(cardsDir)) {
      console.warn('卡牌目录不存在:', cardsDir);
      return;
    }

    const files = fs.readdirSync(cardsDir);
    files.forEach(file => {
      if (file.endsWith('.json') && file !== 'all.json') {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(cardsDir, file), 'utf8'));
          data.forEach(card => {
            this.cards.push(card);
            this.byId[card.id] = card;
          });
        } catch (err) {
          console.error('加载卡牌文件失败:', file, err);
        }
      }
    });
  }

  index() {
    // 初始化索引
    this.byClass = {};
    this.byType = {};
    this.byRarity = {};
    this.byCost = {};

    // 预分配费用索引（0-10+）
    for (let i = 0; i <= 12; i++) {
      this.byCost[i] = [];
    }

    this.cards.forEach(card => {
      this.byId[card.id] = card;

      // 按职业索引
      const cls = card.cardClass || 'NEUTRAL';
      if (!this.byClass[cls]) this.byClass[cls] = [];
      this.byClass[cls].push(card);

      // 按类型索引
      const type = card.type || 'UNKNOWN';
      if (!this.byType[type]) this.byType[type] = [];
      this.byType[type].push(card);

      // 按稀有度索引
      const rarity = card.rarity || 'UNKNOWN';
      if (!this.byRarity[rarity]) this.byRarity[rarity] = [];
      this.byRarity[rarity].push(card);

      // 按费用索引
      const cost = card.cost || 0;
      if (!this.byCost[cost]) this.byCost[cost] = [];
      this.byCost[cost].push(card);
    });
  }

  /**
   * 获取卡牌
   * @param {string} id
   * @returns {object|null}
   */
  getCard(id) {
    return this.byId[id] || null;
  }

  /**
   * 获取职业卡牌
   * @param {string} cardClass
   * @returns {array}
   */
  getCardsByClass(cardClass) {
    // 尝试直接匹配，不行则尝试大小写转换
    if (this.byClass[cardClass]) return this.byClass[cardClass];
    const upper = cardClass.toUpperCase();
    if (this.byClass[upper]) return this.byClass[upper];
    const lower = cardClass.toLowerCase();
    return this.byClass[lower] || [];
  }

  /**
   * 获取所有卡牌
   * @returns {array}
   */
  getAllCards() {
    return this.cards;
  }

  /**
   * 按模式获取（标准/狂野）
   * @param {string} mode - 'standard' or 'wild'
   * @returns {array}
   */
  getCardsBySet(mode) {
    const standardSets = ['CORE', 'EXPERT1', 'LEGACY', 'MISSIONS', 'HERO_SKINS'];
    if (mode === 'standard') {
      return this.cards.filter(c => standardSets.includes(c.set));
    }
    return this.cards;
  }

  /**
   * 按类型获取
   * @param {string} type
   * @returns {array}
   */
  getCardsByType(type) {
    return this.byType[type] || [];
  }

  /**
   * 按稀有度获取
   * @param {string} rarity
   * @returns {array}
   */
  getCardsByRarity(rarity) {
    return this.byRarity[rarity] || [];
  }

  /**
   * 按费用获取
   * @param {number} cost
   * @returns {array}
   */
  getCardsByCost(cost) {
    return this.byCost[cost] || [];
  }

  /**
   * 搜索卡牌
   * @param {string} query
   * @returns {array}
   */
  search(query) {
    const q = query.toLowerCase();
    return this.cards.filter(c =>
      c.name && c.name.toLowerCase().includes(q) ||
      (c.text && c.text.toLowerCase().includes(q))
    );
  }

  /**
   * 获取所有职业
   * @returns {array}
   */
  getClasses() {
    return Object.keys(this.byClass);
  }

  /**
   * 获取转换后的卡牌（含effect）
   * @param {string} id
   * @returns {object|null}
   */
  getCardWithEffect(id) {
    const card = this.byId[id];
    if (!card) return null;
    const EffectMapper = require('./EffectMapper');
    return { ...card, effect: EffectMapper.transform(card) };
  }

  /**
   * 获取职业卡牌（含effect）
   * @param {string} cardClass
   * @returns {array}
   */
  getCardsByClassWithEffect(cardClass) {
    // 尝试直接匹配，不行则尝试大小写转换
    let cards = this.byClass[cardClass];
    if (!cards) {
      const upper = cardClass.toUpperCase();
      cards = this.byClass[upper];
    }
    if (!cards) {
      const lower = cardClass.toLowerCase();
      cards = this.byClass[lower];
    }
    cards = cards || [];
    const EffectMapper = require('./EffectMapper');
    return cards.map(c => ({ ...c, effect: EffectMapper.transform(c) }));
  }
}

module.exports = new CardData();
