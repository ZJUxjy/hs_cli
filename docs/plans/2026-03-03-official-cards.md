# 官方卡牌数据与卡组系统实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 从 hearthstonejson.com 获取官方卡牌数据，实现完整的效果映射系统和卡组构建功能

**Architecture:** 启动时自动从API同步数据 → 转换为游戏格式 → 存储到本地 → 卡组系统调用

**Tech Stack:** Node.js, JSON 存储, HTTPS API

---

## 实现阶段概览

### Phase 1: 数据同步 (1-3)
- Task 1: 创建CardSync模块从API下载数据
- Task 2: 实现卡牌数据解析和存储
- Task 3: 实现按职业/模式筛选

### Phase 2: 效果系统 (4-6)
- Task 4: 实现mechanics到effect映射
- Task 5: 扩展CardEffect支持新机制
- Task 6: 完善现有卡牌数据引用新系统

### Phase 3: 卡组系统 (7-10)
- Task 7: 创建DeckBuilder模块
- Task 8: 实现卡组验证规则
- Task 9: 实现卡组CRUD操作
- Task 10: 创建卡组选择UI

### Phase 4: 集成测试 (11-12)
- Task 11: 端到端测试
- Task 12: 性能优化

---

## Task 1: 创建CardSync模块

**Files:**
- Create: `src/data/CardSync.js`

**Step 1: 创建测试文件**

```javascript
// test/CardSync.test.js
const CardSync = require('../src/data/CardSync');

async function testSync() {
  const sync = new CardSync();
  const result = await sync.download();
  console.log('Downloaded:', result.length, 'cards');
  return result.length > 0;
}

testSync().then(ok => process.exit(ok ? 0 : 1));
```

**Step 2: 运行测试**

Run: `node test/CardSync.test.js`
Expected: FAIL - file not found

**Step 3: 创建CardSync模块**

```javascript
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
    // 按职业分组
    const byClass = {};
    validCards.forEach(card => {
      const cls = card.cardClass || 'NEUTRAL';
      if (!byClass[cls]) byClass[cls] = [];
      byClass[cls].push(this.transform(card));
    });
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
```

**Step 4: 运行测试**

Run: `node test/CardSync.test.js`
Expected: PASS - 输出 "Downloaded: X cards"

**Step 5: Commit**

```bash
git add src/data/CardSync.js test/CardSync.test.js
git commit -m "feat: 添加CardSync模块从API下载卡牌数据"
```

---

## Task 2: 实现卡牌数据解析和存储

**Files:**
- Modify: `src/data/CardSync.js`
- Create: `src/data/CardData.js`

**Step 1: 创建CardData模块**

```javascript
// src/data/CardData.js
const fs = require('fs');
const path = require('path');

class CardData {
  constructor() {
    this.cards = [];
    this.byClass = {};
    this.byId = {};
    this.load();
  }

  load() {
    const cardPath = path.join(__dirname, '../../data/cards/all.json');
    if (fs.existsSync(cardPath)) {
      const data = fs.readFileSync(cardPath, 'utf8');
      this.cards = JSON.parse(data);
      this.index();
    }
  }

  index() {
    this.cards.forEach(card => {
      this.byId[card.id] = card;
      const cls = card.cardClass || 'NEUTRAL';
      if (!this.byClass[cls]) this.byClass[cls] = [];
      this.byClass[cls].push(card);
    });
  }

  getCard(id) {
    return this.byId[id];
  }

  getCardsByClass(cardClass) {
    return this.byClass[cardClass] || [];
  }

  getAllCards() {
    return this.cards;
  }
}

module.exports = new CardData();
```

**Step 2: 测试加载**

Run: `node -e "const cd = require('./src/data/CardData'); console.log('Loaded:', cd.getAllCards().length, 'cards')"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/data/CardData.js
git commit -m "feat: 添加CardData模块管理卡牌数据"
```

---

## Task 3: 实现按职业/模式筛选

**Files:**
- Modify: `src/data/CardData.js`

**Step 1: 添加筛选方法**

在 CardData.js 中添加：

```javascript
  // 按模式获取（标准/狂野）
  getCardsBySet(mode) {
    const standardSets = ['CORE', 'EXPERT1', 'LEGACY', 'MISSIONS', 'HERO_SKINS'];
    if (mode === 'standard') {
      return this.cards.filter(c => standardSets.includes(c.set));
    }
    return this.cards; // wild = all
  }

  // 按类型获取
  getCardsByType(type) {
    return this.cards.filter(c => c.type === type);
  }

  // 按稀有度获取
  getCardsByRarity(rarity) {
    return this.cards.filter(c => c.rarity === rarity);
  }

  // 按费用获取
  getCardsByCost(cost) {
    return this.cards.filter(c => c.cost === cost);
  }

  // 搜索
  search(query) {
    const q = query.toLowerCase();
    return this.cards.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.text && c.text.toLowerCase().includes(q))
    );
  }
```

**Step 2: 测试筛选**

Run: `node -e "const cd = require('./src/data/CardData'); console.log('Mage:', cd.getCardsByClass('MAGE').length); console.log('Standard:', cd.getCardsBySet('standard').length)"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/data/CardData.js
git commit -m "feat: CardData添加筛选方法"
```

---

## Task 4: 实现mechanics到effect映射

**Files:**
- Create: `src/data/EffectMapper.js`

**Step 1: 创建EffectMapper**

```javascript
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
    if (text.includes('Lifesteal')) effect.lifeste = true;
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
```

**Step 2: 测试映射**

Run: `node -e "const em = require('./src/data/EffectMapper'); const test = {id:'TEST', attack:3, health:4, cost:5, mechanics:['BATTLECRY','TAUNT']}; console.log(em.transform(test))"`
Expected: PASS - 输出包含battlecry, taunt

**Step 3: Commit**

```bash
git add src/data/EffectMapper.js
git commit -me "feat: 添加EffectMapper实现mechanics映射"
```

---

## Task 5: 扩展CardEffect支持新机制

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 添加新机制处理**

在 CardEffect.js 中添加：

```javascript
  // 处理风怒
  handleWindfury(target, context) {
    target.windfury = true;
  }

  // 处理圣盾
  handleDivineShield(target, context) {
    target.divine_shield = true;
  }

  // 处理潜行
  handleStealth(target, context) {
    target.stealth = true;
  }

  // 处理剧毒
  handlePoisonous(attacker, target, context) {
    target.health = 0;
  }

  // 处理吸血
  handleLifesteal(attacker, target, context) {
    const player = context.player;
    player.health = Math.min(player.health + attacker.attack, player.maxHealth);
  }

  // 处理冲锋（使随从可以攻击）
  handleCharge(minion) {
    minion.canAttack = true;
    minion.sleeping = false;
  }

  // 处理嘲讽
  handleTaunt(minion) {
    minion.taunt = true;
  }
```

**Step 2: 测试编译**

Run: `node -e "require('./src/game/CardEffect'); console.log('CardEffect loaded')"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/game/CardEffect.js
git commit -m "feat: CardEffect支持新机制"
```

---

## Task 6: 完善现有卡牌数据引用新系统

**Files:**
- Modify: `src/game/GameEngine.js`
- Modify: `src/data/CardData.js`

**Step 1: 更新CardData集成EffectMapper**

在 CardData.js 中添加：

```javascript
  const EffectMapper = require('./EffectMapper');

  // 获取转换后的卡牌（含effect）
  getCardWithEffect(id) {
    const card = this.byId[id];
    if (!card) return null;
    return { ...card, effect: EffectMapper.transform(card) };
  }

  // 获取职业卡牌（含effect）
  getCardsByClassWithEffect(cardClass) {
    const cards = this.byClass[cardClass] || [];
    return cards.map(c => ({ ...c, effect: EffectMapper.transform(c) }));
  }
```

**Step 2: 更新GameEngine使用新数据**

在 GameEngine.js 的 createPlayer 方法中：

```javascript
  // 修改前
  const classCards = CardData.getCardsByClass(heroClass);

  // 修改后 - 使用带effect的数据
  const classCards = CardData.getCardsByClassWithEffect(heroClass);
```

**Step 3: 测试**

Run: `node -e "const CardData = require('./src/data/CardData'); const c = CardData.getCardWithEffect('CS2_022'); console.log(c.effect)"`
Expected: PASS

**Step 4: Commit**

```bash
git add src/data/CardData.js src/game/GameEngine.js
git commit -m "feat: 集成EffectMapper到游戏引擎"
```

---

## Task 7: 创建DeckBuilder模块

**Files:**
- Create: `src/data/DeckBuilder.js`

**Step 1: 创建DeckBuilder**

```javascript
// src/data/DeckBuilder.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DeckBuilder {
  constructor() {
    this.decksDir = path.join(__dirname, '../../data/decks');
    this.indexFile = path.join(this.decksDir, 'index.json');
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.decksDir)) {
      fs.mkdirSync(this.decksDir, { recursive: true });
    }
    if (!fs.existsSync(this.indexFile)) {
      fs.writeFileSync(this.indexFile, JSON.stringify([]));
    }
  }

  getDecks() {
    return JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
  }

  saveDecks(decks) {
    fs.writeFileSync(this.indexFile, JSON.stringify(decks, null, 2));
  }

  create(name, hero, mode = 'standard') {
    const deck = {
      id: uuidv4(),
      name,
      hero,
      mode,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const decks = this.getDecks();
    decks.push(deck);
    this.saveDecks(decks);
    return deck;
  }

  getDeck(id) {
    const decks = this.getDecks();
    return decks.find(d => d.id === id);
  }

  delete(id) {
    const decks = this.getDecks();
    const filtered = decks.filter(d => d.id !== id);
    this.saveDecks(filtered);
  }

  addCard(deckId, cardId) {
    const deck = this.getDeck(deckId);
    if (!deck) return null;
    const card = deck.cards.find(c => c.id === cardId);
    if (card) {
      card.count++;
    } else {
      deck.cards.push({ id: cardId, count: 1 });
    }
    deck.updatedAt = new Date().toISOString();
    this.saveDecks(this.getDecks().map(d => d.id === deckId ? deck : d));
    return deck;
  }

  removeCard(deckId, cardId) {
    const deck = this.getDeck(deckId);
    if (!deck) return null;
    const idx = deck.cards.findIndex(c => c.id === cardId);
    if (idx > -1) {
      deck.cards[idx].count--;
      if (deck.cards[idx].count <= 0) {
        deck.cards.splice(idx, 1);
      }
    }
    deck.updatedAt = new Date().toISOString();
    this.saveDecks(this.getDecks().map(d => d.id === deckId ? deck : d));
    return deck;
  }
}

module.exports = new DeckBuilder();
```

**Step 2: 测试**

Run: `node -e "const db = require('./src/data/DeckBuilder'); const d = db.create('Test', 'mage'); console.log('Created:', d.id)"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/data/DeckBuilder.js
git commit -m "feat: 添加DeckBuilder卡组管理模块"
```

---

## Task 8: 实现卡组验证规则

**Files:**
- Modify: `src/data/DeckBuilder.js`

**Step 1: 添加验证方法**

```javascript
  validate(deckId) {
    const deck = this.getDeck(deckId);
    if (!deck) return { valid: false, errors: ['Deck not found'] };

    const errors = [];
    const CardData = require('./CardData');

    // 检查卡组数量
    const totalCards = deck.cards.reduce((sum, c) => sum + c.count, 0);
    if (totalCards < 30) {
      errors.push(`卡组只有${totalCards}张卡，需要30张`);
    }

    // 检查每张卡
    deck.cards.forEach(card => {
      const cardData = CardData.getCard(card.id);
      if (!cardData) {
        errors.push(`卡牌 ${card.id} 不存在`);
        return;
      }

      // 检查职业
      if (cardData.cardClass !== 'NEUTRAL' && cardData.cardClass !== deck.hero) {
        errors.push(`${cardData.name} 不是${deck.hero}职业卡`);
      }

      // 检查数量限制
      const rarity = cardData.rarity;
      if (rarity === 'LEGENDARY' || rarity === 'EPIC') {
        if (card.count > 1) {
          errors.push(`${cardData.name} 只能带1张`);
        }
      } else {
        if (card.count > 2) {
          errors.push(`${cardData.name} 只能带2张`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }
```

**Step 2: 测试验证**

Run: `node -e "const db = require('./src/data/DeckBuilder'); console.log(db.validate('invalid'))"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/data/DeckBuilder.js
git commit -m "feat: DeckBuilder添加验证规则"
```

---

## Task 9: 实现卡组CRUD操作

**Files:**
- Modify: `src/data/DeckBuilder.js`

**Step 1: 添加更新和列表方法**

```javascript
  update(id, updates) {
    const decks = this.getDecks();
    const idx = decks.findIndex(d => d.id === id);
    if (idx === -1) return null;
    decks[idx] = { ...decks[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDecks(decks);
    return decks[idx];
  }

  list() {
    return this.getDecks();
  }

  listByHero(hero) {
    return this.getDecks().filter(d => d.hero === hero);
  }

  listByMode(mode) {
    return this.getDecks().filter(d => d.mode === mode);
  }
```

**Step 2: 测试**

Run: `node -e "const db = require('./src/data/DeckBuilder'); console.log('Decks:', db.list().length)"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/data/DeckBuilder.js
git commit -m "feat: DeckBuilder完善CRUD操作"
```

---

## Task 10: 创建卡组选择UI

**Files:**
- Create: `src/ui/screens/DeckSelection.js`

**Step 1: 创建卡组选择界面**

```javascript
// src/ui/screens/DeckSelection.js
const blessed = require('blessed');
const DeckBuilder = require('../../data/DeckBuilder');

class DeckSelection {
  constructor(screen, parent) {
    this.screen = screen;
    this.parent = parent;
    this.container = null;
    this.decks = [];
    this.selectedIndex = 0;
  }

  show(callback) {
    this.callback = callback;
    this.screen.currentScreen = 'deckSelection';
    this.decks = DeckBuilder.list();

    this.container = blessed.box({
      parent: this.parent,
      top: 'center',
      left: 'center',
      width: 60,
      height: 15,
      border: { type: 'line', fg: 'cyan' },
      style: { fg: 'white', bg: 'black', border: { fg: 'cyan' } }
    });

    blessed.text({
      parent: this.container,
      top: 1,
      left: 'center',
      content: '=== 选择卡组 ===',
      style: { fg: 'yellow', bold: true }
    });

    this.listBox = blessed.box({
      parent: this.container,
      top: 3,
      left: 0,
      width: '100%',
      height: 8,
      content: this.getListDisplay()
    });

    blessed.text({
      parent: this.container,
      bottom: 1,
      left: 'center',
      content: '上下选择  Enter确认  N新建  D删除  Esc返回',
      style: { fg: 'gray' }
    });

    this.bindKeys();
    this.screen.render();
  }

  getListDisplay() {
    if (this.decks.length === 0) return '暂无卡组，按N创建';
    return this.decks.map((d, i) => {
      const prefix = i === this.selectedIndex ? '> ' : '  ';
      return `${prefix}${d.name} (${d.hero})`;
    }).join('\n');
  }

  bindKeys() {
    const self = this;
    this.screen.key('up', () => {
      if (self.screen.currentScreen === 'deckSelection') {
        self.selectedIndex = (self.selectedIndex - 1 + self.decks.length) % self.decks.length;
        self.listBox.setContent(self.getListDisplay());
        self.screen.render();
      }
    });
    this.screen.key('down', () => {
      if (self.screen.currentScreen === 'deckSelection') {
        self.selectedIndex = (self.selectedIndex + 1) % self.decks.length;
        self.listBox.setContent(self.getListDisplay());
        self.screen.render();
      }
    });
    this.screen.key('enter', () => {
      if (self.screen.currentScreen === 'deckSelection' && self.decks[self.selectedIndex]) {
        self.callback(self.decks[self.selectedIndex]);
      }
    });
    this.screen.key('escape', () => self.back());
  }

  back() {
    this.destroy();
    const MainMenu = require('./MainMenu');
    const menu = new MainMenu(this.screen, this.parent);
    menu.show();
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

module.exports = DeckSelection;
```

**Step 2: 测试加载**

Run: `node -e "const ds = require('./src/ui/screens/DeckSelection'); console.log('DeckSelection loaded')"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/ui/screens/DeckSelection.js
git commit -m "feat: 添加卡组选择界面"
```

---

## Task 11: 端到端测试

**Step 1: 集成测试**

```bash
# 测试完整流程
node -e "
const CardSync = require('./src/data/CardSync');
const CardData = require('./src/data/CardData');
const DeckBuilder = require('./src/data/DeckBuilder');

async function test() {
  // 1. 同步数据
  console.log('Syncing...');
  await CardSync.sync();

  // 2. 验证加载
  console.log('Cards:', CardData.getAllCards().length);
  console.log('Mage cards:', CardData.getCardsByClass('MAGE').length);

  // 3. 创建卡组
  const deck = DeckBuilder.create('Test Deck', 'mage', 'standard');
  DeckBuilder.addCard(deck.id, 'CS2_022'); // icespike
  console.log('Deck created:', deck.id);

  // 4. 验证
  const result = DeckBuilder.validate(deck.id);
  console.log('Valid:', result.valid);
}

test();
"
```

**Step 2: Commit**

```bash
git commit -m "test: 添加集成测试"
```

---

## Task 12: 性能优化（如需要）

根据实际测试结果优化：
- 考虑添加缓存
- 懒加载卡牌图片（如需要）
- 批量操作优化

---

## 执行选项

**Plan complete and saved to `docs/plans/2026-03-03-official-cards.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
