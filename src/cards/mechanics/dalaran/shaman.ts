// dalaran - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_049 - Underbelly Angler - After you play a Murloc, add a random Murloc to your hand
cardScriptsRegistry.register('DAL_049', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const playedCard = ctx.target;
      if (playedCard && (playedCard as any).race === 'murloc') {
        const controller = (ctx.source as any).controller;
        const { Draw } = require('../../../actions/draw');
        const drawAction = new Draw();
        drawAction.trigger(controller);
      }
    },
  },
});

// DAL_052 - Muckmorpher - Battlecry: Transform into a 4/4 copy of a different minion in your deck
cardScriptsRegistry.register('DAL_052', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    if (deck.length > 0) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const randomMinion = deck[randomIndex];
      if (randomMinion) {
        const source = ctx.source as any;
        source.attack = 4;
        source.health = 4;
        source.maxHealth = 4;
      }
    }
  },
});

// DAL_052e
cardScriptsRegistry.register('DAL_052e', {
});

// DAL_431 - Swampqueen Hagatha - Battlecry: Add a 5/5 Horror to your hand with 2 Shaman spells
cardScriptsRegistry.register('DAL_431', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Add a card to hand - simplified: draw a card
    const { Draw } = require('../../../actions/draw');
    for (let i = 0; i < 2; i++) {
      const drawAction = new Draw();
      drawAction.trigger(controller);
    }
  },
});

// DAL_433 - Sludge Slurper - Battlecry: Add a Lackey to your hand. Overload: (1)
cardScriptsRegistry.register('DAL_433', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Add a Lackey to hand - simplified: draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(controller);
  },
});

// DAL_726 - Scargil - Your Murlocs cost (1)
cardScriptsRegistry.register('DAL_726', {
  play: (ctx: ActionContext) => {
    // This is a passive effect - the card reduces Murloc costs
    // Implementation would require mana cost modification system
  },
});

// DAL_071 - Mutate - Transform a friendly minion into a random one that costs (1) more
cardScriptsRegistry.register('DAL_071', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const deck = controller.deck || [];
      if (deck.length > 0) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        // Transform the target - simplified: destroy and summon new
        (ctx.target as any).destroyed = true;
        const { Summon } = require('../../../actions/summon');
        const summonAction = new Summon(deck[randomIndex]);
        summonAction.trigger(ctx.source);
      }
    }
  },
});

// DAL_432 - Witch's Brew - Restore #4 Health. Repeatable this turn.
cardScriptsRegistry.register('DAL_432', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      // Heal the target for 4
      if (target.health) {
        target.health = Math.min(target.health + 4, target.maxHealth || target.health);
      }
      // Also heal hero if targeted
      if (target.isHero) {
        target.health = Math.min(target.health + 4, target.maxHealth || 30);
      }
    }
  },
});

// DAL_710 - Soul of the Murloc - Give your minions "Deathrattle: Summon a 1/1 Murloc"
cardScriptsRegistry.register('DAL_710', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('DAL_710e', {});
      buff.trigger(ctx.source, minion);
    }
  },
});

// DAL_710e
cardScriptsRegistry.register('DAL_710e', {
  deathrattle: (ctx: ActionContext) => { /* TODO */ },
});
