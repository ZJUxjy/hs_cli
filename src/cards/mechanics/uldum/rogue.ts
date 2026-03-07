// uldum - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, Silence, Freeze } from '../../../actions';
import { Race } from '../../../enums';

// ULD_186 - Hooked Dagger - Your Weapon has +2 Attack
cardScriptsRegistry.register('ULD_186', {
  play: (ctx: ActionContext) => {
    // Equipping a dagger - handled by game
  },
});

// ULD_231 - Pharaoh's Blessing - Give a minion +4/+4 and Divine Shield
cardScriptsRegistry.register('ULD_231', {
  events: {
    // Battlecry: Give +4/+4
  },
});

// ULD_280 - Anubrekhan - Deathrattle: Summon two 1/1 Scarabs
cardScriptsRegistry.register('ULD_280', {
  deathrattle: (ctx: ActionContext) => {
    for (let i = 0; i < 2; i++) {
      const summonAction = new Summon(ctx.source, 'ULD_280t');
      summonAction.trigger(ctx.source);
    }
  },
});

// ULD_288 - Clever Disguise - Add 2 random minions to your hand
cardScriptsRegistry.register('ULD_288', {
  play: (ctx: ActionContext) => {
    // Add 2 random minions - simplified
  },
});

// ULD_288e - Clever Disguise buff
cardScriptsRegistry.register('ULD_288e', {
});

// ULD_327 - Bazaar Burglary - Quest: Use your Hero Power 4 times
cardScriptsRegistry.register('ULD_327', {
  play: (ctx: ActionContext) => {
    // Quest reward: Give your hero +4 Attack
    const controller = (ctx.source as any).controller;
    const buff = new Buff(ctx.source, controller.hero, { ATK: 4 });
    buff.trigger(ctx.source);
  },
});

// ULD_286 - Plaguebringer - Battlecry: Give a friendly minion Poisonous
cardScriptsRegistry.register('ULD_286', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).poisonous = true;
    }
  },
});

// ULD_286t - Plaguebringer token
cardScriptsRegistry.register('ULD_286t', {
  play: (ctx: ActionContext) => {
    // 1/1 minion
  },
});

// ULD_326 - Sir Finley of the Sands - Battlecry: Discover a new Hero Power
cardScriptsRegistry.register('ULD_326', {
});

// ULD_326p - Ocean's Hero Power
cardScriptsRegistry.register('ULD_326p', {
});

// ULD_326t - Finley's Shell (Armor)
cardScriptsRegistry.register('ULD_326t', {
});

// ULD_328 - Swindler's Surrender - Your minions have +1 Attack
cardScriptsRegistry.register('ULD_328', {
  play: (ctx: ActionContext) => {
    // Battlecry: Deal 3 damage
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// ULD_715 - Journey Below - Discover a Deathrattle minion
cardScriptsRegistry.register('ULD_715', {
  play: (ctx: ActionContext) => {
    // Discover a Deathrattle minion - handled by game
  },
});

// ULD_285 - Shadow of the Night - Draw 2 cards
cardScriptsRegistry.register('ULD_285', {
});
