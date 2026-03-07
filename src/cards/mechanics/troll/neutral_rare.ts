// troll - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Give } from '../../../actions';

// TRL_057 - Serpent Ward - At the end of your turn, deal 2 damage to the enemy hero
cardScriptsRegistry.register('TRL_057', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const opponent = (ctx.source as any).controller.opponent;
      const hero = opponent.hero;
      if (hero) {
        const damage = new Damage(ctx.source, hero, 2);
        damage.trigger(ctx.source);
      }
    },
  },
});

// TRL_407 - Waterboy - Battlecry: Your next Hero Power this turn costs (0)
cardScriptsRegistry.register('TRL_407', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Hero power costs 0 - handled by game
  },
});

// TRL_407e
cardScriptsRegistry.register('TRL_407e', {
  events: {
    // Handled by game
  },
});

// TRL_504 - Booty Bay Bookie - Battlecry: Give your opponent a Coin
cardScriptsRegistry.register('TRL_504', {
  play: (ctx: ActionContext) => {
    const opponent = (ctx.source as any).controller.opponent;
    const give = new Give('GAME_005');
    give.trigger(ctx.source, opponent);
  },
});

// TRL_514
cardScriptsRegistry.register('TRL_514', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_520
cardScriptsRegistry.register('TRL_520', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_521
cardScriptsRegistry.register('TRL_521', {
});

// TRL_523
cardScriptsRegistry.register('TRL_523', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_524
cardScriptsRegistry.register('TRL_524', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_570
cardScriptsRegistry.register('TRL_570', {
  events: {
    // Handled by game
  },
});
