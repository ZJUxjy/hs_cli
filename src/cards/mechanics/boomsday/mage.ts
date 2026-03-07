// boomsday - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give } from '../../../actions';

// BOT_103 - Cryomancer - Battlecry: Gain +2/+2 if your hero has 5 or more Armor
cardScriptsRegistry.register('BOT_103', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const armor = controller.hero?.armor || 0;
    if (armor >= 5) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// BOT_256 - Ravenous Pterrordax - Battlecry: Destroy a friendly minion to Adapt
cardScriptsRegistry.register('BOT_256', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
    }
  },
});

// BOT_531 - Unstable Elemental - Battlecry: Add a random Mage spell to your hand
cardScriptsRegistry.register('BOT_531', {
  play: (ctx: ActionContext) => {
    // Add random mage spell - placeholder
  },
});

// BOT_531e - Elemental Enchantment
cardScriptsRegistry.register('BOT_531e', {
});

// BOT_601 - Frost Lich Jaina - Battlecry: Summon a 3/6 Water Elemental
cardScriptsRegistry.register('BOT_601', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('ICC_823t');
    summonAction.trigger(ctx.source);
  },
});

// BOT_101 - Shooting Star - Deal 1 damage to a minion and its owner
cardScriptsRegistry.register('BOT_101', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Deal 1 to target
      const damage = new Damage(ctx.source, ctx.target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// BOT_254 - Astromancer - Battlecry: Summon a random minion with cost equal to your hand size
cardScriptsRegistry.register('BOT_254', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const handSize = controller.hand?.length || 0;
    // Would need to find minion with cost = handSize - placeholder
  },
});

// BOT_257 - celestial - Your spells cost 1 less
cardScriptsRegistry.register('BOT_257', {
});

// BOT_257e - Arcane Power Enchantment
cardScriptsRegistry.register('BOT_257e', {
});

// BOT_453 - Unexpected Results - Summon 2 random 2-Cost minions
cardScriptsRegistry.register('BOT_453', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    // Summon 2 random 2-cost minions - placeholder
    const summonAction1 = new Summon('CS2_121');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon('CS2_121');
    summonAction2.trigger(ctx.source);
  },
});

// BOT_600 - Pyroblast - Deal 10 damage
cardScriptsRegistry.register('BOT_600', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 10);
      damage.trigger(ctx.source);
    }
  },
});

// BOT_436 - Ghostly Charger - Divine Shield
cardScriptsRegistry.register('BOT_436', {
});

// BOT_104 - Cosmic Anomaly - Battlecry: Deal 4 damage
cardScriptsRegistry.register('BOT_104', {
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
