// outlands - demonhunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';

// BT_187 - Aldrachi Warblades (Common)
// Lifesteal - intrinsic weapon ability
cardScriptsRegistry.register('BT_187', {
  play: (ctx: ActionContext) => {
    // Lifesteal is an intrinsic weapon ability
  },
});

// BT_321 - Chaos Strike (Common)
// Give your hero +2 Attack this turn. Draw a card
cardScriptsRegistry.register('BT_321', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Give hero +2 Attack
    if (controller?.hero) {
      (controller.hero as any).attackBonus = ((controller.hero as any).attackBonus || 0) + 2;
    }
    // Draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(source);
  },
});

// BT_480 - Immolation Aura (Rare)
// Deal 2 damage to all other minions
cardScriptsRegistry.register('BT_480', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    const field = controller?.field as Entity[];
    const oppField = opponent?.field as Entity[];

    // Damage friendly minions
    if (field) {
      for (const minion of field) {
        if (minion !== source) {
          const { Damage } = require('../../../actions/damage');
          const damageAction = new Damage(2);
          damageAction.trigger(source, minion);
        }
      }
    }
    // Damage enemy minions
    if (oppField) {
      for (const minion of oppField) {
        const { Damage } = require('../../../actions/damage');
        const damageAction = new Damage(2);
        damageAction.trigger(source, minion);
      }
    }
  },
});

// BT_486 - Soul Cleave (Epic)
// Lifesteal. Deal 2 damage to two random minions
cardScriptsRegistry.register('BT_486', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    const field = controller?.field as Entity[];
    const oppField = opponent?.field as Entity[];

    // Combine all minions
    const allMinions = [...(field || []), ...(oppField || [])];
    // Deal 2 damage to two random minions
    for (let i = 0; i < 2 && allMinions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * allMinions.length);
      const target = allMinions[randomIndex];
      allMinions.splice(randomIndex, 1);

      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(source, target);
    }
  },
});

// BT_493 - Felosophy (Epic)
// Duplicate a minion in your deck
cardScriptsRegistry.register('BT_493', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = controller?.deck as Entity[];
    if (deck && deck.length > 0) {
      // Get a random minion from deck and add copy to hand
      const minions = deck.filter((c: any) => c.type === 'MINION');
      if (minions.length > 0) {
        const randomMinion = minions[Math.floor(Math.random() * minions.length)];
        const { Give } = require('../../../actions/give');
        const giveAction = new Give((randomMinion as any).id);
        giveAction.trigger(source, controller);
      }
    }
  },
});

// BT_496 - Glaivebound Adept (Rare)
// Battlecry: Deal 4 damage
cardScriptsRegistry.register('BT_496', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(4);
      damageAction.trigger(ctx.source, target);
    }
  },
});

// BT_509 - Wrathscale Naga (Rare)
// After a friendly minion dies, deal 3 damage to a random enemy
cardScriptsRegistry.register('BT_509', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;

      // Check if a friendly minion died
      if (event?.source && (event.source as any).controller === controller) {
        // Deal 3 damage to random enemy
        const oppField = opponent?.field as Entity[];
        if (oppField && oppField.length > 0) {
          const target = oppField[Math.floor(Math.random() * oppField.length)];
          const { Damage } = require('../../../actions/damage');
          const damageAction = new Damage(3);
          damageAction.trigger(source, target);
        } else if (opponent?.hero) {
          const { Damage } = require('../../../actions/damage');
          const damageAction = new Damage(3);
          damageAction.trigger(source, opponent.hero);
        }
      }
    },
  },
});

// BT_761 - Coilfang Warlord (Rare)
// Deathrattle: Summon a 5/5 with Rush
cardScriptsRegistry.register('BT_761', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(ctx.source, 'BT_761t'); // 5/5 with Rush
    summonAction.trigger(ctx.source);
  },
});

// BT_934 - Eye Beam (Rare)
// Lifesteal. Deal 3 damage to a minion
cardScriptsRegistry.register('BT_934', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
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

// BT_429 - Il'gynoth (Legendary)
// Your hero Power deals 2 damage
cardScriptsRegistry.register('BT_429', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Mark that hero power deals 2 damage
    (controller as any).heroPowerDamage = 2;
  },
});

// BT_429p - Il'gynoth hero power
cardScriptsRegistry.register('BT_429p', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
});

// BT_429p2 - Il'gynoth hero power upgraded
cardScriptsRegistry.register('BT_429p2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
});

// BT_491 - Warglaives of Azzinoth (Epic)
// After you play a minion, give it +2 Attack
cardScriptsRegistry.register('BT_491', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Mark that after playing minion, give +2 attack
    (controller as any).warglaivesActive = true;
  },
  events: {
    MINION_SUMMON: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;

      // If warglaives is active and a minion was summoned
      if ((controller as any).warglaivesActive && event?.source) {
        const { Buff } = require('../../../actions/buff');
        const buffAction = new Buff('BT_491e', { ATK: 2, HEALTH: 0 });
        buffAction.trigger(source, event.source);
      }
    },
  },
});

// BT_514 - Skull of Gul'dan (Epic)
// Draw 3 cards. Reduce their Cost by (3)
cardScriptsRegistry.register('BT_514', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Draw 3 cards
    for (let i = 0; i < 3; i++) {
      const { Draw } = require('../../../actions/draw');
      const drawAction = new Draw();
      drawAction.trigger(source);
    }
    // Reduce cost by 3 - would need to track drawn cards
    // Simplified: mark that next cards drawn are reduced
    (controller as any).skullOfGuldanActive = true;
  },
});

// BT_601 - Metamorphosis (Legendary)
// Battlecry: Deal 5 damage. Gain 5 Armor
cardScriptsRegistry.register('BT_601', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Deal 5 damage
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(5);
      damageAction.trigger(source, target);
    }
    // Gain 5 armor
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 5;
    }
  },
});

// BT_601e - Metamorphosis buff
cardScriptsRegistry.register('BT_601e', {
});

// BT_430 - Nethrandamus (Legendary)
// Battlecry: Summon two random 0-Cost minions
cardScriptsRegistry.register('BT_430', {
  events: {
    // Battlecry: Summon two random 0-Cost minions
  },
});
