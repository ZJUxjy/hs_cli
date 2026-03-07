// witchwood - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give, Shuffle } from '../../../actions';

// GIL_128 - Vicious Scalehide - Lifesteal. Battlecry: Deal 1 damage
cardScriptsRegistry.register('GIL_128', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// GIL_128e - Vicious Scalehide Enchantment
cardScriptsRegistry.register('GIL_128e', {
});

// GIL_200 - Houndmaster Shaw - Your other minions have +2 Attack
cardScriptsRegistry.register('GIL_200', {
});

// GIL_200t - Hound (Token)
cardScriptsRegistry.register('GIL_200t', {
});

// GIL_200e - Houndmaster's Companion
cardScriptsRegistry.register('GIL_200e', {
});

// GIL_607 - Scavenger's Ingenuity - Draw a card
cardScriptsRegistry.register('GIL_607', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// GIL_650 - Venomizer - Poisonous
cardScriptsRegistry.register('GIL_650', {
});

// GIL_905 - Rat Trap - Secret: After your opponent plays 3 cards, summon a 6/6 Rat
cardScriptsRegistry.register('GIL_905', {
});

// GIL_518 - Wing Blast - Deal 4 damage to a minion. If a minion died this turn, deal 6 instead
cardScriptsRegistry.register('GIL_518', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Check if a minion died this turn - would need game state
      const damage = new Damage(ctx.source, ctx.target, 4);
      damage.trigger(ctx.source);
    }
  },
});

// GIL_577 - Toxmonger - After you play a Poisonous minion, give it +2/+2
cardScriptsRegistry.register('GIL_577', {
  events: {
    PLAY: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.source) {
        const source = event.source as any;
        if (source.poisonous) {
          const buff = new Buff(ctx.source, source, { ATK: 2, HEALTH: 2 });
          buff.trigger(ctx.source);
        }
      }
    },
  },
});

// GIL_828 - Dire Frenzy - Give a Beast +3/+3. Shuffle 3 copies into your deck
cardScriptsRegistry.register('GIL_828', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const buff = new Buff(ctx.source, ctx.target, { ATK: 3, HEALTH: 3 });
      buff.trigger(ctx.source);
      // Shuffle 3 copies into deck
      const cardId = target.id;
      const shuffleAction = new Shuffle(cardId);
      shuffleAction.trigger(ctx.source);
      shuffleAction.trigger(ctx.source);
      shuffleAction.trigger(ctx.source);
    }
  },
});

// GIL_551 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('GIL_551', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all other friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(ctx.source, minion, 2);
        damage.trigger(ctx.source);
      }
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
  },
});

// GIL_809 - Hunting Party - Draw 3 cards
cardScriptsRegistry.register('GIL_809', {
  play: (ctx: ActionContext) => {
    for (let i = 0; i < 3; i++) {
      const drawAction = new Draw(ctx.source, 1);
      drawAction.trigger(ctx.source);
    }
  },
});
