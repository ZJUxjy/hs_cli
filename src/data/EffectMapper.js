// src/data/EffectMapper.js
class EffectMapper {
  constructor() {
    this.mechanicMap = {
      'BATTLECRY': 'battlecry',
      'DEATHRATTLE': 'deathrattle',
      'CHARGE': 'charge',
      'TAUNT': 'taunt',
      'WINDFURY': 'windfury',
      'DIVINE_SHIELD': 'divine_shield',
      'STEALTH': 'stealth',
      'FROZEN': 'frozen',
      'POISONOUS': 'poisonous',
      'LIFESTEAL': 'lifesteal',
      'FREEZE': 'freeze',
      'OVERLOAD': 'overload',
      'COMBO': 'combo',
      'INSPIRE': 'inspire',
      'SECRET': 'secret'
    };

    // 缓存转换结果
    this.cache = new Map();

    // 预编译text匹配模式
    this.textPatterns = [
      { pattern: /Charge/i, key: 'charge' },
      { pattern: /Taunt/i, key: 'taunt' },
      { pattern: /Windfury/i, key: 'windfury' },
      { pattern: /Divine Shield/i, key: 'divine_shield' },
      { pattern: /Stealth/i, key: 'stealth' },
      { pattern: /Poisonous/i, key: 'poisonous' },
      { pattern: /Lifesteal/i, key: 'lifesteal' }
    ];
  }

  // 从mechanics转换为effect标志（带缓存）
  mapMechanics(mechanics) {
    if (!mechanics) return {};
    const effect = {};
    for (let i = 0; i < mechanics.length; i++) {
      const m = mechanics[i];
      const mapped = this.mechanicMap[m];
      if (mapped) effect[mapped] = true;
    }
    return effect;
  }

  // 从text解析额外效果（优化版）
  parseTextEffect(text) {
    if (!text) return {};
    const effect = {};
    for (let i = 0; i < this.textPatterns.length; i++) {
      if (this.textPatterns[i].pattern.test(text)) {
        effect[this.textPatterns[i].key] = true;
      }
    }
    return effect;
  }

  // 完整转换（带缓存）
  transform(card) {
    // 使用card id作为缓存键
    const cacheKey = card.id;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const effect = {
      attack: card.attack || 0,
      health: card.health || 0,
      cost: card.cost || 0,
      ...this.mapMechanics(card.mechanics),
      ...this.parseTextEffect(card.text)
    };

    // 缓存结果（限制缓存大小）
    if (this.cache.size > 10000) {
      // 清除最老的50%缓存
      const keys = Array.from(this.cache.keys());
      for (let i = 0; i < 5000; i++) {
        this.cache.delete(keys[i]);
      }
    }
    this.cache.set(cacheKey, effect);

    return effect;
  }

  // 清除缓存
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new EffectMapper();
