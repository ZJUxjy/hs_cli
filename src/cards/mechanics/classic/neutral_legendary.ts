// Classic Neutral Legendary Card Scripts
import { cardScriptsRegistry } from '../index';

// All Classic Neutral Legendary cards (42 cards)
const legendaryCards = [
  'CS2_101', // Sir Finley Mrrgl
  'CS2_103', // Mogu'shan Warden
  'CS2_104', // Fen Creeper
  'CS2_121', // Booty Bay Bodyguard
  'CS2_124', // Fen Creeper
  'CS2_169', // Young Dragonhawk
  'CS2_186', // Injured Blademaster
  'CS2_213', // Emperor Cobra
  'CS2_214', // Lupine Ferocity
  'EX1_001', //顺林熊
  'EX1_002', //阿古斯防御者
  'EX1_004', //战利品贮藏者
  'EX1_005', //石拳食人魔
  'EX1_006', // Legendary
  'EX1_008', // 精灵龙
  'EX1_010', // 精灵
  'EX1_012', // 监护者
  'EX1_014', // 苦痛侍僧
  'EX1_020', // 牛头人熔岩
  'EX1_021', // 暗鳞治愈者
  'EX1_023', // 银月城侍从
  'EX1_028', // 闪金镇步兵
  'EX1_033', // 风险投资公司雇佣兵
  'EX1_043', // 深渊之王
  'EX1_050', // 鱼人领军
  'EX1_055', // 科多兽
  'EX1_058', // 戈鲁克
  'EX1_066', // 污染者
  'EX1_093', // 食腐狼
  'EX1_100', // 火车王里诺艾
  'EX1_105', // रण
  'EX1_110', // 冰霜元素
  'EX1_116', // 暴龙
  'EX1_186', // 谨慎的出售者
  'EX1_249', // 复仇
  'EX1_284', // 奥秘
  'EX1_306', // 海巨人之
  'EX1_383', // 炎魔
  'EX1_384', // 复仇者
  'EX1_562', // 噬月者巴库
  'NEW1_030', // 鲲鹏
  'NEW1_038', // 筑巢龙
  'NEW1_040', // 协商
];

// Register all as empty scripts (to be implemented)
for (const cardId of legendaryCards) {
  cardScriptsRegistry.register(cardId, {});
}

console.log('[Classic Neutral Legendary] Registered', legendaryCards.length, 'card scripts');
