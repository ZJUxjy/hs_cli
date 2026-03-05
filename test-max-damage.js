const BattleCalculator = require('./src/game/BattleCalculator');

// 测试用例1：无嘲讽，普通随从
console.log('=== 测试1：无嘲讽，普通随从 ===');
const opponent1 = [{ attack: 3, health: 5, canAttack: true, frozen: false, sleeping: false, hasAttacked: false }];
const myHero1 = { id: 'player', hero: 'warrior', health: 30, maxHealth: 30, armor: 0, immune: false, divine_shield: false };
const myField1 = [];
const result1 = BattleCalculator.calculateMaxDamage(opponent1, myHero1, myField1);
console.log('预期: 3, 实际:', result1);
console.log('结果:', result1 === 3 ? 'PASS' : 'FAIL');

// 测试用例2：圣盾随从攻击（攻击者圣盾不影响伤害）
console.log('\n=== 测试2：圣盾随从攻击 ===');
const opponent2 = [{ attack: 3, health: 5, canAttack: true, frozen: false, sleeping: false, hasAttacked: false, divine_shield: true }];
const myHero2 = { id: 'player', hero: 'warrior', health: 30, maxHealth: 30, armor: 0, immune: false, divine_shield: false };
const myField2 = [];
const result2 = BattleCalculator.calculateMaxDamage(opponent2, myHero2, myField2);
console.log('预期: 3, 实际:', result2);
console.log('结果:', result2 === 3 ? 'PASS' : 'FAIL');

// 测试用例3：风怒随从
console.log('\n=== 测试3：风怒随从 ===');
const opponent3 = [{ attack: 3, health: 5, canAttack: true, frozen: false, sleeping: false, hasAttacked: false, windfury: true }];
const myHero3 = { id: 'player', hero: 'warrior', health: 30, maxHealth: 30, armor: 0, immune: false, divine_shield: false };
const myField3 = [];
const result3 = BattleCalculator.calculateMaxDamage(opponent3, myHero3, myField3);
console.log('预期: 6, 实际:', result3);
console.log('结果:', result3 === 6 ? 'PASS' : 'FAIL');

// 测试用例4：有嘲讽（攻击被嘲讽吸收，对英雄伤害为0）
console.log('\n=== 测试4：有嘲讽 ===');
const opponent4 = [{ attack: 4, health: 5, canAttack: true, frozen: false, sleeping: false, hasAttacked: false }];
const myHero4 = { id: 'player', hero: 'warrior', health: 30, maxHealth: 30, armor: 0, immune: false, divine_shield: false };
const myField4 = [{ attack: 2, health: 3, taunt: true }];
const result4 = BattleCalculator.calculateMaxDamage(opponent4, myHero4, myField4);
console.log('预期: 0, 实际:', result4);
console.log('结果:', result4 === 0 ? 'PASS' : 'FAIL');

// 测试用例5：高攻随从击杀嘲讽后，低攻随从可以攻击英雄
console.log('\n=== 测试5：击杀嘲讽后低攻随从攻击英雄 ===');
const opponent5 = [
  { attack: 5, health: 5, canAttack: true, frozen: false, sleeping: false, hasAttacked: false },
  { attack: 2, health: 3, canAttack: true, frozen: false, sleeping: false, hasAttacked: false }
];
const myHero5 = { id: 'player', hero: 'warrior', health: 30, maxHealth: 30, armor: 0, immune: false, divine_shield: false };
const myField5 = [{ attack: 2, health: 3, taunt: true }];
const result5 = BattleCalculator.calculateMaxDamage(opponent5, myHero5, myField5);
console.log('预期: 2, 实际:', result5);
console.log('结果:', result5 === 2 ? 'PASS' : 'FAIL');
