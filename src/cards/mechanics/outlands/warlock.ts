// outlands - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle } from '../../../actions';
import { Race } from '../../../enums';

// BT_196 - Shadow Council - Replace your hand with copies of a random minion in your deck
cardScriptsRegistry.register('BT_196', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Replace hand with copies - simplified
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    if (deck.length > 0) {
      const randomCard = deck[Math.floor(Math.random() * deck.length)];
      if (randomCard) {
        // Clear hand and give copies
        const hand = controller.hand || [];
        for (const card of hand) {
          card.zone = 'GRAVEYARD';
        }
        for (let i = 0; i < hand.length; i++) {
          const giveAction = new Give(randomCard.id);
          giveAction.trigger(ctx.source, controller);
        }
      }
    }
  },
});

// BT_301 - Kanrethad Ebonlocke - Battlecry: Summon a 3/3 Infernal
cardScriptsRegistry.register('BT_301', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_301t');
    summon.trigger(ctx.source);
  },
});

// BT_304 - Enhanced Dreadlord - Deathrattle: Summon a 3/3 Infernal
cardScriptsRegistry.register('BT_304', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_304t');
    summon.trigger(ctx.source);
  },
});

// BT_305 - Darkglare - Your minions take 1 less damage from spells
cardScriptsRegistry.register('BT_305', {
});

// BT_307 - Nightshade Matron - Battlecry: Discard your highest Cost card
cardScriptsRegistry.register('BT_307', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const hand = controller.hand || [];
      if (hand.length > 0) {
        // Find highest cost card
        let highestCostCard = hand[0];
        let highestCost = (highestCostCard as any).cost || 0;
        for (const card of hand) {
          const cost = (card as any).cost || 0;
          if (cost > highestCost) {
            highestCost = cost;
            highestCostCard = card;
          }
        }
        // Discard it
        highestCostCard.zone = 'GRAVEYARD';
        controller.hand = controller.hand.filter((c: any) => c !== highestCostCard);
      }
    },
  },
});

// BT_309 - Keli'dan the Breaker - Deathrattle: Destroy a random enemy minion
cardScriptsRegistry.register('BT_309', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    if (enemyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * enemyMinions.length);
      const target = enemyMinions[randomIndex];
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, target);
    }
  },
});

// BT_309t - Keli'dan token
cardScriptsRegistry.register('BT_309t', {
  play: (ctx: ActionContext) => {
    // Destroy a random enemy minion
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    if (enemyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * enemyMinions.length);
      const target = enemyMinions[randomIndex];
      const destroy = new Destroy();
      destroy.trigger(ctx.source, target);
    }
  },
});

// BT_199 - Unstable Felbolt - Deal 3 damage to a minion and 2 damage to its controller
cardScriptsRegistry.register('BT_199', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Deal 3 damage to the target minion
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);

      // Deal 2 damage to the controller (opponent's hero)
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      const damage2 = new Damage(ctx.source, opponent.hero, 2);
      damage2.trigger(ctx.source);
    }
  },
});

// BT_300 - Imprisoned Scrap Imp - Dormant for 2 turns. When this awakens, give all minions in your hand +2/+2
cardScriptsRegistry.register('BT_300', {
  play: (ctx: ActionContext) => {
    // Dormant effect handled by game
    // When awakens, buff hand
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    for (const card of hand) {
      if ((card as any).type === 'minion') {
        const buff = new Buff(ctx.source, card, { ATK: 2, HEALTH: 2 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// BT_302 - Darkest Hour - Destroy a random enemy minion
cardScriptsRegistry.register('BT_302', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    if (enemyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * enemyMinions.length);
      const target = enemyMinions[randomIndex];
      const destroy = new Destroy();
      destroy.trigger(ctx.source, target);
    }
  },
});

// BT_302e - Darkest Hour enchantment
cardScriptsRegistry.register('BT_302e', {
  events: {
    // Periodically triggers
  },
});

// BT_306 - Void Drinker - Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('BT_306', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    if (enemyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * enemyMinions.length);
      const target = enemyMinions[randomIndex];
      const destroy = new Destroy();
      destroy.trigger(ctx.source, target);
    }
  },
});
