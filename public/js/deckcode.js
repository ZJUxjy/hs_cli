// deckcode.js - Hearthstone deck code encoder/decoder
// Format based on Hearthstone deck string specification

class DeckCode {
  constructor() {
    this.version = 1;
    this.format = 1; // 1 = Wild, 2 = Standard
  }

  // Varint encode a number
  encodeVarint(value) {
    const bytes = [];
    while (value > 127) {
      bytes.push((value & 0x7F) | 0x80);
      value >>= 7;
    }
    bytes.push(value);
    return bytes;
  }

  // Varint decode from bytes
  decodeVarint(bytes, offset) {
    let value = 0;
    let shift = 0;
    while (true) {
      const byte = bytes[offset++];
      value |= (byte & 0x7F) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    return { value, offset };
  }

  // Encode deck to base64 string
  encode(deck) {
    const bytes = [];

    // Header
    bytes.push(0); // Reserved
    bytes.push(this.version); // Version
    bytes.push(this.format); // Format (Wild/Standard)

    // Group cards by count
    const cards1 = []; // 1 copy
    const cards2 = []; // 2 copies
    const cardsN = []; // >2 copies (for arena)

    for (const card of deck.cards) {
      if (card.count === 1) {
        cards1.push(card.dbfId);
      } else if (card.count === 2) {
        cards2.push(card.dbfId);
      } else {
        cardsN.push({ dbfId: card.dbfId, count: card.count });
      }
    }

    // Encode 1-copy cards
    bytes.push(...this.encodeVarint(cards1.length));
    for (const dbfId of cards1) {
      bytes.push(...this.encodeVarint(dbfId));
    }

    // Encode 2-copy cards
    bytes.push(...this.encodeVarint(cards2.length));
    for (const dbfId of cards2) {
      bytes.push(...this.encodeVarint(dbfId));
    }

    // Encode n-copy cards
    bytes.push(...this.encodeVarint(cardsN.length));
    for (const { dbfId, count } of cardsN) {
      bytes.push(...this.encodeVarint(count));
      bytes.push(...this.encodeVarint(dbfId));
    }

    // Encode hero (deck class)
    bytes.push(...this.encodeVarint(1)); // 1 hero
    const heroDbfId = this.getHeroDbfId(deck.hero);
    bytes.push(...this.encodeVarint(heroDbfId));

    // Convert to base64
    const binary = bytes.map(b => String.fromCharCode(b)).join('');
    return btoa(binary);
  }

  // Decode base64 string to deck
  decode(code) {
    try {
      // Remove whitespace
      code = code.trim().replace(/\s/g, '');

      // Decode base64
      const binary = atob(code);
      let bytes = binary.split('').map(c => c.charCodeAt(0));

      let offset = 0;

      // Header
      const reserved = bytes[offset++];
      const version = bytes[offset++];
      const format = bytes[offset++];

      // Read 1-copy cards
      let result = this.decodeVarint(bytes, offset);
      const numCards1 = result.value;
      offset = result.offset;

      const cards1 = [];
      for (let i = 0; i < numCards1; i++) {
        result = this.decodeVarint(bytes, offset);
        cards1.push(result.value);
        offset = result.offset;
      }

      // Read 2-copy cards
      result = this.decodeVarint(bytes, offset);
      const numCards2 = result.value;
      offset = result.offset;

      const cards2 = [];
      for (let i = 0; i < numCards2; i++) {
        result = this.decodeVarint(bytes, offset);
        cards2.push(result.value);
        offset = result.offset;
      }

      // Read n-copy cards
      result = this.decodeVarint(bytes, offset);
      const numCardsN = result.value;
      offset = result.offset;

      const cardsN = [];
      for (let i = 0; i < numCardsN; i++) {
        result = this.decodeVarint(bytes, offset);
        const count = result.value;
        offset = result.offset;

        result = this.decodeVarint(bytes, offset);
        const dbfId = result.value;
        offset = result.offset;

        cardsN.push({ dbfId, count });
      }

      // Read hero
      result = this.decodeVarint(bytes, offset);
      const numHeroes = result.value;
      offset = result.offset;

      let heroClass = 'mage'; // default
      if (numHeroes > 0) {
        result = this.decodeVarint(bytes, offset);
        const heroDbfId = result.value;
        heroClass = this.getHeroClass(heroDbfId);
        offset = result.offset;
      }

      // Build cards array
      const cards = [];
      for (const dbfId of cards1) {
        cards.push({ dbfId, count: 1 });
      }
      for (const dbfId of cards2) {
        cards.push({ dbfId, count: 2 });
      }
      for (const { dbfId, count } of cardsN) {
        cards.push({ dbfId, count });
      }

      return {
        format: format === 1 ? 'wild' : 'standard',
        hero: heroClass,
        cards: cards
      };
    } catch (err) {
      console.error('Failed to decode deck code:', err);
      return null;
    }
  }

  // Get hero DBF ID from class string
  getHeroDbfId(heroClass) {
    const heroMap = {
      'mage': 637,
      'warrior': 7,
      'hunter': 31,
      'druid': 274,
      'rogue': 930,
      'priest': 813,
      'paladin': 671,
      'shaman': 1066,
      'warlock': 893,
      'demonhunter': 56550,
      'deathknight': 78065
    };
    return heroMap[heroClass] || 637;
  }

  // Get class string from hero DBF ID
  getHeroClass(dbfId) {
    const heroMap = {
      637: 'mage',
      7: 'warrior',
      31: 'hunter',
      274: 'druid',
      930: 'rogue',
      813: 'priest',
      671: 'paladin',
      1066: 'shaman',
      893: 'warlock',
      56550: 'demonhunter',
      78065: 'deathknight'
    };
    return heroMap[dbfId] || 'mage';
  }

  // Convert card ID to DBF ID (needs card data)
  async getDbfId(cardId, allCards) {
    const card = allCards.find(c => c.id === cardId);
    return card ? card.dbfId : null;
  }

  // Convert DBF ID to card ID
  async getCardId(dbfId, allCards) {
    const card = allCards.find(c => c.dbfId === dbfId);
    return card ? card.id : null;
  }
}

// Export
window.DeckCode = DeckCode;
