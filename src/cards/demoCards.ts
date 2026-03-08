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
  { id: 'CS2_168', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 1, race: Race.MURLOC },
  { id: 'CS2_171', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1, rarity: Rarity.COMMON, collectible: true, attack: 1, health: 1, race: Race.BEAST },
  { id: 'CS2_120', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 3, race: Race.BEAST },
  { id: 'CS2_121', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2 },
  { id: 'CS2_122', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2 },
  { id: 'CS2_124', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 5 },
  { id: 'CS2_125', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 2 },
  { id: 'CS2_127', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 5 },
  { id: 'CS2_131', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 7, rarity: Rarity.COMMON, collectible: true, attack: 6, health: 6 },
  { id: 'CS2_141', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 3, race: Race.BEAST },
  { id: 'CS2_142', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2 },
  { id: 'CS2_147', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 4 },
  { id: 'CS2_179', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 3, health: 3 },
  { id: 'CS2_182', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 4, health: 5 },
  { id: 'CS2_187', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 2 },
  { id: 'CS2_189', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 5, rarity: Rarity.COMMON, collectible: true, attack: 4, health: 5 },
  { id: 'CS2_203', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3, rarity: Rarity.COMMON, collectible: true, attack: 1, health: 4, race: Race.BEAST },
  { id: 'CS2_119', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 7, race: Race.BEAST },
  { id: 'CS1_042', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2, rarity: Rarity.COMMON, collectible: true, attack: 2, health: 3, race: Race.BEAST },

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
];

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
};

/**
 * Load demo cards into CardLoader
 */
export function loadDemoCards(): void {
  const { CardLoader } = require('./loader');
  CardLoader.registerAll(DEMO_CARDS);
  console.log(`[DemoCards] Loaded ${DEMO_CARDS.length} demo cards`);
}
