// gangs - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// CFM_341 - Patches the Pirate (Legendary)
// Charge. Battlecry: If your deck contains no duplicates, add Patches to your hand
cardScriptsRegistry.register('CFM_341', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Check if deck has no duplicates (simplified - just add Patches)
    const deck = controller?.deck as Entity[];
    if (deck && deck.length > 0) {
      // Add Patches to hand (CFM_341t)
      const { Give } = require('../../../actions/give');
      const giveAction = new Give('CFM_341t');
      giveAction.trigger(source, controller);
    }
  },
  deathrattle: (ctx: ActionContext) => {
    // Return to hand is handled differently in game
  },
});

// CFM_344 - Small-Time Buccaneer (Rare)
// Has +2 Attack while you have a weapon
cardScriptsRegistry.register('CFM_344', {
  events: {
    // Has +2 Attack while you have a weapon
  },
});

// CFM_621 - Kazakus (Legendary)
// Battlecry: Discover a spell
cardScriptsRegistry.register('CFM_621', {
  play: (ctx: ActionContext) => {
    // Discover a spell - this would require a discover action
    // For now, mark that this is a battlecry effect
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // This is a placeholder - full implementation would require discover UI
    (controller as any).kazakusActive = true;
  },
});

// CFM_637 - Grimestreet Enforcer (Rare)
// At the end of your turn, give a random minion in your hand +1/+1
cardScriptsRegistry.register('CFM_637', {
});

// Deck - ???
cardScriptsRegistry.register('Deck', {
  events: {
    // ???
  },
});

// CFM_670 - Burgly Bully (Epic)
// Whenever your opponent casts a spell, add a Coin to your hand
cardScriptsRegistry.register('CFM_670', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Check if opponent cast the spell
      if (event?.source && (event.source as any).controller !== controller) {
        const { Give } = require('../../../actions/give');
        const giveAction = new Give('GAME_005'); // The Coin
        giveAction.trigger(source, controller);
      }
    },
  },
});

// CFM_672 - Jade Lightning (Common)
// Deal 4 damage. Summon a 1/1 Jade Golem
cardScriptsRegistry.register('CFM_672', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage. Summon a 1/1 Jade Golem
  },
});

// CFM_685 - Felguard (Rare)
// Taunt. Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('CFM_685', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const enemyField = opponent.field || [];
    if (enemyField.length > 0) {
      const target = enemyField[Math.floor(Math.random() * enemyField.length)];
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
});

// CFM_806 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('CFM_806', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field as Entity[];
    // Trigger deathrattles of all friendly minions except self
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

// CFM_807 - Fandral Staghelm (Legendary)
// Your Deathrattle cards trigger twice
cardScriptsRegistry.register('CFM_807', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Mark that deathrattles trigger twice
    (controller as any).deathrattleMultiplier = 2;
  },
});

// CFM_808 - Blightnozzle Crawler (Rare)
// Deathrattle: Summon a 1/1 Ooze with Rush. Battlecry: Deal 2 damage
cardScriptsRegistry.register('CFM_808', {
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, target);
    }
  },
  deathrattle: (ctx: ActionContext) => {
    // Summon a 1/1 Ooze with Rush (CFM_808t)
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(ctx.source, 'CFM_808t');
    summonAction.trigger(ctx.source);
  },
});
