// Gangs - Neutral Legendary Cards
import { cardScriptsRegistry } from '../index';

// CFM_621 - Kazakus
cardScriptsRegistry.register('CFM_621', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Create custom Kazakus potion - simplified
    if (controller?.hand?.length < 10) {
      const potions = ['CFM_621t', 'CFM_621t14', 'CFM_621t15'];
      const idx = Math.floor(Math.random() * potions.length);
      controller.hand.push({ id: potions[idx] } as any);
    }
  },
});

// CFM_637 - Patches the Pirate
cardScriptsRegistry.register('CFM_637', {
  // In deck: summoned when you play a pirate - simplified
});

// CFM_670 - Mayor Noggenfogger
cardScriptsRegistry.register('CFM_670', {
  // All targeting is random - simplified aura
});

// CFM_672 - Madam Goya
cardScriptsRegistry.register('CFM_672', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      const deck = controller?.deck || [];
      const minions = deck.filter((c: any) => c.type === 'MINION');
      if (minions.length > 0) {
        const idx = Math.floor(Math.random() * minions.length);
        const minion = minions[idx];
        const deckIdx = deck.indexOf(minion);

        // Swap target with deck minion
        const field = controller?.field || [];
        const fieldIdx = field.indexOf(ctx.target);
        if (fieldIdx !== -1 && deckIdx !== -1) {
          deck.splice(deckIdx, 1, ctx.target);
          field.splice(fieldIdx, 1, minion);
        }
      }
    }
  },
  requirements: { 48: 0 },
});

// CFM_685 - Don Han'Cho
cardScriptsRegistry.register('CFM_685', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const minions = (controller?.hand || []).filter((c: any) => c.type === 'MINION');
    if (minions.length > 0) {
      const idx = Math.floor(Math.random() * minions.length);
      (minions[idx] as any).atk = ((minions[idx] as any).atk || 0) + 5;
      (minions[idx] as any).maxHealth = ((minions[idx] as any).maxHealth || 0) + 5;
    }
  },
});

// CFM_806 - Wrathion
cardScriptsRegistry.register('CFM_806', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Draw cards until draw a non-dragon - simplified
    for (let i = 0; i < 3; i++) {
      if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
        const card = controller.deck.shift();
        controller.hand.push(card);
        if ((card as any).race === 'DRAGON') {
          i--; // Continue drawing
        } else {
          break;
        }
      }
    }
  },
});

// CFM_807 - Auctionmaster Beardo
cardScriptsRegistry.register('CFM_807', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller) {
        // Refresh hero power - simplified
        (controller as any).heroPowerRefreshed = true;
      }
    }
  },
});

// CFM_808 - Genzo, the Shark
cardScriptsRegistry.register('CFM_808', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.attacker === ctx.source) {
        const controller = ctx.source?.controller;
        const opponent = controller?.opponent;
        // Both players draw until 3 cards
        for (let i = 0; i < 2; i++) {
          if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
            controller.hand.push(controller.deck.shift());
          }
          if (opponent?.deck && opponent.deck.length > 0 && opponent?.hand?.length < 10) {
            opponent.hand.push(opponent.deck.shift());
          }
        }
      }
    }
  },
});

// CFM_902 - Aya Blackpaw
cardScriptsRegistry.register('CFM_902', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'CFM_715t' } as any);
    }
  },
});

console.log('[Gangs Neutral Legendary] Registered card scripts');
