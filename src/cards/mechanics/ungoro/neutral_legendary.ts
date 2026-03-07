// ungoro - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Draw, Give } from '../../../actions';

// UNG_840 - Hemet, Jungle Hunter - Battlecry: Destroy all cards in your deck that cost (3) or less.
cardScriptsRegistry.register('UNG_840', {
  play: (ctx: ActionContext) => {
    // Destroy cards costing 3 or less - handled by game
  },
});

// UNG_843 - Master of Evolution - Battlecry: Deal 3 damage. If this kills it, summon a random minion.
cardScriptsRegistry.register('UNG_843', {
  events: {
    // After attack - handled by game
  },
});

// UNG_851 - Tyrantus - Can't be targeted by spells or Hero Powers.
cardScriptsRegistry.register('UNG_851', {
  play: (ctx: ActionContext) => {
    // Passive effect - handled by game
  },
});

// UNG_851t1 - Tyrantus
cardScriptsRegistry.register('UNG_851t1', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// UNG_900 - The Caverns Below - Quest: Play 5 minions with the same name. Reward: Crystal Core.
cardScriptsRegistry.register('UNG_900', {
  events: {
    // Quest tracking - handled by game
  },
});

// UNG_907 - Open the Waygate - Quest: Cast 8 spells that didn't start in your deck. Reward: Time Warp.
cardScriptsRegistry.register('UNG_907', {
  play: (ctx: ActionContext) => {
    // Quest card - handled by game
  },
});
