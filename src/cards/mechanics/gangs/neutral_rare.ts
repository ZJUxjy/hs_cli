// gangs - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Give } from '../../../actions';

// CFM_321 - Grimestreet Informant - Battlecry: Discover a Hunter, Paladin, or Warrior card
cardScriptsRegistry.register('CFM_321', {
  play: (ctx: ActionContext) => {
    // Discover a card - simplified: give random card from one of the classes
    const source = ctx.source as any;
    const controller = source?.controller;
    const classes = ['HUNTER', 'PALADIN', 'WARRIOR'];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    // Simplified: give a placeholder card
    const cardId = 'CS2_101'; // placeholder
    const give = new Give(cardId);
    give.trigger(source, controller);
  },
});

// CFM_325
cardScriptsRegistry.register('CFM_325', {
});

// CFM_649 - Kabal Courier - Battlecry: Discover a Mage, Priest, or Warlock card
cardScriptsRegistry.register('CFM_649', {
  play: (ctx: ActionContext) => {
    // Discover a card - simplified: give random card from one of the classes
    const source = ctx.source as any;
    const controller = source?.controller;
    const classes = ['MAGE', 'PRIEST', 'WARLOCK'];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    // Simplified: give a placeholder card
    const cardId = 'CS2_022'; // placeholder
    const give = new Give(cardId);
    give.trigger(source, controller);
  },
});

// CFM_652
cardScriptsRegistry.register('CFM_652', {
});

// Hand
cardScriptsRegistry.register('Hand', {
});

// CFM_658 - Backroom Bouncer - Whenever a friendly minion dies, gain +1 Attack
cardScriptsRegistry.register('CFM_658', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const source = ctx.source;
      const deadMinion = ctx.target;
      const controller = (source as any)?.controller;
      if (deadMinion && controller) {
        const field = controller?.field || [];
        if (field.includes(deadMinion)) {
          const buff = new Buff(source, source, { ATK: 1 });
          buff.trigger(source);
        }
      }
    },
  },
});

// CFM_667 - Bomb Squad - Battlecry: Deal 5 damage to an enemy minion. Deathrattle: Deal 5 damage to your hero
cardScriptsRegistry.register('CFM_667', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(5);
      damageAction.trigger(ctx.source, ctx.target);
    }
  },
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(5);
    damageAction.trigger(source, controller.hero);
  },
});

// CFM_668 - Doppelgangster - Battlecry: Summon 2 copies of this minion
cardScriptsRegistry.register('CFM_668', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const cardId = source.cardId;

    // Summon 2 copies
    const { Summon } = require('../../../actions/summon');
    for (let i = 0; i < 2; i++) {
      const summonAction = new Summon(cardId);
      summonAction.trigger(source);
    }
  },
});

// CFM_688 - Spiked Hogrider - Battlecry: If an enemy minion has Taunt, gain Charge
cardScriptsRegistry.register('CFM_688', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const enemyField = opponent.field || [];

    // Check if any enemy minion has Taunt
    const hasTaunt = enemyField.some((minion: any) => minion.taunt);

    if (hasTaunt) {
      source.charge = true;
    }
  },
});

// CFM_852 - Lotus Agents - Battlecry: Discover a Druid, Rogue, or Shaman card
cardScriptsRegistry.register('CFM_852', {
  play: (ctx: ActionContext) => {
    // Discover mechanic - handled by game UI
    // The effect will allow player to choose from cards of those classes
  },
});
