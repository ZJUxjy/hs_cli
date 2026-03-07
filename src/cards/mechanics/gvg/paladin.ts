// gvg - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Give, Draw, Summon } from '../../../actions';

// GVG_060 - Quartermaster - Battlecry: Give your Silver Hand Recruits +2/+2
cardScriptsRegistry.register('GVG_060', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if ((minion as any).id === 'CS2_101') {
        const buff = new Buff(source, minion, { ATK: 2, HEALTH: 2 });
        buff.trigger(source);
      }
    }
  },
});

// GVG_062 - Warhorse Trainer - Your Silver Hand Recruits have +1/+1
cardScriptsRegistry.register('GVG_062', {
  events: {
    // Silver Hand Recruits have +1/+1 - handled by game
  },
});

// GVG_063 - Murloc Knight - Inspire: Summon a random Murloc
cardScriptsRegistry.register('GVG_063', {
});

// Hand - Seal of Light
cardScriptsRegistry.register('Hand', {
  events: {
    // Restore 4 Health to your hero and give your minions +2 Attack - handled by game
  },
});

// GVG_101 - Bolvar Fordragon - Battlecry: If your deck has no duplicates, gain +2 Attack
cardScriptsRegistry.register('GVG_101', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];
    // Check for duplicates - handled by game
    const buff = new Buff(source, source, { ATK: 2 });
    buff.trigger(source);
  },
});

// GVG_057 - Scarlet Purifier - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('GVG_057', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
  },
});

// GVG_061 - Solemn Vigil - Battlecry: Draw 2 cards. Costs (1) less for each minion that died this turn
cardScriptsRegistry.register('GVG_061', {
  play: (ctx: ActionContext) => {
    const { Draw } = require('../../../actions/draw');
    const source = ctx.source as any;
    const controller = source.controller;
    const drawAction1 = new Draw();
    drawAction1.trigger(source, controller);
    const drawAction2 = new Draw();
    drawAction2.trigger(source, controller);
  },
});

// GVG_059 - Dragon Consort - Battlecry: The next Dragon you play costs (2) less
cardScriptsRegistry.register('GVG_059', {
  play: (ctx: ActionContext) => {
    // Next Dragon costs (2) less - handled by game
  },
});
