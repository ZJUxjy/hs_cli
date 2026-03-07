// ungoro - adapt_buff.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal } from '../../../actions';

// UNG_999t10e - Adapt: +3 Attack
cardScriptsRegistry.register('UNG_999t10e', {
  events: {
    // Triggered by attack - handled by game
  },
});

// UNG_999t2e - Adapt: Deathrattle: Summon two 1/1s
cardScriptsRegistry.register('UNG_999t2e', {
  deathrattle: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'CS2_101t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon(ctx.source, 'CS2_101t');
    summon2.trigger(ctx.source);
  },
});

// UNG_999t8e - Adapt: Taunt
cardScriptsRegistry.register('UNG_999t8e', {
});

// UNG_999t10 - Adapt: +3 Attack
cardScriptsRegistry.register('UNG_999t10', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { ATK: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// UNG_999t2 - Adapt: Deathrattle: Summon two 1/1s
cardScriptsRegistry.register('UNG_999t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      // This is complex - handled by game as Adapt
    }
  },
});

// UNG_999t3 - Adapt: +3 Health
cardScriptsRegistry.register('UNG_999t3', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { HEALTH: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// UNG_999t4 - Adapt: Taunt
cardScriptsRegistry.register('UNG_999t4', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { taunt: true });
      buff.trigger(ctx.source);
    }
  },
});

// UNG_999t5 - Adapt: Divine Shield
cardScriptsRegistry.register('UNG_999t5', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { divineShield: true });
      buff.trigger(ctx.source);
    }
  },
});

// UNG_999t6 - Adapt: Poisonous
cardScriptsRegistry.register('UNG_999t6', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Poisonous is handled by game
  },
});

// UNG_999t7 - Adapt: Windfury
cardScriptsRegistry.register('UNG_999t7', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Windfury is handled by game
  },
});

// UNG_999t8 - Adapt: +1/+1
cardScriptsRegistry.register('UNG_999t8', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// UNG_999t13 - Adapt: Restore 3 Health
cardScriptsRegistry.register('UNG_999t13', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const heal = new Heal(ctx.source, target, 3);
      heal.trigger(ctx.source);
    }
  },
});

// UNG_999t14 - Adapt: Can't be targeted
cardScriptsRegistry.register('UNG_999t14', {
  play: (ctx: ActionContext) => {
    // Can't be targeted - handled by game
  },
});
