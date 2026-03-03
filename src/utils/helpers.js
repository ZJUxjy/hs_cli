/**
 * 辅助函数工具
 */

/**
 * 清屏
 */
function clearScreen() {
  console.clear();
}

/**
 * 延时
 * @param {number} ms - 毫秒
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成唯一ID
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 随机打乱数组
 * @param {array} array
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 格式化卡牌显示
 * @param {object} card
 * @returns {string}
 */
function formatCard(card) {
  if (!card) return '';
  if (card.type === 'minion') {
    return `${card.name}[${card.effect.attack}/${card.effect.health}]`;
  }
  return `${card.name}[${card.cost}]`;
}

module.exports = {
  clearScreen,
  sleep,
  generateId,
  shuffle,
  formatCard
};
