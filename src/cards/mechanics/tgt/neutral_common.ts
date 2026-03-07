// tgt - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon } from '../../../actions';

// AT_082
cardScriptsRegistry.register('AT_082', {
});

// AT_083
cardScriptsRegistry.register('AT_083', {
});

// AT_084 - Shudderstep - Battlecry: Deal 2 damage
cardScriptsRegistry.register('AT_084', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// AT_085
cardScriptsRegistry.register('AT_085', {
});

// AT_085e
cardScriptsRegistry.register('AT_085e', {
});

// AT_089
cardScriptsRegistry.register('AT_089', {
});

// AT_090
cardScriptsRegistry.register('AT_090', {
});

// AT_091
cardScriptsRegistry.register('AT_091', {
});

// AT_094 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('AT_094', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
  },
});

// AT_096 - Ram Wrangler - Battlecry: If you have a Beast, gain +3/+3
cardScriptsRegistry.register('AT_096', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const hasBeast = hand.some((card: any) => card.race === 'Beast');
    if (hasBeast && target) {
      const buff = new Buff(ctx.source, target, { ATK: 3, HEALTH: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// AT_100
cardScriptsRegistry.register('AT_100', {
});

// AT_103 - King's Elekk - Battlecry: Reveal a minion in each deck
cardScriptsRegistry.register('AT_103', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Reveal minion from each deck - handled by game
  },
});

// AT_111 - Fencing Coach - Battlecry: The next Secret you play costs (3) less
cardScriptsRegistry.register('AT_111', {
  play: (ctx: ActionContext) => {
    // Next secret costs 3 less - handled by game
  },
});

// AT_119
cardScriptsRegistry.register('AT_119', {
});

// AT_133 - Garrison Commander - Your Hero Power can be used twice
cardScriptsRegistry.register('AT_133', {
  play: (ctx: ActionContext) => {
    // Hero power can be used twice - handled by game
  },
});
