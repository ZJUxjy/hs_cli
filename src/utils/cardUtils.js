const CardType = {
  isMinion: (card) => {
    return card && (card.type === 'MINION' || card.type === 'minion');
  },
  isSpell: (card) => {
    return card && (card.type === 'SPELL' || card.type === 'spell');
  },
  isWeapon: (card) => {
    return card && (card.type === 'WEAPON' || card.type === 'weapon');
  },
  isHero: (card) => {
    return card && (card.type === 'HERO' || card.type === 'hero');
  },
  getNormalizedType: (card) => {
    if (!card || !card.type) return null;
    return card.type.toUpperCase();
  }
};
module.exports = CardType;
