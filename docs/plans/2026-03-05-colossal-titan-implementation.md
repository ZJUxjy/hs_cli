# 巨型(Colossal)和泰坦(Titan)机制实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现炉石传说的巨型和泰坦两个新机制

**Architecture:** 在 CardEffect.js 添加 COLOSSAL 和 TITAN 效果类型，在 GameEngine.js 的 summonMinion 中处理巨型附属物召唤，在 TurnManager.js 中处理泰坦技能使用限制，在 game.js 中添加泰坦技能弹窗。

**Tech Stack:** Node.js, JavaScript, HTML/CSS

---

## Task 1: 添加效果类型常量

**Files:**
- Modify: `src/game/CardEffect.js:10-63`

**Step 1: 添加 COLOSSAL 和 TITAN 到 TYPES**

在 CardEffect.TYPES 中添加：
```javascript
static TYPES = {
  // ... 现有类型
  BLOODLUST: 'bloodlust',
  // 新增巨型和泰坦机制
  COLOSSAL: 'colossal',
  TITAN: 'titan'
};
```

**Step 2: Commit**

```bash
git add src/game/CardEffect.js
git commit -m "feat: add COLOSSAL and TITAN effect types"
```

---

## Task 2: 修改 summonMinion 支持巨型机制

**Files:**
- Modify: `src/game/GameEngine.js:571-700`

**Step 1: 在 summonMinion 中添加巨型检测**

在 `summonMinion` 方法中，在 `player.field.push(minion);` 之后添加：

```javascript
// 处理巨型机制
if (card.effect?.colossal && card.effect?.appendages) {
  this.summonColossalAppendages(player, minion, card.effect.appendages);
}

// 处理泰坦机制
if (card.effect?.titan) {
  minion.titan = true;
  minion.titanAbilities = card.effect.titanAbilities || [];
  minion.titanAbilitiesUsed = [];
  minion.canAttack = false; // 泰坦初始不能攻击
}
```

**Step 2: 添加 summonColossalAppendages 方法**

在 GameEngine 类中添加新方法：

```javascript
/**
 * 召唤巨型随从的附属物
 * @param {object} player - 玩家
 * @param {object} parentMinion - 主体随从
 * @param {array} appendages - 附属物配置数组
 */
summonColossalAppendages(player, parentMinion, appendages) {
  const gameConfig = ConfigData.getGameConfig();
  const maxField = gameConfig?.maxFieldSize || 7;

  for (const appendageConfig of appendages) {
    // 检查战场是否已满
    if (player.field.length >= maxField) {
      Logger.info('战场已满，无法召唤更多附属物');
      break;
    }

    const appendage = {
      uid: this.generateUid(),
      id: `${parentMinion.id}_appendage_${appendageConfig.name}`,
      name: appendageConfig.name,
      attack: appendageConfig.attack || 0,
      health: appendageConfig.health || 0,
      maxHealth: appendageConfig.health || 0,
      canAttack: false,
      hasAttacked: false,
      frozen: false,
      sleeping: true,
      taunt: appendageConfig.taunt || false,
      isAppendage: true,
      parentMinionUid: parentMinion.uid,
      effects: []
    };

    player.field.push(appendage);
    Logger.info(`${parentMinion.name} 召唤了附属物 ${appendage.name}`);
  }
}
```

**Step 3: Commit**

```bash
git add src/game/GameEngine.js
git commit -m "feat: implement Colossal minion summoning with appendages"
```

---

## Task 3: 添加泰坦技能管理方法

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 添加 useTitanAbility 方法**

在 GameEngine 类中添加：

```javascript
/**
 * 使用泰坦技能
 * @param {object} player - 玩家
 * @param {object} minion - 泰坦随从
 * @param {number} abilityIndex - 技能索引 (0-2)
 * @returns {boolean} 是否成功
 */
useTitanAbility(player, minion, abilityIndex) {
  if (!minion.titan || !minion.titanAbilities) {
    Logger.warn('该随从不是泰坦');
    return false;
  }

  if (abilityIndex < 0 || abilityIndex >= minion.titanAbilities.length) {
    Logger.warn('无效的技能索引');
    return false;
  }

  if (minion.titanAbilitiesUsed.includes(abilityIndex)) {
    Logger.warn('该技能已经使用过');
    return false;
  }

  const ability = minion.titanAbilities[abilityIndex];

  // 执行技能效果
  const cardEffect = new CardEffect(this);
  const context = {
    player,
    target: this.getOpponent(),
    card: { effect: ability.effect }
  };

  // 根据效果类型执行
  switch (ability.effect.type) {
    case 'heal':
      this.executeTitanHeal(ability.effect, player);
      break;
    case 'summon':
      this.summonMinion(player, {
        id: `titan_summon_${Date.now()}`,
        name: ability.effect.name || '泰坦召唤物',
        effect: ability.effect
      });
      break;
    case 'buff':
      this.executeTitanBuff(ability.effect, player);
      break;
    case 'damage':
      this.executeTitanDamage(ability.effect, player);
      break;
    default:
      Logger.warn(`未知的泰坦技能类型: ${ability.effect.type}`);
      return false;
  }

  // 标记技能已使用
  minion.titanAbilitiesUsed.push(abilityIndex);
  Logger.info(`${minion.name} 使用了技能: ${ability.name}`);

  // 检查是否所有技能都已使用
  if (minion.titanAbilitiesUsed.length >= minion.titanAbilities.length) {
    minion.canAttack = true;
    Logger.info(`${minion.name} 所有技能已使用，现在可以攻击了`);
  }

  return true;
}

/**
 * 泰坦技能：治疗
 */
executeTitanHeal(effect, player) {
  const value = effect.value || 0;
  const target = effect.target || 'hero';

  if (target === 'all_friendly' || target === 'hero') {
    // 治疗英雄
    player.health = Math.min(player.health + value, player.maxHealth);
    Logger.info(`${player.name} 恢复 ${value} 点生命`);
  }

  if (target === 'all_friendly' || target === 'all_friendly_minions') {
    // 治疗所有随从
    player.field.forEach(minion => {
      minion.health = Math.min(minion.health + value, minion.maxHealth);
    });
    Logger.info(`所有友方随从恢复 ${value} 点生命`);
  }
}

/**
 * 泰坦技能：增益
 */
executeTitanBuff(effect, player) {
  const attack = effect.attack || 0;
  const health = effect.health || 0;

  player.field.forEach(minion => {
    minion.attack += attack;
    minion.health += health;
    minion.maxHealth += health;
  });

  Logger.info(`所有友方随从获得 +${attack}/+${health}`);
}

/**
 * 泰坦技能：伤害
 */
executeTitanDamage(effect, player) {
  const value = effect.value || 0;
  const opponent = this.getOpponent();

  if (effect.target === 'all_enemy') {
    // 对所有敌人造成伤害
    opponent.field.forEach(minion => {
      minion.health -= value;
    });
    opponent.health -= value;
    Logger.info(`对所有敌人造成 ${value} 点伤害`);
  } else if (effect.target === 'enemy_hero') {
    opponent.health -= value;
    Logger.info(`对敌方英雄造成 ${value} 点伤害`);
  }
}
```

**Step 2: Commit**

```bash
git add src/game/GameEngine.js
git commit -m "feat: add Titan ability management methods"
```

---

## Task 4: 添加 API 端点支持泰坦技能

**Files:**
- Modify: `src/api/game.js`

**Step 1: 添加泰坦技能使用端点**

在 `src/api/game.js` 中，在现有端点后添加：

```javascript
// 使用泰坦技能
router.post('/titanAbility', (req, res) => {
  const { minionIndex, abilityIndex } = req.body;

  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }

  const state = currentGame.getGameState();
  const player = state.player;

  if (minionIndex < 0 || minionIndex >= player.field.length) {
    return res.status(400).json({ error: 'Invalid minion index' });
  }

  const minion = player.field[minionIndex];

  if (!minion.titan) {
    return res.status(400).json({ error: 'Minion is not a Titan' });
  }

  const success = currentGame.useTitanAbility(player, minion, abilityIndex);

  if (success) {
    res.json(currentGame.getGameState());
  } else {
    res.status(400).json({ error: 'Failed to use Titan ability' });
  }
});

// 获取泰坦技能状态
router.get('/titanAbility', (req, res) => {
  const { minionIndex } = req.query;

  if (!currentGame) {
    return res.status(400).json({ error: 'No active game' });
  }

  const state = currentGame.getGameState();
  const player = state.player;

  if (minionIndex === undefined || minionIndex < 0 || minionIndex >= player.field.length) {
    return res.status(400).json({ error: 'Invalid minion index' });
  }

  const minion = player.field[minionIndex];

  if (!minion.titan) {
    return res.json({ isTitan: false });
  }

  res.json({
    isTitan: true,
    abilities: minion.titanAbilities,
    usedAbilities: minion.titanAbilitiesUsed,
    canAttack: minion.canAttack
  });
});
```

**Step 2: Commit**

```bash
git add src/api/game.js
git commit -m "feat: add API endpoints for Titan abilities"
```

---

## Task 5: 添加前端 API 方法

**Files:**
- Modify: `public/js/api.js`

**Step 1: 添加泰坦技能 API 方法**

在 `public/js/api.js` 的 API 对象中添加：

```javascript
// 使用泰坦技能
async function useTitanAbility(minionIndex, abilityIndex) {
  const res = await fetch(`${this.baseUrl}/game/titanAbility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minionIndex, abilityIndex })
  });
  return this._handleResponse(res);
},

// 获取泰坦技能状态
async function getTitanAbilityStatus(minionIndex) {
  const res = await fetch(`${this.baseUrl}/game/titanAbility?minionIndex=${minionIndex}`);
  return this._handleResponse(res);
}
```

**Step 2: Commit**

```bash
git add public/js/api.js
git commit -m "feat: add Titan ability API methods in frontend"
```

---

## Task 6: 添加泰坦技能弹窗 HTML

**Files:**
- Modify: `public/index.html`

**Step 1: 在 body 中添加泰坦技能弹窗**

在 `adapt-dialog` 之后添加：

```html
<!-- 泰坦技能弹窗 -->
<div id="titan-ability-dialog" class="dialog hidden">
  <div class="dialog-content">
    <h3 id="titan-name">泰坦名称</h3>
    <div id="titan-abilities" class="titan-abilities">
    </div>
  </div>
</div>
```

**Step 2: 添加 CSS 样式**

在 `public/css/components.css` 中添加：

```css
.titan-abilities {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.titan-ability-btn {
  padding: var(--space-4) var(--space-6);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.titan-ability-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--accent-gold);
  box-shadow: 0 0 15px rgba(240, 192, 64, 0.2);
}

.titan-ability-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

.titan-ability-btn .ability-name {
  display: block;
  font-size: var(--text-lg);
  color: var(--accent-gold);
  margin-bottom: var(--space-1);
}

.titan-ability-btn .ability-text {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
```

**Step 3: Commit**

```bash
git add public/index.html public/css/components.css
git commit -m "feat: add Titan ability dialog UI"
```

---

## Task 7: 添加前端泰坦技能逻辑

**Files:**
- Modify: `public/js/game.js`

**Step 1: 添加泰坦技能弹窗显示方法**

在 GameUI 类中添加：

```javascript
/**
 * 显示泰坦技能选择弹窗
 */
showTitanAbilityDialog(minionIndex) {
  const dialog = document.getElementById('titan-ability-dialog');
  const abilitiesContainer = document.getElementById('titan-abilities');
  const titanNameEl = document.getElementById('titan-name');

  if (!dialog || !this.gameState) return;

  const player = this.gameState.player;
  const minion = player.field[minionIndex];

  if (!minion || !minion.titan) return;

  // 设置泰坦名称
  if (titanNameEl) {
    titanNameEl.textContent = `${minion.name} - 选择技能`;
  }

  // 生成技能按钮
  abilitiesContainer.innerHTML = minion.titanAbilities.map((ability, idx) => {
    const isUsed = minion.titanAbilitiesUsed.includes(idx);
    return `
      <button class="titan-ability-btn" data-index="${idx}" ${isUsed ? 'disabled' : ''}>
        <span class="ability-name">${isUsed ? '✓ ' : ''}${ability.name}</span>
        <span class="ability-text">${ability.text}</span>
      </button>
    `;
  }).join('');

  // 绑定点击事件
  abilitiesContainer.querySelectorAll('.titan-ability-btn:not(:disabled)').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      this.useTitanAbility(minionIndex, idx);
    };
  });

  dialog.classList.remove('hidden');
}

/**
 * 使用泰坦技能
 */
async useTitanAbility(minionIndex, abilityIndex) {
  try {
    this.gameState = await API.useTitanAbility(minionIndex, abilityIndex);
    const dialog = document.getElementById('titan-ability-dialog');
    if (dialog) dialog.classList.add('hidden');
    this.render();
    this.showMessage('泰坦技能已使用');
  } catch (err) {
    console.error('Failed to use Titan ability:', err);
    this.showMessage('技能使用失败');
  }
}
```

**Step 2: 修改 renderPlayerField 支持泰坦点击**

在 `renderPlayerField` 方法中，修改 minion 渲染部分：

```javascript
field.innerHTML = minions.map((minion, i) => {
  const canAttack = minion.canAttack !== false && this.isPlayerTurn && !minion.sleeping && !minion.frozen && !minion.hasAttacked;
  const isTitan = minion.titan;
  const remainingAbilities = isTitan ? minion.titanAbilities.length - minion.titanAbilitiesUsed.length : 0;

  return `
    <div class="minion ${canAttack ? 'can-attack' : ''} ${this.selectedMinionIndex === i ? 'selected' : ''} ${isTitan ? 'titan' : ''}"
         data-index="${i}" data-can-attack="${canAttack}" data-is-titan="${isTitan}">
      ${minion.taunt ? '<span class="minion-taunt"></span>' : ''}
      ${minion.windfury ? '<span class="mechanic-icon windfury-icon">W</span>' : ''}
      ${minion.isAppendage ? '<span class="mechanic-icon appendage-icon">A</span>' : ''}
      ${isTitan ? `<span class="mechanic-icon titan-icon">T(${remainingAbilities})</span>` : ''}
      <div class="minion-name">${minion.name}</div>
      <div class="minion-stats">
        <span class="minion-attack">${minion.attack}</span>
        <span class="minion-health">${minion.health}</span>
      </div>
    </div>
  `;
}).join('');
```

**Step 3: 修改 bindEvents 支持泰坦点击**

在 `bindEvents` 方法中，修改 player field 点击事件：

```javascript
// Player field click
const playerField = document.getElementById('player-field');
if (playerField) {
  playerField.onclick = (e) => {
    const minionEl = e.target.closest('.minion');
    if (minionEl) {
      const index = parseInt(minionEl.dataset.index);
      const isTitan = minionEl.dataset.isTitan === 'true';

      if (isTitan && this.isPlayerTurn) {
        // 泰坦随从显示技能弹窗
        this.showTitanAbilityDialog(index);
      } else {
        this.selectMinion(index);
      }
    }
  };
}
```

**Step 4: Commit**

```bash
git add public/js/game.js
git commit -m "feat: implement Titan ability UI and interaction"
```

---

## Task 8: 添加示例卡牌数据

**Files:**
- Modify: `data/cards/neutral.json` (如果不存在则创建)

**Step 1: 创建/修改 neutral.json 添加巨型和泰坦卡牌**

```json
[
  {
    "id": "neutral_colossal_crab",
    "name": "可拉克",
    "type": "minion",
    "cost": 7,
    "rarity": "legendary",
    "description": "7/6，巨型+1。可拉克的壳获得嘲讽",
    "effect": {
      "type": "summon",
      "attack": 7,
      "health": 6,
      "colossal": 1,
      "appendages": [
        { "name": "可拉克的壳", "attack": 5, "health": 8, "taunt": true }
      ]
    },
    "classes": ["neutral"]
  },
  {
    "id": "neutral_titan_eonar",
    "name": "生命的缚誓者艾欧娜尔",
    "type": "minion",
    "cost": 8,
    "rarity": "legendary",
    "description": "8/8，泰坦。拥有3个技能",
    "effect": {
      "type": "summon",
      "attack": 8,
      "health": 8,
      "titan": true,
      "titanAbilities": [
        { "id": "heal_all", "name": "生命绽放", "text": "为所有友方角色恢复3点生命", "effect": { "type": "heal", "value": 3, "target": "all_friendly" } },
        { "id": "summon_seed", "name": "播种生命", "text": "召唤一个2/2的植物", "effect": { "type": "summon", "name": "生命种子", "attack": 2, "health": 2 } },
        { "id": "buff_field", "name": "自然之力", "text": "使你的所有随从获得+2/+2", "effect": { "type": "buff", "attack": 2, "health": 2, "target": "all_friendly_minions" } }
      ]
    },
    "classes": ["neutral"]
  }
]
```

**Step 2: Commit**

```bash
git add data/cards/neutral.json
git commit -m "feat: add Colossal and Titan example cards"
```

---

## Task 9: 测试验证

**Step 1: 启动服务器**

```bash
node server.js
```

**Step 2: 打开游戏**

访问 `http://localhost:3000` 并开始游戏。

**Step 3: 测试巨型机制**

1. 使用法师职业开始游戏
2. 抽到/获得"可拉克"卡牌
3. 打出可拉克
4. 验证：
   - 主体7/6召唤到战场
   - 附属物5/8嘲讽"可拉克的壳"同时召唤
   - 附属物显示"A"标记

**Step 4: 测试泰坦机制**

1. 抽到/获得"生命的缚誓者艾欧娜尔"
2. 打出艾欧娜尔
3. 点击艾欧娜尔
4. 验证：
   - 弹出技能选择对话框
   - 显示3个技能：生命绽放、播种生命、自然之力
   - 选择技能后效果正确执行
   - 已使用技能显示为禁用
   - 3个技能用完后可以攻击

**Step 5: Commit**

```bash
git commit -m "test: verify Colossal and Titan mechanics"
```

---

## 完成总结

实现完成后，项目将支持：

1. **巨型(Colossal)机制**
   - 召唤主体时自动召唤附属物
   - 附属物作为独立随从存在
   - 显示"A"标记区分附属物

2. **泰坦(Titan)机制**
   - 3个独立技能
   - 点击泰坦显示技能选择弹窗
   - 技能用完后才能攻击
   - 显示剩余可用技能数
