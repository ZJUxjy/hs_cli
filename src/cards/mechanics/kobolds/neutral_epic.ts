// kobolds - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Summon, Damage } from '../../../actions';

// LOOT_130 - Blink Fox
// Battlecry: Add a random card to your hand
cardScriptsRegistry.register('LOOT_130', {
});

// Hand - Blink Fox buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_130e - Blink Fox buff
cardScriptsRegistry.register('LOOT_130e', {
  events: {
    // Handled by game
  },
});

// LOOT_149 - Shudderwraith
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('LOOT_149', {
});

// Hand - Shudderwraith buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_149e - Shudderwraith buff
cardScriptsRegistry.register('LOOT_149e', {
  events: {
    // Handled by game
  },
});

// LOOT_161 - Shudderwraith
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('LOOT_161', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const game = ctx.game;

    // Get all friendly minions on board
    const friendlyMinions = controller?.board || [];

    // Trigger deathrattle for each friendly minion that has one
    for (const minion of friendlyMinions) {
      if (minion.id && minion !== source) {
        const script = cardScriptsRegistry.get(minion.id);
        if (script?.deathrattle) {
          try {
            script.deathrattle({ source: minion, game, target: undefined });
          } catch (e) {
            // Ignore errors in deathrattle triggers
          }
        }
      }
    }
  },
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_193 - Green Jelly
// Battlecry: Summon a 1/1 Ooze with Taunt
cardScriptsRegistry.register('LOOT_193', {
});

// LOOT_389 - Fungal Enchanter
// Battlecry: Restore 3 Health to a random friendly character
cardScriptsRegistry.register('LOOT_389', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const field = controller?.field || [];

    if (field.length > 0) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(source, target, 3);
      heal.trigger(source);
    }
  },
});

// LOOT_414 - Cursed Disciple
// Deathrattle: Summon a 5/5 Skeleton
cardScriptsRegistry.register('LOOT_414', {
  events: {
    // Handled by game
  },
});

// LOOT_529 - Wax Elemental
// Battlecry: Gain +2/+2 for each Elemental in your hand
cardScriptsRegistry.register('LOOT_529', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const hand = controller?.hand || [];

    const elementals = hand.filter((card: any) => (card as any).race === 'elemental');
    const bonus = elementals.length * 2;

    if (bonus > 0) {
      const buff = new Buff(source, source, { ATK: bonus, HEALTH: bonus });
      buff.trigger(source);
    }
  },
});

// LOOT_539 - Sand Drinker
// Battlecry: Deal 5 damage to the enemy hero
cardScriptsRegistry.register('LOOT_539', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;

    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 5);
      damage.trigger(source);
    }
  },
});

// LOOT_540 - Sneaky Devil
// Battlecry: Give a friendly minion +2/+2
cardScriptsRegistry.register('LOOT_540', {
  events: {
    // Handled by game
  },
});
