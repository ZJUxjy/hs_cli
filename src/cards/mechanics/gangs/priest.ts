// Gangs - Priest Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_020 - Raza the Chained
cardScriptsRegistry.register('CFM_020', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller) {
      controller.heroPowerCostZero = true;
    }
  },
});

// CFM_605 - Drakonid Operative
cardScriptsRegistry.register('CFM_605', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = (controller?.hand || []).some((c: any) => c.race === 'DRAGON');
    if (hasDragon) {
      // Discover a card from opponent deck - simplified
      const opponent = controller?.opponent;
      if (opponent?.deck && opponent.deck.length > 0 && controller?.hand?.length < 10) {
        const idx = Math.floor(Math.random() * opponent.deck.length);
        controller.hand.push({ ...(opponent.deck[idx] as any) });
      }
    }
  },
});

// CFM_606 - Mana Geode
cardScriptsRegistry.register('CFM_606', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        // Heal self and summon copy - simplified
        const source = ctx.source as any;
        source.health = Math.min((source.health || 0) + 4, source.maxHealth || 4);
        if (controller?.field?.length < 7) {
          controller.field.push({ id: 'CFM_606t' } as any);
        }
      }
    }
  },
});

// CFM_626 - Kabal Talonpriest
cardScriptsRegistry.register('CFM_626', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 3;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// CFM_657 - Kabal Songstealer
cardScriptsRegistry.register('CFM_657', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).silenced = true;
    }
  },
  requirements: { 48: 0 },
});

// === Spells ===

// CFM_603 - Potion of Madness
cardScriptsRegistry.register('CFM_603', {
  play: (ctx: any) => {
    if (ctx.target && ((ctx.target as any).atk || 0) <= 2) {
      // Take control of enemy minion until end of turn
      const controller = ctx.source?.controller;
      const opponent = controller?.opponent;
      if (opponent?.field) {
        const idx = opponent.field.indexOf(ctx.target);
        if (idx !== -1) {
          const minion = opponent.field.splice(idx, 1)[0];
          if (controller?.field?.length < 7) {
            minion.controller = controller;
            controller.field.push(minion);
          }
        }
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// CFM_604 - Greater Healing Potion
cardScriptsRegistry.register('CFM_604', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = Math.min(
        ((ctx.target as any).health || 0) + 12,
        (ctx.target as any).maxHealth || 30
      );
    }
  },
  requirements: { 48: 0 },
});

// CFM_661 - Pint-Size Potion
cardScriptsRegistry.register('CFM_661', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    for (const minion of opponent?.field || []) {
      (minion as any).atk = Math.max(0, ((minion as any).atk || 0) - 3);
    }
  },
});

// CFM_662 - Dragonfire Potion
cardScriptsRegistry.register('CFM_662', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || []),
    ].filter((m: any) => m.race !== 'DRAGON');
    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 5;
    }
  },
});

console.log('[Gangs Priest] Registered card scripts');
