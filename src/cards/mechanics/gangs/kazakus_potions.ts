// Gangs - Kazakus Potions
import { cardScriptsRegistry } from '../index';

// CFM_621t - Kazakus Potion (1-cost)
cardScriptsRegistry.register('CFM_621t', {
  play: (ctx: any) => {
    // Custom potion created by Kazakus - simplified
    const effects = [
      'armor_5',
      'draw_2',
      'summon_random_cost_1',
      'damage_3',
      'freeze',
      'polymorph',
      'health_4',
      'aoe',
      'revive',
      'steal',
    ];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    // Apply effect based on randomEffect - simplified
  },
});

// CFM_621t14 - Kazakus Potion (5-cost)
cardScriptsRegistry.register('CFM_621t14', {
  play: (ctx: any) => {
    const effects = [
      'armor_10',
      'draw_3',
      'summon_random_cost_5',
      'damage_5',
      'freeze_all',
      'polymorph_all',
      'health_8',
      'aoe_2',
      'revive_2',
      'steal_2',
    ];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
  },
});

// CFM_621t15 - Kazakus Potion (10-cost)
cardScriptsRegistry.register('CFM_621t15', {
  play: (ctx: any) => {
    const effects = [
      'armor_20',
      'draw_5',
      'summon_random_cost_10',
      'damage_10',
      'freeze_all',
      'polymorph_all',
      'health_12',
      'aoe_4',
      'revive_4',
      'steal_4',
    ];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
  },
});

// === Potion Effect Cards ===

// CFM_621t2 - Armor Potion
cardScriptsRegistry.register('CFM_621t2', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 6;
    }
  },
});

// CFM_621t3 - Health Potion
cardScriptsRegistry.register('CFM_621t3', {
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

// CFM_621t4 - Damage Potion
cardScriptsRegistry.register('CFM_621t4', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 4
    }
  },
  requirements: { 48: 0 },
});

// CFM_621t5 - Freeze Potion
cardScriptsRegistry.register('CFM_621t5', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).frozen = true;
    }
  },
  requirements: { 48: 0 },
});

// CFM_621t6 - Polymorph Potion
cardScriptsRegistry.register('CFM_621t6', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).id = 'CFM_621t6t'; // Sheep
    }
  },
  requirements: { 48: 0 },
});

// CFM_621t8 - Draw Potion
cardScriptsRegistry.register('CFM_621t8', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (let i = 0; i < 2; i++) {
      if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
        controller.hand.push(controller.deck.shift());
      }
    }
  },
});

// CFM_621t9 - Summon Potion
cardScriptsRegistry.register('CFM_621t9', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_2_MINION' } as any);
    }
  },
});

// CFM_621t10 - AOE Potion
cardScriptsRegistry.register('CFM_621t10', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const targets = opponent?.field || [];
    for (const minion of targets) {
      (minion as any).health = ((minion as any).health || 0) - 1
    }
  },
});

console.log('[Gangs Kazakus Potions] Registered card scripts');
