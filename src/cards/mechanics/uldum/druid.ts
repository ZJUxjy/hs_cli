// uldum - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// ULD_133 - BEEEES! (Rare)
// Choose a minion. Summon four 1/1 copies of it
cardScriptsRegistry.register('ULD_133', {
  events: {
    // Choose a minion, summon four 1/1 copies
  },
});

// ULD_137 - Hidden Cache (Rare)
// Add a random Beast to your hand. It costs (2) less
cardScriptsRegistry.register('ULD_137', {
  play: (ctx: ActionContext) => {
    // Add a random Beast to your hand
  },
});

// ULD_138 - Ramkahen Wildtamer (Rare)
// Copy a random Beast in your deck
cardScriptsRegistry.register('ULD_138', {
  play: (ctx: ActionContext) => {
    // Copy a random Beast in your deck
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // ???
  },
});

// ULD_139 - Desert Spear (Rare)
// After your hero attacks, summon a 1/1 Cobra with Poisonous
cardScriptsRegistry.register('ULD_139', {
  play: (ctx: ActionContext) => {
    // After your hero attacks, summon a 1/1 Cobra with Poisonous
  },
});

// ULD_292 - Worthy Expedition (Rare)
// Choose a minion. Shuffle three copies of it into your deck
cardScriptsRegistry.register('ULD_292', {
  play: (ctx: ActionContext) => {
    // Choose a minion, shuffle three copies into your deck
  },
});

// ULD_292a - Worthy Expedition power
cardScriptsRegistry.register('ULD_292a', {
  play: (ctx: ActionContext) => {
    // Choose a minion
  },
});

// ULD_292b - Worthy Expedition power
cardScriptsRegistry.register('ULD_292b', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Add a 2/2 Lion to your hand
  },
});
