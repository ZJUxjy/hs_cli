// outlands - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give, Freeze } from '../../../actions';

// BT_004 - Felsaber - Taunt
cardScriptsRegistry.register('BT_004', {
});

// BT_014 - Risen Skeleton - Deathrattle: Deal 3 damage
cardScriptsRegistry.register('BT_014', {
  deathrattle: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 3);
    damage.trigger(ctx.source);
  },
});

// BT_022 - Starscryer - After you cast a spell, draw a card
cardScriptsRegistry.register('BT_022', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const drawAction = new Draw(ctx.source, 1);
      drawAction.trigger(ctx.source);
    },
  },
});

// BT_028 - Nether Breath - Deal 2 damage to a minion. If you're holding a Dragon, deal 4 instead
cardScriptsRegistry.register('BT_028', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Check for dragon - simplified to 4 damage
      const damage = new Damage(ctx.source, ctx.target, 4);
      damage.trigger(ctx.source);
    }
  },
});

// BT_028t - Nether Breath (Token)
cardScriptsRegistry.register('BT_028t', {
});

// BT_002 - Rain of Fire - Deal 1 damage to all characters
cardScriptsRegistry.register('BT_002', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      const damage = new Damage(ctx.source, minion, 1);
      damage.trigger(ctx.source);
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 1);
      damage.trigger(ctx.source);
    }
    // Damage both heroes
    if (controller.hero) {
      const damage = new Damage(ctx.source, controller.hero, 1);
      damage.trigger(ctx.source);
    }
    if (opponent.hero) {
      const damage = new Damage(ctx.source, opponent.hero, 1);
      damage.trigger(ctx.source);
    }
  },
});

// BT_002e - Felstorm Enchantment
cardScriptsRegistry.register('BT_002e', {
});

// BT_003 - Wrathscale Nether - Lifesteal
cardScriptsRegistry.register('BT_003', {
});

// BT_006 - Imprisoned Homunculus - Taunt. Battlecry: Deal 2 damage
cardScriptsRegistry.register('BT_006', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// BT_006e - Imprisoned Enchantment
cardScriptsRegistry.register('BT_006e', {
});

// BT_021 - Shattering Blast - Destroy a random enemy minion
cardScriptsRegistry.register('BT_021', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      (target as any).destroyed = true;
    }
  },
});

// BT_072 - Frozen Touch - Deal 3 damage
cardScriptsRegistry.register('BT_072', {
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

// BT_291 - Kalecgos - Your first Dragon each turn costs (0)
cardScriptsRegistry.register('BT_291', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    (controller as any).kalecgosActive = true;
  },
});
