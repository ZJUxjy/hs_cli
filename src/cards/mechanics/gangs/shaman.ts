// gangs - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';

// CFM_061 - Jade Lightning (Common)
// Deal 4 damage. Summon a 1/1 Jade Golem
cardScriptsRegistry.register('CFM_061', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    // Deal 4 damage
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(4);
      damageAction.trigger(ctx.source, target);
    }
    // Summon a 1/1 Jade Golem
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(ctx.source, 'CFM_712t');
    summonAction.trigger(ctx.source);
  },
});

// CFM_324 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('CFM_324', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field as Entity[];
    // Trigger deathrattles of all friendly minions
    if (field) {
      for (const minion of field) {
        if (minion !== source) {
          const { executeDeathrattle } = require('../../index');
          executeDeathrattle(minion as any);
        }
      }
    }
  },
});

// CFM_697 - Fire Plume Phoenix (Rare)
// Battlecry: Deal 3 damage
cardScriptsRegistry.register('CFM_697', {
  events: {
    // Deal 3 damage
  },
});

// CFM_310 - Call in the Finishers - Battlecry: Summon four 1/1 Murlocs
cardScriptsRegistry.register('CFM_310', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    for (let i = 0; i < 4; i++) {
      const summon = new Summon(ctx.source, 'CFM_310t');
      summon.trigger(ctx.source);
    }
  },
});

// CFM_313 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('CFM_313', {
  play: (ctx: ActionContext) => {
    // Your other Murlocs have +1 Attack
  },
});

// CFM_696 - Fire Plume Phoenix (Rare)
// Battlecry: Deal 3 damage
cardScriptsRegistry.register('CFM_696', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(3);
      damageAction.trigger(ctx.source, target);
    }
  },
});

// CFM_712 - Jade Lightning (Common)
// Deal 4 damage. Summon a 1/1 Jade Golem
cardScriptsRegistry.register('CFM_712', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage. Summon a 1/1 Jade Golem
  },
});
