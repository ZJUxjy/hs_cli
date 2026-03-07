// ungoro - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon } from '../../../actions';

// UNG_078 - Tortollan Forager - Battlecry: Add a random minion with 5 or more Attack to your hand
cardScriptsRegistry.register('UNG_078', {
  play: (ctx: ActionContext) => {
    // Would need card database - placeholder
  },
});

// UNG_086 - Gentle Megasaur - Battlecry: Choose a friendly Beast. Adapt it
cardScriptsRegistry.register('UNG_086', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Adapt effect - handled by game
  },
});

// UNG_100 - Primordial Drake - Taunt. Battlecry: Deal 8 damage
cardScriptsRegistry.register('UNG_100', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 8);
      damage.trigger(ctx.source);
    }
  },
});

// UNG_101 - Living Mana - Transform your Mana Crystals into 2/2 minions
cardScriptsRegistry.register('UNG_101', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Transform mana crystals into 2/2 minions - placeholder
  },
});

// UNG_101a - Malkorok - (Choice) Summon 7 minions
cardScriptsRegistry.register('UNG_101a', {
  play: (ctx: ActionContext) => {
    // Summon 7 random 2/2 minions
  },
});

// UNG_101b - (Choice) Summon 7 minions
cardScriptsRegistry.register('UNG_101b', {
});

// UNG_109 - Jungle Giants - Your minions cost (3) less
cardScriptsRegistry.register('UNG_109', {
});

// UNG_103 - Petricite Starseeker - Taunt
cardScriptsRegistry.register('UNG_103', {
});

// UNG_108 - Verdant Longneck - Battlecry: Adapt
cardScriptsRegistry.register('UNG_108', {
  play: (ctx: ActionContext) => {
    // Adapt - handled by game
  },
});

// UNG_111 - Earthen Scales - Give a minion +1/+2, then gain Armor equal to its Attack
cardScriptsRegistry.register('UNG_111', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('UNG_111e', { ATK: 1, HEALTH: 2 });
      buff.trigger(ctx.source, ctx.target);
      // Gain armor equal to attack
      const controller = (ctx.source as any).controller;
      if (controller.hero) {
        const attack = target.attack || 0;
        controller.hero.armor = (controller.hero.armor || 0) + attack;
      }
    }
  },
});

// UNG_111t1 - Crypt Lord - Taunt
cardScriptsRegistry.register('UNG_111t1', {
});

// UNG_116 - Shellshifter - Choose One - Transform into a 5/3 or 3/5
cardScriptsRegistry.register('UNG_116', {
  play: (ctx: ActionContext) => {
    // Choose one - handled by game
  },
});

// UNG_116t - Shellshifter (3/5 version)
cardScriptsRegistry.register('UNG_116t', {
});

// UNG_116te - Shellshifter Enchantment
cardScriptsRegistry.register('UNG_116te', {
});

// UNG_099 - Wispering Stones - Put a random cost 10 card into your hand
cardScriptsRegistry.register('UNG_099', {
  play: (ctx: ActionContext) => {
    // Would need card database
  },
});

// UNG_074 - Elder Longhorn - Taunt. Choose One - +1 Attack or +1 Health
cardScriptsRegistry.register('UNG_074', {
});

// UNG_075 - Elder Longhorn (Choice 1)
cardScriptsRegistry.register('UNG_075', {
});

// UNG_076 - Elder Longhorn (Choice 2)
cardScriptsRegistry.register('UNG_076', {
});

// UNG_063 - Giantaconda - Deathrattle: An Summon a minion from your deck
cardScriptsRegistry.register('UNG_063', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Summon random minion from deck
  },
});
