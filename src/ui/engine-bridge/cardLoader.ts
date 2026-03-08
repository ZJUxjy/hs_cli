/**
 * Browser Card Loader
 *
 * Handles loading card definitions in the browser environment.
 */

import { CardLoader } from '../../cards/loader';
import { cardXmlParser } from '../../cards/xmlparser';
import { I18n } from '../../i18n';

let cardsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Load cards in browser environment
 */
export async function loadCardsInBrowser(): Promise<void> {
  if (cardsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      console.log('[CardLoader] Loading cards in browser...');

      // Fetch the XML file
      const response = await fetch('/src/cards/CardDefs.xml');
      if (!response.ok) {
        throw new Error(`Failed to fetch CardDefs.xml: ${response.status}`);
      }

      const xmlText = await response.text();

      // Parse the XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Use the existing parser to extract card data
      const parsedCards = cardXmlParser.parseString(xmlText);

      // Load into CardLoader
      const { CardType, CardClass, Rarity, Race } = await import('../../enums');

      for (const [cardId, parsedData] of parsedCards) {
        const def = parseCardDefinition(cardId, parsedData, CardType, CardClass, Rarity, Race);
        (CardLoader as any).cards.set(cardId, def);
      }

      // Load i18n
      I18n.setLocale('enUS');
      I18n.loadFromXml(parsedCards, 'enUS');

      cardsLoaded = true;
      console.log(`[CardLoader] Loaded ${parsedCards.size} cards in browser`);
    } catch (error) {
      console.error('[CardLoader] Failed to load cards:', error);
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * Check if cards are loaded
 */
export function areCardsLoaded(): boolean {
  return cardsLoaded;
}

/**
 * Parse card definition from parsed XML data
 */
function parseCardDefinition(
  cardId: string,
  data: any,
  CardType: any,
  CardClass: any,
  Rarity: any,
  Race: any
): any {
  const tags = data.tags || {};

  const typeMap: Record<number, any> = {
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

  const classMap: Record<number, any> = {
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

  const rarityMap: Record<number, any> = {
    1: Rarity.COMMON,
    2: Rarity.RARE,
    3: Rarity.EPIC,
    4: Rarity.LEGENDARY,
  };

  const cost = parseInt(tags[48] as string) || 0; // COST
  const attack = parseInt(tags[47] as string) || 0; // ATK
  const health = parseInt(tags[45] as string) || 0; // HEALTH
  const cardTypeNum = parseInt(tags[202] as string) || 4; // CARDTYPE
  const cardClassNum = parseInt(tags[199] as string) || 12; // CLASS
  const rarityNum = parseInt(tags[203] as string) || 1; // RARITY
  const collectible = tags[321] === '1'; // COLLECTIBLE

  const cardType = typeMap[cardTypeNum] || CardType.INVALID;
  const cardClass = classMap[cardClassNum] || CardClass.INVALID;
  const rarity = rarityMap[rarityNum] || Rarity.INVALID;

  return {
    id: cardId,
    type: cardType,
    cardClass,
    cost,
    rarity,
    collectible,
    attack: cardType === CardType.MINION || cardType === CardType.WEAPON ? attack : undefined,
    health: cardType === CardType.MINION ? health : undefined,
  };
}
