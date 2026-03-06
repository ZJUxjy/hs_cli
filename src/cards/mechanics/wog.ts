// WOG (Whispers of the Old Gods) Card Scripts
import { cardScriptsRegistry } from '../index';

// === Druid Cards ===

// OG_051 - Forbidden Ancient
cardScriptsRegistry.register('OG_051', {
  play: (ctx: any) => {
    // Spend all mana, gain +1/+1 for each mana spent - simplified
    const controller = ctx.source?.controller;
    const mana = controller?.mana || 0;
    (ctx.source as any).atk = ((ctx.source as any).atk || 0) + mana;
    (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + mana;
  },
});

// OG_044 - Fandral Staghelm
cardScriptsRegistry.register('OG_044', {
  // Choose Both cards effect - simplified aura
});

// OG_202 - Mire Keeper
cardScriptsRegistry.register('OG_202', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Choose One: Summon a 2/2 or gain an empty mana crystal - simplified
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'OG_202c' } as any);
    }
  },
});

// OG_313 - Addled Grizzly
cardScriptsRegistry.register('OG_313', {
  events: {
    MINION_SUMMON: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller && ctx.event?.card !== ctx.source) {
        (ctx.event.card as any).atk = ((ctx.event.card as any).atk || 0) + 1;
        (ctx.event.card as any).maxHealth = ((ctx.event.card as any).maxHealth || 0) + 1;
      }
    },
  },
});

// OG_188 - Klaxxi Amber-Weaver
cardScriptsRegistry.register('OG_188', {
  play: (ctx: any) => {
    // If C'Thun has 10+ attack, gain +4 Health - simplified
    (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 4;
  },
});

// OG_293 - Dark Arakkoa
cardScriptsRegistry.register('OG_293', {
  play: (ctx: any) => {
    // Buff C'Thun +3/+3 - simplified
  },
});

// OG_047 - Feral Rage
cardScriptsRegistry.register('OG_047', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Choose One: +4 Attack or 8 Armor - simplified to armor
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 8;
    }
  },
});

// OG_048 - Mark of Y'Shaarj
cardScriptsRegistry.register('OG_048', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 2;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 2;

      // If beast, draw a card
      if ((ctx.target as any).race === 'BEAST') {
        const controller = ctx.source?.controller;
        if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
          controller.hand.push(controller.deck.shift());
        }
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_195 - Wisps of the Old Gods
cardScriptsRegistry.register('OG_195', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Choose One: Summon 7 Wisps or buff minions - simplified to summon
    for (let i = 0; i < 7 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'OG_195c' } as any);
    }
  },
});

// === Hunter Cards ===

// OG_179 - Fiery Bat
cardScriptsRegistry.register('OG_179', {
  deathrattle: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];
    if (targets.length > 0) {
      const idx = Math.floor(Math.random() * targets.length);
      (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 1;
    }
  },
});

// OG_292 - Forlorn Stalker
cardScriptsRegistry.register('OG_292', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Buff deathrattle minions in hand - simplified
    for (const card of controller?.hand || []) {
      if ((card as any).deathrattle) {
        (card as any).atk = ((card as any).atk || 0) + 1;
        (card as any).maxHealth = ((card as any).maxHealth || 0) + 1;
      }
    }
  },
});

// OG_216 - Infested Wolf
cardScriptsRegistry.register('OG_216', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (let i = 0; i < 2 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'OG_216a' } as any);
    }
  },
});

// OG_309 - Princess Huhuran
cardScriptsRegistry.register('OG_309', {
  play: (ctx: any) => {
    // Trigger friendly minion's deathrattle - simplified
    if (ctx.target && (ctx.target as any).deathrattle) {
      // Would need to trigger deathrattle
    }
  },
  requirements: { 1: 0, 49: 0 },
});

// OG_308 - Giant Sand Worm
cardScriptsRegistry.register('OG_308', {
  // Attack a minion and kill it to attack again - simplified
});

// OG_045 - Infest
cardScriptsRegistry.register('OG_045', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Give friendly minions deathrattle: add random beast - simplified
    for (const minion of controller?.field || []) {
      (minion as any).hasInfestDeathrattle = true;
    }
  },
});

// OG_061 - On the Hunt
cardScriptsRegistry.register('OG_061', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 1;
    }
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'OG_061t' } as any);
    }
  },
  requirements: { 48: 0 },
});

// OG_211 - Call of the Wild
cardScriptsRegistry.register('OG_211', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) controller.field.push({ id: 'NEW1_034' } as any);
    if (controller?.field?.length < 7) controller.field.push({ id: 'NEW1_033' } as any);
    if (controller?.field?.length < 7) controller.field.push({ id: 'NEW1_032' } as any);
  },
});

// === Mage Cards ===

// OG_303 - Cult Sorcerer
cardScriptsRegistry.register('OG_303', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        // Buff C'Thun +1/+1 - simplified
      }
    },
  },
});

// OG_083 - Twilight Flamecaller
cardScriptsRegistry.register('OG_083', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    for (const minion of opponent?.field || []) {
      (minion as any).health = ((minion as any).health || 0) - 1;
    }
  },
});

// OG_085 - Demented Frostcaller
cardScriptsRegistry.register('OG_085', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        const opponent = controller?.opponent;
        const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];
        if (targets.length > 0) {
          const idx = Math.floor(Math.random() * targets.length);
          (targets[idx] as any).frozen = true;
        }
      }
    },
  },
});

// OG_120 - Anomalus
cardScriptsRegistry.register('OG_120', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [...(controller?.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 8;
    }
  },
});

// OG_207 - Faceless Summoner
cardScriptsRegistry.register('OG_207', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_3_MINION' } as any);
    }
  },
});

// OG_087 - Servant of Yogg-Saron
cardScriptsRegistry.register('OG_087', {
  play: (ctx: any) => {
    // Cast a random spell - simplified
  },
});

// OG_081 - Shatter
cardScriptsRegistry.register('OG_081', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).frozen) {
      (ctx.target as any).destroyed = true;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_090 - Cabalist's Tome
cardScriptsRegistry.register('OG_090', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (let i = 0; i < 3 && controller?.hand?.length < 10; i++) {
      controller.hand.push({ id: 'RANDOM_MAGE_SPELL' } as any);
    }
  },
});

// OG_086 - Forbidden Flame
cardScriptsRegistry.register('OG_086', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const mana = controller?.mana || 0;
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - mana;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// === Paladin Cards ===

// OG_006 - Vilefin Inquisitor
cardScriptsRegistry.register('OG_006', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Replace hero power - simplified
  },
});

// OG_221 - Selfless Hero
cardScriptsRegistry.register('OG_221', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const minions = controller?.field || [];
    if (minions.length > 0) {
      const idx = Math.floor(Math.random() * minions.length);
      (minions[idx] as any).divineShield = true;
    }
  },
});

// OG_229 - Ragnaros, Lightlord
cardScriptsRegistry.register('OG_229', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        const damagedCharacters = [controller.hero, ...(controller.field || [])]
          .filter((c: any) => (c?.health || 0) < (c?.maxHealth || 0));
        if (damagedCharacters.length > 0) {
          const idx = Math.floor(Math.random() * damagedCharacters.length);
          (damagedCharacters[idx] as any).health = Math.min(
            ((damagedCharacters[idx] as any).health || 0) + 8,
            (damagedCharacters[idx] as any).maxHealth || 30
          );
        }
      }
    },
  },
});

// OG_310 - Steward of Darkshire
cardScriptsRegistry.register('OG_310', {
  events: {
    MINION_SUMMON: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        const card = ctx.event?.card;
        if (card && (card as any).health === 1) {
          (card as any).divineShield = true;
        }
      }
    },
  },
});

// OG_223 - Divine Strength
cardScriptsRegistry.register('OG_223', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 1;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 2;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_273 - Stand Against Darkness
cardScriptsRegistry.register('OG_273', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (let i = 0; i < 5 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'CS2_101t' } as any);
    }
  },
  requirements: { 24: 1 },
});

// OG_311 - A Light in the Darkness
cardScriptsRegistry.register('OG_311', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Discover a minion and give it +1/+1 - simplified
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_MINION' } as any);
    }
  },
});

// OG_222 - Rallying Blade
cardScriptsRegistry.register('OG_222', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const minion of controller?.field || []) {
      if ((minion as any).divineShield) {
        (minion as any).atk = ((minion as any).atk || 0) + 1;
        (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 1;
      }
    }
  },
});

// OG_198 - Forbidden Healing
cardScriptsRegistry.register('OG_198', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const mana = controller?.mana || 0;
    if (ctx.target) {
      (ctx.target as any).health = Math.min(
        ((ctx.target as any).health || 0) + mana * 2,
        (ctx.target as any).maxHealth || 30
      );
    }
  },
  requirements: { 48: 0 },
});

// === Priest Cards ===

// OG_096 - Twilight Darkmender
cardScriptsRegistry.register('OG_096', {
  play: (ctx: any) => {
    // If C'Thun has 10+ attack, heal hero for 10 - simplified
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + 10,
        (controller.hero as any).maxHealth || 30
      );
    }
  },
});

// OG_334 - Hooded Acolyte
cardScriptsRegistry.register('OG_334', {
  // Buff C'Thun when healing - simplified
});

// OG_234 - Darkshire Alchemist
cardScriptsRegistry.register('OG_234', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = Math.min(
        ((ctx.target as any).health || 0) + 5,
        (ctx.target as any).maxHealth || 30
      );
    }
  },
  requirements: { 48: 0 },
});

// OG_335 - Shifting Shade
cardScriptsRegistry.register('OG_335', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    if (opponent?.deck && opponent.deck.length > 0 && controller?.hand?.length < 10) {
      const idx = Math.floor(Math.random() * opponent.deck.length);
      controller.hand.push({ ...(opponent.deck[idx] as any) });
    }
  },
});

// OG_316 - Herald Volazj
cardScriptsRegistry.register('OG_316', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Summon 1/1 copies of other minions - simplified
    for (const minion of controller?.field || []) {
      if (minion !== ctx.source && controller?.field?.length < 7) {
        controller.field.push({ id: (minion as any).id, atk: 1, maxHealth: 1 } as any);
      }
    }
  },
});

// OG_104 - Embrace the Shadow
cardScriptsRegistry.register('OG_104', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller) {
      controller.embraceTheShadow = true;
    }
  },
});

// OG_094 - Power Word: Tentacles
cardScriptsRegistry.register('OG_094', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 2;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 6;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_100 - Shadow Word: Horror
cardScriptsRegistry.register('OG_100', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [...(controller?.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      if (((minion as any).atk || 0) <= 2) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// OG_101 - Forbidden Shaping
cardScriptsRegistry.register('OG_101', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const mana = controller?.mana || 0;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: `RANDOM_COST_${mana}_MINION` } as any);
    }
  },
});

// === Rogue Cards ===

// OG_070 - Bladed Cultist
cardScriptsRegistry.register('OG_070', {
  combo: (ctx: any) => {
    (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
    (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;
  },
});

// OG_080 - Xaril, Poisoned Mind
cardScriptsRegistry.register('OG_080', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      const toxins = ['OG_080b', 'OG_080c', 'OG_080d', 'OG_080e', 'OG_080f'];
      const idx = Math.floor(Math.random() * toxins.length);
      controller.hand.push({ id: toxins[idx] } as any);
    }
  },
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      const toxins = ['OG_080b', 'OG_080c', 'OG_080d', 'OG_080e', 'OG_080f'];
      const idx = Math.floor(Math.random() * toxins.length);
      controller.hand.push({ id: toxins[idx] } as any);
    }
  },
});

// OG_267 - Southsea Squidface
cardScriptsRegistry.register('OG_267', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.weapon) {
      (controller.weapon as any).atk = ((controller.weapon as any).atk || 0) + 2;
    }
  },
});

// OG_330 - Undercity Huckster
cardScriptsRegistry.register('OG_330', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_OPPONENT_CLASS_CARD' } as any);
    }
  },
});

// OG_291 - Shadowcaster
cardScriptsRegistry.register('OG_291', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (ctx.target && controller?.hand?.length < 10) {
      controller.hand.push({
        id: (ctx.target as any).id,
        atk: 1,
        maxHealth: 1,
      } as any);
    }
  },
  requirements: { 1: 0, 49: 0 },
});

// OG_282 - Blade of C'Thun
cardScriptsRegistry.register('OG_282', {
  play: (ctx: any) => {
    if (ctx.target) {
      const atk = (ctx.target as any).atk || 0;
      const health = (ctx.target as any).health || 0;
      (ctx.target as any).destroyed = true;
      // Buff C'Thun by atk/health - simplified
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_072 - Journey Below
cardScriptsRegistry.register('OG_072', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_DEATHRATTLE_MINION' } as any);
    }
  },
});

// OG_073 - Thistle Tea
cardScriptsRegistry.register('OG_073', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck && controller.deck.length > 0) {
      const card = controller.deck.shift();
      if (controller?.hand?.length < 10) controller.hand.push(card);
      if (controller?.hand?.length < 10) controller.hand.push({ ...(card as any) });
      if (controller?.hand?.length < 10) controller.hand.push({ ...(card as any) });
    }
  },
});

// OG_176 - Shadow Strike
cardScriptsRegistry.register('OG_176', {
  play: (ctx: any) => {
    if (ctx.target && !(ctx.target as any).damaged) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 5;
    }
  },
  requirements: { 48: 0 },
});

// === Shaman Cards ===

// OG_023 - Primal Fusion
cardScriptsRegistry.register('OG_023', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const totemCount = (controller?.field || []).filter((m: any) => m.race === 'TOTEM').length;
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + totemCount;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + totemCount;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_026 - Eternal Sentinel
cardScriptsRegistry.register('OG_026', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller) {
      controller.overload = 0;
    }
  },
});

// OG_209 - Hallazeal the Ascended
cardScriptsRegistry.register('OG_209', {
  // Heal for spell damage dealt - simplified
});

// OG_328 - Master of Evolution
cardScriptsRegistry.register('OG_328', {
  play: (ctx: any) => {
    // Evolve target minion - simplified
    if (ctx.target) {
      const cost = (ctx.target as any).cost || 0;
      (ctx.target as any).id = `RANDOM_COST_${cost + 1}_MINION`;
    }
  },
  requirements: { 1: 0, 49: 0 },
});

// OG_028 - Thing from Below
cardScriptsRegistry.register('OG_028', {
  // Cost reduced by totems summoned - simplified
});

// OG_027 - Evolve
cardScriptsRegistry.register('OG_027', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const minion of controller?.field || []) {
      const cost = (minion as any).cost || 0;
      (minion as any).id = `RANDOM_COST_${cost + 1}_MINION`;
    }
  },
});

// OG_206 - Stormcrack
cardScriptsRegistry.register('OG_206', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 4;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_031 - Hammer of Twilight
cardScriptsRegistry.register('OG_031', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'OG_031a' } as any);
    }
  },
});

// === Warlock Cards ===

// OG_109 - Darkshire Librarian
cardScriptsRegistry.register('OG_109', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand && controller.hand.length > 0) {
      const idx = Math.floor(Math.random() * controller.hand.length);
      controller.hand.splice(idx, 1);
    }
  },
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
      controller.hand.push(controller.deck.shift());
    }
  },
});

// OG_113 - Darkshire Councilman
cardScriptsRegistry.register('OG_113', {
  events: {
    MINION_SUMMON: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller && ctx.event?.card !== ctx.source) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
      }
    },
  },
});

// OG_121 - Cho'gall
cardScriptsRegistry.register('OG_121', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller) {
      controller.spellsCostHealth = true;
    }
  },
});

// OG_241 - Possessed Villager
cardScriptsRegistry.register('OG_241', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'OG_241a' } as any);
    }
  },
});

// OG_302 - Usher of Souls
cardScriptsRegistry.register('OG_302', {
  events: {
    DEATH: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.entity?.controller === controller) {
        // Buff C'Thun +1/+1 - simplified
      }
    },
  },
});

// OG_116 - Spreading Madness
cardScriptsRegistry.register('OG_116', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allCharacters = [
      controller?.hero,
      opponent?.hero,
      ...(controller?.field || []),
      ...(opponent?.field || []),
    ].filter(Boolean);

    for (let i = 0; i < 9 && allCharacters.length > 0; i++) {
      const idx = Math.floor(Math.random() * allCharacters.length);
      (allCharacters[idx] as any).health = ((allCharacters[idx] as any).health || 0) - 1;
    }
  },
});

// OG_118 - Renounce Darkness
cardScriptsRegistry.register('OG_118', {
  play: (ctx: any) => {
    // Replace hero power and warlock cards - simplified
  },
});

// OG_239 - DOOM!
cardScriptsRegistry.register('OG_239', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [...(controller?.field || []), ...(opponent?.field || [])];
    const count = allMinions.length;

    for (const minion of allMinions) {
      (minion as any).destroyed = true;
    }

    for (let i = 0; i < count && controller?.hand?.length < 10; i++) {
      if (controller?.deck && controller.deck.length > 0) {
        controller.hand.push(controller.deck.shift());
      }
    }
  },
});

// OG_114 - Forbidden Ritual
cardScriptsRegistry.register('OG_114', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const mana = controller?.mana || 0;
    for (let i = 0; i < mana && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'OG_114a' } as any);
    }
  },
});

// === Warrior Cards ===

// OG_149 - Ravaging Ghoul
cardScriptsRegistry.register('OG_149', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [...(controller?.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 1;
    }
  },
});

// OG_218 - Bloodhoof Brave
cardScriptsRegistry.register('OG_218', {
  // Enrage: +3 Attack - simplified
});

// OG_220 - Malkorok
cardScriptsRegistry.register('OG_220', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller) {
      controller.weapon = { id: 'RANDOM_WEAPON' } as any;
    }
  },
});

// OG_312 - N'Zoth's First Mate
cardScriptsRegistry.register('OG_312', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller) {
      controller.weapon = { id: 'OG_058' } as any;
    }
  },
});

// OG_315 - Bloodsail Cultist
cardScriptsRegistry.register('OG_315', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasPirate = (controller?.field || []).some(
      (m: any) => m !== ctx.source && m.race === 'PIRATE'
    );
    if (hasPirate && controller?.weapon) {
      (controller.weapon as any).atk = ((controller.weapon as any).atk || 0) + 1;
      (controller.weapon as any).durability = ((controller.weapon as any).durability || 0) + 1;
    }
  },
});

// OG_301 - Ancient Shieldbearer
cardScriptsRegistry.register('OG_301', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 10;
    }
  },
});

// OG_276 - Blood Warriors
cardScriptsRegistry.register('OG_276', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const damagedMinions = (controller?.field || []).filter((m: any) => m.damaged);
    for (const minion of damagedMinions) {
      if (controller?.hand?.length < 10) {
        controller.hand.push({ ...(minion as any) });
      }
    }
  },
});

// OG_314 - Blood To Ichor
cardScriptsRegistry.register('OG_314', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 1;
      // If dies, summon 2/2 - simplified
      const controller = ctx.source?.controller;
      if (controller?.field?.length < 7) {
        controller.field.push({ id: 'OG_314b' } as any);
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_033 - Tentacles for Arms
cardScriptsRegistry.register('OG_033', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'OG_033' } as any);
    }
  },
});

// === Neutral Common Cards ===

// OG_281 - Beckoner of Evil
cardScriptsRegistry.register('OG_281', {
  play: (ctx: any) => {
    // Buff C'Thun +2/+2 - simplified
  },
});

// OG_283 - C'Thun's Chosen
cardScriptsRegistry.register('OG_283', {
  play: (ctx: any) => {
    // Buff C'Thun +2/+2 - simplified
  },
});

// OG_284 - Twilight Geomancer
cardScriptsRegistry.register('OG_284', {
  play: (ctx: any) => {
    // Give C'Thun taunt - simplified
  },
});

// OG_286 - Twilight Elder
cardScriptsRegistry.register('OG_286', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        // Buff C'Thun +1/+1 - simplified
      }
    },
  },
});

// OG_138 - Nerubian Prophet
cardScriptsRegistry.register('OG_138', {
  // Cost reduced by 1 each turn in hand - simplified
});

// OG_150 - Aberrant Berserker
cardScriptsRegistry.register('OG_150', {
  // Enrage: +2 Attack - simplified
});

// OG_151 - Tentacle of N'Zoth
cardScriptsRegistry.register('OG_151', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [...(controller?.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 1;
    }
  },
});

// OG_156 - Bilefin Tidehunter
cardScriptsRegistry.register('OG_156', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'OG_156a' } as any);
    }
  },
});

// OG_158 - Zealous Initiate
cardScriptsRegistry.register('OG_158', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const minions = (controller?.field || []).filter((m: any) => m !== ctx.source);
    if (minions.length > 0) {
      const idx = Math.floor(Math.random() * minions.length);
      (minions[idx] as any).atk = ((minions[idx] as any).atk || 0) + 1;
      (minions[idx] as any).maxHealth = ((minions[idx] as any).maxHealth || 0) + 1;
    }
  },
});

// OG_249 - Infested Tauren
cardScriptsRegistry.register('OG_249', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'OG_249a' } as any);
    }
  },
});

// OG_256 - Spawn of N'Zoth
cardScriptsRegistry.register('OG_256', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const minion of controller?.field || []) {
      (minion as any).atk = ((minion as any).atk || 0) + 1;
      (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 1;
    }
  },
});

// OG_295 - Cult Apothecary
cardScriptsRegistry.register('OG_295', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const enemyCount = (opponent?.field || []).length;
    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + enemyCount * 2,
        (controller.hero as any).maxHealth || 30
      );
    }
  },
});

// OG_323 - Polluted Hoarder
cardScriptsRegistry.register('OG_323', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
      controller.hand.push(controller.deck.shift());
    }
  },
});

// === Neutral Rare Cards ===

// OG_162 - Disciple of C'Thun
cardScriptsRegistry.register('OG_162', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
    }
    // Buff C'Thun +2/+2 - simplified
  },
  requirements: { 48: 0 },
});

// OG_255 - Doomcaller
cardScriptsRegistry.register('OG_255', {
  play: (ctx: any) => {
    // Buff C'Thun +2/+2 and shuffle if dead - simplified
  },
});

// OG_034 - Silithid Swarmer
cardScriptsRegistry.register('OG_034', {
  // Can only attack if hero attacked this turn - simplified
});

// OG_339 - Skeram Cultist
cardScriptsRegistry.register('OG_339', {
  play: (ctx: any) => {
    // Buff C'Thun +2/+2 - simplified
  },
});

// OG_147 - Corrupted Healbot
cardScriptsRegistry.register('OG_147', {
  deathrattle: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    if (opponent?.hero) {
      (opponent.hero as any).health = Math.min(
        ((opponent.hero as any).health || 0) + 8,
        (opponent.hero as any).maxHealth || 30
      );
    }
  },
});

// OG_161 - Corrupted Seer
cardScriptsRegistry.register('OG_161', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || []),
    ].filter((m: any) => m.race !== 'MURLOC');
    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 2;
    }
  },
});

// OG_254 - Eater of Secrets
cardScriptsRegistry.register('OG_254', {
  play: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent as any;
    const secretCount = opponent?.secrets?.length || 0;
    (ctx.source as any).atk = ((ctx.source as any).atk || 0) + secretCount;
    (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + secretCount;
    if (opponent?.secrets) {
      opponent.secrets = [];
    }
  },
});

// OG_320 - Midnight Drake
cardScriptsRegistry.register('OG_320', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const handCount = controller?.hand?.length || 0;
    (ctx.source as any).atk = ((ctx.source as any).atk || 0) + handCount;
  },
});

// OG_322 - Blackwater Pirate
cardScriptsRegistry.register('OG_322', {
  // Weapons cost 2 less - simplified aura
});

// === Neutral Epic Cards ===

// OG_173 - Blood of The Ancient One
cardScriptsRegistry.register('OG_173', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        // If another Blood of The Ancient One exists, merge - simplified
        const other = (controller?.field || []).find(
          (m: any) => m !== ctx.source && (m as any).id === 'OG_173'
        );
        if (other && controller?.field?.length < 7) {
          (ctx.source as any).destroyed = true;
          (other as any).destroyed = true;
          controller.field.push({ id: 'OG_173a' } as any);
        }
      }
    },
  },
});

// OG_200 - Validated Doomsayer
cardScriptsRegistry.register('OG_200', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        (ctx.source as any).atk = 7;
      }
    },
  },
});

// OG_271 - Scaled Nightmare
cardScriptsRegistry.register('OG_271', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) * 2;
      }
    },
  },
});

// OG_272 - Twilight Summoner
cardScriptsRegistry.register('OG_272', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'OG_272t' } as any);
    }
  },
});

// OG_290 - Ancient Harbinger
cardScriptsRegistry.register('OG_290', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        // Draw a 10-cost minion - simplified
      }
    },
  },
});

// OG_337 - Cyclopian Horror
cardScriptsRegistry.register('OG_337', {
  play: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    const enemyCount = (opponent?.field || []).length;
    (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + enemyCount;
  },
});

// OG_102 - Darkspeaker
cardScriptsRegistry.register('OG_102', {
  play: (ctx: any) => {
    // Swap stats with target - simplified
  },
  requirements: { 1: 0, 49: 0 },
});

// OG_174 - Faceless Shambler
cardScriptsRegistry.register('OG_174', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.source as any).atk = (ctx.target as any).atk || 0;
      (ctx.source as any).maxHealth = (ctx.target as any).maxHealth || 0;
    }
  },
  requirements: { 1: 0, 49: 0 },
});

// OG_321 - Crazed Worshipper
cardScriptsRegistry.register('OG_321', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        // Buff C'Thun +1/+1 - simplified
      }
    },
  },
});

// === Neutral Legendary Cards ===

// OG_042 - Y'Shaarj, Rage Unbound
cardScriptsRegistry.register('OG_042', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.field?.length < 7) {
        const minions = (controller?.deck || []).filter((c: any) => c.type === 'MINION');
        if (minions.length > 0) {
          const idx = Math.floor(Math.random() * minions.length);
          const cardIdx = controller.deck.indexOf(minions[idx]);
          if (cardIdx !== -1) {
            controller.field.push(controller.deck.splice(cardIdx, 1)[0]);
          }
        }
      }
    },
  },
});

// OG_122 - Mukla, Tyrant of the Vale
cardScriptsRegistry.register('OG_122', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) controller.hand.push({ id: 'EX1_014t' } as any);
    if (controller?.hand?.length < 10) controller.hand.push({ id: 'EX1_014t' } as any);
  },
});

// OG_317 - Deathwing, Dragonlord
cardScriptsRegistry.register('OG_317', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const dragons = (controller?.hand || []).filter((c: any) => c.race === 'DRAGON');
    for (const dragon of dragons) {
      if (controller?.field?.length < 7) {
        controller.field.push(dragon);
      }
    }
  },
});

// OG_318 - Hogger, Doom of Elwynn
cardScriptsRegistry.register('OG_318', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        const controller = ctx.source?.controller;
        if (controller?.field?.length < 7) {
          controller.field.push({ id: 'OG_318t' } as any);
        }
      }
    },
  },
});

// OG_338 - Nat, the Darkfisher
cardScriptsRegistry.register('OG_338', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (!controller?.isCurrentPlayer) {
        // 50% chance opponent draws - simplified
        const opponent = controller?.opponent;
        if (Math.random() > 0.5 && opponent?.deck && opponent.deck.length > 0) {
          opponent.hand = opponent.hand || [];
          opponent.hand.push(opponent.deck.shift());
        }
      }
    },
  },
});

// OG_123 - Shifter Zerus
cardScriptsRegistry.register('OG_123', {
  // Transform into random minion each turn - simplified
});

// OG_300 - The Boogeymonster
cardScriptsRegistry.register('OG_300', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.attacker === ctx.source) {
        const defender = ctx.event?.target;
        if (defender && (defender as any).destroyed) {
          (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
          (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 2;
        }
      }
    },
  },
});

// OG_133 - N'Zoth, the Corruptor
cardScriptsRegistry.register('OG_133', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Summon all friendly deathrattle minions that died - simplified
    for (let i = 0; i < 7 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'RANDOM_FRIENDLY_DEATHRATTLE_MINION' } as any);
    }
  },
});

// OG_134 - Yogg-Saron, Hope's End
cardScriptsRegistry.register('OG_134', {
  play: (ctx: any) => {
    // Cast random spells equal to spells cast this game - simplified
    for (let i = 0; i < 10; i++) {
      // Cast random spell - simplified
    }
  },
});

// OG_280 - C'Thun
cardScriptsRegistry.register('OG_280', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const atk = (ctx.source as any).atk || 6;
    const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];

    for (let i = 0; i < atk && targets.length > 0; i++) {
      const idx = Math.floor(Math.random() * targets.length);
      (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 1;
    }
  },
});

// OG_131 - Twin Emperor Vek'lor
cardScriptsRegistry.register('OG_131', {
  play: (ctx: any) => {
    // If C'Thun has 10+ attack, summon other emperor - simplified
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'OG_319' } as any);
    }
  },
});

// === Toxin Cards ===

// OG_080b - Kingsblood Toxin
cardScriptsRegistry.register('OG_080b', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
      controller.hand.push(controller.deck.shift());
    }
  },
});

// OG_080c - Bloodthistle Toxin
cardScriptsRegistry.register('OG_080c', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      const opponent = ctx.target?.controller;

      // Bounce to hand
      if (opponent?.field) {
        const idx = opponent.field.indexOf(ctx.target);
        if (idx !== -1) opponent.field.splice(idx, 1);
      }
      if (controller?.hand?.length < 10) {
        controller.hand.push(ctx.target);
      }
    }
  },
  requirements: { 1: 0, 49: 0, 48: 0 },
});

// OG_080d - Briarthorn Toxin
cardScriptsRegistry.register('OG_080d', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 3;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// OG_080e - Fadeleaf Toxin
cardScriptsRegistry.register('OG_080e', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).stealth = true;
    }
  },
  requirements: { 1: 0, 49: 0, 48: 0 },
});

// OG_080f - Firebloom Toxin
cardScriptsRegistry.register('OG_080f', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
    }
  },
  requirements: { 48: 0 },
});

console.log('[WOG] Registered card scripts');
