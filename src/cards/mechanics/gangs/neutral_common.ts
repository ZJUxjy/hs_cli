// Gangs - Neutral Common Cards
import { cardScriptsRegistry } from '../index';

// CFM_321 - Grimestreet Informant
cardScriptsRegistry.register('CFM_321', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      const classes = ['HUNTER', 'PALADIN', 'WARRIOR'];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      controller.hand.push({ id: `RANDOM_${randomClass}_CARD` } as any);
    }
  },
});

// CFM_325 - Small-Time Buccaneer
cardScriptsRegistry.register('CFM_325', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && (controller as any)?.weapon) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 1) + 2;
      }
    }
  },
});

// CFM_649 - Kabal Courier
cardScriptsRegistry.register('CFM_649', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      const classes = ['MAGE', 'PRIEST', 'WARLOCK'];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      controller.hand.push({ id: `RANDOM_${randomClass}_CARD` } as any);
    }
  },
});

// CFM_652 - Second-Rate Bruiser
cardScriptsRegistry.register('CFM_652', {
  // Cost (2) less if opponent has 3+ minions - simplified
});

// CFM_658 - Backroom Bouncer
cardScriptsRegistry.register('CFM_658', {
  events: {
    DEATH: (ctx: any) => {
      if (ctx.event?.entity?.controller === ctx.source?.controller) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 1) + 1;
      }
    }
  },
});

// CFM_667 - Bomb Squad
cardScriptsRegistry.register('CFM_667', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 5;
    }
  },
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = ((controller.hero as any).health || 0) - 5;
    }
  },
  requirements: { 48: 0 },
});

// CFM_668 - Doppelgangster
cardScriptsRegistry.register('CFM_668', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (let i = 0; i < 2 && controller?.field?.length < 7; i++) {
      controller.field.push({ ...(ctx.source as any) });
      controller.field.push({ ...(ctx.source as any) });
    }
  },
});

// CFM_688 - Spiked Hogrider
cardScriptsRegistry.register('CFM_688', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const taunts = (opponent?.field || []).filter((m: any) => (m as any).taunt);
    if (taunts.length > 0) {
      (ctx.source as any).charge = true;
    }
  },
});

// CFM_852 - Lotus Agents
cardScriptsRegistry.register('CFM_852', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      const classes = ['DRUID', 'ROGUE', 'SHAMAN'];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      controller.hand.push({ id: `RANDOM_${randomClass}_CARD` } as any);
    }
  },
});

console.log('[Gangs Neutral Common] Registered card scripts');
