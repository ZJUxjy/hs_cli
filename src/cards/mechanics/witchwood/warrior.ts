// witchwood - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// GIL_152 - Frightened Flunky - Battlecry: Discover a Taunt minion
cardScriptsRegistry.register('GIL_152', {
});

// GIL_155 - Redband Wasp - Rush
cardScriptsRegistry.register('GIL_155', {
});

// GIL_547 - Rabid Worgen - Rush
cardScriptsRegistry.register('GIL_547', {
});

// GIL_580 - Stone Hill Defender - Battlecry: Discover a Treasure
cardScriptsRegistry.register('GIL_580', {
});

// GIL_655 - Voorzichtige Tovenaar - Your hero can only take 1 damage at a time
cardScriptsRegistry.register('GIL_655', {
});

// GIL_803 - Mossy Horror - Battlecry: Destroy all other minions with 2 or less Attack
cardScriptsRegistry.register('GIL_803', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;

    // Destroy enemy minions with 2 or less Attack
    const enemyField = opponent.field || [];
    for (const minion of enemyField) {
      if ((minion.attack || 0) <= 2) {
        const destroy = new Destroy();
        destroy.trigger(source, minion);
      }
    }

    // Destroy friendly minions with 2 or less Attack (except self)
    const friendlyField = controller.field || [];
    for (const minion of friendlyField) {
      if (minion !== source && (minion.attack || 0) <= 2) {
        const destroy = new Destroy();
        destroy.trigger(source, minion);
      }
    }
  },
});

// GIL_537 - Darius Crowley - Battlecry: If your opponent has 15 or more cards in their deck, gain +5/+5
cardScriptsRegistry.register('GIL_537', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const oppDeckSize = opponent.deck ? opponent.deck.length : 0;

    if (oppDeckSize >= 15) {
      const buff = new Buff(source, source, { ATK: 5, HEALTH: 5 });
      buff.trigger(source);
    }
  },
});

// GIL_654 - Swat - Destroy a minion
cardScriptsRegistry.register('GIL_654', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target as any;
    if (target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, target);
    }
  },
});

// GIL_653 - Voodoo Doll - Battlecry: Destroy a minion. Deathrattle: Resummon it
cardScriptsRegistry.register('GIL_653', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;
    if (target) {
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
  deathrattle: (ctx: ActionContext) => {
    // Resummon the destroyed minion (handled by game)
  },
});
