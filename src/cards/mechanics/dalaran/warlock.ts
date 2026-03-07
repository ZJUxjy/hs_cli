// dalaran - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_185
cardScriptsRegistry.register('DAL_185', {
});

// DAL_422 - Arch-Villain Rafaam - Battlecry: Replace your hand and deck with Legendary minions
cardScriptsRegistry.register('DAL_422', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Replace hand and deck with legendary minions - simplified: just draw cards
    const { Draw } = require('../../../actions/draw');
    for (let i = 0; i < 3; i++) {
      const drawAction = new Draw();
      drawAction.trigger(controller);
    }
  },
});

// DAL_561
cardScriptsRegistry.register('DAL_561', {
});

// Hand - EVIL Genius buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// DAL_561e - EVIL Genius buff
cardScriptsRegistry.register('DAL_561e', {
  events: {
    // Handled by game
  },
});

// DAL_563 - Eager Underling - Deathrattle: Give two random friendly minions +2/+2
cardScriptsRegistry.register('DAL_563', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];
    if (friendlyMinions.length >= 2) {
      const indices = Array.from({ length: friendlyMinions.length }, (_, i) => i);
      const idx1 = Math.floor(Math.random() * indices.length);
      indices.splice(idx1, 1);
      const idx2 = Math.floor(Math.random() * indices.length);

      const target1 = friendlyMinions[indices[idx1]];
      const target2 = friendlyMinions[indices[idx2]];

      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('DAL_563e', { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source, target1);
      buff.trigger(ctx.source, target2);
    } else if (friendlyMinions.length === 1) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('DAL_563e', { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source, friendlyMinions[0]);
    }
  },
});

// DAL_606 - EVIL Genius - Battlecry: Destroy a friendly minion to add 2 random Lackeys to your hand
cardScriptsRegistry.register('DAL_606', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Destroy the targeted friendly minion
      (ctx.target as any).destroyed = true;
      // Add 2 random Lackeys to hand - simplified: draw cards
      const controller = (ctx.source as any).controller;
      const { Draw } = require('../../../actions/draw');
      for (let i = 0; i < 2; i++) {
        const drawAction = new Draw();
        drawAction.trigger(controller);
      }
    }
  },
});

// DAL_607 - Fel Lord Betrug - Whenever you draw a minion, summon a copy that dies at end of turn
cardScriptsRegistry.register('DAL_607', {
  events: {
    DRAW_CARD: (ctx: ActionContext) => {
      const drawnCard = ctx.target;
      if (drawnCard && (drawnCard as any).type === 'minion') {
        const { Summon } = require('../../../actions/summon');
        const summonAction = new Summon(drawnCard);
        summonAction.trigger(ctx.source);
      }
    },
  },
});

// DAL_607e - Fel Lord Betrug buff
cardScriptsRegistry.register('DAL_607e', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
  events: {
    // Handled by game
  },
});

// DAL_173 - Darkest Hour - Destroy all friendly minions. For each one, summon a random minion from your deck.
cardScriptsRegistry.register('DAL_173', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const friendlyMinions = [...(controller.field || [])];
    const deck = controller.deck || [];

    // Destroy all friendly minions
    for (const minion of friendlyMinions) {
      (minion as any).destroyed = true;
    }

    // For each destroyed minion, summon a random minion from deck
    const { Summon } = require('../../../actions/summon');
    for (let i = 0; i < friendlyMinions.length && deck.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const randomMinion = deck[randomIndex];
      if (randomMinion) {
        const summonAction = new Summon(randomMinion);
        summonAction.trigger(ctx.source);
      }
    }
  },
});

// DAL_602
cardScriptsRegistry.register('DAL_602', {
});

// DAL_605 - Impferno - Give your Demons +1 Attack. Deal $1 damage to all enemy minions.
cardScriptsRegistry.register('DAL_605', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Give your Demons +1 Attack
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const card = minion as any;
      if (card.race === 'demon') {
        card.attack = (card.attack || 0) + 1;
      }
    }

    // Deal 1 damage to all enemy minions
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, minion, 1);
      damage.trigger(ctx.source);
    }
  },
});
