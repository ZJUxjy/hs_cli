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
    // Summon random secret from deck - simplified
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
    // Summon random minion from opponent's deck - simplified
  },
});

// FP1_011 - Webspinner
cardScriptsRegistry.register('FP1_011', {
  deathrattle: (ctx: any) => {
    // Add random beast to hand - simplified
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
      // Resummon friendly minions that died - simplified
    },
  },
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
    // Silence friendly minions - simplified
  },
});

// FP1_017 - Nerub'ar Weblord
cardScriptsRegistry.register('FP1_017', {});

// FP1_022 - Voidcaller
cardScriptsRegistry.register('FP1_022', {
  deathrattle: (ctx: any) => {
    // Summon random demon from hand - simplified
  },
});

// FP1_023 - Dark Cultist
cardScriptsRegistry.register('FP1_023', {
  deathrattle: (ctx: any) => {
    // Give random friendly minion +3 Health - simplified
  },
});

// FP1_024 - Unstable Ghoul
cardScriptsRegistry.register('FP1_024', {
  deathrattle: (ctx: any) => {
    // Deal 1 damage to all minions - simplified
  },
});

// FP1_026 - Anub'ar Ambusher
cardScriptsRegistry.register('FP1_026', {
  deathrattle: (ctx: any) => {
    // Return random friendly minion to hand - simplified
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
    PLAY: (ctx: any) => {
      // Gain +1 attack when deathrattle minion played - simplified
    },
  },
});

// FP1_029 - Dancing Swords
cardScriptsRegistry.register('FP1_029', {
  deathrattle: (ctx: any) => {
    // Opponent draws a card - simplified
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
      // When friendly minion dies, add 2 copies to hand - simplified
    },
  },
});

// FP1_020 - Avenge
cardScriptsRegistry.register('FP1_020', {
  events: {
    DEATH: (ctx: any) => {
      // When friendly minion dies, buff another - simplified
    },
  },
});

// === Weapons ===

// FP1_021 - Death's Bite
cardScriptsRegistry.register('FP1_021', {
  deathrattle: (ctx: any) => {
    // Deal 1 damage to all minions - simplified
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
