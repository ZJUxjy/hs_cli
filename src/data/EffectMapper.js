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
  }

  // 从mechanics转换为effect标志
  mapMechanics(mechanics) {
    if (!mechanics) return {};
    const effect = {};
    mechanics.forEach(m => {
      if (this.mechanicMap[m]) {
        effect[this.mechanicMap[m]] = true;
      }
    });
    return effect;
  }

  // 从text解析额外效果
  parseTextEffect(text) {
    if (!text) return {};
    const effect = {};
    if (text.includes('Charge')) effect.charge = true;
    if (text.includes('Taunt')) effect.taunt = true;
    if (text.includes('Windfury')) effect.windfury = true;
    if (text.includes('Divine Shield')) effect.divine_shield = true;
    if (text.includes('Stealth')) effect.stealth = true;
    if (text.includes('Poisonous')) effect.poisonous = true;
    if (text.includes('Lifesteal')) effect.lifesteal = true;
    return effect;
  }

  // 完整转换
  transform(card) {
    const effect = {
      attack: card.attack || 0,
      health: card.health || 0,
      cost: card.cost || 0,
      ...this.mapMechanics(card.mechanics),
      ...this.parseTextEffect(card.text)
    };
    return effect;
  }
}

module.exports = new EffectMapper();
