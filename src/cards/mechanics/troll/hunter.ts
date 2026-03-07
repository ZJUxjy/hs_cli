// troll - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TRL_348 - Springpaw - Rush. Battlecry: Add a 1/1 Lynx with Rush to your hand.
cardScriptsRegistry.register('TRL_348', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const { Give } = require('../../../actions/give');
    const give = new Give(controller, 'TRL_348t');
    give.trigger(source);
  },
});

// TRL_349 - Bloodscalp Strategist - Battlecry: If you have a weapon equipped, Discover a spell.
cardScriptsRegistry.register('TRL_349', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const weapon = controller.weapon;

    if (weapon) {
      // Discover a spell - simplified, just draw a random spell
      // In full implementation, would show discover UI
    }
  },
});

// TRL_900 - Halazzi, the Lynx - Battlecry: Fill your hand with 1/1 Lynxes that have Rush.
cardScriptsRegistry.register('TRL_900', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const handSize = controller.hand ? controller.hand.length : 0;
    const cardsToDraw = 10 - handSize; // Fill hand to 10

    const { Give } = require('../../../actions/give');
    for (let i = 0; i < cardsToDraw; i++) {
      const give = new Give(controller, 'TRL_348t');
      give.trigger(source);
    }
  },
});

// TRL_901 - Halazzi transform
cardScriptsRegistry.register('TRL_901', {
  events: {
    // Transform effect - simplified
  },
});

// TRL_119 - The Beast Within - Give a friendly Beast +1/+1, then it attacks a random enemy minion.
cardScriptsRegistry.register('TRL_119', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
    [PlayReq.REQ_TARGET_IS_RACE]: 20, // Beast
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;

    // Give +1/+1
    const { Buff } = require('../../../actions/buff');
    const buff = new Buff(source, target, { ATK: 1, HEALTH: 1 });
    buff.trigger(source);

    // Attack a random enemy minion
    const controller = source.controller;
    const opponent = controller.opponent;
    const oppField = opponent?.field || [];
    if (oppField.length > 0) {
      const randomTarget = oppField[Math.floor(Math.random() * oppField.length)];
      const { Attack } = require('../../../actions/attack');
      const attack = new Attack(target, randomTarget);
      attack.execute(source);
    }
  },
});

// TRL_339
cardScriptsRegistry.register('TRL_339', {
});

// TRL_347 - Baited Arrow - Deal $3 damage. Overkill: Summon a 5/5 Devilsaur.
cardScriptsRegistry.register('TRL_347', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;

    // Deal 3 damage
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(source, 3);
    damage.trigger(source, target);

    // Check for overkill - simplified, would need proper overkill tracking
    const targetHealth = target.health || 0;
    if (targetHealth < 3) {
      const { Summon } = require('../../../actions/summon');
      const summon = new Summon(source, 'TRL_347t');
      summon.trigger(source);
    }
  },
});

// TRL_566 - Revenge of the Wild - Summon your Beasts that died this turn.
cardScriptsRegistry.register('TRL_566', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Track dead beasts - simplified, would need proper tracking
    // In full implementation, track beasts that died this turn
  },
});

// TRL_111 - Headhunter's Hatchet - Battlecry: If you control a Beast, gain +1 Durability.
cardScriptsRegistry.register('TRL_111', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];

    // Check if controlling a Beast
    const hasBeast = field.some((m: any) => m.race === 'BEAST');
    if (hasBeast) {
      source.durability = (source.durability || 1) + 1;
    }
  },
});

// TRL_065 - Zul'jin - Battlecry: Cast all spells you've played this game (targets chosen randomly).
cardScriptsRegistry.register('TRL_065', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Track spells played - simplified, would need proper tracking
    // In full implementation, track all spells played and cast them again
  },
});

// TRL_065h
cardScriptsRegistry.register('TRL_065h', {
});
