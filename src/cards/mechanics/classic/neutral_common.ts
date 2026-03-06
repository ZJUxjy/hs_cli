// Classic Neutral Common Card Scripts - Simplified
import { cardScriptsRegistry, ActionContext } from '../index';

// === Basic Minions ===
cardScriptsRegistry.register('CS2_122', {}); // Raid Leader
cardScriptsRegistry.register('CS2_222', {}); // Stormwind Champion
cardScriptsRegistry.register('CS2_226', {}); // Frostwolf Warlord

// Voodoo Doctor - Battlecry: Restore 2 Health
cardScriptsRegistry.register('EX1_011', {
  play: (_ctx: ActionContext) => {},
  requirements: { 23: 0 },
});

// Novice Engineer - Battlecry: Draw a card
cardScriptsRegistry.register('EX1_015', {
  play: (_ctx: ActionContext) => {},
});

// Mad Bomber - Battlecry: Deal 3 damage
cardScriptsRegistry.register('EX1_082', {
  play: (_ctx: ActionContext) => {},
});

// Demolisher - At turn start, deal 2 damage
cardScriptsRegistry.register('EX1_102', {});

// Dire Wolf Alpha
cardScriptsRegistry.register('EX1_162', {});

// Gurubashi Berserker
cardScriptsRegistry.register('EX1_399', {});

// Grimscale Oracle
cardScriptsRegistry.register('EX1_508', {});

// Nightblade
cardScriptsRegistry.register('EX1_593', {});

// Cult Master
cardScriptsRegistry.register('EX1_595', {});

// === Common Basic Minions ===
cardScriptsRegistry.register('CS2_117', {}); // Earthen Ring Farseer
cardScriptsRegistry.register('CS2_141', {}); // Ironforge Rifleman
cardScriptsRegistry.register('CS2_146', {}); // Southsea Deckhand
cardScriptsRegistry.register('CS2_147', {}); // Gnomish Inventor
cardScriptsRegistry.register('CS2_150', {}); // Stormpike Commando
cardScriptsRegistry.register('CS2_151', {}); // Silver Hand Knight
cardScriptsRegistry.register('CS2_189', {}); // Elven Archer
cardScriptsRegistry.register('CS2_188', {}); // Abusive Sergeant
cardScriptsRegistry.register('CS2_196', {}); // Razorfen Hunter
cardScriptsRegistry.register('CS2_203', {}); // Ironbeak Owl
cardScriptsRegistry.register('CS2_221', {}); // Spiteful Smith
cardScriptsRegistry.register('CS2_227', {}); // Venture Co. Mercenary

cardScriptsRegistry.register('DS1_055', {}); // Darkscale Healer
cardScriptsRegistry.register('EX1_007', {}); // Acolyte of Pain
cardScriptsRegistry.register('EX1_019', {}); // Shattered Sun Cleric
cardScriptsRegistry.register('EX1_025', {}); // Dragonling Mechanic
cardScriptsRegistry.register('EX1_029', {}); // Leper Gnome
cardScriptsRegistry.register('EX1_046', {}); // Dark Iron Dwarf
cardScriptsRegistry.register('EX1_048', {}); // Spellbreaker
cardScriptsRegistry.register('EX1_049', {}); // Youthful Brewmaster
cardScriptsRegistry.register('EX1_057', {}); // Ancient Brewmaster
cardScriptsRegistry.register('EX1_066', {}); // Acidic Swamp Ooze
cardScriptsRegistry.register('EX1_096', {}); // Loot Hoarder
cardScriptsRegistry.register('EX1_283', {}); // Frost Elemental
cardScriptsRegistry.register('EX1_390', {}); // Tauren Warrior
cardScriptsRegistry.register('EX1_393', {}); // Amani Berserker
cardScriptsRegistry.register('EX1_412', {}); // Raging Worgen
cardScriptsRegistry.register('EX1_506', {}); // Murloc Tidehunter
cardScriptsRegistry.register('EX1_556', {}); // Harvest Golem
cardScriptsRegistry.register('EX1_583', {}); // Priestess of Elune

cardScriptsRegistry.register('NEW1_018', {}); // Bloodsail Raider
cardScriptsRegistry.register('NEW1_022', {}); // Dread Corsair
cardScriptsRegistry.register('tt_004', {}); // Flesheating Ghoul

console.log('[Classic Neutral Common] Registered card scripts');
