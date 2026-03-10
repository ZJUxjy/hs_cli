/**
 * Pre-built Decks Configuration
 *
 * Realistic Hearthstone decks for different classes.
 */

// Hero IDs
export const HEROES = {
  MAGE: 'HERO_08',        // Jaina Proudmoore
  WARRIOR: 'HERO_01',     // Garrosh Hellscream
  HUNTER: 'HERO_05',      // Rexxar
  PRIEST: 'HERO_09',      // Anduin Wrynn
  WARLOCK: 'HERO_07',     // Gul'dan
  ROGUE: 'HERO_03',       // Valeera Sanguinar
  PALADIN: 'HERO_04',     // Uther Lightbringer
  SHAMAN: 'HERO_02',      // Thrall
  DRUID: 'HERO_06',       // Malfurion Stormrage
  DEMONHUNTER: 'HERO_10', // Illidan Stormrage
};

// Mage Deck - Basic Spell Damage
export const MAGE_DECK: string[] = [
  // Minions (18)
  'CS2_168', 'CS2_168', // Murloc Raider 2/1
  'CS2_171', 'CS2_171', // Stonetusk Boar 1/1 Charge
  'CS2_121', 'CS2_121', // Frostwolf Grunt 2/2 Taunt
  'CS2_124', 'CS2_124', // Sen'jin Shieldmasta 3/5 Taunt
  'CS2_142', 'CS2_142', // Kobold Geomancer 2/2 Spell Damage +1
  'CS2_147', 'CS2_147', // Gnomish Inventor 2/4 Draw
  'CS2_189', 'CS2_189', // Elven Archer 1/1 Battlecry: 1 damage
  'EX1_559', 'EX1_559', // Mana Wyrm 1/3 After spell +1 Attack
  'EX1_274', 'EX1_274', // Kirin Tor Mage 4/3 Spell Damage +1
  'CS2_122', 'CS2_122', // Raid Leader 2/2 Aura +1 Attack

  // Spells (10)
  'CS2_024', 'CS2_024', // Frost Nova - Freeze all enemy minions
  'CS2_025', 'CS2_025', // Fireball - Deal 6 damage
  'CS2_023', 'CS2_023', // Arcane Intellect - Draw 2 cards
  'EX1_277', // Pyroblast - Deal 10 damage
  'CS2_026', // Flamestrike - Deal 4 to all enemy minions
  'EX1_275', 'EX1_275', // Frostbolt - Deal 3 damage and Freeze
  'EX1_295', 'EX1_295', // Arcane Missiles - 3 random damage

  // Weapons (2)
  'CS2_119', 'CS2_119', // Fiery War Axe 3/2
];

// Warrior Deck - Basic Aggro
export const WARRIOR_DECK: string[] = [
  // Minions (18)
  'CS2_168', 'CS2_168', // Murloc Raider 2/1
  'CS2_171', 'CS2_171', // Stonetusk Boar 1/1 Charge
  'CS2_121', 'CS2_121', // Frostwolf Grunt 2/2 Taunt
  'CS2_124', 'CS2_124', // Sen'jin Shieldmasta 3/5 Taunt
  'CS2_125', 'CS2_125', // Shattered Sun Cleric 3/2 Buff
  'CS2_127', 'CS2_127', // Stormwind Knight 2/5 Charge
  'EX1_398', 'EX1_398', // Arathi Weaponsmith 3/3 Battlecry: Weapon
  'EX1_402', // Frothing Berserker 2/4 After damage +1 Attack
  'EX1_604', // Armorsmith 1/4 After damage +1 Armor
  'CS2_122', 'CS2_122', // Raid Leader 2/2 Aura +1 Attack
  'CS2_131', 'CS2_131', // Stormwind Champion 6/6 Aura +1/+1

  // Spells (8)
  'CS2_104', 'CS2_104', // Heroic Strike +4 Attack this turn
  'CS2_105', // Charge Give minion Charge
  'CS2_108', // Execute Destroy damaged minion
  'EX1_603', // Cleave 4 damage to 2 random enemy minions

  // Weapons (4)
  'CS2_106', 'CS2_106', // Fiery War Axe 3/2
  'CS2_112', // Arcanite Reaper 5/2
  'EX1_398t', 'EX1_398t', // Battle Axe 4/2 (from Arathi)
];

// Hunter Deck - Basic Beast Synergy
export const HUNTER_DECK: string[] = [
  // Minions (20)
  'CS2_168', 'CS2_168', // Murloc Raider 2/1
  'CS2_171', 'CS2_171', // Stonetusk Boar 1/1 Charge
  'CS2_120', 'CS2_120', // River Crocolisk 2/3
  'CS2_122', 'CS2_122', // Raid Leader 2/2 Aura
  'CS2_127', 'CS2_127', // Stormwind Knight 2/5 Charge
  'CS2_141', 'CS2_141', // Ironforge Rifleman 2/2 Battlecry: 1 damage
  'CS2_189', 'CS2_189', // Elven Archer 1/1 Battlecry: 1 damage
  'CS2_121', 'CS2_121', // Frostwolf Grunt 2/2 Taunt
  'CS2_124', 'CS2_124', // Sen'jin Shieldmasta 3/5 Taunt
  'CS2_131', 'CS2_131', // Stormwind Champion 6/6 Aura

  // Spells (8)
  'CS2_084', 'CS2_084', // Hunter's Mark - Set minion health to 1
  'EX1_539', // Kill Command - Deal 3 damage (5 with beast)

  // Weapons (2)
  'CS2_080', 'CS2_080', // Assassin's Blade 3/2
];

// Mage Deck with Battlecry and Deathrattle focus
export const MAGE_BATTLECRY_DECK: string[] = [
  // 1-Cost Minions (6)
  'EX1_593', 'EX1_593',       // Elven Archer (1/1) - Battlecry: Deal 1 damage
  'EX1_029', 'EX1_029',       // Leper Gnome (1/1) - Deathrattle: Deal 2 damage to enemy hero

  // 2-Cost Minions (6)
  'EX1_011', 'EX1_011',       // Voodoo Doctor (2/1) - Battlecry: Restore 2 Health
  'EX1_066', 'EX1_066',       // Acidic Swamp Ooze (3/2) - Battlecry: Destroy weapon
  'EX1_096', 'EX1_096',       // Loot Hoarder (2/1) - Deathrattle: Draw a card

  // 3-Cost Minions (6)
  'CS2_226', 'CS2_226',       // Ironforge Rifleman (2/2) - Battlecry: Deal 1 damage
  'EX1_019', 'EX1_019',       // Shattered Sun Cleric (3/2) - Battlecry: +1/+1
  'CS2_188', 'CS2_188',       // Earthen Ring Farseer (3/3) - Battlecry: Restore 3 Health

  // Spells (12)
  'CS2_027', 'CS2_027',       // Mirror Image - Summon two 0/2 Taunt
  'EX1_295', 'EX1_295',       // Arcane Missiles - 3 random damage
  'EX1_275', 'EX1_275',       // Frostbolt - Deal 3 damage and Freeze
  'CS2_023', 'CS2_023',       // Arcane Intellect - Draw 2 cards
  'CS2_022', 'CS2_022',       // Polymorph - Transform to 1/1 Sheep
  'CS2_025', 'CS2_025',       // Fireball - Deal 6 damage
  'CS2_031',                   // Cone of Cold - Freeze and deal 1 damage
  'CS2_024',                   // Frost Nova - Freeze all enemy minions
];

// Default decks for quick game
export const DEFAULT_P1_DECK = MAGE_DECK;
export const DEFAULT_P2_DECK = WARRIOR_DECK;

// Deck metadata
export const DECK_INFO = {
  MAGE_DECK: {
    name: 'Basic Spell Damage',
    hero: HEROES.MAGE,
    heroName: 'Jaina Proudmoore',
    description: 'Mage deck focused on spell damage and control',
  },
  MAGE_BATTLECRY_DECK: {
    name: 'Battlecry & Deathrattle',
    hero: HEROES.MAGE,
    heroName: 'Jaina Proudmoore',
    description: 'Mage deck with many Battlecry and Deathrattle minions for testing mechanics',
  },
  WARRIOR_DECK: {
    name: 'Basic Aggro',
    hero: HEROES.WARRIOR,
    heroName: 'Garrosh Hellscream',
    description: 'Warrior deck with weapons and aggressive minions',
  },
  HUNTER_DECK: {
    name: 'Basic Beast',
    hero: HEROES.HUNTER,
    heroName: 'Rexxar',
    description: 'Hunter deck with beast synergy',
  },
};
