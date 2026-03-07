// icecrown - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Race } from '../../../enums';
import { Damage, Draw, Buff, Summon, Give, Shuffle, Heal } from '../../../actions';

// ICC_075 - Sanguine Reveler - Destroy a friendly minion, draw a card
cardScriptsRegistry.register('ICC_075', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Destroy friendly minion
      (ctx.target as any).destroyed = true;
      // Draw a card
      const drawAction = new Draw(ctx.source, 1);
      drawAction.trigger(ctx.source);
    }
  },
});

// ICC_218 - Blood-Queen Lana'thel - Lifesteal. Battlecry: If your deck has 20 or more cards, gain +1/+1
cardScriptsRegistry.register('ICC_218', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    if (deck.length >= 20) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('ICC_218e', { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source, ctx.source);
    }
  },
});

// ICC_407 - Desperate Stand - Give a minion "Deathrattle: Resurrect this minion"
cardScriptsRegistry.register('ICC_407', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      // Add deathrattle to resurrect
      target.deathrattle = (ctx: ActionContext) => {
        const cardId = target.id;
        const { Summon } = require('../../../actions/summon');
        const summonAction = new Summon(cardId);
        summonAction.trigger(ctx.source);
      };
    }
  },
});

// ICC_841 - Gnomeferatu - Battlecry: Remove the top card of your opponent's deck
cardScriptsRegistry.register('ICC_841', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const deck = opponent.deck || [];
    if (deck.length > 0) {
      // Remove top card
      deck.shift();
    }
  },
});

// ICC_903 - Howlfiend - Whenever a card is discarded, put it into your hand
cardScriptsRegistry.register('ICC_903', {
  events: {
    DISCARD: (ctx: ActionContext) => {
      if (ctx.target) {
        const controller = (ctx.source as any).controller;
        const cardId = (ctx.target as any).id;
        const giveAction = new Give(cardId);
        giveAction.trigger(ctx.source, controller);
      }
    },
  },
});

// ICC_041 - Void Walker - Taunt
cardScriptsRegistry.register('ICC_041', {
});

// ICC_055 - Drain Soul - Deal 3 damage to a minion. If it's a Demon, also give +3/+3
cardScriptsRegistry.register('ICC_055', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
      const target = ctx.target as any;
      if (target.race === Race.DEMON) {
        const { Buff } = require('../../../actions/buff');
        const buff = new Buff('ICC_055e', { ATK: 3, HEALTH: 3 });
        buff.trigger(ctx.source, ctx.target);
      }
    }
  },
});

// ICC_206 - Tusklord - +4 Attack. Your other Demons have +4 Attack
cardScriptsRegistry.register('ICC_206', {
});

// ICC_469 - Unwilling Sacrifice - Target an enemy minion. Your other minions attack it
cardScriptsRegistry.register('ICC_469', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      // Other minions attack the target
      for (const minion of field) {
        if (minion !== ctx.source) {
          const { Attack } = require('../../../actions/attack');
          const attackAction = new Attack(minion, ctx.target);
          attackAction.trigger(minion);
        }
      }
    }
  },
});

// ICC_831 - Gul'dan (Hero) - Battlecry: Resurrect all friendly Demons that died this game
cardScriptsRegistry.register('ICC_831', {
  play: (ctx: ActionContext) => {
    // Would need to track which demons died - placeholder
  },
});

// ICC_831p - Soulfiend (Hero Power)
cardScriptsRegistry.register('ICC_831p', {
});

// ICC_837p - Death's Head (Hero Power)
cardScriptsRegistry.register('ICC_837p', {
});

// ICC_626 - Hooked Reaver - Battlecry: If you discarded a card this turn, gain +4/+4
cardScriptsRegistry.register('ICC_626', {
  play: (ctx: ActionContext) => {
    // Check if a card was discarded this turn - would need game state
  },
});

// ICC_047 - Shadow Bolt - Deal 4 damage to a minion
cardScriptsRegistry.register('ICC_047', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 4);
      damage.trigger(ctx.source);
    }
  },
});

// ICC_914 - Treachery - Choose a friendly minion. It attacks an enemy minion
cardScriptsRegistry.register('ICC_914', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Choose target and attack - placeholder
  },
});
