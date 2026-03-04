// 生成卡牌翻译映射
const fs = require('fs');
const path = require('path');

const zhCNPath = path.join(__dirname, 'data/cards/zhCN.json');
const allPath = path.join(__dirname, 'data/cards/all.json');
const outputPath = path.join(__dirname, 'data/cards/translation.json');

const zhCN = JSON.parse(fs.readFileSync(zhCNPath, 'utf8'));
const allCards = JSON.parse(fs.readFileSync(allPath, 'utf8'));

// 创建 id -> 中文名称 的映射
const translationMap = {};

// 处理中文卡牌数据
zhCN.forEach(card => {
  if (card.name) {
    translationMap[card.id] = {
      name: card.name,
      text: card.text || ''
    };
  }
});

// 只保留 our cards 中存在的卡牌翻译
const filteredTranslation = {};
const ourIds = new Set(allCards.map(c => c.id));

Object.keys(translationMap).forEach(id => {
  if (ourIds.has(id)) {
    filteredTranslation[id] = translationMap[id];
  }
});

fs.writeFileSync(outputPath, JSON.stringify(filteredTranslation, null, 2), 'utf8');

console.log(`翻译映射已生成: ${Object.keys(filteredTranslation).length} 张卡牌`);
