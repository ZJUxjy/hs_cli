import { cardXmlParser, ParsedCardData } from './xmlparser';
import { I18n } from '../i18n';
import { CardType, CardClass, Rarity, Race } from '../enums';
import { CardDefinition } from '../core/card';

// Tag IDs from Hearthstone
const TAG = {
  ID: 45,
  COST: 48,
  ATK: 47,
  HEALTH: 45,
  CARD_SET: 183,
  CLASS: 199,
  FACTION: 201,
  CARDTYPE: 202,
  RARITY: 203,
  CARDRACE: 200,
  DURABILITY: 212,
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
};

// Map XML card types to CardType enum
function mapCardType(xmlType: number | string): CardType {
  const typeMap: Record<number, CardType> = {
    3: CardType.HERO,
    4: CardType.MINION,
    5: CardType.SPELL,
    6: CardType.ENCHANTMENT,
    7: CardType.WEAPON,
    8: CardType.ITEM,
    9: CardType.TOKEN,
    10: CardType.HERO_POWER,
    11: CardType.LOCATION,
  };
  const numType = typeof xmlType === 'string' ? parseInt(xmlType) : xmlType;
  return typeMap[numType] || CardType.INVALID;
}

// Map XML card class to CardClass enum
function mapCardClass(xmlClass: number | string): CardClass {
  const classMap: Record<number, CardClass> = {
    2: CardClass.DRUID,
    3: CardClass.HUNTER,
    4: CardClass.MAGE,
    5: CardClass.PALADIN,
    6: CardClass.PRIEST,
    7: CardClass.ROGUE,
    8: CardClass.SHAMAN,
    9: CardClass.WARLOCK,
    10: CardClass.WARRIOR,
    11: CardClass.DEMONHUNTER,
    12: CardClass.NEUTRAL,
  };
  const numClass = typeof xmlClass === 'string' ? parseInt(xmlClass) : xmlClass;
  return classMap[numClass] || CardClass.INVALID;
}

// Map XML rarity to Rarity enum
function mapRarity(xmlRarity: number | string): Rarity {
  const rarityMap: Record<number, Rarity> = {
    1: Rarity.COMMON,
    2: Rarity.RARE,
    3: Rarity.EPIC,
    4: Rarity.LEGENDARY,
  };
  const numRarity = typeof xmlRarity === 'string' ? parseInt(xmlRarity) : xmlRarity;
  return rarityMap[numRarity] || Rarity.INVALID;
}

// Map XML race to Race enum
function mapRace(xmlRace: number | string): Race {
  const raceMap: Record<number, Race> = {
    1: Race.BLOODELF,
    2: Race.DRAENEI,
    3: Race.DWARF,
    4: Race.GNOME,
    5: Race.GOBLIN,
    14: Race.MURLOC,
    15: Race.DEMON,
    17: Race.MECHANICAL,
    18: Race.ELEMENTAL,
    19: Race.OGRE,
    20: Race.BEAST,
    21: Race.PET,
    22: Race.TOTEM,
    23: Race.PIRATE,
    24: Race.DRAGON,
    26: Race.ALL,
  };
  const numRace = typeof xmlRace === 'string' ? parseInt(xmlRace) : xmlRace;
  return raceMap[numRace] || Race.INVALID;
}

export class CardLoader {
  private static cards: Map<string, CardDefinition> = new Map();

  /**
   * Register a single card definition
   */
  static register(definition: CardDefinition): void {
    this.cards.set(definition.id, definition);
  }

  /**
   * Register multiple card definitions
   */
  static registerAll(definitions: CardDefinition[]): void {
    for (const def of definitions) {
      this.cards.set(def.id, def);
    }
  }

  /**
   * Load cards from XML file and initialize i18n
   */
  static loadFromXml(xmlPath: string, locale: string = 'enUS'): void {
    console.log('Loading cards from XML...');
    const parsedCards = cardXmlParser.parseFile(xmlPath);
    console.log(`Loaded ${parsedCards.size} card definitions`);

    // Convert parsed data to CardDefinition
    for (const [cardId, parsedData] of parsedCards) {
      const def = this.parseCardDefinition(cardId, parsedData);
      this.cards.set(cardId, def);
    }

    // Load i18n data
    I18n.setLocale(locale);
    I18n.loadFromXml(parsedCards, locale as any);

    console.log(`Card database initialized with ${this.cards.size} cards`);
  }

  /**
   * Parse XML card data to CardDefinition
   */
  private static parseCardDefinition(cardId: string, data: ParsedCardData): CardDefinition {
    const tags = data.tags;

    const cost = parseInt(tags[TAG.COST] as string) || 0;
    const attack = parseInt(tags[TAG.ATK] as string) || 0;
    const health = parseInt(tags[TAG.HEALTH] as string) || 0;
    const durability = parseInt(tags[TAG.DURABILITY] as string) || 0;
    const cardSet = parseInt(tags[TAG.CARD_SET] as string) || 0;
    const cardClass = mapCardClass(tags[TAG.CLASS] as string);
    const cardType = mapCardType(tags[TAG.CARDTYPE] as string);
    const rarity = mapRarity(tags[TAG.RARITY] as string);
    const race = mapRace(tags[TAG.CARDRACE] as string);
    const collectible = tags[TAG.COLLECTIBLE] === '1';

    return {
      id: cardId,
      type: cardType,
      cardClass,
      cost,
      rarity,
      set: cardSet,
      collectible,
      attack: cardType === CardType.MINION || cardType === CardType.WEAPON ? attack : undefined,
      health: cardType === CardType.MINION ? health : undefined,
      race: cardType === CardType.MINION ? race : undefined,
      durability: cardType === CardType.WEAPON ? durability : undefined,
    };
  }

  /**
   * Get card definition by ID
   */
  static get(id: string): CardDefinition | undefined {
    return this.cards.get(id);
  }

  /**
   * Get all card definitions
   */
  static getAll(): CardDefinition[] {
    return Array.from(this.cards.values());
  }

  /**
   * Get collectible cards only
   */
  static getCollectible(): CardDefinition[] {
    return this.getAll().filter(card => card.collectible);
  }

  /**
   * Filter cards by criteria
   */
  static filter(criteria: {
    type?: CardType;
    cardClass?: CardClass;
    rarity?: Rarity;
    race?: Race;
    cost?: number;
    collectible?: boolean;
  }): CardDefinition[] {
    return this.getAll().filter(card => {
      if (criteria.type !== undefined && card.type !== criteria.type) return false;
      if (criteria.cardClass !== undefined && card.cardClass !== criteria.cardClass) return false;
      if (criteria.rarity !== undefined && card.rarity !== criteria.rarity) return false;
      if (criteria.race !== undefined && card.race !== criteria.race) return false;
      if (criteria.cost !== undefined && card.cost !== criteria.cost) return false;
      if (criteria.collectible !== undefined && card.collectible !== criteria.collectible) return false;
      return true;
    });
  }

  /**
   * Check if card exists
   */
  static has(id: string): boolean {
    return this.cards.has(id);
  }
}

export default CardLoader;
