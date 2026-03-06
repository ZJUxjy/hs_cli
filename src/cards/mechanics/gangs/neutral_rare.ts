// Gangs - Neutral Rare Cards
import { cardScriptsRegistry } from '../index';

// CFM_060 - Red Mana Wyrm
cardScriptsRegistry.register('CFM_060', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
      }
    }
  },
});

// CFM_063 - Kooky Chemist
cardScriptsRegistry.register('CFM_063', {
  play: (ctx: any) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const atk = target.atk || 0;
      const health = target.health || 1;
      target.atk = health;
      target.maxHealth = atk;
      target.health = atk;
    }
  },
  requirements: { 48: 0 },
});

// CFM_067 - Hozen Healer
cardScriptsRegistry.register('CFM_067', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = Math.min(
        ((ctx.target as any).health || 0) + ((ctx.target as any).maxHealth || 0),
        ((ctx.target as any).maxHealth || 0)
      );
    }
  },
  requirements: { 48: 0 },
});

// CFM_120 - Mistress of Mixtures
cardScriptsRegistry.register('CFM_120', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + 4,
        (controller.hero as any).maxHealth || 30
      );
    }
    if (opponent?.hero) {
      (opponent.hero as any).health = Math.min(
        ((opponent.hero as any).health || 0) + 4,
        (opponent.hero as any).maxHealth || 30
      );
    }
  },
});

// CFM_619 - Kabal Chemist
cardScriptsRegistry.register('CFM_619', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_POTION' } as any);
    }
  },
});

// CFM_646 - Backstreet Leper
cardScriptsRegistry.register('CFM_646', {
  deathrattle: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    if (opponent?.hero) {
      (opponent.hero as any).health = ((opponent.hero as any).health || 0) - 2;
    }
  },
});

// CFM_647 - Blowgill Sniper
cardScriptsRegistry.register('CFM_647', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 1;
    }
  },
  requirements: { 48: 0 },
});

// CFM_648 - Big-Time Racketeer
cardScriptsRegistry.register('CFM_648', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_648t' } as any);
    }
  },
});

// CFM_651 - Naga Corsair
cardScriptsRegistry.register('CFM_651', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller?.weapon) {
      (controller.weapon as any).atk = ((controller.weapon as any).atk || 0) + 1;
    }
  },
});

// CFM_654 - Friendly Bartender
cardScriptsRegistry.register('CFM_654', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.hero) {
        (controller.hero as any).health = Math.min(
          ((controller.hero as any).health || 0) + 1,
          (controller.hero as any).maxHealth || 30
        );
      }
    }
  },
});

// CFM_655 - Toxic Sewer Ooze
cardScriptsRegistry.register('CFM_655', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent as any;
    if (opponent?.weapon) {
      (opponent.weapon as any).durability = ((opponent.weapon as any).durability || 0) - 1;
    }
  },
});

// CFM_656 - Streetwise Investigator
cardScriptsRegistry.register('CFM_656', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    for (const minion of opponent?.field || []) {
      (minion as any).stealth = false;
    }
  },
});

// CFM_659 - Gadgetzan Socialite
cardScriptsRegistry.register('CFM_659', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = Math.min(
        ((ctx.target as any).health || 0) + 2,
        (ctx.target as any).maxHealth || 30
      );
    }
  },
  requirements: { 48: 0 },
});

// CFM_715 - Jade Spirit
cardScriptsRegistry.register('CFM_715', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
});

// CFM_809 - Tanaris Hogchopper
cardScriptsRegistry.register('CFM_809', {
  play: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    if ((opponent?.hand?.length || 0) === 0) {
      (ctx.source as any).charge = true;
    }
  },
});

// CFM_851 - Daring Reporter
cardScriptsRegistry.register('CFM_851', {
  events: {
    DRAW: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.player !== controller) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 1) + 1;
        (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;
      }
    }
  },
});

// CFM_853 - Grimestreet Smuggler
cardScriptsRegistry.register('CFM_853', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const minions = (controller?.hand || []).filter((c: any) => c.type === 'MINION');
    if (minions.length > 0) {
      const idx = Math.floor(Math.random() * minions.length);
      (minions[idx] as any).atk = ((minions[idx] as any).atk || 0) + 1;
      (minions[idx] as any).maxHealth = ((minions[idx] as any).maxHealth || 0) + 1;
    }
  },
});

console.log('[Gangs Neutral Rare] Registered card scripts');
