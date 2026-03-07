// kobolds - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy, Shuffle } from '../../../actions';
import type { Entity } from '../../../core/entity';

// LOOT_111 - Hoarding Dragon
cardScriptsRegistry.register('LOOT_111', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Add a random Dragon to your hand - handled by game
  },
});

// LOOT_118 - Emerald Reaver
cardScriptsRegistry.register('LOOT_118', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage to each hero - handled by game
  },
});

// LOOT_118e
cardScriptsRegistry.register('LOOT_118e', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      // Your minions have +1 Attack - handled by game
    },
  },
});

// LOOT_124 - Ravenous Pterrordax
cardScriptsRegistry.register('LOOT_124', {
  play: (ctx: ActionContext) => {
    // Destroy a random enemy minion - handled by game
  },
});

// LOOT_150 - Desperate Stand
cardScriptsRegistry.register('LOOT_150', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give a minion Taunt and Divine Shield - handled by game
  },
});

// LOOT_154 - Corrosive Breath
cardScriptsRegistry.register('LOOT_154', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage to enemy hero - handled by game
  },
});

// LOOT_218 - Waxadred
cardScriptsRegistry.register('LOOT_218', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        // Shuffle a Candle into your deck - handled by game
      }
    },
  },
});

// LOOT_382 - Shudderwraith
cardScriptsRegistry.register('LOOT_382', {
});

// LOOT_383 - Ghost Light Angler
cardScriptsRegistry.register('LOOT_383', {
  play: (ctx: ActionContext) => {
    // Summon two 1/1s - handled by game
  },
});

// LOOT_394 - Shudderwraith
cardScriptsRegistry.register('LOOT_394', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const buff = new Buff(source, source, { ATK: 2 });
        buff.trigger(source);
      }
    },
  },
});
