// Naxxramas Card Scripts
import { cardScriptsRegistry } from '../index';

// === Minions ===

// FP1_001 - Zombie Chow
cardScriptsRegistry.register('FP1_001', {
  deathrattle: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    if (opponent?.hero) {
      opponent.hero.health = Math.min(
        (opponent.hero.health || 0) + 5,
        (opponent.hero as any).maxHealth || 30
      );
    }
  },
});

// FP1_002 - Haunted Creeper
cardScriptsRegistry.register('FP1_002', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'FP1_002t' } as any);
    }
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'FP1_002t' } as any);
    }
  },
});

// FP1_003 - Echoing Ooze
cardScriptsRegistry.register('FP1_003', {});

// FP1_004 - Mad Scientist
cardScriptsRegistry.register('FP1_004', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Add a random secret to hand - simplified
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_SECRET' } as any);
    }
  },
});

// FP1_005 - Shade of Naxxramas
cardScriptsRegistry.register('FP1_005', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
        (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;
      }
    },
  },
});

// FP1_007 - Nerubian Egg
cardScriptsRegistry.register('FP1_007', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'FP1_007t' } as any);
    }
  },
});

// FP1_009 - Deathlord
cardScriptsRegistry.register('FP1_009', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    // Summon random minion from opponent's deck - simplified
    if (opponent?.deck && opponent.deck.length > 0 && controller?.field?.length < 7) {
      const minions = opponent.deck.filter((c: any) => c.type === 'MINION');
      if (minions.length > 0) {
        const idx = Math.floor(Math.random() * minions.length);
        controller.field.push(minions[idx]);
        opponent.deck.splice(idx, 1);
      }
    }
  },
});

// FP1_011 - Webspinner
cardScriptsRegistry.register('FP1_011', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Add random beast to hand - simplified
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_BEAST' } as any);
    }
  },
});

// FP1_012 - Sludge Belcher
cardScriptsRegistry.register('FP1_012', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'FP1_012t' } as any);
    }
  },
});

// FP1_013 - Kel'Thuzad
cardScriptsRegistry.register('FP1_013', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && (controller as any).kelthuzadMinions) {
        // Resummon friendly minions that died - simplified
        const minions = (controller as any).kelthuzadMinions;
        for (const minion of minions) {
          if (controller?.field?.length < 7) {
            controller.field.push({ ...minion });
          }
        }
        (controller as any).kelthuzadMinions = [];
      }
    },
  },
});

// FP1_013t - Kel'Thuzad's Champion
cardScriptsRegistry.register('FP1_013t', {
  // Companion minion for Kel'Thuzad
});

// FP1_014 - Stalagg
cardScriptsRegistry.register('FP1_014', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller?.feugenDied && controller?.field?.length < 7) {
      controller.field.push({ id: 'FP1_014t' } as any);
    }
    controller.stalaggDied = true;
  },
});

// FP1_015 - Feugen
cardScriptsRegistry.register('FP1_015', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller?.stalaggDied && controller?.field?.length < 7) {
      controller.field.push({ id: 'FP1_014t' } as any);
    }
    controller.feugenDied = true;
  },
});

// FP1_016 - Wailing Soul
cardScriptsRegistry.register('FP1_016', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Silence friendly minions - simplified
    for (const minion of controller?.field || []) {
      (minion as any).silenced = true;
      (minion as any).buffs = [];
    }
  },
});

// FP1_017 - Nerub'ar Weblord
cardScriptsRegistry.register('FP1_017', {
  // Battlecry: Hand and deck minions cost 2 more - simplified
});

// FP1_017t - Nerubian
cardScriptsRegistry.register('FP1_017t', {});

// FP1_022 - Voidcaller
cardScriptsRegistry.register('FP1_022', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const demons = controller?.hand?.filter((c: any) => c.race === 'DEMON') || [];

    if (demons.length > 0 && controller?.field?.length < 7) {
      const demon = demons[Math.floor(Math.random() * demons.length)];
      controller.field.push(demon);
      controller.hand = controller.hand.filter((c: any) => c !== demon);
    }
  },
});

// FP1_023 - Dark Cultist
cardScriptsRegistry.register('FP1_023', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Give random friendly minion +3 Health - simplified
    const friendlyMinions = controller?.field?.filter((m: any) => m !== ctx.source) || [];
    if (friendlyMinions.length > 0) {
      const target = friendlyMinions[Math.floor(Math.random() * friendlyMinions.length)];
      (target as any).maxHealth = ((target as any).maxHealth || 0) + 3;
      (target as any).health = ((target as any).health || 0) + 3;
    }
  },
});

// FP1_024 - Unstable Ghoul
cardScriptsRegistry.register('FP1_024', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    // Deal 1 damage to all minions - simplified
    for (const minion of [...(controller?.field || []), ...(opponent?.field || [])]) {
      (minion as any).health = ((minion as any).health || 0) - 1;
    }
  },
});

// FP1_026 - Anub'ar Ambusher
cardScriptsRegistry.register('FP1_026', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Return random friendly minion to hand - simplified
    const friendlyMinions = controller?.field?.filter((m: any) => m !== ctx.source) || [];
    if (friendlyMinions.length > 0 && controller?.hand?.length < 10) {
      const target = friendlyMinions[Math.floor(Math.random() * friendlyMinions.length)];
      controller.hand.push(target);
      controller.field = controller.field.filter((m: any) => m !== target);
    }
  },
});

// FP1_027 - Stoneskin Gargoyle
cardScriptsRegistry.register('FP1_027', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        const source = ctx.source as any;
        source.health = source.maxHealth;
      }
    },
  },
});

// FP1_028 - Undertaker
cardScriptsRegistry.register('FP1_028', {
  events: {
    MINION_SUMMON: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller && ctx.event?.card !== ctx.source) {
        if ((ctx.event.card as any).deathrattle) {
          (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
        }
      }
    },
  },
});

// FP1_029 - Dancing Swords
cardScriptsRegistry.register('FP1_029', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    // Opponent draws a card - simplified
    if (opponent?.deck && opponent.deck.length > 0 && opponent?.hand?.length < 10) {
      opponent.hand.push(opponent.deck.shift());
    }
  },
});

// FP1_030 - Loatheb
cardScriptsRegistry.register('FP1_030', {
  play: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent as any;
    if (opponent) {
      opponent.spellCostIncrease = 5;
    }
  },
});

// FP1_030 - Loatheb
cardScriptsRegistry.register('FP1_030', {
  play: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent as any;
    if (opponent) {
      opponent.spellCostIncrease = 5;
    }
  },
});

// FP1_031 - Baron Rivendare
cardScriptsRegistry.register('FP1_031', {});

// === Spells ===

// FP1_019 - Poison Seeds
cardScriptsRegistry.register('FP1_019', {
  play: (ctx: any) => {
    // Destroy all minions, summon Treants - simplified
  },
});

// FP1_025 - Reincarnate
cardScriptsRegistry.register('FP1_025', {
  play: (ctx: any) => {
    // Destroy and resummon target - simplified
  },
  requirements: { 1: 0, 48: 0 },
});

// === Secrets ===

// FP1_018 - Duplicate
cardScriptsRegistry.register('FP1_018', {
  events: {
    DEATH: (ctx: any) => {
      const controller = ctx.source?.controller;
      const target = ctx.event?.target;
      // When friendly minion dies, add 2 copies to hand - simplified
      if (target && controller?.hand?.length < 9) {
        controller.hand.push({ ...(target as any) });
        controller.hand.push({ ...(target as any) });
      }
    },
  },
});

// FP1_020 - Avenge
cardScriptsRegistry.register('FP1_020', {
  events: {
    DEATH: (ctx: any) => {
      const controller = ctx.source?.controller;
      const target = ctx.event?.target;
      // When friendly minion dies, buff another - simplified
      if (target && controller?.field?.length > 1) {
        const otherMinions = controller.field.filter((m: any) => m !== ctx.source);
        if (otherMinions.length > 0) {
          const target = otherMinions[Math.floor(Math.random() * otherMinions.length)];
          (target as any).atk = ((target as any).atk || 0) + 3;
          (target as any).maxHealth = ((target as any).maxHealth || 0) + 2;
        }
      }
    },
  },
});

// === Weapons ===

// FP1_021 - Death's Bite
cardScriptsRegistry.register('FP1_021', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    // Deal 1 damage to all minions - simplified
    for (const minion of [...(controller?.field || []), ...(opponent?.field || [])]) {
      (minion as any).health = ((minion as any).health || 0) - 1;
    }
  },
});

// === Adventure Boss Cards ===

// NAX1_04 - Skitter
cardScriptsRegistry.register('NAX1_04', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'NAX1_03' } as any);
    }
  },
  requirements: { 24: 1 },
});

// NAX1h_04 - Skitter (Heroic)
cardScriptsRegistry.register('NAX1h_04', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'NAX1h_03' } as any);
    }
  },
});

// NAX6_02 - Necrotic Aura
cardScriptsRegistry.register('NAX6_02', {
  play: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    if (opponent?.hero) {
      (opponent.hero as any).health = ((opponent.hero as any).health || 0) - 3;
    }
  },
});

console.log('[Naxxramas] Registered card scripts');
