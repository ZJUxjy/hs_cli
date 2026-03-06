// Gangs - Mage Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_066 - Kabal Lackey
cardScriptsRegistry.register('CFM_066', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller) {
      controller.nextSecretCost = 0;
    }
  },
});

// CFM_660 - Manic Soulcaster
cardScriptsRegistry.register('CFM_660', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      if (controller?.deck) {
        controller.deck.push({ ...(ctx.target as any) });
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// CFM_671 - Cryomancer
cardScriptsRegistry.register('CFM_671', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const hasFrozen = [opponent?.hero, ...(opponent?.field || [])].some(
      (c: any) => c?.frozen
    );
    if (hasFrozen) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 2;
    }
  },
});

// CFM_687 - Inkmaster Solia
cardScriptsRegistry.register('CFM_687', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // If no duplicates in deck, next spell costs 0 - simplified
    (controller as any).nextSpellFree = true;
  },
});

// CFM_760 - Kabal Crystal Runner
cardScriptsRegistry.register('CFM_760', {
  // Cost reduced by secrets played - simplified aura
});

// === Spells ===

// CFM_021 - Freezing Potion
cardScriptsRegistry.register('CFM_021', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).frozen = true;
    }
  },
  requirements: { 48: 0 },
});

// CFM_065 - Volcanic Potion
cardScriptsRegistry.register('CFM_065', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [...(controller?.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 2;
    }
  },
});

// CFM_620 - Potion of Polymorph
cardScriptsRegistry.register('CFM_620', {
  // Secret: Transform minion to Sheep - simplified
});

// CFM_623 - Greater Arcane Missiles
cardScriptsRegistry.register('CFM_623', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];

    for (let i = 0; i < 3 && targets.length > 0; i++) {
      const idx = Math.floor(Math.random() * targets.length);
      (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 3;
    }
  },
});

console.log('[Gangs Mage] Registered card scripts');
