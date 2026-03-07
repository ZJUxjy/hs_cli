// troll - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Draw, Buff, Damage, Heal } from '../../../actions';

// TRL_223 - Spirit of the Raptor
// Stealth for 1 turn. After your hero attacks and kills a minion, draw a card.
cardScriptsRegistry.register('TRL_223', {
  events: {
    ATTACK: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      if (controller?.hero === source && ctx.target) {
        const target = ctx.target as any;
        if (target && target.atk && target.health <= source.atk) {
          // Target would be killed - draw a card
          const drawAction = new Draw(source, 1);
          drawAction.trigger(source);
        }
      }
    },
  },
});

// TRL_232 - Ironhide Direhorn
// (no special effect - just a minion)
cardScriptsRegistry.register('TRL_232', {
});

// TRL_240 - Savage Striker
// Battlecry: Deal damage to an enemy minion equal to your hero's Attack.
cardScriptsRegistry.register('TRL_240', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_ENEMY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hero = controller?.hero;
    const heroAttack = hero?.atk || 0;
    if (ctx.target) {
      const damage = new Damage(source, ctx.target, heroAttack);
      damage.trigger(source);
    }
  },
});

// TRL_241 - Stampeding Roar
// Summon a random Beast. Give it Rush.
cardScriptsRegistry.register('TRL_241', {
  events: {
    // Would need random Beast from hand - simplified
  },
});

// TRL_341 - Jungle Giants
// Quest: Use 5 cards that didn't start in your deck. Reward: Barnabus
cardScriptsRegistry.register('TRL_341', {
  play: (ctx: ActionContext) => {
    // Quest reward - simplified
  },
});

// TRL_343 - The Caverns Below
// Quest: Play five 1-Cost minions. Reward: Crystal Core
cardScriptsRegistry.register('TRL_343', {
  play: (ctx: ActionContext) => {
    // Quest reward - simplified
  },
});

// TRL_343at2 - Crystal Core (5/5 for 4)
cardScriptsRegistry.register('TRL_343at2', {
  play: (ctx: ActionContext) => {
    // 5/4 minion with "Your minions that cost 4 or less are 5/5"
  },
});

// TRL_343bt2 - Crystal Core buff
cardScriptsRegistry.register('TRL_343bt2', {
  play: (ctx: ActionContext) => {
    // Buff effect
  },
});

// TRL_343ct2 - Crystal Core buff
cardScriptsRegistry.register('TRL_343ct2', {
  play: (ctx: ActionContext) => {
    // Buff effect
  },
});

// TRL_343dt2 - Crystal Core buff
cardScriptsRegistry.register('TRL_343dt2', {
  play: (ctx: ActionContext) => {
    // Buff effect
  },
});

// TRL_243 - Reckless Diretroll
// Taunt. Battlecry: Give your other Trolls +1 Attack
cardScriptsRegistry.register('TRL_243', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const { Buff } = require('../../../actions/buff');
    for (const minion of field) {
      if (minion !== source) {
        const buff = new Buff(source, minion, { ATK: 1 });
        buff.trigger(source);
      }
    }
  },
});

// TRL_244 - Direhorn Hatchling
// Taunt. Deathrattle: Shuffle a 6/6 Direhorn into your deck
cardScriptsRegistry.register('TRL_244', {
  play: (ctx: ActionContext) => {
    // Just a minion
  },
});

// TRL_254 - Cancel
// Counter a spell
cardScriptsRegistry.register('TRL_254', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Counter target spell - simplified
  },
});

// TRL_254a - Cancel effect
cardScriptsRegistry.register('TRL_254a', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Counter effect
  },
});

// TRL_254b - Cancel effect
cardScriptsRegistry.register('TRL_254b', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Counter effect
  },
});

// TRL_255 - Tidal Surge
// Lifesteal. Deal 3 damage to a minion
cardScriptsRegistry.register('TRL_255', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});
