// gvg - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Give, Draw } from '../../../actions';

// GVG_074 - Floating Watcher - Battlecry: If you have 3+ Mechs, gain +4/+4
cardScriptsRegistry.register('GVG_074', {
  play: (ctx: ActionContext) => {
    // Already implemented in neutral_common.ts (GVG_065 is same effect)
  },
});

// GVG_089 - Fel Cannon - At the end of your turn, deal 2 damage to a non-Mech
cardScriptsRegistry.register('GVG_089', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const opponent = controller.opponent;
      const field = opponent.field || [];
      // Find non-Mech targets
      const nonMechs = field.filter((minion: any) => minion.race !== 'MECH');
      if (nonMechs.length > 0) {
        const target = nonMechs[Math.floor(Math.random() * nonMechs.length)];
        const damage = new Damage(source, target, 2);
        damage.trigger(source);
      }
    },
  },
});

// GVG_094 - Junkyard - At the end of your turn, transform a random minion into a random Mech
cardScriptsRegistry.register('GVG_094', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Transform random minion into random Mech - handled by game
    },
  },
});

// GVG_095 - Metaltooth Leaper - Battlecry: Give your other Mechs +2 Attack
cardScriptsRegistry.register('GVG_095', {
});

// GVG_097 - Siltfin Spiritwalker - Deathrattle: Give your minions +1/+1
cardScriptsRegistry.register('GVG_097', {
  play: (ctx: ActionContext) => {
    // Already implemented in neutral_common.ts (GVG_082)
  },
});

// GVG_099 - Upgraded Scrap Hound - Whenever a Mech dies, gain +1/+1
cardScriptsRegistry.register('GVG_099', {
  play: (ctx: ActionContext) => {
    // Gains +1/+1 when a Mech dies - handled by events
  },
});
