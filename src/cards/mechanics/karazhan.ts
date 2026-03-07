// Karazhan Card Scripts
import { cardScriptsRegistry } from '../index';

// === Minions ===

// KAR_005 - Kindly Grandmother
cardScriptsRegistry.register('KAR_005', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'KAR_005a' } as any);
    }
  },
});

// KAR_005a - Big Bad Wolf
cardScriptsRegistry.register('KAR_005a', {});

// KAR_006 - Cloaked Huntress
cardScriptsRegistry.register('KAR_006', {
  // Secrets cost 0 - simplified aura
});

// KAR_009 - Babbling Book
cardScriptsRegistry.register('KAR_009', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_SPELL' } as any);
    }
  },
});

// KAR_010 - Nightbane Templar
cardScriptsRegistry.register('KAR_010', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON');
    if (hasDragon) {
      if (controller?.field?.length < 7) controller.field.push({ id: 'KAR_010a' } as any);
      if (controller?.field?.length < 7) controller.field.push({ id: 'KAR_010a' } as any);
    }
  },
});

// KAR_021 - Wicked Witchdoctor
cardScriptsRegistry.register('KAR_021', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller && controller?.field?.length < 7) {
        controller.field.push({ id: 'RANDOM_BASIC_TOTEM' } as any);
      }
    },
  },
});

// KAR_029 - Runic Egg
cardScriptsRegistry.register('KAR_029', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
      controller.hand.push(controller.deck.shift());
    }
  },
});

// KAR_030a - Pantry Spider
cardScriptsRegistry.register('KAR_030a', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'KAR_030' } as any);
    }
  },
});

// KAR_033 - Book Wyrm
cardScriptsRegistry.register('KAR_033', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON');
    if (hasDragon && ctx.target && ((ctx.target as any).atk || 0) <= 3) {
      (ctx.target as any).destroyed = true;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// KAR_035 - Priest of the Feast
cardScriptsRegistry.register('KAR_035', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller && controller?.hero) {
        (controller.hero as any).health = Math.min(
          ((controller.hero as any).health || 0) + 3,
          (controller.hero as any).maxHealth || 30
        );
      }
    },
  },
});

// KAR_036 - Arcane Anomaly
cardScriptsRegistry.register('KAR_036', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;
      }
    },
  },
});

// KAR_037 - Avian Watcher
cardScriptsRegistry.register('KAR_037', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasSecret = (controller?.secrets?.length || 0) > 0;
    if (hasSecret) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;
      (ctx.source as any).taunt = true;
    }
  },
});

// KAR_041 - Moat Lurker
cardScriptsRegistry.register('KAR_041', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
    }
  },
  deathrattle: (ctx: any) => {
    // Resummon destroyed minion - simplified
  },
  requirements: { 1: 0, 48: 0 },
});

// KAR_044 - Moroes
cardScriptsRegistry.register('KAR_044', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.field?.length < 7) {
        controller.field.push({ id: 'KAR_044a' } as any);
      }
    },
  },
});

// KAR_057 - Ivory Knight
cardScriptsRegistry.register('KAR_057', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Discover a spell and heal for its cost - simplified
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_SPELL', cost: 3 } as any);
    }
    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + 3,
        (controller.hero as any).maxHealth || 30
      );
    }
  },
});

// KAR_061 - The Curator
cardScriptsRegistry.register('KAR_061', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Draw murloc, dragon, and beast from deck - simplified
    const races = ['MURLOC', 'DRAGON', 'BEAST'];
    for (const race of races) {
      const idx = (controller?.deck || []).findIndex((c: any) => c.race === race);
      if (idx !== -1 && controller?.hand?.length < 10) {
        controller.hand.push(controller.deck.splice(idx, 1)[0]);
      }
    }
  },
});

// KAR_062 - Netherspite Historian
cardScriptsRegistry.register('KAR_062', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON');
    if (hasDragon && controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_DRAGON' } as any);
    }
  },
});

// KAR_065 - Menagerie Warden
cardScriptsRegistry.register('KAR_065', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (ctx.target && (ctx.target as any).race === 'BEAST' && controller?.field?.length < 7) {
      controller.field.push({ ...(ctx.target as any) });
    }
  },
  requirements: { 1: 0, 49: 0 },
});

// KAR_069 - Swashburglar
cardScriptsRegistry.register('KAR_069', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_OPPONENT_CLASS_CARD' } as any);
    }
  },
});

// KAR_070 - Ethereal Peddler
cardScriptsRegistry.register('KAR_070', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Reduce cost of other class cards in hand - simplified
    for (const card of controller?.hand || []) {
      if ((card as any).cardClass !== (controller as any).heroClass) {
        (card as any).cost = Math.max(0, ((card as any).cost || 0) - 2);
      }
    }
  },
});

// KAR_089 - Malchezaar's Imp
cardScriptsRegistry.register('KAR_089', {
  events: {
    DISCARD: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.player === controller && controller?.deck && controller.deck.length > 0) {
        if (controller?.hand?.length < 10) {
          controller.hand.push(controller.deck.shift());
        }
      }
    },
  },
});

// KAR_092 - Medivh's Valet
cardScriptsRegistry.register('KAR_092', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasSecret = (controller?.secrets?.length || 0) > 0;
    if (hasSecret && ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 3;
    }
  },
  requirements: { 48: 0 },
});

// KAR_094 - Deadly Fork
cardScriptsRegistry.register('KAR_094', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'KAR_094a' } as any);
    }
  },
});

// KAR_095 - Zoobot
cardScriptsRegistry.register('KAR_095', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const races = ['MURLOC', 'DRAGON', 'BEAST'];

    for (const race of races) {
      const minion = (controller?.field || []).find(
        (m: any) => m !== ctx.source && m.race === race
      );
      if (minion) {
        (minion as any).atk = ((minion as any).atk || 0) + 1;
        (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 1;
      }
    }
  },
});

// KAR_096 - Prince Malchezaar
cardScriptsRegistry.register('KAR_096', {
  // Add 5 random legendaries to deck at game start - simplified
});

// KAR_097 - Medivh, the Guardian
cardScriptsRegistry.register('KAR_097', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'KAR_097t' } as any);
    }
  },
});

// KAR_097t - Atiesh (weapon)
cardScriptsRegistry.register('KAR_097t', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        const cost = (ctx.event?.source as any)?.cost || 0;
        if (controller?.field?.length < 7) {
          controller.field.push({ id: `RANDOM_COST_${cost}_MINION` } as any);
        }
        // Lose 1 durability - simplified
      }
    },
  },
});

// KAR_114 - Barnes
cardScriptsRegistry.register('KAR_114', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const minions = (controller?.deck || []).filter((c: any) => c.type === 'MINION');
    if (minions.length > 0 && controller?.field?.length < 7) {
      const idx = Math.floor(Math.random() * minions.length);
      controller.field.push({
        ...minions[idx],
        atk: 1,
        maxHealth: 1,
      } as any);
    }
  },
});

// KAR_204 - Onyx Bishop
cardScriptsRegistry.register('KAR_204', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Summon a copy of a friendly minion that died - simplified
    if (controller?.graveyard?.length > 0 && controller?.field?.length < 7) {
      const randomMinion = controller.graveyard[
        Math.floor(Math.random() * controller.graveyard.length)
      ];
      controller.field.push({ ...(randomMinion as any) });
    }
  },
});

// KAR_205 - Silverware Golem
cardScriptsRegistry.register('KAR_205', {
  // Summoned when discarded - simplified
});

// KAR_702 - Menagerie Magician
cardScriptsRegistry.register('KAR_702', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const races = ['MURLOC', 'DRAGON', 'BEAST'];

    for (const race of races) {
      const minion = (controller?.field || []).find(
        (m: any) => m !== ctx.source && m.race === race
      );
      if (minion) {
        (minion as any).atk = ((minion as any).atk || 0) + 2;
        (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 2;
      }
    }
  },
});

// KAR_710 - Arcanosmith
cardScriptsRegistry.register('KAR_710', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'KAR_710m' } as any);
    }
  },
});

// KAR_711 - Arcane Giant
cardScriptsRegistry.register('KAR_711', {
  // Cost reduced by spells cast - simplified
});

// KAR_712 - Violet Illusionist
cardScriptsRegistry.register('KAR_712', {
  // Hero immune during your turn - simplified aura
});

// === Spells ===

// KAR_004 - Cat Trick
cardScriptsRegistry.register('KAR_004', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      const caster = ctx.event?.source?.controller;
      if (caster === controller?.opponent && controller?.field?.length < 7) {
        controller.field.push({ id: 'KAR_004t' } as any);
      }
    },
  },
});

// KAR_004t - Mr. Bigglesworth
cardScriptsRegistry.register('KAR_004t', {});

// KAR_004a - Cat in a Canopy
cardScriptsRegistry.register('KAR_004a', {});

// KAR_013 - Purify
cardScriptsRegistry.register('KAR_013', {
  play: (ctx: any) => {
    if (ctx.target) {
      // Silence target - simplified
      (ctx.target as any).silenced = true;
      (ctx.target as any).buffs = [];
    }
    const controller = ctx.source?.controller;
    if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
      controller.hand.push(controller.deck.shift());
    }
  },
  requirements: { 1: 0, 49: 0, 48: 0 },
});

// KAR_013a - Purify
cardScriptsRegistry.register('KAR_013a', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
      controller.hand.push(controller.deck.shift());
    }
  },
});

// KAR_025 - Kara Kazham!
cardScriptsRegistry.register('KAR_025', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) controller.field.push({ id: 'KAR_025a' } as any);
    if (controller?.field?.length < 7) controller.field.push({ id: 'KAR_025b' } as any);
    if (controller?.field?.length < 7) controller.field.push({ id: 'KAR_025c' } as any);
  },
  requirements: { 24: 1 },
});

// KAR_026 - Protect the King!
cardScriptsRegistry.register('KAR_026', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const enemyCount = (opponent?.field || []).length;
    for (let i = 0; i < enemyCount && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'KAR_026t' } as any);
    }
  },
  requirements: { 24: 1 },
});

// KAR_073 - Maelstrom Portal
cardScriptsRegistry.register('KAR_073', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    for (const minion of opponent?.field || []) {
      (minion as any).health = ((minion as any).health || 0) - 1;
    }
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_1_MINION' } as any);
    }
  },
});

// KAR_075 - Moonglade Portal
cardScriptsRegistry.register('KAR_075', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = Math.min(
        ((ctx.target as any).health || 0) + 6,
        (ctx.target as any).maxHealth || 30
      );
    }
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_6_MINION' } as any);
    }
  },
  requirements: { 48: 0 },
});

// KAR_076 - Firelands Portal
cardScriptsRegistry.register('KAR_076', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 5;
    }
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_5_MINION' } as any);
    }
  },
  requirements: { 48: 0 },
});

// KAR_077 - Silvermoon Portal
cardScriptsRegistry.register('KAR_077', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 2;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 2;
    }
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_2_MINION' } as any);
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// KAR_091 - Ironforge Portal
cardScriptsRegistry.register('KAR_091', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 4;
    }
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_4_MINION' } as any);
    }
  },
});

// === Weapons ===

// KAR_028 - Fool's Bane
cardScriptsRegistry.register('KAR_028', {
  // Can attack all minions, can't attack heroes - simplified
});

// KAR_063 - Spirit Claws
cardScriptsRegistry.register('KAR_063', {
  // +2 Attack while spell damage minion - simplified aura
});

console.log('[Karazhan] Registered card scripts');
