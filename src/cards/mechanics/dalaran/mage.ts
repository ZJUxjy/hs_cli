// dalaran - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_163 - Kalecgos (Legendary)
// Your first Dragon each turn costs (0)
cardScriptsRegistry.register('DAL_163', {
  aura: {
    // Your first Dragon each turn costs (0)
  },
});

// DAL_182 - Magic Trick (Common)
// Discover a spell
cardScriptsRegistry.register('DAL_182', {
  play: (ctx: ActionContext) => {
    // Discover a spell
  },
});

// DAL_575 - Conjurer's Calling (Rare)
// Transform a minion into two 1/1 minions
cardScriptsRegistry.register('DAL_575', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Transform a minion into two 1/1 minions
  },
});

// DAL_576 - Magic Carpet (Epic)
// Your 1-cost minions have +1 Attack and Rush
cardScriptsRegistry.register('DAL_576', {
  aura: {
    // Your 1-cost minions have +1 Attack and Rush
  },
});

// DAL_603 - Ray of Frost (Common)
// Freeze a minion. If it's already Frozen, deal 2 damage to it
cardScriptsRegistry.register('DAL_603', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Freeze a minion, if already frozen deal 2 damage
    const target = ctx.target;
    if (target) {
      if ((target as any).frozen) {
        const { Damage } = require('../../actions/damage');
        const damageAction = new Damage(2);
        damageAction.trigger(ctx.source, target);
      } else {
        (target as any).frozen = true;
      }
    }
  },
});

// DAL_609 - Mana Cyclone (Rare)
// Battlecry: Add a random Mage spell to your hand
cardScriptsRegistry.register('DAL_609', {
  play: (ctx: ActionContext) => {
    // Add a random Mage spell to your hand
  },
});

// DAL_609e - Mana Cyclone buff
cardScriptsRegistry.register('DAL_609e', {
});

// DAL_177 - Kirin Tor Tricaster (Rare)
// Battlecry: Add three 1/1 minions to your hand
cardScriptsRegistry.register('DAL_177', {
  play: (ctx: ActionContext) => {
    // Add three 1/1 minions to your hand
  },
});

// DAL_577 - Jaina Proudmoore (Legendary)
// Battlecry: Summon a 3/3 Water Elemental. Your Elementals have Lifesteal
cardScriptsRegistry.register('DAL_577', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Summon a 3/3 Water Elemental
  },
});

// DAL_578 - Frost Lich Jaina (Hero)
// Battlecry: Summon a 3/3 Water Elemental. Your Elementals have Lifesteal
cardScriptsRegistry.register('DAL_578', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Summon a 3/3 Water Elemental
  },
});

// DAL_608 - Messenger Raven (Common)
// Battlecry: Add a random Mage minion to your hand
cardScriptsRegistry.register('DAL_608', {
  play: (ctx: ActionContext) => {
    // Add a random Mage minion to your hand
  },
});
