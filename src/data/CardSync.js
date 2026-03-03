// src/data/CardSync.js
const https = require('https');
const fs = require('fs');
const path = require('path');

class CardSync {
  constructor() {
    this.apiUrl = 'https://api.hearthstonejson.com/v1/latest/enUS/cards.json';
    this.outputDir = path.join(__dirname, '../../data/cards');
  }

  async download() {
    return new Promise((resolve, reject) => {
      https.get(this.apiUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const cards = JSON.parse(data);
            resolve(cards);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  async sync() {
    const cards = await this.download();
    // 过滤有效卡牌
    const validCards = cards.filter(c => c.type && c.type !== 'HERO');
    // 保存到文件
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(this.outputDir, 'all.json'),
      JSON.stringify(validCards, null, 2)
    );
    console.log(`Synced ${validCards.length} cards`);
    return validCards;
  }

  transform(card) {
    return {
      id: card.id,
      name: card.name,
      cardClass: card.cardClass,
      cost: card.cost,
      attack: card.attack,
      health: card.health,
      type: card.type,
      rarity: card.rarity,
      set: card.set,
      mechanics: card.mechanics,
      text: card.text,
      race: card.race
    };
  }
}

module.exports = CardSync;
