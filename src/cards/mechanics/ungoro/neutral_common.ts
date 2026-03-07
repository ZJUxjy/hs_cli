// ungoro - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle } from '../../../actions';
import { Entity } from '../../../core/entity';

// UNG_001 Piranha Swarm - No special ability
cardScriptsRegistry.register('UNG_001', {
});

// UNG_009 Verdant Longneck - Battlecry: Adapt
cardScriptsRegistry.register('UNG_009', {
  play: (ctx: ActionContext) => {
    // Adapt mechanics would need choice UI - simplified here
  },
});

// UNG_010 Stonehill Defender - Battlecry: Discover a Taunt minion
cardScriptsRegistry.register('UNG_010', {
  deathrattle: (ctx: ActionContext) => {
    // Would need discover mechanics
  },
});

// UNG_073 Fire Plume Phoenix - Battlecry: Deal 2 damage
cardScriptsRegistry.register('UNG_073', {
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

// UNG_076 Primalfin Lookout - Deathrattle: Discover a Murloc
cardScriptsRegistry.register('UNG_076', {
  deathrattle: (ctx: ActionContext) => {
    // Would need discover mechanics
  },
});

// UNG_082 Frozen Crusher - No special ability
cardScriptsRegistry.register('UNG_082', {
});

// UNG_084 Stegodon - No special ability
cardScriptsRegistry.register('UNG_084', {
});

// UNG_205 Giant Mastodon - Taunt
cardScriptsRegistry.register('UNG_205', {
});

// UNG_801 Ravasaur Raptor - Battlecry: Adapt
cardScriptsRegistry.register('UNG_801', {
  play: (ctx: ActionContext) => {
    // Adapt mechanics would need choice UI
  },
});

// UNG_803 Scarab - Taunt
cardScriptsRegistry.register('UNG_803', {
});

// UNG_809 Tar Creeper - Taunt
cardScriptsRegistry.register('UNG_809', {
});

// UNG_818 Nesting Roc - Deathrattle: Give your other minions Taunt
cardScriptsRegistry.register('UNG_818', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source) {
        (minion as any).taunt = true;
      }
    }
  },
});

// UNG_845 Tol'vir Stoneshaper - Deathrattle: Give a random friend Taunt
cardScriptsRegistry.register('UNG_845', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller.field || [];
    const otherMinions = field.filter((m: Entity) => m !== source);
    if (otherMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherMinions.length);
      (otherMinions[randomIndex] as any).taunt = true;
    }
  },
});

// UNG_928 Gentle Megasaur - Battlecry: Adapt
cardScriptsRegistry.register('UNG_928', {
});

// UNG_937 Galvadon - Battlecry: Adapt 5 times
cardScriptsRegistry.register('UNG_937', {
  play: (ctx: ActionContext) => {
    // Adapt mechanics would need choice UI
  },
});
