/**
 * Minimal Card Definitions for Web Demo
 *
 * This file contains a small subset of cards for the web demo.
 * In production, you would load from the full CardDefs.xml.
 */

import { CardType, CardClass, Rarity, Race } from '../enums';
import { CardDefinition } from '../core/card';

// Basic cards used in the demo decks
export const DEMO_CARDS: CardDefinition[] = [
  // Heroes
  { id: 'HERO_08', type: CardType.HERO, cardClass: CardClass.MAGE, cost: 0, rarity: Rarity.FREE, collectible: false, health: 30 },
  { id: 'HERO_01', type: CardType.HERO, cardClass: CardClass.WARRIOR, cost: 0, rarity: Rarity.FREE, collectible: false, health: 30 },
  { id: 'HERO_05', type: CardType.HERO, cardClass: CardClass.HUNTER, cost: 0, rarity: Rarity.FREE, collectible: false, health: 30 },

  // Neutral Minions - Basic
  { id: 'CS2_168', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1, rarity: Rarity.COMMON, collectible: true, attack: 1, health: 1, race: Race.MURLOC, descriptions: { 'enUS': 'A simple murloc warrior.', 'zhCN': '一个简单的鱼人战士。' } },
  { id: 'CS2_171', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1, rarity: Rarity.COMMON, collectible: true, attack: 1, health: 1, race: Race.BEAST, charge: true, descriptions: { 'enUS': 'Charge', 'zhCN': '冲锋' } },
  { id: 'CS2_120', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 3, race: Race.BEAST, descriptions: { 'enUS': 'A fierce crocodile from the rivers of Azeroth.', 'zhCN': '来自艾泽拉斯河流的凶猛鳄鱼。' } },
  { id: 'CS2_121', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2, taunt: true, descriptions: { 'enUS': 'Taunt', 'zhCN': '嘲讽' } },
  { id: 'CS2_122', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2, descriptions: { 'enUS': 'Your other minions have +1 Attack.', 'zhCN': '你的其他随从获得+1攻击力。' } },
  { id: 'CS2_124', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 5, taunt: true, descriptions: { 'enUS': 'Taunt', 'zhCN': '嘲讽' } },
  { id: 'CS2_125', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 2, descriptions: { 'enUS': 'Battlecry: Give a friendly minion +1/+1.', 'zhCN': '战吼：使一个友方随从获得+1/+1。' } },
  { id: 'CS2_127', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 5, descriptions: { 'enUS': 'Charge', 'zhCN': '冲锋' } },
  { id: 'CS2_131', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 7, rarity: Rarity.COMMON, collectible: true, attack: 6, health: 6, descriptions: { 'enUS': 'Your other minions have +1/+1.', 'zhCN': '你的其他随从获得+1/+1。' } },
  { id: 'CS2_141', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 3, race: Race.BEAST, taunt: true, descriptions: { 'enUS': 'Taunt', 'zhCN': '嘲讽' } },
  { id: 'CS2_142', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2, descriptions: { 'enUS': 'Spell Damage +1', 'zhCN': '法术伤害+1' } },
  { id: 'CS2_147', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 4, descriptions: { 'enUS': 'Battlecry: Draw a card.', 'zhCN': '战吼：抽一张牌。' } },
  { id: 'CS2_179', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 3, descriptions: { 'enUS': 'A seasoned knight of Stormwind.', 'zhCN': '暴风城经验丰富的骑士。' } },
  { id: 'CS2_182', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 4, health: 5, descriptions: { 'enUS': 'A massive yeti from the Chillwind Mountains.', 'zhCN': '来自冰风山的巨大雪人。' } },
  { id: 'CS2_187', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2, descriptions: { 'enUS': 'Battlecry: Deal 1 damage.', 'zhCN': '战吼：造成1点伤害。' } },
  { id: 'CS2_189', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 5, rarity: Rarity.COMMON, collectible: true, attack: 4, health: 5, descriptions: { 'enUS': 'Battlecry: Restore 2 Health to all friendly characters.', 'zhCN': '战吼：为所有友方角色恢复2点生命值。' } },
  { id: 'CS2_203', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 1, health: 4, race: Race.BEAST, taunt: true, descriptions: { 'enUS': 'Taunt', 'zhCN': '嘲讽' } },
  { id: 'CS2_119', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 7, race: Race.BEAST, descriptions: { 'enUS': 'A slow but sturdy turtle.', 'zhCN': '一只缓慢但坚固的乌龟。' } },
  { id: 'CS1_042', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 3, race: Race.BEAST, taunt: true, descriptions: { 'enUS': 'Taunt', 'zhCN': '嘲讽' } },

  // Mage Spells
  { id: 'CS2_022', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 4, rarity: Rarity.COMMON, collectible: true },
  { id: 'CS2_023', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 3, rarity: Rarity.COMMON, collectible: true },
  { id: 'CS2_024', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 3, rarity: Rarity.FREE, collectible: true },
  { id: 'CS2_025', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 4, rarity: Rarity.FREE, collectible: true },
  { id: 'CS2_026', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 7, rarity: Rarity.FREE, collectible: true },
  { id: 'EX1_275', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 2, rarity: Rarity.COMMON, collectible: true },
  { id: 'EX1_277', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 10, rarity: Rarity.EPIC, collectible: true },
  { id: 'EX1_279', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 6, rarity: Rarity.RARE, collectible: true },
  { id: 'EX1_295', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 1, rarity: Rarity.FREE, collectible: true },

  // Mage Minions
  { id: 'CS2_033', type: CardType.MINION, cardClass: CardClass.MAGE, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 2 },
  { id: 'EX1_274', type: CardType.MINION, cardClass: CardClass.MAGE, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 4, health: 3 },
  { id: 'EX1_559', type: CardType.MINION, cardClass: CardClass.MAGE, cost: 1, rarity: Rarity.COMMON, collectible: true, attack: 1, health: 3 },

  // Warrior Spells
  { id: 'CS2_104', type: CardType.SPELL, cardClass: CardClass.WARRIOR, cost: 2, rarity: Rarity.FREE, collectible: true },
  { id: 'CS2_105', type: CardType.SPELL, cardClass: CardClass.WARRIOR, cost: 3, rarity: Rarity.COMMON, collectible: true },
  { id: 'CS2_108', type: CardType.SPELL, cardClass: CardClass.WARRIOR, cost: 2, rarity: Rarity.FREE, collectible: true },
  { id: 'EX1_603', type: CardType.SPELL, cardClass: CardClass.WARRIOR, cost: 2, rarity: Rarity.COMMON, collectible: true },

  // Warrior Minions
  { id: 'EX1_398', type: CardType.MINION, cardClass: CardClass.WARRIOR, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 3 },
  { id: 'EX1_402', type: CardType.MINION, cardClass: CardClass.WARRIOR, cost: 3, rarity: Rarity.RARE, collectible: true, attack: 2, health: 4 },
  { id: 'EX1_604', type: CardType.MINION, cardClass: CardClass.WARRIOR, cost: 2, rarity: Rarity.RARE, collectible: true, attack: 1, health: 4 },

  // Warrior Weapons
  { id: 'CS2_106', type: CardType.WEAPON, cardClass: CardClass.WARRIOR, cost: 3, rarity: Rarity.FREE, collectible: true, attack: 3, durability: 2 },
  { id: 'CS2_112', type: CardType.WEAPON, cardClass: CardClass.WARRIOR, cost: 5, rarity: Rarity.COMMON, collectible: true, attack: 5, durability: 2 },
  { id: 'EX1_398t', type: CardType.WEAPON, cardClass: CardClass.WARRIOR, cost: 1, rarity: Rarity.COMMON, collectible: false, attack: 4, durability: 2 },

  // Hunter Spells
  { id: 'CS2_084', type: CardType.SPELL, cardClass: CardClass.HUNTER, cost: 0, rarity: Rarity.FREE, collectible: true },
  { id: 'EX1_539', type: CardType.SPELL, cardClass: CardClass.HUNTER, cost: 3, rarity: Rarity.FREE, collectible: true },

  // Hunter Weapons
  { id: 'CS2_080', type: CardType.WEAPON, cardClass: CardClass.HUNTER, cost: 5, rarity: Rarity.FREE, collectible: true, attack: 3, durability: 2 },

  // Tokens
  { id: 'CS2_tk1', type: CardType.MINION, cardClass: CardClass.MAGE, cost: 0, rarity: Rarity.COMMON, collectible: false, attack: 1, health: 1, race: Race.BEAST },
  { id: 'CS2_mirror', type: CardType.MINION, cardClass: CardClass.MAGE, cost: 0, rarity: Rarity.COMMON, collectible: false, attack: 0, health: 2 },

  // Battlecry Minions (Low Cost)
  { id: 'EX1_593', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1, rarity: Rarity.COMMON, collectible: true, attack: 1, health: 1, descriptions: { 'enUS': 'Battlecry: Deal 1 damage.', 'zhCN': '战吼：造成1点伤害。' } }, // Elven Archer
  { id: 'EX1_011', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 1, descriptions: { 'enUS': 'Battlecry: Restore 2 Health.', 'zhCN': '战吼：恢复2点生命值。' } }, // Voodoo Doctor
  { id: 'EX1_066', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 2, descriptions: { 'enUS': "Battlecry: Destroy your opponent's weapon.", 'zhCN': '战吼：摧毁对手的武器。' } }, // Acidic Swamp Ooze
  { id: 'CS2_226', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2, descriptions: { 'enUS': 'Battlecry: Deal 1 damage.', 'zhCN': '战吼：造成1点伤害。' } }, // Ironforge Rifleman
  { id: 'EX1_019', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 2, descriptions: { 'enUS': 'Battlecry: Give a friendly minion +1/+1.', 'zhCN': '战吼：使一个友方随从获得+1/+1。' } }, // Shattered Sun Cleric
  { id: 'CS2_188', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 3, descriptions: { 'enUS': 'Battlecry: Restore 3 Health.', 'zhCN': '战吼：恢复3点生命值。' } }, // Earthen Ring Farseer

  // Deathrattle Minions (Low Cost)
  { id: 'EX1_029', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1, rarity: Rarity.COMMON, collectible: true, attack: 1, health: 1, descriptions: { 'enUS': 'Deathrattle: Deal 2 damage to the enemy hero.', 'zhCN': '亡语：对敌方英雄造成2点伤害。' } }, // Leper Gnome
  { id: 'EX1_096', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 1, descriptions: { 'enUS': 'Deathrattle: Draw a card.', 'zhCN': '亡语：抽一张牌。' } }, // Loot Hoarder

  // Additional Mage Spells
  { id: 'CS2_027', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 1, rarity: Rarity.COMMON, collectible: true }, // Mirror Image
  { id: 'CS2_031', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 4, rarity: Rarity.COMMON, collectible: true }, // Cone of Cold
];

// Card descriptions for display (Chinese)
export const CARD_DESCRIPTIONS: Record<string, string> = {
  // Neutral Minions
  'CS2_168': '一个简单的鱼人战士。',
  'CS2_171': '冲锋',
  'CS2_120': '来自艾泽拉斯河流的凶猛鳄鱼。',
  'CS2_121': '嘲讽',
  'CS2_122': '你的其他随从获得+1攻击力。(光环效果)',
  'CS2_124': '嘲讽',
  'CS2_125': '战吼：使一个友方随从获得+1/+1。',
  'CS2_127': '冲锋',
  'CS2_131': '你的其他随从获得+1/+1。',
  'CS2_141': '嘲讽',
  'CS2_142': '法术伤害+1',
  'CS2_147': '战吼：抽一张牌。',
  'CS2_179': '暴风城经验丰富的骑士。',
  'CS2_182': '来自冰风山的巨大雪人。',
  'CS2_187': '战吼：造成1点伤害。',
  'CS2_189': '战吼：为所有友方角色恢复2点生命值。',
  'CS2_203': '嘲讽',
  'CS2_119': '一只缓慢但坚固的乌龟。',
  'CS1_042': '嘲讽',

  // Mage Spells
  'CS2_022': '变形术：将一个随从变成1/1的绵羊。',
  'CS2_023': '奥术智慧：抽两张牌。',
  'CS2_024': '冰霜新星：冻结所有敌方随从。',
  'CS2_025': '火球术：造成6点伤害。',
  'CS2_026': '烈焰风暴：对所有敌方随从造成4点伤害。',
  'EX1_275': '寒冰箭：造成3点伤害，并冻结该角色。',
  'EX1_277': '炎爆术：造成10点伤害。',
  'EX1_279': '暴风雪：对所有敌方随从造成2点伤害，并冻结他们。',
  'EX1_295': '奥术飞弹：随机发射3枚飞弹，每枚造成1点伤害。',

  // Mage Minions
  'CS2_033': '巫师学徒：你的法术的法力值消耗减少(1)点。',
  'EX1_274': '肯瑞托法师：法术伤害+1',
  'EX1_559': '法力浮龙：每当你施放一个法术，便获得+1攻击力。',

  // Warrior Spells
  'CS2_104': '英勇打击：在本回合中，使你的英雄获得+4攻击力。',
  'CS2_105': '冲锋：使一个友方随从获得冲锋。',
  'CS2_108': '斩杀：消灭一个受伤的敌方随从。',
  'EX1_603': '顺劈斩：对两个随机敌方随从造成2点伤害。',

  // Warrior Minions
  'EX1_398': '阿拉希武器匠：战吼：装备一把2/2的武器。',
  'EX1_402': '暴怒的狼人：每当该随从受到伤害时，获得+1攻击力。',
  'EX1_604': '铸甲师：每当一个友方随从受到伤害时，获得1点护甲值。',

  // Warrior Weapons
  'CS2_106': '炽炎战斧：战士的基础武器。',
  'CS2_112': '奥金斧：一把强大的双手斧。',
  'EX1_398t': ' battle斧：阿拉希武器匠的战利品。',

  // Hunter Spells
  'CS2_084': '猎人印记：使一个随从的生命值变为1。',
  'EX1_539': '杀戮命令：造成3点伤害。如果你控制任何野兽，则改为造成5点伤害。',

  // Hunter Weapons
  'CS2_080': '刺客之刃：一把锋利的匕首。',

  // Tokens
  'CS2_tk1': '一只被变形的绵羊。',
  'CS2_mirror': '镜像：0/2的防御随从。',

  // Battlecry Minions
  'EX1_593': '战吼：造成1点伤害。', // Elven Archer
  'EX1_011': '战吼：恢复2点生命值。', // Voodoo Doctor
  'EX1_066': '战吼：摧毁对手的武器。', // Acidic Swamp Ooze
  'CS2_226': '战吼：造成1点伤害。', // Ironforge Rifleman
  'EX1_019': '战吼：使一个友方随从获得+1/+1。', // Shattered Sun Cleric
  'CS2_188': '战吼：恢复3点生命值。', // Earthen Ring Farseer

  // Deathrattle Minions
  'EX1_029': '亡语：对敌方英雄造成2点伤害。', // Leper Gnome
  'EX1_096': '亡语：抽一张牌。', // Loot Hoarder

  // Additional Mage Spells
  'CS2_027': '召唤两个0/2并具有嘲讽的随从。',
  'CS2_031': '冻结一个随从，并对其造成1点伤害。',
};

// Card names for display
export const CARD_NAMES: Record<string, string> = {
  // Heroes
  'HERO_08': 'Jaina Proudmoore',
  'HERO_01': 'Garrosh Hellscream',
  'HERO_05': 'Rexxar',

  // Neutral Minions
  'CS2_168': 'Murloc Raider',
  'CS2_171': 'Stonetusk Boar',
  'CS2_120': 'River Crocolisk',
  'CS2_121': 'Frostwolf Grunt',
  'CS2_122': 'Raid Leader',
  'CS2_124': "Sen'jin Shieldmasta",
  'CS2_125': 'Shattered Sun Cleric',
  'CS2_127': 'Stormwind Knight',
  'CS2_131': 'Stormwind Champion',
  'CS2_141': 'Ironfur Grizzly',
  'CS2_142': 'Kobold Geomancer',
  'CS2_147': 'Gnomish Inventor',
  'CS2_179': 'Silver Hand Knight',
  'CS2_182': 'Chillwind Yeti',
  'CS2_187': 'Ironforge Rifleman',
  'CS2_189': 'Darkscale Healer',
  'CS2_203': 'Silverback Patriarch',
  'CS2_119': 'Oasis Snapjaw',
  'CS1_042': 'River Crocolisk',

  // Mage Cards
  'CS2_022': 'Polymorph',
  'CS2_023': 'Arcane Intellect',
  'CS2_024': 'Frost Nova',
  'CS2_025': 'Fireball',
  'CS2_026': 'Flamestrike',
  'EX1_275': 'Frostbolt',
  'EX1_277': 'Pyroblast',
  'EX1_279': 'Blizzard',
  'EX1_295': 'Arcane Missiles',
  'CS2_033': "Sorcerer's Apprentice",
  'EX1_274': 'Kirin Tor Mage',
  'EX1_559': 'Mana Wyrm',

  // Warrior Cards
  'CS2_104': 'Heroic Strike',
  'CS2_105': 'Charge',
  'CS2_108': 'Execute',
  'EX1_603': 'Cleave',
  'EX1_398': 'Arathi Weaponsmith',
  'EX1_402': 'Frothing Berserker',
  'EX1_604': 'Armorsmith',
  'CS2_106': 'Fiery War Axe',
  'CS2_112': 'Arcanite Reaper',
  'EX1_398t': 'Battle Axe',

  // Hunter Cards
  'CS2_084': "Hunter's Mark",
  'EX1_539': 'Kill Command',
  'CS2_080': "Assassin's Blade",

  // Tokens
  'CS2_tk1': 'Sheep',
  'CS2_mirror': 'Mirror Image',

  // Battlecry Minions
  'EX1_593': 'Elven Archer', // 1费 1/1 战吼: 造成1点伤害
  'EX1_011': 'Voodoo Doctor', // 2费 2/1 战吼: 恢复2点生命值
  'EX1_066': 'Acidic Swamp Ooze', // 2费 3/2 战吼: 摧毁敌方武器
  'CS2_226': 'Ironforge Rifleman', // 3费 2/2 战吼: 造成1点伤害
  'EX1_019': 'Shattered Sun Cleric', // 3费 3/2 战吼: +1/+1
  'CS2_188': 'Earthen Ring Farseer', // 3费 3/3 战吼: 恢复3点生命值

  // Deathrattle Minions
  'EX1_029': 'Leper Gnome', // 1费 1/1 亡语: 对敌方英雄造成2点伤害
  'EX1_096': 'Loot Hoarder', // 2费 2/1 亡语: 抽一张牌

  // Additional Mage Spells
  'CS2_027': 'Mirror Image',
  'CS2_031': 'Cone of Cold',
};

/**
 * Load demo cards into CardLoader
 */
export function loadDemoCards(): void {
  const { CardLoader } = require('./loader');
  CardLoader.registerAll(DEMO_CARDS);
  console.log(`[DemoCards] Loaded ${DEMO_CARDS.length} demo cards`);
}
