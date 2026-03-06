import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';

export interface RawCardEntity {
  CardID: string;
  ID: number;
  version?: number;
  Tag: RawTag | RawTag[];
}

export interface RawTag {
  enumID: number;
  name: string;
  type: string;
  value?: string | number;
  cardID?: string;
}

export interface ParsedCardData {
  id: string;
  dbfId?: number;
  name: Record<string, string>;  // locale -> name
  description: Record<string, string>;  // locale -> description
  tags: Record<number, number | string>;  // tag enum ID -> value
  heroPowerCardId?: string;
}

// Supported locales
export const SUPPORTED_LOCALES = [
  'enUS', 'zhCN', 'zhTW', 'deDE', 'esES', 'esMX',
  'frFR', 'itIT', 'jaJP', 'koKR', 'plPL', 'ptBR',
  'ruRU', 'thTH'
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

class CardXmlParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text',
      parseTagValue: false,
      parseAttributeValue: false,
    });
  }

  parseFile(xmlPath: string): Map<string, ParsedCardData> {
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    return this.parseString(xmlContent);
  }

  parseString(xmlContent: string): Map<string, ParsedCardData> {
    const parsed = this.parser.parse(xmlContent);
    const cards = new Map<string, ParsedCardData>();

    if (!parsed.CardDefs?.Entity) {
      return cards;
    }

    const entities = Array.isArray(parsed.CardDefs.Entity)
      ? parsed.CardDefs.Entity
      : [parsed.CardDefs.Entity];

    for (const entity of entities) {
      if (!entity) continue;

      const cardData = this.parseEntity(entity);
      if (cardData) {
        cards.set(cardData.id, cardData);
      }
    }

    return cards;
  }

  private parseEntity(entity: RawCardEntity): ParsedCardData | null {
    const cardId = entity.CardID;
    if (!cardId) return null;

    const cardData: ParsedCardData = {
      id: cardId,
      dbfId: entity.ID,
      name: {},
      description: {},
      tags: {},
    };

    const tags = entity.Tag || [];
    const tagsArray = Array.isArray(tags) ? tags : [tags].filter(Boolean);

    for (const tag of tagsArray) {
      if (!tag) continue;

      const enumId = tag.enumID;
      const tagName = tag.name;
      const tagType = tag.type;
      const value = tag.value;

      // Handle LocString type (localized strings like CARDNAME, CARDTEXT, FLAVORTEXT)
      if (tagType === 'LocString') {
        const tagAny = tag as unknown as Record<string, unknown>;
        if (tagName === 'CARDNAME') {
          for (const locale of SUPPORTED_LOCALES) {
            if (tagAny[locale]) {
              cardData.name[locale] = tagAny[locale] as string;
            }
          }
        } else if (tagName === 'CARDTEXT') {
          for (const locale of SUPPORTED_LOCALES) {
            if (tagAny[locale]) {
              cardData.description[locale] = tagAny[locale] as string;
            }
          }
        }
        continue;
      }

      // Handle HERO_POWER which has cardID attribute
      if (tagName === 'HERO_POWER' && tag.cardID) {
        cardData.heroPowerCardId = tag.cardID;
        continue;
      }

      // Handle Card type (reference to another card)
      if (tagType === 'Card') {
        cardData.tags[enumId] = tag.cardID || '';
        continue;
      }

      // Handle regular tags with value
      if (value !== undefined) {
        cardData.tags[enumId] = value as number | string;
      }
    }

    return cardData;
  }

  // Get all unique tag names from XML
  extractTagNames(xmlPath: string): Set<string> {
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const parsed = this.parser.parse(xmlContent);
    const tagNames = new Set<string>();

    if (!parsed.CardDefs?.Entity) {
      return tagNames;
    }

    const entities = Array.isArray(parsed.CardDefs.Entity)
      ? parsed.CardDefs.Entity
      : [parsed.CardDefs.Entity];

    for (const entity of entities) {
      if (!entity?.Tags?.Tag) continue;

      const tags = Array.isArray(entity.Tags.Tag)
        ? entity.Tags.Tag
        : [entity.Tags.Tag];

      for (const tag of tags) {
        if (tag?.name) {
          tagNames.add(tag.name);
        }
      }
    }

    return tagNames;
  }
}

export const cardXmlParser = new CardXmlParser();
export default cardXmlParser;
