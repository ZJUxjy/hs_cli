# 炉石传说战吼亡语及新职业扩展实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 实现战吼(battlecry)和亡语(deathrattle)机制，并添加6个新职业(猎人、圣骑士、萨满、牧师、盗贼、德鲁伊)及72张卡牌

**Architecture:** 扩展 CardEffect.js 添加战吼/亡语处理方法，扩展 GameEngine.js 在随从召唤/死亡时触发效果，更新配置文件和卡牌数据

**Tech Stack:** Node.js, JSON 卡牌数据, 游戏引擎

---

## Task 1: 修改 CardEffect.js - 添加战吼亡语处理

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 添加新效果类型常量**

在 TYPES 对象中添加:
```javascript
BATTLECRY: 'battlecry',
DEATHRATTLE: 'deathrattle',
SILENCE: 'silence'
```

**Step 2: 添加 executeBattlecry 方法**

```javascript
executeBattlecry(card, context) {
  const battlecry = card.effect?.battlecry;
  if (!battlecry) return;

  const effect = { ...battlecry };
  // 处理特殊参数
  if (effect.card_id) {
    // 需要从卡牌库获取卡牌
    const CardData = require('../data/CardData');
    const summonCard = CardData.getCard(effect.card_id);
    if (summonCard) {
      effect.summonCard = summonCard;
    }
  }

  switch (effect.type) {
    case 'damage':
      this.executeDamage(effect, context);
      break;
    case 'heal':
      this.executeHeal(effect, context);
      break;
    case 'draw_card':
      this.executeDrawCard(effect, context);
      break;
    case 'armor':
      this.executeArmor(effect, context);
      break;
    case 'summon':
      this.executeSummon(effect.summonCard || effect, effect, context);
      break;
    case 'buff':
      this.executeBuff(effect, context);
      break;
    case 'silence':
      this.executeSilence(effect, context);
      break;
  }
}
```

**Step 3: 添加 executeDeathrattle 方法**

```javascript
executeDeathrattle(minion, context) {
  const deathrattle = minion.deathrattle;
  if (!deathrattle) return;

  switch (deathrattle.type) {
    case 'summon':
      if (deathrattle.card_id) {
        const CardData = require('../data/CardData');
        const summonCard = CardData.getCard(deathrattle.card_id);
        if (summonCard) {
          this.game.summonMinion(context.player, summonCard);
        }
      }
      break;
    case 'damage':
      const opponent = context.player === this.game.state.player
        ? this.game.state.ai
        : this.game.state.player;
      opponent.health -= deathrattle.value;
      break;
    case 'draw_card':
      this.game.drawCard(context.player, deathrattle.value || 1);
      break;
    case 'buff':
      // 给自己场上的随从buff
      context.player.field.forEach(m => {
        m.attack += (deathrattle.attack || 0);
        m.health += (deathrattle.health || 0);
        m.maxHealth = Math.max(m.maxHealth, m.health);
      });
      break;
  }
}
```

**Step 4: 添加 executeBuff 方法**

```javascript
executeBuff(effect, context) {
  if (!context.target || context.target.health === undefined) {
    Logger.warn('Buff目标无效');
    return;
  }

  if (effect.value !== undefined) {
    context.target.attack += effect.value;
  }
  if (effect.health !== undefined) {
    context.target.health += effect.health;
    context.target.maxHealth = Math.max(context.target.maxHealth, context.target.health);
  }
  if (effect.taunt) {
    context.target.taunt = true;
  }
}
```

**Step 5: 添加 executeSilence 方法**

```javascript
executeSilence(effect, context) {
  if (!context.target || context.target.health === undefined) {
    Logger.warn('Silence目标无效');
    return;
  }

  // 沉默所有负面效果
  context.target.taunt = false;
  context.target.frozen = false;
  context.target.sleeping = false;
  context.target.buffs = [];
}
```

**Step 6: 测试验证**

运行: `node -e "const CardEffect = require('./src/game/CardEffect'); console.log('CardEffect loaded');"`
Expected: 输出 "CardEffect loaded"

---

## Task 2: 修改 GameEngine.js - 触发战吼亡语

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 修改 summonMinion 方法触发战吼**

在 `summonMinion` 方法中，`player.field.push(minion)` 后添加:

```javascript
// 存储战吼和亡语到随从对象
minion.battlecry = card.effect?.battlecry || null;
minion.deathrattle = card.effect?.deathrattle || null;

player.field.push(minion);

// 触发战吼
if (minion.battlecry) {
  const CardEffect = require('./CardEffect');
  const cardEffect = new CardEffect(this);
  cardEffect.executeBattlecry(card, { player, target: player, card });
}

return true;
```

**Step 2: 修改 removeDeadMinions 方法触发亡语**

替换整个 `removeDeadMinions` 方法:

```javascript
removeDeadMinions() {
  if (!this.state) return;

  const player = this.state.player;
  const ai = this.state.ai;

  const playerCount = player.field.length;
  const aiCount = ai.field.length;

  // 分离死亡和存活的随从
  const deadPlayerMinions = player.field.filter(m => m.health <= 0);
  const deadAiMinions = ai.field.filter(m => m.health <= 0);

  player.field = player.field.filter(m => m.health > 0);
  ai.field = ai.field.filter(m => m.health > 0);

  // 触发玩家随从亡语
  deadPlayerMinions.forEach(minion => {
    if (minion.deathrattle) {
      const CardEffect = require('./CardEffect');
      const cardEffect = new CardEffect(this);
      cardEffect.executeDeathrattle(minion, { player, target: ai, card: minion });
    }
  });

  // 触发敌方随从亡语
  deadAiMinions.forEach(minion => {
    if (minion.deathrattle) {
      const CardEffect = require('./CardEffect');
      const cardEffect = new CardEffect(this);
      cardEffect.executeDeathrattle(minion, { player: ai, target: player, card: minion });
    }
  });

  if (player.field.length < playerCount) {
    Logger.info('你的随从阵亡');
  }
  if (ai.field.length < aiCount) {
    Logger.info('敌方随从阵亡');
  }
}
```

**Step 3: 测试验证**

运行: `node index-text.js` 并尝试打出有战吼/亡语的随从

---

## Task 3: 更新职业配置

**Files:**
- Modify: `data/config.json`

**Step 1: 添加新职业配置**

在 `classes` 中添加:

```json
"hunter": {
  "id": "hunter",
  "name": "猎人",
  "startingHealth": 30,
  "heroPower": { "name": "稳固射击", "cost": 2, "damage": 1 }
},
"paladin": {
  "id": "paladin",
  "name": "圣骑士",
  "startingHealth": 30,
  "heroPower": { "name": "保护之手", "cost": 2, "armor": 2 }
},
"shaman": {
  "id": "shaman",
  "name": "萨满",
  "startingHealth": 30,
  "heroPower": { "name": "图腾召唤", "cost": 2, "type": "totem" }
},
"priest": {
  "id": "priest",
  "name": "牧师",
  "startingHealth": 30,
  "heroPower": { "name": "暗影形态", "cost": 2, "damage": 1 }
},
"rogue": {
  "id": "rogue",
  "name": "盗贼",
  "startingHealth": 30,
  "heroPower": { "name": "疾跑", "cost": 2, "draw": 2 }
},
"druid": {
  "id": "druid",
  "name": "德鲁伊",
  "startingHealth": 30,
  "heroPower": { "name": "月火术", "cost": 2, "damage": 1 }
}
```

---

## Task 4-9: 创建6个职业卡牌文件

### Task 4: 创建猎人卡牌

**Files:**
- Create: `data/cards/hunter.json`

**内容 (12张卡牌):**

```json
[
  { "id": "hunter_arcane_shot", "name": "奥术射击", "type": "spell", "cost": 1, "rarity": "common", "description": "造成2点伤害", "effect": { "type": "damage", "value": 2 }, "classes": ["hunter"] },
  { "id": "hunter_timber_wolf", "name": "森林狼", "type": "minion", "cost": 2, "rarity": "common", "description": "2/1，其他野兽获得+1攻击力", "effect": { "type": "summon", "attack": 2, "health": 1, "battlecry": { "type": "buff", "value": 1 } }, "classes": ["hunter"] },
  { "id": "hunter_animal_companion", "name": "动物伙伴", "type": "spell", "cost": 3, "rarity": "common", "description": "召唤一个随机野兽伙伴", "effect": { "type": "summon", "card_id": "hunter_boar" }, "classes": ["hunter"] },
  { "id": "hunter_boar", "name": "野猪", "type": "minion", "cost": 1, "rarity": "common", "description": "1/1", "effect": { "type": "summon", "attack": 1, "health": 1, "charge": true }, "classes": ["hunter"] },
  { "id": "hunter_misdirection", "name": "误导", "type": "spell", "cost": 2, "rarity": "rare", "description": "奥秘：当敌人攻击时，随机转移给另一个角色", "effect": { "type": "secret", "trigger": "enemy_attack" }, "classes": ["hunter"] },
  { "id": "hunter_kill_command", "name": "杀戮命令", "type": "spell", "cost": 3, "rarity": "common", "description": "造成3点伤害，你的野兽+2攻击力", "effect": { "type": "damage", "value": 3 }, "classes": ["hunter"] },
  { "id": "hunter_snipe", "name": "狙击", "type": "spell", "cost": 2, "rarity": "rare", "description": "奥秘：在敌人使用随从后，对其造成4点伤害", "effect": { "type": "secret", "trigger": "enemy_minion_played" }, "classes": ["hunter"] },
  { "id": "hunter_explosive_trap", "name": "爆炸陷阱", "type": "spell", "cost": 2, "rarity": "common", "description": "奥秘：当敌人攻击时，对所有敌人造成2点伤害", "effect": { "type": "secret", "trigger": "enemy_attack" }, "classes": ["hunter"] },
  { "id": "hunter_freezing_trap", "name": "冰冻陷阱", "type": "spell", "cost": 2, "rarity": "rare", "description": "奥秘：敌人攻击随从时，将其移回手牌", "effect": { "type": "secret", "trigger": "enemy_attack" }, "classes": ["hunter"] },
  { "id": "hunter_leokk", "name": "雷克萨", "type": "minion", "cost": 3, "rarity": "legendary", "description": "战吼：召唤一个2/2的猎豹", "effect": { "type": "summon", "attack": 2, "health": 2, "battlecry": { "type": "summon", "card_id": "hunter_cheetah" } }, "classes": ["hunter"] },
  { "id": "hunter_cheetah", "name": "猎豹", "type": "minion", "cost": 1, "rarity": "common", "description": "2/2", "effect": { "type": "summon", "attack": 2, "health": 2 }, "classes": ["hunter"] },
  { "id": "hunter_tirion", "name": "提里奥·弗丁", "type": "minion", "cost": 8, "rarity": "legendary", "description": "圣盾，嘲讽，战吼：装备一把4/2的灰烬使者", "effect": { "type": "summon", "attack": 6, "health": 6, "taunt": true, "divine_shield": true, "battlecry": { "type": "armor", "value": 5 } }, "classes": ["hunter"] }
]
```

### Task 5: 创建圣骑士卡牌

**Files:**
- Create: `data/cards/paladin.json`

### Task 6: 创建萨满卡牌

**Files:**
- Create: `data/cards/shaman.json`

### Task 7: 创建牧师卡牌

**Files:**
- Create: `data/cards/priest.json`

### Task 8: 创建盗贼卡牌

**Files:**
- Create: `data/cards/rogue.json`

### Task 9: 创建德鲁伊卡牌

**Files:**
- Create: `data/cards/druid.json`

**内容要求:** 每个文件包含12张卡牌，包含战吼(battlecry)和亡语(deathrattle)效果

---

## Task 10: 更新 AIEngine 支持新职业

**Files:**
- Modify: `src/game/AIEngine.js`

**Step 1: 更新英雄技能执行**

在 `executeHeroPower` 方法中添加新职业的英雄技能:

```javascript
executeHeroPower(player) {
  const opponent = this.game.getOpponent();

  if (player.hero === 'mage') {
    // 法师: 造成1点伤害
  } else if (player.hero === 'warrior') {
    // 战士: 获得2点护甲
  } else if (player.hero === 'hunter') {
    // 猎人: 造成1点伤害
    this.cardEffect.execute(
      { effect: { type: 'damage', value: 1 } },
      { target: opponent, player }
    );
  } else if (player.hero === 'paladin') {
    // 圣骑士: 获得2点护甲
    this.cardEffect.execute(
      { effect: { type: 'armor', value: 2 } },
      { player }
    );
  } else if (player.hero === 'shaman') {
    // 萨满: 随机召唤图腾
    const totems = ['healing_totem', 'searing_totem', 'stoneclaw_totem', 'wrath_of_air_totem'];
    // 随机选择一个图腾召唤
  } else if (player.hero === 'priest') {
    // 牧师: 造成1点伤害
  } else if (player.hero === 'rogue') {
    // 盗贼: 抽2张牌
    this.game.drawCard(player, 2);
  } else if (player.hero === 'druid') {
    // 德鲁伊: 造成1点伤害
  }

  player.usedHeroPower = true;
  player.mana -= 2;
}
```

---

## Task 11: 整体测试

**Step 1: 测试新职业可用性**

运行: `node index-text.js` 并选择新职业

**Step 2: 测试战吼效果**

打出有战吼的随从，验证效果触发

**Step 3: 测试亡语效果**

让随从死亡，验证亡语触发

**Step 4: 测试 RL Server**

运行: `node rl-server.js` 并测试 API

---

## 验收标准

1. 战吼机制正确触发
2. 亡语机制正确触发
3. 6个新职业可选
4. 72张新卡牌可用
5. AI支持新职业英雄技能
6. CLI和RL Server游戏内容一致
