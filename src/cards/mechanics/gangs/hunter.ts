// Gangs - Hunter Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_315 - Alleycat
cardScriptsRegistry.register('CFM_315', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_315t' } as any);
    }
  },
});

// CFM_316 - Rat Pack
cardScriptsRegistry.register('CFM_316', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const atk = (ctx.source as any).atk || 2;
    for (let i = 0; i < atk && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'CFM_316t' } as any);
    }
  },
});

// CFM_333 - Knuckles
cardScriptsRegistry.register('CFM_333', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.attacker === ctx.source) {
        const opponent = ctx.source?.controller?.opponent;
        if (opponent?.hero) {
          const atk = (ctx.source as any).atk || 0;
          (opponent.hero as any).health = ((opponent.hero as any).health || 0) - atk;
        }
      }
    },
  },
});

// CFM_335 - Dispatch Kodo
cardScriptsRegistry.register('CFM_335', {
  play: (ctx: any) => {
    if (ctx.target) {
      const atk = (ctx.source as any).atk || 0;
      (ctx.target as any).health = ((ctx.target as any).health || 0) - atk;
    }
  },
  requirements: { 48: 0 },
});

// CFM_336 - Shaky Zipgunner
cardScriptsRegistry.register('CFM_336', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const minions = (controller?.hand || []).filter((c: any) => c.type === 'MINION');
    if (minions.length > 0) {
      const idx = Math.floor(Math.random() * minions.length);
      (minions[idx] as any).atk = ((minions[idx] as any).atk || 0) + 2;
      (minions[idx] as any).maxHealth = ((minions[idx] as any).maxHealth || 0) + 2;
    }
  },
});

// CFM_338 - Trogg Beastrager
cardScriptsRegistry.register('CFM_338', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const beasts = (controller?.hand || []).filter((c: any) => c.race === 'BEAST');
    if (beasts.length > 0) {
      const idx = Math.floor(Math.random() * beasts.length);
      (beasts[idx] as any).atk = ((beasts[idx] as any).atk || 0) + 1;
      (beasts[idx] as any).maxHealth = ((beasts[idx] as any).maxHealth || 0) + 1;
    }
  },
});

// === Spells ===

// CFM_026 - Hidden Cache
cardScriptsRegistry.register('CFM_026', {
  // Secret: After opponent plays minion, buff random minion in hand - simplified
});

// CFM_334 - Smuggler's Crate
cardScriptsRegistry.register('CFM_334', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const beasts = (controller?.hand || []).filter((c: any) => c.race === 'BEAST');
    if (beasts.length > 0) {
      const idx = Math.floor(Math.random() * beasts.length);
      (beasts[idx] as any).atk = ((beasts[idx] as any).atk || 0) + 2;
      (beasts[idx] as any).maxHealth = ((beasts[idx] as any).maxHealth || 0) + 2;
    }
  },
});

// === Weapons ===

// CFM_337 - Piranha Launcher
cardScriptsRegistry.register('CFM_337', {
  events: {
    ATTACK: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.attacker === controller?.hero && ctx.event?.target?.type === 'MINION') {
        if (controller?.field?.length < 7) {
          controller.field.push({ id: 'CFM_337t' } as any);
        }
      }
    },
  },
});

console.log('[Gangs Hunter] Registered card scripts');
