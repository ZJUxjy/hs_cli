// Gangs - Neutral Epic Cards
import { cardScriptsRegistry } from '../index';

// CFM_025 - Wind-up Burglebot
cardScriptsRegistry.register('CFM_025', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.attacker === ctx.source) {
        const defender = ctx.event?.target;
        const controller = ctx.source?.controller;
        // If survived attack on a minion, draw a card
        if (defender?.type === 'MINION' && !(ctx.source as any).destroyed) {
          if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
            controller.hand.push(controller.deck.shift());
          }
        }
      }
    }
  },
});

// CFM_064 - Blubber Baron
cardScriptsRegistry.register('CFM_064', {
  // In hand: gain +1/+1 when you play a Battlecry minion - simplified
});

// CFM_095 - Weasel Tunneler
cardScriptsRegistry.register('CFM_095', {
  deathrattle: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    if (opponent?.deck) {
      opponent.deck.push(ctx.source);
    }
  },
});

// CFM_328 - Fight Promoter
cardScriptsRegistry.register('CFM_328', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const has6HealthMinion = (controller?.field || []).some(
      (m: any) => (m.health || 0) >= 6
    );
    if (has6HealthMinion) {
      for (let i = 0; i < 2 && controller?.deck && controller.deck.length > 0; i++) {
        if (controller?.hand?.length < 10) {
          controller.hand.push(controller.deck.shift());
        }
      }
    }
  },
});

// CFM_609 - Fel Orc Soulfiend
cardScriptsRegistry.register('CFM_609', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        (ctx.source as any).health = ((ctx.source as any).health || 0) - 2;
      }
    }
  },
});

// CFM_669 - Burgly Bully
cardScriptsRegistry.register('CFM_669', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller !== controller) {
        if (controller?.hand?.length < 10) {
          controller.hand.push({ id: 'GAME_005' } as any); // The Coin
        }
      }
    }
  },
});

// CFM_790 - Dirty Rat
cardScriptsRegistry.register('CFM_790', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const opponentMinions = (opponent?.hand || []).filter((c: any) => c.type === 'MINION');
    if (opponentMinions.length > 0 && opponent?.field?.length < 7) {
      const idx = Math.floor(Math.random() * opponentMinions.length);
      const minion = opponentMinions[idx];
      const cardIdx = opponent.hand.indexOf(minion);
      if (cardIdx !== -1) {
        opponent.hand.splice(cardIdx, 1);
        opponent.field.push(minion);
      }
    }
  },
});

// CFM_810 - Leatherclad Hogleader
cardScriptsRegistry.register('CFM_810', {
  play: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    if ((opponent?.hand?.length || 0) >= 6) {
      (ctx.source as any).charge = true;
    }
  },
});

// CFM_855 - Defias Cleaner
cardScriptsRegistry.register('CFM_855', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).deathrattle) {
      (ctx.target as any).silenced = true;
    }
  },
  requirements: { 48: 0 },
});

console.log('[Gangs Neutral Epic] Registered card scripts');
