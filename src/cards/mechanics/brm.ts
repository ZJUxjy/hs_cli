// BRM (Blackrock Mountain) Card Scripts
import { cardScriptsRegistry } from '../index';

// === Collectible Minions ===

// BRM_002 - Flamewaker
cardScriptsRegistry.register('BRM_002', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        const opponent = controller?.opponent;
        const targets: any[] = [];
        if (opponent?.hero) targets.push(opponent.hero);
        if (opponent?.field) targets.push(...opponent.field);

        // Deal 1 damage to 2 random enemies
        for (let i = 0; i < 2 && targets.length > 0; i++) {
          const idx = Math.floor(Math.random() * targets.length);
          (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 1;
        }
      }
    },
  },
});

// BRM_004 - Twilight Whelp
cardScriptsRegistry.register('BRM_004', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON') ||
                     controller?.field?.some((m: any) => m.race === 'DRAGON');

    if (hasDragon) {
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 2;
    }
  },
});

// BRM_006 - Imp Gang Boss
cardScriptsRegistry.register('BRM_006', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        const controller = ctx.source?.controller;
        if (controller?.field?.length < 7) {
          controller.field.push({ id: 'BRM_006t' } as any);
        }
      }
    },
  },
});

// BRM_008 - Dark Iron Skulker
cardScriptsRegistry.register('BRM_008', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const undamagedMinions = opponent?.field?.filter((m: any) => !m.damaged) || [];

    for (const minion of undamagedMinions) {
      (minion as any).health = ((minion as any).health || 0) - 2;
    }
  },
});

// BRM_009 - Volcanic Lumberer
cardScriptsRegistry.register('BRM_009', {
  // Cost reduced by 1 for each minion that died this turn - simplified
});

// BRM_010 - Druid of the Flame
cardScriptsRegistry.register('BRM_010', {
  play: (ctx: any) => {
    // Choose One: 5/2 or 2/5 - simplified
  },
});

// BRM_012 - Fireguard Destroyer
cardScriptsRegistry.register('BRM_012', {
  play: (ctx: any) => {
    const bonus = Math.floor(Math.random() * 4) + 1; // 1-4
    (ctx.source as any).atk = ((ctx.source as any).atk || 0) + bonus;
  },
});

// BRM_014 - Core Rager
cardScriptsRegistry.register('BRM_014', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length === 1) { // Only this card in hand
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 3;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 3;
    }
  },
});

// BRM_016 - Axe Flinger
cardScriptsRegistry.register('BRM_016', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        const controller = ctx.source?.controller;
        const opponent = controller?.opponent;
        if (opponent?.hero) {
          (opponent.hero as any).health = ((opponent.hero as any).health || 0) - 2;
        }
      }
    },
  },
});

// BRM_018 - Dragon Consort
cardScriptsRegistry.register('BRM_018', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller) {
      controller.dragonCostReduction = (controller.dragonCostReduction || 0) + 2;
    }
  },
});

// BRM_019 - Grim Patron
cardScriptsRegistry.register('BRM_019', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        const source = ctx.source as any;
        if ((source.health || 0) > 0) { // Still alive
          const controller = source.controller;
          if (controller?.field?.length < 7) {
            controller.field.push({ id: 'BRM_019' } as any);
          }
        }
      }
    },
  },
});

// BRM_020 - Dragonkin Sorcerer
cardScriptsRegistry.register('BRM_020', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      const target = ctx.event?.target;

      if (target === ctx.source && ctx.event?.source?.controller === controller) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
        (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;
      }
    },
  },
});

// BRM_022 - Dragon Egg
cardScriptsRegistry.register('BRM_022', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        const controller = ctx.source?.controller;
        if (controller?.field?.length < 7) {
          controller.field.push({ id: 'BRM_022t' } as any);
        }
      }
    },
  },
});

// BRM_024 - Drakonid Crusher
cardScriptsRegistry.register('BM_024', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (opponent?.hero && (opponent.hero as any).health <= 15) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 3;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 3;
    }
  },
});

// BRM_025 - Volcanic Drake
cardScriptsRegistry.register('BRM_025', {
  // Cost reduced by 1 for each minion that died this turn - simplified
});

// BRM_026 - Hungry Dragon
cardScriptsRegistry.register('BRM_026', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (opponent?.field?.length < 7) {
      opponent.field.push({ id: 'RANDOM_COST_1_MINION' } as any);
    }
  },
});

// BRM_027 - Majordomo Executus
cardScriptsRegistry.register('BRM_027', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      // Replace hero with Ragnaros - simplified
      (controller.hero as any).isRagnaros = true;
    }
  },
});

// BRM_028 - Emperor Thaurissan
cardScriptsRegistry.register('BRM_028', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.hand) {
        for (const card of controller.hand) {
          if (card !== ctx.source) {
            (card as any).cost = Math.max(0, ((card as any).cost || 0) - 1);
          }
        }
      }
    },
  },
});

// BRM_029 - Rend Blackhand
cardScriptsRegistry.register('BRM_029', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON');

    if (hasDragon && ctx.target && (ctx.target as any).legendary) {
      (ctx.target as any).destroyed = true;
    }
  },
  requirements: { 1: 0, 49: 0 },
});

// BRM_030 - Nefarian
cardScriptsRegistry.register('BRM_030', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Add 2 random spells from opponent's class
    for (let i = 0; i < 2 && controller?.hand?.length < 10; i++) {
      controller.hand.push({ id: 'OPPONENT_CLASS_SPELL' } as any);
    }
  },
});

// BRM_031 - Chromaggus
cardScriptsRegistry.register('BRM_031', {
  events: {
    DRAW: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.player === controller && controller?.hand?.length < 10) {
        const drawnCard = ctx.event?.card;
        if (drawnCard) {
          controller.hand.push({ ...(drawnCard as any) });
        }
      }
    },
  },
});

// BRM_033 - Blackwing Technician
cardScriptsRegistry.register('BRM_033', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON');

    if (hasDragon) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;
    }
  },
});

// BRM_034 - Blackwing Corruptor
cardScriptsRegistry.register('BRM_034', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON');

    if (hasDragon && ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 3;
    }
  },
  requirements: { 49: 0 },
});

// === Spells ===

// BRM_001 - Solemn Vigil
cardScriptsRegistry.register('BRM_001', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    // Draw 2 cards
    for (let i = 0; i < 2 && controller?.hand?.length < 10; i++) {
      if (controller?.deck && controller.deck.length > 0) {
        controller.hand.push(controller.deck.shift());
      }
    }
  },
});

// BRM_003 - Dragon's Breath
cardScriptsRegistry.register('BRM_003', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 4;
    }
  },
  requirements: { 48: 0 },
});

// BRM_005 - Demonwrath
cardScriptsRegistry.register('BRM_005', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || [])
    ].filter((m: any) => m.race !== 'DEMON');

    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 2;
    }
  },
});

// BRM_007 - Gang Up
cardScriptsRegistry.register('BRM_007', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      const targetId = (ctx.target as any).id;

      for (let i = 0; i < 3 && controller?.deck; i++) {
        const idx = Math.floor(Math.random() * (controller.deck.length + 1));
        controller.deck.splice(idx, 0, { id: targetId } as any);
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// BRM_011 - Lava Shock
cardScriptsRegistry.register('BRM_011', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
    }

    const controller = ctx.source?.controller as any;
    if (controller) {
      controller.overload = 0;
    }
  },
  requirements: { 48: 0 },
});

// BRM_013 - Quick Shot
cardScriptsRegistry.register('BRM_013', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 3;
    }

    const controller = ctx.source?.controller;
    if (controller?.hand?.length === 1) { // Only this card
      if (controller?.deck && controller.deck.length > 0) {
        controller.hand.push(controller.deck.shift());
      }
    }
  },
  requirements: { 48: 0 },
});

// BRM_015 - Revenge
cardScriptsRegistry.register('BRM_015', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || [])
    ];

    const damage = (controller?.hero as any)?.health <= 12 ? 3 : 1;

    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - damage;
    }
  },
});

// BRM_017 - Resurrect
cardScriptsRegistry.register('BRM_017', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    if (controller?.graveyard?.length > 0 && controller?.field?.length < 7) {
      const randomMinion = controller.graveyard[
        Math.floor(Math.random() * controller.graveyard.length)
      ];
      controller.field.push(randomMinion);
    }
  },
});

// === Adventure Boss Cards ===

// BRMA01_2 - Pile On! (Core)
cardScriptsRegistry.register('BRMA01_2', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (controller?.deck && controller?.field?.length < 7) {
      const idx = Math.floor(Math.random() * controller.deck.length);
      const card = controller.deck.splice(idx, 1)[0];
      controller.field.push(card);
    }
    if (opponent?.deck && opponent?.field?.length < 7) {
      const idx = Math.floor(Math.random() * opponent.deck.length);
      const card = opponent.deck.splice(idx, 1)[0];
      opponent.field.push(card);
    }
  },
  requirements: { 24: 1 },
});

// BRMA03_2 - Power of the Firelord
cardScriptsRegistry.register('BRMA03_2', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
    }
  },
  requirements: { 48: 0 },
});

// BRMA04_2 - Magma Pulse
cardScriptsRegistry.register('BRMA04_2', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || [])
    ];

    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 1;
    }
  },
});

// BRMA05_2 - Ignite Mana
cardScriptsRegistry.register('BRMA05_2', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const usedMana = opponent?.usedMana || 0;
    const availableMana = (opponent?.maxMana || 0) - usedMana;

    if (availableMana === 0 && opponent?.hero) {
      (opponent.hero as any).health = ((opponent.hero as any).health || 0) - 5;
    }
  },
});

// BRMA11_2 - Essence of the Red
cardScriptsRegistry.register('BRMA11_2', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Each player draws 2 cards
    for (let i = 0; i < 2; i++) {
      if (controller?.deck && controller.deck.length > 0) {
        controller.hand.push(controller.deck.shift());
      }
      if (opponent?.deck && opponent.deck.length > 0) {
        opponent.hand.push(opponent.deck.shift());
      }
    }
  },
});

console.log('[BRM] Registered card scripts');
