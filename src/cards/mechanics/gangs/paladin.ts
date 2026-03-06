// Gangs - Paladin Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_062 - Grimestreet Protector
cardScriptsRegistry.register('CFM_062', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const field = controller?.field || [];
    const adjacent = field.filter((m: any) => m !== ctx.source);
    for (const minion of adjacent) {
      (minion as any).divineShield = true;
    }
  },
});

// CFM_639 - Grimestreet Enforcer
cardScriptsRegistry.register('CFM_639', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        for (const card of controller?.hand || []) {
          if ((card as any).type === 'MINION') {
            (card as any).atk = ((card as any).atk || 0) + 1;
            (card as any).maxHealth = ((card as any).maxHealth || 0) + 1;
          }
        }
      }
    }
  },
});

// CFM_650 - Grimscale Chum
cardScriptsRegistry.register('CFM_650', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const murlocs = (controller?.hand || []).filter((c: any) => c.race === 'MURLOC');
    if (murlocs.length > 0) {
      const idx = Math.floor(Math.random() * murlocs.length);
      (murlocs[idx] as any).atk = ((murlocs[idx] as any).atk || 0) + 1;
      (murlocs[idx] as any).maxHealth = ((murlocs[idx] as any).maxHealth || 0) + 1;
    }
  },
});

// CFM_753 - Grimestreet Outfitter
cardScriptsRegistry.register('CFM_753', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const card of controller?.hand || []) {
      if ((card as any).type === 'MINION') {
        (card as any).atk = ((card as any).atk || 0) + 1;
        (card as any).maxHealth = ((card as any).maxHealth || 0) + 1;
      }
    }
  },
});

// CFM_759 - Meanstreet Marshal
cardScriptsRegistry.register('CFM_759', {
  deathrattle: (ctx: any) => {
    const source = ctx.source as any;
    if ((source.atk || 0) >= 2) {
      const controller = ctx.source?.controller;
      if (controller?.deck && controller.deck.length > 0) {
        controller.hand.push(controller.deck.shift());
      }
    }
  },
});

// === Spells ===

// CFM_305 - Smuggler's Run
cardScriptsRegistry.register('CFM_305', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const card of controller?.hand || []) {
      if ((card as any).type === 'MINION') {
        (card as any).atk = ((card as any).atk || 0) + 1;
        (card as any).maxHealth = ((card as any).maxHealth || 0) + 1;
      }
    }
  },
});

// CFM_800 - Getaway Kodo
cardScriptsRegistry.register('CFM_800', {
  // Secret: Return friendly minion to your hand - simplified
});

// CFM_905 - Small-Time Recruits
cardScriptsRegistry.register('CFM_905', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const deck = controller?.deck || [];
    const oneCostMinions = deck.filter((c: any) => c.type === 'MINION' && (c.cost || 0) === 1);
    for (let i = 0; i < 3 && controller?.hand?.length < 10; i++) {
      const idx = deck.indexOf(oneCostMinions[i]);
      controller.hand.push(deck.splice(idx, 1)[0]);
    }
  },
});

console.log('[Gangs Paladin] Registered card scripts');
