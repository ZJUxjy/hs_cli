// Gangs - Druid Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_308 - Kun the Forgotten King
cardScriptsRegistry.register('CFM_308', {
  play: (ctx: any) => {
    // Choose One: Gain 10 Armor or Refresh Mana Crystals - simplified
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 10;
    }
  },
});

// CFM_343 - Jade Behemoth
cardScriptsRegistry.register('CFM_343', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Summon a Jade Golem - simplified
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
});

// CFM_617 - Celestial Dreamer
cardScriptsRegistry.register('CFM_617', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // If you have a minion with 5+ Attack, gain +2/+2
    const hasBigMinion = (controller?.field || []).some(
      (m: any) => m !== ctx.source && (m.atk || 0) >= 5
    );
    if (hasBigMinion) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 2;
    }
  },
});

// CFM_816 - Virmen Sensei
cardScriptsRegistry.register('CFM_816', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).race === 'BEAST') {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 2;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 2;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// === Spells ===

// CFM_602 - Jade Idol
cardScriptsRegistry.register('CFM_602', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Choose One: Summon Jade Golem or Shuffle 3 copies - simplified to summon
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
});

// CFM_614 - Mark of the Lotus
cardScriptsRegistry.register('CFM_614', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const minion of controller?.field || []) {
      (minion as any).atk = ((minion as any).atk || 0) + 1;
      (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 1;
    }
  },
});

// CFM_616 - Pilfered Power
cardScriptsRegistry.register('CFM_616', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const minionCount = (controller?.field || []).length;
    // Gain empty mana crystals equal to minion count - simplified
    if (controller) {
      (controller as any).maxMana = Math.min(10, ((controller as any).maxMana || 0) + minionCount);
    }
  },
});

// CFM_713 - Jade Blossom
cardScriptsRegistry.register('CFM_713', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Summon Jade Golem and gain empty mana crystal
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
    if (controller) {
      (controller as any).maxMana = Math.min(10, ((controller as any).maxMana || 0) + 1);
    }
  },
});

// CFM_811 - Lunar Visions
cardScriptsRegistry.register('CFM_811', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Draw 2 cards, minions cost 2 less - simplified
    for (let i = 0; i < 2 && controller?.deck && controller.deck.length > 0; i++) {
      if (controller?.hand?.length < 10) {
        const card = controller.deck.shift();
        controller.hand.push(card);
      }
    }
  },
});

console.log('[Gangs Druid] Registered card scripts');
