// Game Tag enum IDs from Hearthstone XML
// This maps the numeric enum IDs to human-readable names

export const enum GameTag {
  // Card identifiers
  ID = 45,
  CARDNAME = 185,
  CARDTEXT = 184,
  CARD_SET = 183,
  CLASS = 199,
  FACTION = 201,
  CARDTYPE = 202,
  RARITY = 203,

  // Card stats
  COST = 48,
  ATK = 47,
  HEALTH = 45,
  DURABILITY = 212,
  CARDRACE = 200,

  // Card properties
  COLLECTIBLE = 321,
  SECRET = 266,
  BATTLECRY = 218,
  DEATHRATTLE = 217,
  TAUNT = 190,
  STEALTH = 194,
  WINDFURY = 189,
  CHARGE = 197,
  DIVINE_SHIELD = 194, // Actually different
  LIFESTEAL = 218, // Different
  POISONOUS = 209,
  SILENCE = 215,
  SPELLPOWER = 192,
  OVERLOAD = 207,
  RITUAL = 225,

  // Special
  HERO_POWER = 380,
  ARTISTNAME = 342,
  FLAVORTEXT = 351,

  // Targeting
  TARGETING_ARROW_TEXT = 325,

  // Quest
  QUEST = 240,
  QUEST_REWARD = 271,

  // Other
  HIDE_WATERMARK = 1107,
  DONT_PICK_FROM_SUBSETS = 1248,
}

// Map of tag name to enum ID
export const TAG_NAME_TO_ID: Record<string, number> = {
  ID: 45,
  CARDNAME: 185,
  CARDTEXT: 184,
  CARD_SET: 183,
  CLASS: 199,
  FACTION: 201,
  CARDTYPE: 202,
  RARITY: 203,
  COST: 48,
  ATK: 47,
  HEALTH: 45,
  DURABILITY: 212,
  CARDRACE: 200,
  COLLECTIBLE: 321,
  SECRET: 266,
  BATTLECRY: 218,
  DEATHRATTLE: 217,
  TAUNT: 190,
  STEALTH: 194,
  WINDFURY: 189,
  CHARGE: 197,
  DIVINE_SHIELD: 194,
  LIFESTEAL: 218,
  POISONOUS: 209,
  SILENCE: 215,
  SPELLPOWER: 192,
  OVERLOAD: 207,
  RITUAL: 225,
  HERO_POWER: 380,
  ARTISTNAME: 342,
  FLAVORTEXT: 351,
  TARGETING_ARROW_TEXT: 325,
  QUEST: 240,
  QUEST_REWARD: 271,
  HIDE_WATERMARK: 1107,
  DONT_PICK_FROM_SUBSETS: 1248,
};

// Reverse map
export const TAG_ID_TO_NAME: Record<number, string> = Object.fromEntries(
  Object.entries(TAG_NAME_TO_ID).map(([k, v]) => [v, k])
) as Record<number, string>;
