// boomsday - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give, Shuffle } from '../../../actions';

// BOT_224 - Doubling Imp - Battlecry: Summon a copy of this minion
cardScriptsRegistry.register('BOT_224', {
  play: (ctx: ActionContext) => {
    const cardId = (ctx.source as any).id;
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(cardId);
    summonAction.trigger(ctx.source);
  },
});

// BOT_226 - Filth Shaman - Battlecry: Transform a friendly minion into a random Demon
cardScriptsRegistry.register('BOT_226', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Transform into random demon - placeholder
    }
  },
});

// BOT_433 - Wicked Skeleton - Deathrattle: Give a random minion in your hand +1/+1
cardScriptsRegistry.register('BOT_433', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    if (hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      const target = hand[randomIndex];
      const buff = new Buff(ctx.source, target, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// BOT_443 - Skull of the Man'ari - At the start of your turn, summon a Demon
cardScriptsRegistry.register('BOT_443', {
  deathrattle: (ctx: ActionContext) => {
    // Summon a demon - placeholder
  },
});

// BOT_536 - Voidlord - Taunt. Deathrattle: Summon three 1/3 Demons
cardScriptsRegistry.register('BOT_536', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction1 = new Summon('BOT_536t');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon('BOT_536t');
    summonAction2.trigger(ctx.source);
    const summonAction3 = new Summon('BOT_536t');
    summonAction3.trigger(ctx.source);
  },
});

// BOT_222 - Mech's MBA - Battlecry: Summon two random Beasts
cardScriptsRegistry.register('BOT_222', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction1 = new Summon('CS2_124');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon('CS2_124');
    summonAction2.trigger(ctx.source);
  },
});

// BOT_263 - Deathweb Spider - Battlecry: If your hero took damage this turn, gain +2/+2
cardScriptsRegistry.register('BOT_263', {
  play: (ctx: ActionContext) => {
    // Check if hero took damage this turn - would need game state
  },
});

// BOT_521 - Soul Infusion - Give a friendly minion +5/+5
cardScriptsRegistry.register('BOT_521', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 5, HEALTH: 5 });
      buff.trigger(ctx.source);
    }
  },
});

// BOT_568 - The Soularium - Draw 3 cards
cardScriptsRegistry.register('BOT_568', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// BOT_568e - Soul Infusion Enchantment
cardScriptsRegistry.register('BOT_568e', {
});

// BOT_913 - Chaos Gazer - Battlecry: Draw a card
cardScriptsRegistry.register('BOT_913', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// BOT_910 - Soul of the Forest - Give your minions "Deathrattle: Summon a 2/2 Treant"
cardScriptsRegistry.register('BOT_910', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      (minion as any).deathrattle = (ctx: ActionContext) => {
        const { Summon } = require('../../../actions/summon');
        const summonAction = new Summon('CS2_tk9');
        summonAction.trigger(ctx.source);
      };
    }
  },
});

// BOT_911 - Flark's Boom-Zooka - Battlecry: Summon 3 random minions
cardScriptsRegistry.register('BOT_911', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    for (let i = 0; i < 3; i++) {
      const summonAction = new Summon('CS2_122');
      summonAction.trigger(ctx.source);
    }
  },
});
