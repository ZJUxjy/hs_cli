// Gangs - Warrior Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_643 - Hobart Grapplehammer
cardScriptsRegistry.register('CFM_643', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const card of controller?.hand || []) {
      if ((card as any).type === 'WEAPON') {
        (card as any).atk = ((card as any).atk || 0) + 1;
      }
    }
    for (const card of controller?.deck || []) {
      if ((card as any).type === 'WEAPON') {
        (card as any).atk = ((card as any).atk || 0) + 1;
      }
    }
  },
});

// CFM_754 - Grimy Gadgeteer
cardScriptsRegistry.register('CFM_754', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        const minions = (controller?.hand || []).filter((c: any) => c.type === 'MINION');
        if (minions.length > 0) {
          const idx = Math.floor(Math.random() * minions.length);
          (minions[idx] as any).atk = ((minions[idx] as any).atk || 0) + 2;
          (minions[idx] as any).maxHealth = ((minions[idx] as any).maxHealth || 0) + 2;
        }
      }
    }
  },
});

// CFM_755 - Grimestreet Pawnbroker
cardScriptsRegistry.register('CFM_755', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const weapons = (controller?.hand || []).filter((c: any) => c.type === 'WEAPON');
    if (weapons.length > 0) {
      const idx = Math.floor(Math.random() * weapons.length);
      (weapons[idx] as any).atk = ((weapons[idx] as any).atk || 1) + 1;
      (weapons[idx] as any).durability = ((weapons[idx] as any).durability || 1) + 1;
    }
  },
});

// CFM_756 - Alley Armorsmith
cardScriptsRegistry.register('CFM_756', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target?.controller === ctx.source?.controller) {
        const controller = ctx.source?.controller;
        if (controller?.hero) {
          (controller.hero as any).armor = ((controller.hero as any).armor || 0) + ((ctx.event as any).amount || 0);
        }
      }
    }
  },
});

// === Spells ===

// CFM_716 - Sleep with the Fishes
cardScriptsRegistry.register('CFM_716', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || []),
    ].filter((m: any) => (m as any).damaged);
    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 3;
    }
  },
});

// CFM_752 - Stolen Goods
cardScriptsRegistry.register('CFM_752', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const taunts = (controller?.hand || []).filter(
      (c: any) => c.type === 'MINION' && (c as any).taunt
    );
    if (taunts.length > 0) {
      const idx = Math.floor(Math.random() * taunts.length);
      (taunts[idx] as any).atk = ((taunts[idx] as any).atk || 3) + 3;
      (taunts[idx] as any).maxHealth = ((taunts[idx] as any).maxHealth || 0) + 3;
    }
  },
});

// CFM_940 - I Know a Guy
cardScriptsRegistry.register('CFM_940', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_TAUNT_MINION' } as any);
    }
  },
});

// === Weapons ===

// CFM_631 - Brass Knuckles
cardScriptsRegistry.register('CFM_631', {
  events: {
    ATTACK: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.attacker === controller?.hero) {
        const minions = (controller?.hand || []).filter((c: any) => c.type === 'MINION');
        if (minions.length > 0) {
          const idx = Math.floor(Math.random() * minions.length);
          (minions[idx] as any).atk = ((minions[idx] as any).atk || 1) + 1;
          (minions[idx] as any).maxHealth = ((minions[idx] as any).maxHealth || 0) + 1;
        }
      }
    }
  },
});

console.log('[Gangs Warrior] Registered card scripts');
