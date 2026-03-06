// Gangs - Rogue Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_342 - Luckydo Buccaneer
cardScriptsRegistry.register('CFM_342', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const weapon = (controller as any)?.weapon;
    if (weapon && ((weapon as any).atk || 0) >= 3) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 4;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 4;
    }
  },
});

// CFM_634 - Lotus Assassin
cardScriptsRegistry.register('CFM_634', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.attacker === ctx.source) {
        const defender = ctx.event?.target;
        if (defender && ((defender as any).health || 0) <= 0) {
          (ctx.source as any).stealth = true;
        }
      }
    },
  },
});

// CFM_691 - Jade Swarmer
cardScriptsRegistry.register('CFM_691', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
});

// CFM_693 - Gadgetzan Ferryman
cardScriptsRegistry.register('CFM_693', {
  play: (ctx: any) => {
    // Combo: Return a friendly minion to your hand
    if (ctx.target) {
      const controller = ctx.source?.controller;
      const field = controller?.field || [];
      const idx = field.indexOf(ctx.target);
      if (idx !== -1 && controller?.hand?.length < 10) {
        field.splice(idx, 1);
        controller.hand.push(ctx.target);
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// CFM_694 - Shadow Sensei
cardScriptsRegistry.register('CFM_694', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).stealth) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 2;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 2;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// CFM_781 - Shaku, the Collector
cardScriptsRegistry.register('CFM_781', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.attacker === ctx.source) {
        const controller = ctx.source?.controller;
        if (controller?.hand?.length < 10) {
          const opponent = controller?.opponent;
          const opponentClass = (opponent as any)?.heroClass || 'NEUTRAL';
          controller.hand.push({ id: `RANDOM_${opponentClass}_CARD` } as any);
        }
      }
    },
  },
});

// === Spells ===

// CFM_630 - Counterfeit Coin
cardScriptsRegistry.register('CFM_630', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller) {
      controller.mana = (controller.mana || 0) + 1;
      (controller as any).temporaryMana = ((controller as any).temporaryMana || 0) + 1;
    }
  },
});

// CFM_690 - Jade Shuriken
cardScriptsRegistry.register('CFM_690', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
    }
  },
  combo: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
    }
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
  requirements: { 48: 0 },
});

console.log('[Gangs Rogue] Registered card scripts');
