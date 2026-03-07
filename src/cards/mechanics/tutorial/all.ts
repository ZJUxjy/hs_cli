// tutorial - all.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Buff, Summon, Give, Heal, Draw } from '../../../actions';

// TU4d_003 - Shotgun Blast
// Deal 1 damage
cardScriptsRegistry.register('TU4d_003', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// TU4e_002 - Crazed Hunter
// Hero Power: Deal 2 damage
cardScriptsRegistry.register('TU4e_002', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
});

// TU4c_003 - Barrel
// Deathrattle: Deal 2 damage
cardScriptsRegistry.register('TU4c_003', {
  deathrattle: (ctx: ActionContext) => {
    // Deal 2 damage to the enemy hero
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    if (opponent) {
      const damage = new Damage(ctx.source, opponent.hero, 2);
      damage.trigger(ctx.source);
    }
  },
});

// TU4f_007 - [c] Darkshire Councilman
// After you play a minion, give it +1/+1
cardScriptsRegistry.register('TU4f_007', {
  events: {
    AFTER_MINION_PLAY: (ctx: ActionContext) => {
      const target = ctx.target;
      if (target) {
        const buff = new Buff(ctx.source, target, { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source);
      }
    },
  },
});

// TU4c_006 - [c] Sheep
// Battlecry: Deal 1 damage
cardScriptsRegistry.register('TU4c_006', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// TU4a_004 - [c] Fireball
// Deal 8 damage
cardScriptsRegistry.register('TU4a_004', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 8);
      damage.trigger(ctx.source);
    }
  },
});

// TU4c_002 - [c] Murloc Scout
// Taunt
cardScriptsRegistry.register('TU4c_002', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
});

// TU4c_004 - [c] Murloc Raider
// Battlecry: Give your other Murlocs +1 Attack
cardScriptsRegistry.register('TU4c_004', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== ctx.source) {
        const buff = new Buff(ctx.source, minion, { ATK: 1 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// TU4c_008 - [c] Oasis Snapjaw
// Battlecry: Summon a 2/2 Crocolisk
cardScriptsRegistry.register('TU4c_008', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'TU4c_008t');
    summon.trigger(ctx.source);
  },
});

// TU4e_005 - [c] Murloc Warleader
// Your other Murlocs have +2 Attack and +1 Health
cardScriptsRegistry.register('TU4e_005', {
});

// TU4f_004 - [c] Voodoo Doctor
// Battlecry: Restore 2 Health
cardScriptsRegistry.register('TU4f_004', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const heal = new Heal(ctx.source, target, 2);
      heal.trigger(ctx.source);
    }
  },
});

// TU4f_006 - [c] Darkshire Councilman
// After you play a minion, give it +1/+1
cardScriptsRegistry.register('TU4f_006', {
  events: {
    AFTER_MINION_PLAY: (ctx: ActionContext) => {
      const target = ctx.target;
      if (target) {
        const buff = new Buff(ctx.source, target, { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source);
      }
    },
  },
});

// TU4f_006o - Darkshire Councilman buff
cardScriptsRegistry.register('TU4f_006o', {
});
