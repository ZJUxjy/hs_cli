// ungoro - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Race } from '../../../enums';
import { Damage, Draw, Buff, Summon, Shuffle } from '../../../actions';

// UNG_047 - Lakkari Felhound - Taunt. Battlecry: Discard 2 random cards
cardScriptsRegistry.register('UNG_047', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    // Discard 2 random cards
    for (let i = 0; i < 2 && hand.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      const discarded = hand[randomIndex];
      (discarded as any).zone = 'GRAVEYARD';
      hand.splice(randomIndex, 1);
    }
  },
});

// UNG_049 - Clutchmother Zavas - Whenever you discard this, gain +2/+2
cardScriptsRegistry.register('UNG_049', {
});

// UNG_830 - Lakkari Sacrifice - Quest: Discard 6 cards
cardScriptsRegistry.register('UNG_830', {
});

// UNG_833 - Gul'dan - Battlecry: Summon all friendly Demons that died this game
cardScriptsRegistry.register('UNG_833', {
  play: (ctx: ActionContext) => {
    // Would need to track which demons died - placeholder
  },
});

// UNG_835 - Chittering Tunneler - Battlecry: Discover a spell. If you play it this turn, gain +3/+3
cardScriptsRegistry.register('UNG_835', {
  play: (ctx: ActionContext) => {
    // Discover spell - handled by game
  },
});

// UNG_836 - Unlicensed Auto-Historian - Battlecry: Discover a Elemental
cardScriptsRegistry.register('UNG_836', {
});

// UNG_829 - Corrupt the Waters - Quest: Use your Hero Power 10 times
cardScriptsRegistry.register('UNG_829', {
});

// UNG_829t1 - Sir Finley Mrrgl - Hero Power: Discover a new Hero Power
cardScriptsRegistry.register('UNG_829t1', {
});

// UNG_829t2 - Deepmaw - Your Hero Power costs 0
cardScriptsRegistry.register('UNG_829t2', {
});

// UNG_831 - Feeding Time - Deal 3 damage to a minion. Shuffle 3蜜獾 into your deck
cardScriptsRegistry.register('UNG_831', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
    // Shuffle 3蜜獾 into deck
    const shuffleAction = new Shuffle('UNG_999t1');
    shuffleAction.trigger(ctx.source);
    shuffleAction.trigger(ctx.source);
    shuffleAction.trigger(ctx.source);
  },
});

// UNG_831e - Corrupted Enchantment
cardScriptsRegistry.register('UNG_831e', {
});

// UNG_832 - Ravenous Pterrordax - Battlecry: Destroy a friendly minion to Adapt
cardScriptsRegistry.register('UNG_832', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Destroy friendly minion
      (ctx.target as any).destroyed = true;
    }
    // Adapt - handled by game
  },
});

// UNG_832e - Pterrordax Enchantment
cardScriptsRegistry.register('UNG_832e', {
});

// UNG_834 - Tar Lurker - Taunt
cardScriptsRegistry.register('UNG_834', {
});

// UNG_028 - Doomed Warlock - Battlecry: Destroy your hero and replace it with Lord Jaraxxus
cardScriptsRegistry.register('UNG_028', {
  play: (ctx: ActionContext) => {
    // Would need hero transformation logic
  },
});

// UNG_823 - Bloodfury Potion - Give a minion +3 Attack. If it's a Demon, also give +3 Health
cardScriptsRegistry.register('UNG_823', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const { Buff } = require('../../../actions/buff');
      if (target.race === Race.DEMON) {
        const buff = new Buff('UNG_823e', { ATK: 3, HEALTH: 3 });
        buff.trigger(ctx.source, ctx.target);
      } else {
        const buff = new Buff('UNG_823e2', { ATK: 3 });
        buff.trigger(ctx.source, ctx.target);
      }
    }
  },
});
