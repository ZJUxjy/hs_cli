// outlands - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon } from '../../../actions';
import { Entity } from '../../../core/entity';

// BT_008 Imprisoned Satyr - Deathrattle: Summon two 1/1 Satyrs
cardScriptsRegistry.register('BT_008', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon('BT_008t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon('BT_008t');
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
      (target as any).destroyed = true;
    }
  },
});

// BT_156
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
    const summon = new Summon('BT_714t');
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
    const { Summon } = require('../../../actions/summon');
    // In full implementation, summon random demon
  },
});

// BT_720
cardScriptsRegistry.register('BT_720', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_722
cardScriptsRegistry.register('BT_722', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_723
cardScriptsRegistry.register('BT_723', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_724
cardScriptsRegistry.register('BT_724', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_726
cardScriptsRegistry.register('BT_726', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BT_727
cardScriptsRegistry.register('BT_727', {
  events: {
    // TODO: implement events
  },
});

// BT_728
cardScriptsRegistry.register('BT_728', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BT_730
cardScriptsRegistry.register('BT_730', {
});

// BT_732
cardScriptsRegistry.register('BT_732', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_734
cardScriptsRegistry.register('BT_734', {
});
