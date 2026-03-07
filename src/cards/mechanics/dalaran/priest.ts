// dalaran - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Heal, Give, Destroy, Buff } from '../../../actions';

// DAL_030 - Shadowy Figure - Battlecry: Transform into a 2/2 copy of a friendly Deathrattle minion
cardScriptsRegistry.register('DAL_030', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Transform into 2/2 copy - handled by game
  },
});

// DAL_030e
cardScriptsRegistry.register('DAL_030e', {
});

// DAL_039 - Convincing Infiltrator - Taunt. Deathrattle: Destroy a random enemy minion
cardScriptsRegistry.register('DAL_039', {
  deathrattle: (ctx: ActionContext) => {
    // Destroy random enemy minion - handled by game
  },
});

// DAL_040 - Hench-Clan Shadequill - Deathrattle: Restore 5 Health to the enemy hero
cardScriptsRegistry.register('DAL_040', {
  deathrattle: (ctx: ActionContext) => {
    const opponent = (ctx.source as any).controller.opponent;
    const hero = opponent.hero;
    if (hero) {
      const heal = new Heal(ctx.source, hero, 5);
      heal.trigger(ctx.source);
    }
  },
});

// DAL_413 - EVIL Conscripter - Deathrattle: Add a Lackey to your hand
cardScriptsRegistry.register('DAL_413', {
  deathrattle: (ctx: ActionContext) => {
    // Add a Lackey to hand - handled by game
  },
});

// DAL_721
cardScriptsRegistry.register('DAL_721', {
  events: {
    // Handled by game
  },
});

// DAL_729
cardScriptsRegistry.register('DAL_729', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// DAL_011e
cardScriptsRegistry.register('DAL_011e', {
  events: {
    // Handled by game
  },
});

// DAL_065
cardScriptsRegistry.register('DAL_065', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// DAL_723
cardScriptsRegistry.register('DAL_723', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// DAL_724
cardScriptsRegistry.register('DAL_724', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});
