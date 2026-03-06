// Gangs - Warlock Cards
import { cardScriptsRegistry } from '../index';

// === Minions ===

// CFM_610 - Crystalweaver
cardScriptsRegistry.register('CFM_610', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const minion of controller?.field || []) {
      if ((minion as any).race === 'DEMON') {
        (minion as any).atk = ((minion as any).atk || 0) + 1;
        (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 1;
      }
    }
  },
});

// CFM_663 - Kabal Trafficker
cardScriptsRegistry.register('CFM_663', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.hand?.length < 10) {
        controller.hand.push({ id: 'RANDOM_DEMON' } as any);
      }
    },
  },
});

// CFM_699 - Seadevil Stinger
cardScriptsRegistry.register('CFM_699', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller as any;
    if (controller) {
      controller.murlocsCostHealth = true;
    }
  },
});

// CFM_750 - Krul the Unshackled
cardScriptsRegistry.register('CFM_750', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const deck = controller?.deck || [];
    const hasDuplicates = deck.some(
      (card: any, i: number) => deck.findIndex((c: any) => c.id === card.id) !== i
    );

    if (!hasDuplicates) {
      // Summon all demons from hand
      const demons = (controller?.hand || []).filter((c: any) => c.race === 'DEMON');
      for (const demon of demons) {
        if (controller?.field?.length < 7) {
          const idx = controller.hand.indexOf(demon);
          if (idx !== -1) {
            controller.hand.splice(idx, 1);
            controller.field.push(demon);
          }
        }
      }
    }
  },
});

// CFM_751 - Abyssal Enforcer
cardScriptsRegistry.register('CFM_751', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allCharacters = [
      controller?.hero,
      opponent?.hero,
      ...(controller?.field || []),
      ...(opponent?.field || []),
    ].filter(Boolean);
    for (const char of allCharacters) {
      if (char !== ctx.source) {
        (char as any).health = ((char as any).health || 0) - 3;
      }
    }
  },
});

// CFM_900 - Unlicensed Apothecary
cardScriptsRegistry.register('CFM_900', {
  events: {
    MINION_SUMMON: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        if (controller?.hero) {
          (controller.hero as any).health = ((controller.hero as any).health || 0) - 5;
        }
      }
    },
  },
});

// === Spells ===

// CFM_094 - Felfire Potion
cardScriptsRegistry.register('CFM_094', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allCharacters = [
      controller?.hero,
      opponent?.hero,
      ...(controller?.field || []),
      ...(opponent?.field || []),
    ].filter(Boolean);
    for (const char of allCharacters) {
      (char as any).health = ((char as any).health || 0) - 5;
    }
  },
});

// CFM_608 - Blastcrystal Potion
cardScriptsRegistry.register('CFM_608', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
      const controller = ctx.source?.controller as any;
      if (controller) {
        controller.maxMana = Math.max(0, (controller.maxMana || 0) - 1);
      }
    }
  },
  requirements: { 48: 0 },
});

// CFM_611 - Bloodfury Potion
cardScriptsRegistry.register('CFM_611', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 3;
      if ((ctx.target as any).race === 'DEMON') {
        (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 3;
      }
    }
  },
  requirements: { 48: 0 },
});

console.log('[Gangs Warlock] Registered card scripts');
