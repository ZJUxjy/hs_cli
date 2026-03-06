// BattleCalculator 测试
const BattleCalculator = require('../src/game/BattleCalculator');

// 测试工具函数
function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ 测试失败: ${message}`);
  }
  console.log(`✅ ${message}`);
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`❌ ${message}\n   期望值: ${expected}\n   实际值: ${actual}`);
  }
  console.log(`✅ ${message}: ${actual}`);
}

// 创建测试用的随从
function createMinion(overrides = {}) {
  return {
    id: 'test-minion',
    name: '测试随从',
    attack: 3,
    health: 5,
    maxHealth: 5,
    ...overrides
  };
}

function createHero(overrides = {}) {
  return {
    id: 'test-hero',
    hero: 'mage',
    name: '测试英雄',
    health: 30,
    maxHealth: 30,
    armor: 0,
    isHero: true,
    ...overrides
  };
}

console.log('=== BattleCalculator 测试开始 ===\n');

// 测试1: 基本伤害计算
console.log('--- 测试1: 基本伤害计算 ---');
{
  const target = createMinion({ health: 10 });
  const damage = BattleCalculator.calculateDamage(target, 3);
  assertEquals(damage, 3, '基本伤害计算');
  assertEquals(target.health, 7, '目标生命值正确减少');
}

// 测试2: 圣盾效果
console.log('\n--- 测试2: 圣盾效果 ---');
{
  const target = createMinion({ divine_shield: true, health: 10 });
  const damage = BattleCalculator.calculateDamage(target, 5);
  assertEquals(damage, 0, '圣盾应该阻挡所有伤害');
  assertEquals(target.divine_shield, false, '圣盾应该被打破');
  assertEquals(target.health, 10, '生命值不应减少');
}

// 测试3: 护甲计算
console.log('\n--- 测试3: 护甲计算 ---');
{
  const hero = createHero({ armor: 5, health: 30 });
  const damage = BattleCalculator.calculateDamage(hero, 8);
  assertEquals(hero.armor, 0, '护甲应该被消耗完');
  assertEquals(hero.health, 27, '剩余伤害应该减少生命值');
}

// 测试4: 治疗计算
console.log('\n--- 测试4: 治疗计算 ---');
{
  const target = createMinion({ health: 3, maxHealth: 10 });
  const healAmount = BattleCalculator.calculateHeal(target, 5);
  assertEquals(healAmount, 5, '治疗量正确');
  assertEquals(target.health, 8, '生命值正确增加');

  // 测试过量治疗
  const target2 = createMinion({ health: 8, maxHealth: 10 });
  const healAmount2 = BattleCalculator.calculateHeal(target2, 5);
  assertEquals(healAmount2, 2, '过量治疗应该被限制');
  assertEquals(target2.health, 10, '生命值不应超过最大值');
}

// 测试5: 随从战斗 - 基本
console.log('\n--- 测试5: 随从战斗 ---');
{
  const minion1 = createMinion({ attack: 3, health: 5 });
  const minion2 = createMinion({ attack: 2, health: 4 });

  const result = BattleCalculator.battle(minion1, minion2);

  assertEquals(minion1.health, 3, '攻击者受到反击伤害 (5-2=3)');
  assertEquals(minion2.health, 1, '防御者受到伤害 (4-3=1)');
  assertEquals(result.minion1Dead, false, '攻击者未死亡');
  assertEquals(result.minion2Dead, false, '防御者未死亡');
}

// 测试6: 随从战斗 - 死亡
console.log('\n--- 测试6: 随从战斗 - 死亡 ---');
{
  const minion1 = createMinion({ attack: 5, health: 10 });
  const minion2 = createMinion({ attack: 1, health: 3 });

  const result = BattleCalculator.battle(minion1, minion2);

  assert(minion2.health <= 0, '防御者应该死亡');
  assertEquals(result.minion2Dead, true, '返回结果正确标记死亡');
}

// 测试7: 剧毒效果
console.log('\n--- 测试7: 剧毒效果 ---');
{
  const minion1 = createMinion({ poisonous: true, attack: 1, health: 5 });
  const minion2 = createMinion({ attack: 2, health: 10 });

  const result = BattleCalculator.battle(minion1, minion2);

  assertEquals(minion2.health, 0, '剧毒应该直接杀死目标');
  assertEquals(result.minion2Dead, true, '返回结果正确');
  assertEquals(minion1.health, 3, '攻击者受到反击伤害 (5-2=3)');
}

// 测试8: 克隆功能
console.log('\n--- 测试8: 克隆功能 ---');
{
  const original = createMinion({
    attack: 5,
    health: 10,
    divine_shield: true,
    poisonous: true
  });

  const clone = BattleCalculator.cloneMinion(original);

  // 修改克隆
  clone.health = 5;
  clone.divine_shield = false;

  // 验证原对象未被修改
  assertEquals(original.health, 10, '原随从生命值未被修改');
  assertEquals(original.divine_shield, true, '原随从圣盾未被修改');
  assertEquals(clone.health, 5, '克隆生命值正确');
  assertEquals(clone.isHero, false, '克隆标记为随从');
}

// 测试9: 模拟攻击
console.log('\n--- 测试9: 模拟攻击 ---');
{
  const attacker = createMinion({ attack: 4, health: 6 });
  const target = createMinion({ attack: 2, health: 5 });

  const result = BattleCalculator.simulateAttack(attacker, target);

  assertEquals(result.damage, 4, '伤害计算正确');
  assertEquals(result.attackerState.health, 4, '攻击者状态更新正确 (6-2=4)');
  assertEquals(result.targetState.health, 1, '目标状态更新正确 (5-4=1)');
  assertEquals(attacker.health, 6, '原攻击者未被修改');
  assertEquals(target.health, 5, '原目标未被修改');
}

// 测试10: 模拟攻击英雄（带护甲）
console.log('\n--- 测试10: 模拟攻击英雄 ---');
{
  const attacker = createMinion({ attack: 5 });
  const hero = createHero({ armor: 3, health: 30 });

  const result = BattleCalculator.simulateAttack(attacker, hero);

  assertEquals(result.targetState.armor, 0, '护甲被消耗');
  assertEquals(result.targetState.health, 28, '生命值减少 (30-(5-3)=28)');
  assertEquals(result.attackerState.dead, false, '攻击者不会死亡（英雄不反击）');
}

// 测试11: 最大伤害计算 - 基本
console.log('\n--- 测试11: 最大伤害计算 ---');
{
  const opponentField = [
    createMinion({ attack: 3, health: 5, canAttack: true }),
    createMinion({ attack: 2, health: 3, canAttack: true })
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, []);

  assertEquals(damage, 5, '两个随从都攻击英雄造成5点伤害');
}

// 测试12: 最大伤害计算 - 嘲讽
console.log('\n--- 测试12: 最大伤害计算 - 嘲讽 ---');
{
  const opponentField = [
    createMinion({ attack: 5, health: 5, canAttack: true })
  ];
  const myField = [
    createMinion({ attack: 1, health: 3, taunt: true })
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, myField);

  assertEquals(damage, 0, '有嘲讽时必须先攻击嘲讽');
  // calculateMaxDamage 使用克隆对象进行模拟，不会修改原始对象
  assertEquals(myField[0].health, 3, '原始随从状态未被修改');
}

// 测试13: 最大伤害计算 - 风怒
console.log('\n--- 测试13: 最大伤害计算 - 风怒 ---');
{
  const opponentField = [
    createMinion({ attack: 4, health: 5, canAttack: true, windfury: true })
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, []);

  assertEquals(damage, 8, '风怒随从攻击两次');
}

// 测试14: 最大伤害计算 - 复杂场景
console.log('\n--- 测试14: 最大伤害计算 - 复杂场景 ---');
{
  const opponentField = [
    createMinion({ attack: 5, health: 10, canAttack: true }),  // 攻击嘲讽
    createMinion({ attack: 3, health: 5, canAttack: true, windfury: true })  // 攻击英雄两次
  ];
  const myField = [
    createMinion({ attack: 1, health: 5, taunt: true })  // 会被第一个杀死
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, myField);

  assertEquals(damage, 6, '第一个随从杀嘲讽，第二个风怒攻击英雄两次 (3+3)');
}

// 测试15: 圣盾在模拟攻击中
console.log('\n--- 测试15: 圣盾在模拟攻击中 ---');
{
  const attacker = createMinion({ attack: 5 });
  const target = createMinion({ health: 10, divine_shield: true });

  const result = BattleCalculator.simulateAttack(attacker, target);

  assertEquals(result.damage, 0, '圣盾阻挡伤害');
  assertEquals(result.targetState.divine_shield, false, '圣盾被打破');
  assertEquals(result.targetState.health, 10, '生命值未减少');
}

// 测试16: 剧毒在模拟攻击中
console.log('\n--- 测试16: 剧毒在模拟攻击中 ---');
{
  const attacker = createMinion({ attack: 1, health: 5, poisonous: true });
  const target = createMinion({ health: 10 });

  const result = BattleCalculator.simulateAttack(attacker, target);

  assertEquals(result.targetState.health, 0, '剧毒直接杀死目标');
  assertEquals(result.targetState.dead, true, '目标标记为死亡');
}

// 测试17: 冰冻效果
console.log('\n--- 测试17: 冰冻效果 ---');
{
  const target = createMinion({ frozen: false });
  BattleCalculator.calculateDamage(target, 1, { freeze: true });
  assertEquals(target.frozen, true, '目标被冻结');
}

// 测试18: 免疫效果
console.log('\n--- 测试18: 免疫效果 ---');
{
  const target = createMinion({ immune: true, health: 10 });
  const damage = BattleCalculator.calculateDamage(target, 5);
  assertEquals(damage, 0, '免疫阻挡所有伤害');
  assertEquals(target.health, 10, '生命值不变');
}

// 测试19: buff应用
console.log('\n--- 测试19: buff应用 ---');
{
  const minion = createMinion({ attack: 2, health: 3, maxHealth: 3 });
  BattleCalculator.applyBuff(minion, { attack: 2, health: 3 });
  assertEquals(minion.attack, 4, '攻击力增加');
  assertEquals(minion.health, 6, '生命值增加');
  assertEquals(minion.maxHealth, 6, '最大生命值增加');
}

// 测试20: 法术伤害加成
console.log('\n--- 测试20: 法术伤害加成 ---');
{
  const target = createMinion({ health: 10 });
  const damage = BattleCalculator.calculateDamage(target, 3, { isSpell: true, spellPower: 2 });
  assertEquals(damage, 5, '法术伤害加成生效');
  assertEquals(target.health, 5, '生命值正确减少');
}

// 测试21: 两个嘲讽 - 高攻先杀一个，然后杀第二个
console.log('\n--- 测试21: 两个嘲讽 ---');
{
  const opponentField = [
    createMinion({ attack: 5, health: 5, canAttack: true }),  // 先攻击
    createMinion({ attack: 3, health: 5, canAttack: true })   // 后攻击
  ];
  const myField = [
    createMinion({ attack: 1, health: 3, taunt: true }),  // 被5攻杀
    createMinion({ attack: 1, health: 4, taunt: true })   // 被3攻杀
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, myField);

  assertEquals(damage, 0, '有两个嘲讽时不能攻击英雄');
}

// 测试22: 嘲讽有圣盾
console.log('\n--- 测试22: 嘲讽有圣盾 ---');
{
  const opponentField = [
    createMinion({ attack: 5, health: 5, canAttack: true })
  ];
  const myField = [
    createMinion({ attack: 1, health: 3, taunt: true, divine_shield: true })
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, myField);

  assertEquals(damage, 0, '圣盾嘲讽必须先攻击');
  // 模拟后圣盾应该被打破，但calculateMaxDamage不修改原始对象
}

// 测试23: 普通随从 + 嘲讽混合
console.log('\n--- 测试23: 普通随从 + 嘲讽混合 ---');
{
  const opponentField = [
    createMinion({ attack: 5, health: 5, canAttack: true })  // 杀嘲讽后无事可做
  ];
  const myField = [
    createMinion({ attack: 1, health: 3, taunt: true }),  // 被杀死
    createMinion({ attack: 10, health: 10 })              // 普通随从不影响攻击优先级
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, myField);

  assertEquals(damage, 0, '有嘲讽时不能攻击普通随从或英雄');
}

// 测试24: 风怒随从杀嘲讽后攻击英雄
console.log('\n--- 测试24: 风怒随从杀嘲讽后攻击英雄 ---');
{
  const opponentField = [
    createMinion({ attack: 5, health: 5, canAttack: true, windfury: true })  // 风怒，第一下杀嘲讽，第二下打英雄
  ];
  const myField = [
    createMinion({ attack: 1, health: 5, taunt: true })  // 被5攻一下杀
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, myField);

  assertEquals(damage, 5, '风怒杀嘲讽后第二下攻击英雄');
}

// 测试25: 攻击力为0的随从
console.log('\n--- 测试25: 攻击力为0的随从 ---');
{
  const opponentField = [
    createMinion({ attack: 0, health: 5, canAttack: true })
  ];
  const myHero = createHero({ health: 30 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, []);

  assertEquals(damage, 0, '0攻随从不造成伤害');
}

// 测试26: 最大伤害计算 - 英雄有护甲
console.log('\n--- 测试26: 最大伤害计算 - 英雄有护甲 ---');
{
  const opponentField = [
    createMinion({ attack: 5, health: 5, canAttack: true })
  ];
  const myHero = createHero({ health: 30, armor: 3 });

  const damage = BattleCalculator.calculateMaxDamage(opponentField, myHero, []);

  assertEquals(damage, 5, '护甲不影响伤害计算（伤害仍然造成，只是被护甲吸收）');
}

// 测试27: 反击致死
console.log('\n--- 测试27: 反击致死 ---');
{
  const minion1 = createMinion({ attack: 2, health: 2 });
  const minion2 = createMinion({ attack: 3, health: 10 });

  const result = BattleCalculator.battle(minion1, minion2);

  assertEquals(result.minion1Dead, true, '攻击者被反击杀死');
  assertEquals(result.minion2Dead, false, '防御者存活');
  assertEquals(minion1.health, -1, '攻击者生命为-1（2-3=-1）');
}

// 测试28: 双方剧毒
console.log('\n--- 测试28: 双方剧毒 ---');
{
  const minion1 = createMinion({ attack: 1, health: 5, poisonous: true });
  const minion2 = createMinion({ attack: 1, health: 10, poisonous: true });

  const result = BattleCalculator.battle(minion1, minion2);

  assertEquals(result.minion1Dead, true, '双方剧毒都死亡');
  assertEquals(result.minion2Dead, true, '双方剧毒都死亡');
}

// 测试29: 圣盾阻挡反击
console.log('\n--- 测试29: 圣盾阻挡反击 ---');
{
  const minion1 = createMinion({ attack: 2, health: 2, divine_shield: true });
  const minion2 = createMinion({ attack: 10, health: 10 });

  const result = BattleCalculator.battle(minion1, minion2);

  assertEquals(result.minion1Dead, false, '圣盾阻挡反击，攻击者存活');
  assertEquals(minion1.divine_shield, false, '圣盾被打破');
  assertEquals(minion1.health, 2, '攻击者生命值不变');
}

// 测试30: 吸血效果 - 目标死亡
console.log('\n--- 测试30: 吸血效果 - 目标死亡 ---');
{
  const minion1 = createMinion({ attack: 5, health: 10, lifesteal: true });
  minion1.owner = createHero({ health: 20, maxHealth: 30 });
  const minion2 = createMinion({ attack: 1, health: 3 });

  const result = BattleCalculator.battle(minion1, minion2);

  assertEquals(minion1.owner.health, 25, '吸血恢复5点生命（攻击力）');
}

console.log('\n=== 所有测试通过! ===');
