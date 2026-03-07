// ungoro - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon } from '../../../actions';

// UNG_002 - Pterrordax Hatchling - Battlecry: Deal 1 damage
cardScriptsRegistry.register('UNG_002', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// UNG_070 - Verdant Longneck - Battlecry: Deal 1 damage
cardScriptsRegistry.register('UNG_070', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// UNG_072 - Ravasaur Runt - Battlecry: If you have another Beast in hand, gain +1/+1
cardScriptsRegistry.register('UNG_072', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const hasBeast = hand.some((card: any) => card.race === 'Beast' && card !== ctx.source);
    if (hasBeast) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// UNG_075 - Sated Threshadon - Deathrattle: Summon three 1/1 Murlocs
cardScriptsRegistry.register('UNG_075', {
  deathrattle: (ctx: ActionContext) => {
    for (let i = 0; i < 3; i++) {
      const summon = new Summon(ctx.source, 'UNG_075t');
      summon.trigger(ctx.source);
    }
  },
});

// UNG_079 - Hemet, Jungle Hunter - Battlecry: Destroy all cards in your deck that cost (3) or less
cardScriptsRegistry.register('UNG_079', {
  play: (ctx: ActionContext) => {
    // Destroy all cards costing 3 or less - handled by game
  },
});

// UNG_083 - Stonehill Defender - Deathrattle: Discover a minion
cardScriptsRegistry.register('UNG_083', {
  deathrattle: (ctx: ActionContext) => {
    // Discover a minion - handled by game
  },
});

// UNG_807 - Explore Un'Goro - Choose One - +1 Attack or +1 Health
cardScriptsRegistry.register('UNG_807', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Choose one - handled by game
  },
});

// UNG_816 - Primalfin Lookout - Battlecry: Discover a card
cardScriptsRegistry.register('UNG_816', {
  play: (ctx: ActionContext) => {
    // Discover a card - handled by game
  },
});
