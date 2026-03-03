# 炉石传说卡牌与机制扩展实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 添加更多游戏机制(抉择、风怒、潜行、剧毒、进化、过载、连击、圣盾等)并大幅扩展卡牌池

**Architecture:** 扩展 CardEffect.js、GameEngine.js，BattleCalculator.js 添加新机制处理，添加新卡牌数据

**Tech Stack:** Node.js, JSON 卡牌数据, 游戏引擎

---

## Task 1: 扩展 CardEffect.js - 添加新效果处理

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 添加新效果类型常量**

在 TYPES 对象中添加（第32行后）:
```javascript
WINDURY: 'windfury',
STEALTH: 'stealth',
POISONOUS: 'poisonous',
EVOLVE: 'evolve',
OVERLOAD: 'overload',
COMBO: 'combo',
DIVINE_SHIELD: 'divine_shield',
IMMUNE: 'immune',
CHOOSE: 'choose'
```

**Step 2: 在 execute 方法的 switch 中添加新效果**

在 execute 方法（约第83行）的 switch 中添加:
```javascript
case 'evolve':
  return this.executeEvolve(effect, context);
case 'combo':
  return this.executeCombo(effect, context);
```

**Step 3: 添加 executeEvolve 方法**

在文件末尾添加（约第580行）:
```javascript
executeEvolve(effect, context) {
  const { player } = context;
  if (!player.field || player.field.length === 0) return false;

  const evolveCount = effect.count || 1;

  for (let i = 0; i < evolveCount && player.field.length > 0; i++) {
    const randomMinion = player.field[Math.floor(Math.random() * player.field.length)];
    randomMinion.attack += 1;
    randomMinion.health += 1;
    randomMinion.maxHealth = Math.max(randomMinion.maxHealth + 1, randomMinion.health);
    Logger.info(`${randomMinion.name} 进化了! (+1/+1)`);
  }
  return true;
}
```

**Step 4: 添加 executeCombo 方法**

在 executeEvolve 后添加:
```javascript
executeCombo(effect, context) {
  const { player, card } = context;
  const handCount = player.hand ? player.hand.length : 0;

  if (effect.buff && handCount > 0) {
    const buffEffect = { ...effect.buff };
    // 连击时增强效果
    if (handCount >= 3) {
      buffEffect.value = (buffEffect.value || 0) + 2;
      buffEffect.health = (buffEffect.health || 0) + 2;
    }
    return this.executeBuff(buffEffect, context);
  }
  return true;
}
```

**Step 5: 测试验证**

运行: `node -e "const CardEffect = require('./src/game/CardEffect'); console.log('CardEffect loaded');"`
Expected: 输出 "CardEffect loaded"

---

## Task 2: 扩展 GameEngine.js - 过载和抉择机制

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 添加过载处理**

找到 startTurn 方法，在法力处理部分添加:
```javascript
// 处理过载（来自上个回合）
if (player.overload && player.overload > 0) {
  const overloadedMana = player.maxMana - player.overload;
  player.mana = Math.min(player.mana, Math.max(0, overloadedMana));
  Logger.info(`${player.hero} 本回合过载锁定 ${player.overload} 点法力`);
  player.overload = 0;
}
```

**Step 2: 添加 applyOverload 方法**

在 GameEngine 中添加:
```javascript
applyOverload(player, overloadValue) {
  if (!player.overload) player.overload = 0;
  player.overload += overloadValue;
  Logger.info(`下回合将过载 ${player.overload} 点`);
}
```

**Step 3: 添加抉择状态管理**

添加:
```javascript
setChoice(player, choiceData) {
  if (!this.state) return false;
  player.currentChoice = choiceData;
  this.state.phase = 'choice';
  this.setMessage(`请选择: 1) ${choiceData.option1.name}  2) ${choiceData.option2.name}`);
  return true;
}

resolveChoice(player, option) {
  if (!player.currentChoice) return false;

  const choice = player.currentChoice;
  if (option === 1 && choice.option1) {
    this.executeCardEffect(choice.card, choice.option1, choice.context);
  } else if (option === 2 && choice.option2) {
    this.executeCardEffect(choice.card, choice.option2, choice.context);
  }

  player.currentChoice = null;
  this.state.phase = 'main';
  return true;
}
```

**Step 4: 测试验证**

运行: `node -e "const GameEngine = require('./src/game/GameEngine'); console.log('GameEngine loaded');"`

---

## Task 3: 扩展 BattleCalculator.js - 剧毒圣盾免疫

**Files:**
- Modify: `src/game/BattleCalculator.js`

**Step 1: 修改 battle 方法处理剧毒和圣盾**

找到 battle 方法（约第101行），修改为:
```javascript
static battle(minion1, minion2) {
  // 剧毒检查
  if (minion1.poisonous) {
    minion2.health = 0;
    Logger.info(`${minion2.name} 被剧毒杀死`);
    return;
  }
  if (minion2.poisonous) {
    minion1.health = 0;
    Logger.info(`${minion1.name} 被剧毒杀死`);
    return;
  }

  // 圣盾处理 - 攻击者
  if (minion1.divine_shield) {
    minion1.divine_shield = false;
    Logger.info(`${minion1.name} 的圣盾被打破`);
  } else {
    minion1.health -= minion2.attack || 0;
  }

  // 圣盾处理 - 防御者
  if (minion2.divine_shield) {
    minion2.divine_shield = false;
    Logger.info(`${minion2.name} 的圣盾被打破`);
  } else {
    minion2.health -= minion1.attack || 0;
  }
}
```

**Step 2: 修改 calculateDamage 方法处理免疫**

在 calculateDamage 方法开头添加:
```javascript
static calculateDamage(target, damage, effect = {}) {
  // 免疫检查
  if (target.immune) {
    Logger.info(`${target.name} 免疫了伤害`);
    return 0;
  }

  // 圣盾检查
  if (target.divine_shield && damage > 0) {
    target.divine_shield = false;
    Logger.info(`${target.name} 的圣盾被打破`);
    return 0;
  }

  // ... 现有逻辑
}
```

**Step 3: 添加 attackHero 方法处理剧毒**

修改 attackHero 方法添加剧毒检查:
```javascript
static attackHero(attacker, targetPlayer) {
  // 剧毒
  if (attacker.poisonous) {
    targetPlayer.health = 0;
    Logger.info(`${targetPlayer.hero} 被剧毒杀死`);
    return;
  }

  // 免疫
  if (targetPlayer.immune) return;

  // 圣盾
  if (targetPlayer.divine_shield) {
    targetPlayer.divine_shield = false;
    Logger.info(`${targetPlayer.hero} 的圣盾被打破`);
    return;
  }

  // ... 现有逻辑
}
```

**Step 4: 测试验证**

运行: `node -e "const BattleCalculator = require('./src/game/BattleCalculator'); console.log('BattleCalculator loaded');"`

---

## Task 4: 扩展猎人卡牌

**Files:**
- Modify: `data/cards/hunter.json`

**添加10张新卡牌:**
```json
{ "id": "hunter_multi_shot", "name": "多重射击", "type": "spell", "cost": 4, "rarity": "common", "description": "随机对两个敌人造成3点伤害", "effect": { "type": "random_damage", "value": 3, "count": 2 }, "classes": ["hunter"] },
{ "id": "hunter_huntress", "name": "女猎手", "type": "minion", "cost": 3, "rarity": "common", "description": "3/3，战吼：使一个野兽获得风怒", "effect": { "type": "summon", "attack": 3, "health": 3, "battlecry": { "type": "buff", "windfury": true } }, "classes": ["hunter"] },
{ "id": "hunter_scavenging_hyena", "name": "食腐土狼", "type": "minion", "cost": 2, "rarity": "common", "description": "2/2，亡语：召唤一个2/2的土狼", "effect": { "type": "summon", "attack": 2, "health": 2, "deathrattle": { "type": "summon", "attack": 2, "health": 2 } }, "classes": ["hunter"] },
{ "id": "hunter_glaive", "name": " Glaive", "type": "weapon", "cost": 3, "rarity": "rare", "description": "3/2", "effect": { "type": "weapon", "attack": 3, "durability": 2 }, "classes": ["hunter"] },
{ "id": "hunter_dire_murloc", "name": "恐狼", "type": "minion", "cost": 4, "rarity": "rare", "description": "4/4，嘲讽，其他野兽获得+1/+1", "effect": { "type": "summon", "attack": 4, "health": 4, "taunt": true }, "classes": ["hunter"] },
{ "id": "hunter_cobra", "name": "眼镜蛇", "type": "minion", "cost": 5, "rarity": "rare", "description": "5/3，剧毒", "effect": { "type": "summon", "attack": 5, "health": 3, "poisonous": true }, "classes": ["hunter"] },
{ "id": "hunter_flare", "name": "照明弹", "type": "spell", "cost": 2, "rarity": "rare", "description": "消灭所有奥秘，抽一张牌", "effect": { "type": "draw_card", "value": 1 }, "classes": ["hunter"] },
{ "id": "hunter_bear_form", "name": "熊形态", "type": "spell", "cost": 3, "rarity": "common", "description": "抉择：获得+2/+4和嘲讽，或造成2点伤害", "effect": { "type": "choose" }, "classes": ["hunter"] },
{ "id": "hunter_call_pet", "name": "召唤宠物", "type": "spell", "cost": 2, "rarity": "common", "description": "抽一张牌，如果抽到野兽则获得+1/+1", "effect": { "type": "draw_card", "value": 1 }, "classes": ["hunter"] },
{ "id": "hunter_core_hound", "name": "熔岩猎犬", "type": "minion", "cost": 6, "rarity": "common", "description": "6/5，亡语：随机召唤一个野兽", "effect": { "type": "summon", "attack": 6, "health": 5 }, "classes": ["hunter"] }
```

---

## Task 5: 扩展圣骑士卡牌

**Files:**
- Modify: `data/cards/paladin.json`

**添加10张新卡牌:**
```json
{ "id": "paladin_steward_peace", "name": "秩序之光", "type": "minion", "cost": 4, "rarity": "rare", "description": "4/3，圣盾，战吼：造成2点伤害", "effect": { "type": "summon", "attack": 4, "health": 3, "divine_shield": true, "battlecry": { "type": "damage", "value": 2 } }, "classes": ["paladin"] },
{ "id": "paladin_shielded_1", "name": "作战机器人", "type": "minion", "cost": 1, "rarity": "common", "description": "1/2，圣盾", "effect": { "type": "summon", "attack": 1, "health": 2, "divine_shield": true }, "classes": ["paladin"] },
{ "id": "paladin_quartermaster", "name": "军需官", "type": "minion", "cost": 5, "rarity": "epic", "description": "5/4，亡语：获得5点护甲", "effect": { "type": "summon", "attack": 5, "health": 4, "deathrattle": { "type": "armor", "value": 5 } }, "classes": ["paladin"] },
{ "id": "paladin_peacekeeper", "name": "和平守护者", "type": "minion", "cost": 3, "rarity": "rare", "description": "3/3，战吼：将一个随从变为1/1", "effect": { "type": "summon", "attack": 3, "health": 3, "battlecry": { "type": "transform", "target": "minion" } }, "classes": ["paladin"] },
{ "id": "paladin_reckless", "name": "无畏", "type": "spell", "cost": 3, "rarity": "common", "description": "使你的所有随从获得冲锋和+1攻击力", "effect": { "type": "buff", "charge": true, "value": 1 }, "classes": ["paladin"] },
{ "id": "paladin_cavalry", "name": "银色骑士", "type": "minion", "cost": 6, "rarity": "rare", "description": "6/6，荣耀激励：获得+2/+2", "effect": { "type": "summon", "attack": 6, "health": 6 }, "classes": ["paladin"] },
{ "id": "paladin_righteous", "name": "正义", "type": "spell", "cost": 2, "rarity": "common", "description": "对一个随从造成3点伤害，复兴", "effect": { "type": "damage", "value": 3 }, "classes": ["paladin"] },
{ "id": "paladin_musician", "name": "吟游诗人", "type": "minion", "cost": 3, "rarity": "common", "description": "3/3，战吼：使一个友方随从获得圣盾", "effect": { "type": "summon", "attack": 3, "health": 3, "battlecry": { "type": "buff", "divine_shield": true } }, "classes": ["paladin"] },
{ "id": "paladin_ARGENT", "name": "银色黎明", "type": "minion", "cost": 5, "rarity": "rare", "description": "5/5，嘲讽，圣盾", "effect": { "type": "summon", "attack": 5, "health": 5, "taunt": true, "divine_shield": true }, "classes": ["paladin"] },
{ "id": "paladin_lightrager", "name": "光铸者", "type": "minion", "cost": 7, "rarity": "legendary", "description": "6/6，嘲讽，圣盾，战吼：恢复6点生命值", "effect": { "type": "summon", "attack": 6, "health": 6, "taunt": true, "divine_shield": true, "battlecry": { "type": "heal", "value": 6 } }, "classes": ["paladin"] }
```

---

## Task 6: 扩展萨满卡牌

**Files:**
- Modify: `data/cards/shaman.json`

**添加10张新卡牌:**
```json
{ "id": "shaman_totem_golem", "name": "图腾魔像", "type": "minion", "cost": 3, "rarity": "common", "description": "3/3，过载(1)", "effect": { "type": "summon", "attack": 3, "health": 3 }, "classes": ["shaman"] },
{ "id": "shaman_unstable", "name": "不稳定的元素", "type": "minion", "cost": 2, "rarity": "rare", "description": "2/1，过载(2)，亡语：对所有角色造成2点伤害", "effect": { "type": "summon", "attack": 2, "health": 1 }, "classes": ["shaman"] },
{ "id": "shaman_lava_burst", "name": " Lava爆发", "type": "spell", "cost": 4, "rarity": "rare", "description": "造成5点伤害，过载(2)", "effect": { "type": "damage", "value": 5 }, "classes": ["shaman"] },
{ "id": "shaman_ancestor", "name": "先祖之魂", "type": "spell", "cost": 3, "rarity": "rare", "description": "使一个随从获得亡语：召唤该随从", "effect": { "type": "buff", "deathrattle": { "type": "resurrect" } }, "classes": ["shaman"] },
{ "id": "shaman_feral_rage", "name": "野性之怒", "type": "spell", "cost": 4, "rarity": "common", "description": "抉择：获得8点护甲，或造成4点伤害", "effect": { "type": "choose" }, "classes": ["shaman"] },
{ "id": "shaman_siltfin", "name": "沙丘锤", "type": "weapon", "cost": 4, "rarity": "rare", "description": "3/2，过载(1)", "effect": { "type": "weapon", "attack": 3, "durability": 2 }, "classes": ["shaman"] },
{ "id": "shaman_thing_below", "name": "深渊滑行者", "type": "minion", "cost": 4, "rarity": "epic", "description": "4/5，过载(2)，战吼：进化", "effect": { "type": "summon", "attack": 4, "health": 5, "battlecry": { "type": "evolve", "count": 1 } }, "classes": ["shaman"] },
{ "id": "shaman_jade", "name": "青玉之灵", "type": "minion", "cost": 5, "rarity": "rare", "description": "5/5，战吼：召唤一个青玉魔像", "effect": { "type": "summon", "attack": 5, "health": 5 }, "classes": ["shaman"] },
{ "id": "shaman_earth_shaker", "name": "大地震击", "type": "spell", "cost": 2, "rarity": "common", "description": "对一个随从造成2点伤害，过载(1)", "effect": { "type": "damage", "value": 2 }, "classes": ["shaman"] },
{ "id": "shaman_thunder", "name": "雷鸣", "type": "spell", "cost": 6, "rarity": "epic", "description": "对所有敌人造成3点伤害，进化所有你的随从", "effect": { "type": "aoe_damage", "value": 3, "evolve": true }, "classes": ["shaman"] }
```

---

## Task 7: 扩展牧师卡牌

**Files:**
- Modify: `data/cards/priest.json`

**添加10张新卡牌:**
```json
{ "id": "priest_resurrect", "name": "复活", "type": "spell", "cost": 2, "rarity": "rare", "description": "复活一个友方随从", "effect": { "type": "resurrect" }, "classes": ["priest"] },
{ "id": "priest_auchenai", "name": "奥金尼", "type": "minion", "cost": 4, "rarity": "rare", "description": "4/5，治疗之触会在本回合造成伤害", "effect": { "type": "summon", "attack": 4, "health": 5 }, "classes": ["priest"] },
{ "id": "priest_cabal", "name": "暗影祭司", "type": "minion", "cost": 5, "rarity": "rare", "description": "5/5，战吼：获得一个敌方随从的控制权", "effect": { "type": "summon", "attack": 5, "health": 5, "battlecry": { "type": "steal" } }, "classes": ["priest"] },
{ "id": "priest_psyfiend", "name": "精神控制者", "type": "minion", "cost": 3, "rarity": "rare", "description": "2/4，潜行", "effect": { "type": "summon", "attack": 2, "health": 4, "stealth": true }, "classes": ["priest"] },
{ "id": "priest_shadow_word_horror", "name": "精神烙印", "type": "spell", "cost": 4, "rarity": "rare", "description": "消灭所有攻击力为2的随从", "effect": { "type": "execute" }, "classes": ["priest"] },
{ "id": "priest_renew", "name": "恢复", "type": "spell", "cost": 1, "rarity": "common", "description": "恢复3点生命值，抽一张牌", "effect": { "type": "heal", "value": 3, "draw_card": 1 }, "classes": ["priest"] },
{ "id": "priest_shadow_reaper", "name": "暗影收割者", "type": "minion", "cost": 6, "rarity": "legendary", "description": "6/6，战吼：消灭所有攻击力小于等于5的敌方随从", "effect": { "type": "summon", "attack": 6, "health": 6 }, "classes": ["priest"] },
{ "id": "priest_waver", "name": "暮光使徒", "type": "minion", "cost": 4, "rarity": "common", "description": "3/5，潜行", "effect": { "type": "summon", "attack": 3, "health": 5, "stealth": true }, "classes": ["priest"] },
{ "id": "priest_ember", "name": "暗影之火", "type": "spell", "cost": 5, "rarity": "epic", "description": "造成8点伤害", "effect": { "type": "damage", "value": 8 }, "classes": ["priest"] },
{ "id": "priest_mass_dispel", "name": "群体驱散", "type": "spell", "cost": 4, "rarity": "epic", "description": "沉默所有敌方随从，抽一张牌", "effect": { "type": "draw_card", "value": 1 }, "classes": ["priest"] }
```

---

## Task 8: 扩展盗贼卡牌

**Files:**
- Modify: `data/cards/rogue.json`

**添加10张新卡牌:**
```json
{ "id": "rogue_shadowcaster", "name": "暗影行者", "type": "minion", "cost": 5, "rarity": "rare", "description": "5/5，战吼：将一个友方随从变为1/1", "effect": { "type": "summon", "attack": 5, "health": 5 }, "classes": ["rogue"] },
{ "id": "rogue_beneath", "name": "深渊", "type": "spell", "cost": 2, "rarity": "rare", "description": "将一个随从移回其拥有者手牌", "effect": { "type": "bounce" }, "classes": ["rogue"] },
{ "id": "rogue_sap", "name": "消沉", "type": "spell", "cost": 2, "rarity": "common", "description": "将一个敌方随从移回其拥有者手牌", "effect": { "type": "bounce" }, "classes": ["rogue"] },
{ "id": "rogue_shadow_dagger", "name": "暗影之刃", "type": "weapon", "cost": 4, "rarity": "rare", "description": "4/2，连击：获得免疫", "effect": { "type": "weapon", "attack": 4, "durability": 2 }, "classes": ["rogue"] },
{ "id": "rogue_hogger", "name": "霍格", "type": "minion", "cost": 4, "rarity": "legendary", "description": "4/4，潜行，亡语：召唤两个2/2的豺狼人", "effect": { "type": "summon", "attack": 4, "health": 4, "stealth": true, "deathrattle": { "type": "summon", "count": 2 } }, "classes": ["rogue"] },
{ "id": "rogue_defias", "name": "迪菲亚兄弟", "type": "minion", "cost": 3, "rarity": "common", "description": "3/2，连击：召唤一个2/1的迪菲亚海盗", "effect": { "type": "summon", "attack": 3, "health": 2 }, "classes": ["rogue"] },
{ "id": "rogue_poisoned", "name": "淬毒", "type": "spell", "cost": 3, "rarity": "common", "description": "使你的武器获得剧毒", "effect": { "type": "weapon_buff", "poisonous": true }, "classes": ["rogue"] },
{ "id": "rogue_shirley", "name": "空灵", "type": "minion", "cost": 2, "rarity": "rare", "description": "2/2，潜行，连击：获得+2/+2", "effect": { "type": "summon", "attack": 2, "health": 2, "stealth": true }, "classes": ["rogue"] },
{ "id": "rogue_ambush", "name": "伏击", "type": "spell", "cost": 2, "rarity": "rare", "description": "奥秘：当敌人打出随从时，召唤一个4/4的刺客", "effect": { "type": "secret", "trigger": "enemy_minion_played" }, "classes": ["rogue"] },
{ "id": "rogue_blade", "name": " Tal dl  之刃", "type": "weapon", "cost": 5, "rarity": "epic", "description": "5/3，连击：造成两次伤害", "effect": { "type": "weapon", "attack": 5, "durability": 3 }, "classes": ["rogue"] }
```

---

## Task 9: 扩展德鲁伊卡牌

**Files:**
- Modify: `data/cards/druid.json`

**添加10张新卡牌:**
```json
{ "id": "druid_grove", "name": "丛林之魂", "type": "spell", "cost": 3, "rarity": "common", "description": "抉择：使一个随从获得+2/+4，或造成3点伤害", "effect": { "type": "choose" }, "classes": ["druid"] },
{ "id": "druid_savannah", "name": "平原狮", "type": "minion", "cost": 5, "rarity": "common", "description": "5/5，抉择：获得+2/+2或嘲讽", "effect": { "type": "summon", "attack": 5, "health": 5 }, "classes": ["druid"] },
{ "id": "druid_wisps", "name": "精灵之魂", "type": "spell", "cost": 7, "rarity": "epic", "description": "召唤七个1/1的小精灵", "effect": { "type": "summon", "count": 7, "attack": 1, "health": 1 }, "classes": ["druid"] },
{ "id": "druid_mire_creature", "name": "湿地生物", "type": "minion", "cost": 4, "rarity": "rare", "description": "4/4，嘲讽，亡语：获得一个法力水晶", "effect": { "type": "summon", "attack": 4, "health": 4, "taunt": true }, "classes": ["druid"] },
{ "id": "druid_jade_idol", "name": "青玉巨像", "type": "minion", "cost": 5, "rarity": "rare", "description": "5/5，亡语：召唤一个青玉魔像", "effect": { "type": "summon", "attack": 5, "health": 5 }, "classes": ["druid"] },
{ "id": "druid_grow", "name": "生长", "type": "spell", "cost": 2, "rarity": "common", "description": "抉择：获得一个法力水晶，或抽一张牌", "effect": { "type": "choose" }, "classes": ["druid"] },
{ "id": "druid_mark", "name": "爪击", "type": "spell", "cost": 1, "rarity": "common", "description": "造成2点伤害，连击：改为4点", "effect": { "type": "damage", "value": 2 }, "classes": ["druid"] },
{ "id": "druid_bark", "name": "树皮术", "type": "spell", "cost": 3, "rarity": "common", "description": "抉择：获得4点护甲，或对一个随从造成3点伤害", "effect": { "type": "choose" }, "classes": ["druid"] },
{ "id": "druid_ancient_war", "name": "上古之神", "type": "minion", "cost": 8, "rarity": "legendary", "description": "8/8，嘲讽，战吼：对所有敌人造成3点伤害", "effect": { "type": "summon", "attack": 8, "health": 8, "taunt": true, "battlecry": { "type": "aoe_damage", "value": 3 } }, "classes": ["druid"] },
{ "id": "druid_twig", "name": "世界之树的枝条", "type": "weapon", "cost": 7, "rarity": "legendary", "description": "5/8，亡语：将该武器移回你的手牌", "effect": { "type": "weapon", "attack": 5, "durability": 8, "deathrattle": { "type": "bounce" } }, "classes": ["druid"] }
```

---

## Task 10: 更新 AI 适配新机制

**Files:**
- Modify: `src/game/AIEngine.js`

**Step 1: 添加 AI 对过载卡牌的处理**

在选择卡牌时考虑过载值:
```javascript
// 检查过载
if (card.effect?.overload) {
  // 评估过载风险
}
```

**Step 2: 添加 AI 对剧毒随从的处理**

优先攻击剧毒随从:
```javascript
// 优先处理剧毒威胁
```

**Step 3: 测试验证**

运行: `node -e "const AIEngine = require('./src/game/AIEngine'); console.log('AIEngine loaded');"`

---

## Task 11: 整体测试

**Step 1: 测试新机制**

运行基本模块测试:
```bash
node -e "
const CardEffect = require('./src/game/CardEffect');
const GameEngine = require('./src/game/GameEngine');
const BattleCalculator = require('./src/game/BattleCalculator');
console.log('All modules loaded successfully');
"
```

**Step 2: 测试新卡牌**

```bash
node -e "
const CardData = require('./src/data/CardData');
console.log('Hunter:', CardData.getCardsByClass('hunter').length);
console.log('Paladin:', CardData.getCardsByClass('paladin').length);
console.log('Shaman:', CardData.getCardsByClass('shaman').length);
console.log('Priest:', CardData.getCardsByClass('priest').length);
console.log('Rogue:', CardData.getCardsByClass('rogue').length);
console.log('Druid:', CardData.getCardsByClass('druid').length);
"
```

**Step 3: 测试 RL Server**

```bash
node rl-server.js &
curl http://localhost:3000/reset -X POST
curl http://localhost:3000/action_space
```

---

## 验收标准

1. 新机制(过载、抉择、剧毒、圣盾、免疫、风怒、潜行、进化、连击)正确实现
2. 60+ 张新卡牌可用
3. AI 正确处理新机制
4. CLI 和 RL Server 游戏内容一致
