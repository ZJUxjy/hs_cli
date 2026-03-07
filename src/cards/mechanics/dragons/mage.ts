// dragons - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give, Freeze } from '../../../actions';

// DRG_102 - Dragon's Breath - Deal 4 damage
cardScriptsRegistry.register('DRG_102', {
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

// DRG_104 - Azure Mage - Battlecry: If you have a Dragon, draw a card
cardScriptsRegistry.register('DRG_104', {
  play: (ctx: ActionContext) => {
    // Check for dragon in hand/deck - simplified to draw
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// DRG_107 - Marsh Hydra - Deathrattle: Summon a 5/5 Dragon
cardScriptsRegistry.register('DRG_107', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('DRG_107t');
    summonAction.trigger(ctx.source);
  },
});

// DRG_109 - Murloc Tidecaller - No special ability
cardScriptsRegistry.register('DRG_109', {
});

// DRG_270 - Malygos - Spell Damage +5
cardScriptsRegistry.register('DRG_270', {
  play: (ctx: ActionContext) => {
    (ctx.source as any).spellDamage = 5;
  },
});

// DRG_270t1 - Aspect of Magic - +2/+2
cardScriptsRegistry.register('DRG_270t1', {
});

// DRG_270t2 - Breath of Fire - Deal 3 damage
cardScriptsRegistry.register('DRG_270t2', {
});

// DRG_270t4 - Dragon's Fury - Deal 5 damage
cardScriptsRegistry.register('DRG_270t4', {
});

// DRG_270t5 - Scorch - Deal 4 damage
cardScriptsRegistry.register('DRG_270t5', {
});

// DRG_270t6 - Wyrmrest - Restore 4 Health
cardScriptsRegistry.register('DRG_270t6', {
});

// DRG_270t7 - Transformations - Transform into 4/12
cardScriptsRegistry.register('DRG_270t7', {
});

// DRG_270t8 - Repair - Give a minion +4/+4
cardScriptsRegistry.register('DRG_270t8', {
});

// DRG_270t9 - Repairs - Restore 6 Health
cardScriptsRegistry.register('DRG_270t9', {
});

// DRG_270t11 - Polymorph - Transform into a 1/1 Sheep
cardScriptsRegistry.register('DRG_270t11', {
});

// DRG_322 -nn - Dragonqueen Alexstrasza - Battlecry: If your deck has no duplicates, add 3 dragons to your hand
cardScriptsRegistry.register('DRG_322', {
  play: (ctx: ActionContext) => {
    // Add 3 random dragons to hand - placeholder
  },
});

// DRG_322e - Dragonqueen Enchantment
cardScriptsRegistry.register('DRG_322e', {
});

// DRG_106 - Emerald Skytalon - Battlecry: Deal 4 damage
cardScriptsRegistry.register('DRG_106', {
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

// DRG_321 - Leeching Poison - Lifesteal
cardScriptsRegistry.register('DRG_321', {
});

// DRG_323 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('DRG_323', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all other friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(ctx.source, minion, 2);
        damage.trigger(ctx.source);
      }
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
  },
});

// DRG_324 - Frozen Shadoweaver - Battlecry: Freeze an enemy
cardScriptsRegistry.register('DRG_324', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).frozen = true;
    }
  },
});
