// ungoro - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// UNG_838
cardScriptsRegistry.register('UNG_838', {
});

// UNG_925 - Ornery Direhorn - Taunt. Battlecry: Adapt
cardScriptsRegistry.register('UNG_925', {
  play: (ctx: ActionContext) => {
    // Adapt effect - simplified: give +1/+1
    const source = ctx.source as any;
    source.attack = (source.attack || 6) + 1;
    source.health = (source.health || 6) + 1;
  },
});

// UNG_926 - Cornered Sentry - Taunt. Battlecry: Summon three 1/1 Raptors for your opponent
cardScriptsRegistry.register('UNG_926', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const { Summon } = require('../../../actions/summon');
    // Summon 3 Raptors for opponent
    for (let i = 0; i < 3; i++) {
      const summonAction = new Summon('UNG_926t1');
      summonAction.trigger(opponent);
    }
  },
});

// UNG_933 - King Mosh - Battlecry: Destroy all damaged minions
cardScriptsRegistry.register('UNG_933', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];

    // Destroy all damaged minions on both fields
    for (const minion of [...myField, ...oppField]) {
      if ((minion as any).damage && (minion as any).damage > 0) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// UNG_957
cardScriptsRegistry.register('UNG_957', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// UNG_922
cardScriptsRegistry.register('UNG_922', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_922t1
cardScriptsRegistry.register('UNG_922t1', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_923
cardScriptsRegistry.register('UNG_923', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_927
cardScriptsRegistry.register('UNG_927', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_934
cardScriptsRegistry.register('UNG_934', {
});

// UNG_934t1
cardScriptsRegistry.register('UNG_934t1', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_934t2
cardScriptsRegistry.register('UNG_934t2', {
});

// UNG_929
cardScriptsRegistry.register('UNG_929', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// UNG_929e
cardScriptsRegistry.register('UNG_929e', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: { /* TODO */ },
});
