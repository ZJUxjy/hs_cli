// outlands - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon, Destroy } from '../../../actions';
import { Entity } from '../../../core/entity';
import { Race } from '../../../enums';

// BT_008 Imprisoned Satyr - Deathrattle: Summon two 1/1 Satyrs
cardScriptsRegistry.register('BT_008', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon(ctx.source, 'BT_008t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon(ctx.source, 'BT_008t');
    summon2.trigger(ctx.source);
  },
});

// BT_010 Rustsworn Cultist - Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('BT_010', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const field = opponent?.field || [];
    if (field.length > 0) {
      const target = field[Math.floor(Math.random() * field.length)];
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
});

// BT_156 - Frozen Mammoth - Taunt
cardScriptsRegistry.register('BT_156', {
});

// BT_159 Unstable Felhound - Taunt
cardScriptsRegistry.register('BT_159', {
});

// BT_160 Felfire Pulser - Deal 2 damage to all minions
cardScriptsRegistry.register('BT_160', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const myField = controller?.field || [];
    const oppField = opponent?.field || [];
    for (const minion of [...myField, ...oppField]) {
      const damage = new Damage(source, minion, 2);
      damage.trigger(source);
    }
  },
});

// BT_160e
cardScriptsRegistry.register('BT_160e', {
});

// BT_714 Portal Keeper - Battlecry: Summon a 2/2 Demon Portal
cardScriptsRegistry.register('BT_714', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_714t');
    summon.trigger(ctx.source);
  },
});

// BT_715 Nether Portal - At the end of your turn, summon a random 6-Cost demon
cardScriptsRegistry.register('BT_715', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // In full implementation, summon random demon
    },
  },
});

// BT_716 Fel Lord - Taunt
cardScriptsRegistry.register('BT_716', {
});

// BT_717 Abyssal Summoner - Battlecry: Summon a random Demon
cardScriptsRegistry.register('BT_717', {
  play: (ctx: ActionContext) => {
    // In full implementation, summon random demon - simplified
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_717t');
    summon.trigger(ctx.source);
  },
});

// BT_720 - Frozen Shadoweaver - Battlecry: Freeze a minion
cardScriptsRegistry.register('BT_720', {
  play: (ctx: ActionContext) => {
    // Battlecry: Freeze a minion - handled by game
  },
});

// BT_722 - Supreme Abyssal - Taunt
cardScriptsRegistry.register('BT_722', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Taunt from card data
  },
});

// BT_723 - Astropom - Battlecry: Copy a card from your opponent's deck
cardScriptsRegistry.register('BT_723', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Copy a card from opponent's deck
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const deck = opponent.deck || [];
    if (deck.length > 0) {
      const randomCard = deck[Math.floor(Math.random() * deck.length)];
      const giveAction = new Give(randomCard.id);
      giveAction.trigger(ctx.source, controller);
    }
  },
});

// BT_724 - Bonecrusher - Battlecry: Deal 2 damage
cardScriptsRegistry.register('BT_724', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// BT_726 - Felhunter - Deathrattle: Give your hero +2 Attack
cardScriptsRegistry.register('BT_726', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const buff = new Buff(ctx.source, controller.hero, { ATK: 2 });
    buff.trigger(ctx.source);
  },
});

// BT_727 - Terrorcreeper - At the end of your turn, give other friendly minions +1 Attack
cardScriptsRegistry.register('BT_727', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      for (const minion of field) {
        if (minion !== ctx.source) {
          const buff = new Buff(ctx.source, minion, { ATK: 1 });
          buff.trigger(ctx.source);
        }
      }
    },
  },
});

// BT_728 - Imprisoned Vilefiend - Deathrattle: Summon two 1/1 Vilefiends
cardScriptsRegistry.register('BT_728', {
  deathrattle: (ctx: ActionContext) => {
    for (let i = 0; i < 2; i++) {
      const { Summon } = require('../../../actions/summon');
      const summon = new Summon(ctx.source, 'BT_728t');
      summon.trigger(ctx.source);
    }
  },
});

// BT_730 - Dragonmaw Sentinel - Battlecry: If you're holding a Dragon, gain +2/+2
cardScriptsRegistry.register('BT_730', {
});

// BT_732 - Sky Gen'rator - Battlecry: Deal 3 damage to all other minions
cardScriptsRegistry.register('BT_732', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(source, minion, 3);
        damage.trigger(source);
      }
    }
  },
});

// BT_734 - Felroc - Taunt
cardScriptsRegistry.register('BT_734', {
});
