// Gangs - Shaman Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_061 - Jinyu Waterspeaker
cardScriptsRegistry.register('CFM_061', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = Math.min(
        ((ctx.target as any).health || 0) + 6,
        (ctx.target as any).maxHealth || 30
      );
    }
  },
  requirements: { 48: 0 },
});

// CFM_312 - Jade Chieftain
cardScriptsRegistry.register('CFM_312', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t', taunt: true } as any);
    }
  },
});

// CFM_324 - White Eyes
cardScriptsRegistry.register('CFM_324', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck) {
      controller.deck.push({ id: 'CFM_324t' } as any);
    }
  },
});

// CFM_697 - Lotus Illusionist
cardScriptsRegistry.register('CFM_697', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.attacker === ctx.source && ctx.event?.target?.type === 'HERO') {
        // Transform into random 6-cost minion - simplified
        (ctx.source as any).id = 'RANDOM_COST_6_MINION';
      }
    },
  },
});

// === Spells ===

// CFM_310 - Call in the Finishers
cardScriptsRegistry.register('CFM_310', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (let i = 0; i < 4 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'CFM_310t' } as any);
    }
  },
});

// CFM_313 - Finders Keepers
cardScriptsRegistry.register('CFM_313', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_SHAMAN_OVERLOAD_CARD' } as any);
    }
  },
});

// CFM_696 - Devolve
cardScriptsRegistry.register('CFM_696', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    for (const minion of opponent?.field || []) {
      const cost = (minion as any).cost || 0;
      (minion as any).id = `RANDOM_COST_${Math.max(0, cost - 1)}_MINION`;
    }
  },
});

// CFM_707 - Jade Lightning
cardScriptsRegistry.register('CFM_707', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 4;
    }
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
  requirements: { 48: 0 },
});

// === Weapons ===

// CFM_717 - Jade Claws
cardScriptsRegistry.register('CFM_717', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
});

console.log('[Gangs Shaman] Registered card scripts');
