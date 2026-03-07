// gvg - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Give, Draw, Summon } from '../../../actions';

// GVG_039 - Siltfin Spiritwalker - Deathrattle: Give your minions +1/+1
cardScriptsRegistry.register('GVG_039', {
  events: {
    // Murlocs get +2/+1 - handled by game
  },
});

// GVG_040 - Whitest
cardScriptsRegistry.register('GVG_040', {
  events: {
    // Whirlcanon deals 1 damage - handled by game
  },
});

// GVG_042 - Darklok's Spire
cardScriptsRegistry.register('GVG_042', {
  play: (ctx: ActionContext) => {
    // Your other Mechs have +1/+1 - handled by game
  },
});

// GVG_066 - Mini
cardScriptsRegistry.register('GVG_066', {
  events: {
    // When a Mech is played, give it +1/+1 - handled by game
  },
});

// GVG_029 - Anomaly
cardScriptsRegistry.register('GVG_029', {
  play: (ctx: ActionContext) => {
    // Choose One - handled by game
  },
});

// GVG_038 - Siltfin Spiritwalker - Deathrattle: Give your minions +1/+1
cardScriptsRegistry.register('GVG_038', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give +3/+3 to a minion - handled by game
  },
});

// GVG_036 - Siltfin Spiritwalker - Deathrattle: Give your minions +1/+1
cardScriptsRegistry.register('GVG_036', {
  deathrattle: (ctx: ActionContext) => {
    // Summon two 1/1 Whelps - handled by game
  },
});
