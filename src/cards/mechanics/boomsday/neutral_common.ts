// boomsday - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage } from '../../../actions';

// BOT_020 - Skaterbot
// Magnetic, Rush
cardScriptsRegistry.register('BOT_020', {
  magnetic: true,
});

// BOT_021 - Bronze Gatekeeper
// Magnetic, Taunt
cardScriptsRegistry.register('BOT_021', {
  magnetic: true,
});

// BOT_031 - Goblin Bomb
// Deathrattle: Deal 2 damage to the enemy hero
cardScriptsRegistry.register('BOT_031', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const opponent = source?.controller?.opponent;
    if (opponent?.hero) {
      const damageAction = new Damage(source, opponent.hero, 2);
      damageAction.trigger(source);
    }
  },
});

// BOT_079
cardScriptsRegistry.register('BOT_079', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_083
cardScriptsRegistry.register('BOT_083', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_267
cardScriptsRegistry.register('BOT_267', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BOT_308
cardScriptsRegistry.register('BOT_308', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_413
cardScriptsRegistry.register('BOT_413', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_431
cardScriptsRegistry.register('BOT_431', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_445
cardScriptsRegistry.register('BOT_445', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BOT_448
cardScriptsRegistry.register('BOT_448', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_532
cardScriptsRegistry.register('BOT_532', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_535
cardScriptsRegistry.register('BOT_535', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_550
cardScriptsRegistry.register('BOT_550', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_562
cardScriptsRegistry.register('BOT_562', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_562e
cardScriptsRegistry.register('BOT_562e', {
  events: {
    // TODO: implement events
  },
});

// BOT_563
cardScriptsRegistry.register('BOT_563', {
});

// BOT_606
cardScriptsRegistry.register('BOT_606', {
  deathrattle: (ctx: ActionContext) => { /* TODO */ },
});
