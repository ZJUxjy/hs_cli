// troll - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Give, Buff } from '../../../actions';

// TRL_010
cardScriptsRegistry.register('TRL_010', {
});

// TRL_015
cardScriptsRegistry.register('TRL_015', {
});

// TRL_020
cardScriptsRegistry.register('TRL_020', {
});

// TRL_151 - Former Champ - Battlecry: Summon a 5/5 Hotshot
cardScriptsRegistry.register('TRL_151', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'TRL_151t');
    summon.trigger(ctx.source);
  },
});

// TRL_312
cardScriptsRegistry.register('TRL_312', {
});

// TRL_363
cardScriptsRegistry.register('TRL_363', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_406
cardScriptsRegistry.register('TRL_406', {
});

// TRL_503
cardScriptsRegistry.register('TRL_503', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_505
cardScriptsRegistry.register('TRL_505', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_505e
cardScriptsRegistry.register('TRL_505e', {
  events: {
    // Handled by game
  },
});

// TRL_506
cardScriptsRegistry.register('TRL_506', {
});

// TRL_507
cardScriptsRegistry.register('TRL_507', {
  events: {
    // Handled by game
  },
});

// TRL_508
cardScriptsRegistry.register('TRL_508', {
  events: {
    // Handled by game
  },
});

// TRL_509
cardScriptsRegistry.register('TRL_509', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_509t
cardScriptsRegistry.register('TRL_509t', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_512
cardScriptsRegistry.register('TRL_512', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_515
cardScriptsRegistry.register('TRL_515', {
});

// TRL_517
cardScriptsRegistry.register('TRL_517', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_525
cardScriptsRegistry.register('TRL_525', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_526
cardScriptsRegistry.register('TRL_526', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_531
cardScriptsRegistry.register('TRL_531', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// TRL_546
cardScriptsRegistry.register('TRL_546', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});
