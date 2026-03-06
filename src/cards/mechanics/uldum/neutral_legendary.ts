// uldum - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// ULD_177 - Reno Jackson (Legendary)
// Battlecry: If your deck contains no duplicates, restore 10 Health
cardScriptsRegistry.register('ULD_177', {
  deathrattle: (ctx: ActionContext) => {
    // If your deck contains no duplicates, restore 10 Health
  },
  play: (ctx: ActionContext) => {
    // If your deck contains no duplicates, restore 10 Health
  },
});

// ULD_178 - Sir Finley of the Sands (Legendary)
// Battlecry: If your deck contains no duplicates, Discover a new Hero Power
cardScriptsRegistry.register('ULD_178', {
  play: (ctx: ActionContext) => {
    // If your deck contains no duplicates, Discover a new Hero Power
  },
});

// ULD_178a - Explore Uldum power
cardScriptsRegistry.register('ULD_178a', {
  requirements: {
    // Add requirements
  },
  play: (ctx: ActionContext) => {
    // Replace your Hero Power
  },
});

// ULD_178a2 - Explore Uldum power
cardScriptsRegistry.register('ULD_178a2', {
  requirements: {
    // Add requirements
  },
  play: (ctx: ActionContext) => {
    // Replace your Hero Power
  },
});

// ULD_178a3 - Explore Uldum power
cardScriptsRegistry.register('ULD_178a3', {
  requirements: {
    // Add requirements
  },
  play: (ctx: ActionContext) => {
    // Replace your Hero Power
  },
});

// ULD_178a4 - Explore Uldum power
cardScriptsRegistry.register('ULD_178a4', {
  requirements: {
    // Add requirements
  },
  play: (ctx: ActionContext) => {
    // Replace your Hero Power
  },
});

// ULD_304 - Reno Jackson (Legendary)
// Battlecry: If your deck contains no duplicates, restore 10 Health
cardScriptsRegistry.register('ULD_304', {
});
