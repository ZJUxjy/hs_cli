// outlands - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, GainArmor } from '../../../actions';
import { Race } from '../../../enums';

// BT_120 - Bladed Dame - Battlecry: Deal 3 damage
cardScriptsRegistry.register('BT_120', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// BT_121 - Corsair Cache - Give your weapon +2 Attack. Draw a card
cardScriptsRegistry.register('BT_121', {
});

// BT_123 - Kargath Bladefist - Deathrattle: Summon a 4/2 Shattered Hand
cardScriptsRegistry.register('BT_123', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_123t');
    summon.trigger(ctx.source);
  },
});

// BT_123t - Shattered Hand
cardScriptsRegistry.register('BT_123t', {
  events: {
    // Battlecry handled
  },
});

// BT_138 - Awaken - Deal 2 damage to all minions
cardScriptsRegistry.register('BT_138', {
});

// BT_140 - Warmaul Challenger - Battlecry: Choose an enemy minion. It attacks this minion
cardScriptsRegistry.register('BT_140', {
  play: (ctx: ActionContext) => {
    // Battlecry: Choose an enemy minion - handled by game
  },
});

// BT_249 - Scrap Golem - Deathrattle: Give your weapon +1 Attack
cardScriptsRegistry.register('BT_249', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const weapon = controller.hero?.weapon;
    if (weapon) {
      const buff = new Buff(ctx.source, weapon, { ATK: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// BT_117 - Bulwark of Azzinoth - Battlecry: Gain 8 Armor
cardScriptsRegistry.register('BT_117', {
});

// BT_124 - Raging Felscreamer - Battlecry: Give your hero +2 Attack this game
cardScriptsRegistry.register('BT_124', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const buff = new Buff(ctx.source, controller.hero, { ATK: 2 });
    buff.trigger(ctx.source);
  },
});

// BT_233 - Bloodboil - Deal 4 damage to a minion
cardScriptsRegistry.register('BT_233', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 4);
      damage.trigger(ctx.source);
    }
  },
});

// BT_781 - Altar of Fire - Deal 1 damage to all minions
cardScriptsRegistry.register('BT_781', {
  events: {
    // Deal 1 damage to all minions - simplified
  },
});
