// gvg - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Give, Draw, Summon } from '../../../actions';

// GVG_016 - Mini-Mage - Stealth. Your spells cost (1) less
cardScriptsRegistry.register('GVG_016', {
  events: {
    // Spells cost (1) less - handled by game
  },
});

// GVG_092 - Enhancer-o-Mechano - Battlecry: Give all other minions Windfury
cardScriptsRegistry.register('GVG_092', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source) {
        (minion as any).windfury = true;
      }
    }
  },
});

// GVG_104 - Junk Evolver - At the end of your turn, transform a random minion into a random Beast
cardScriptsRegistry.register('GVG_104', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Transform random minion into random Beast - handled by game
    },
  },
});

// GVG_105 - Sneed's Old Shredder - Deathrattle: Summon a random legendary minion
cardScriptsRegistry.register('GVG_105', {
  deathrattle: (ctx: ActionContext) => {
    // Summon random legendary - handled by game
  },
});

// GVG_106 - Foe Reaper 4000 - Also damages adjacent minions
cardScriptsRegistry.register('GVG_106', {
  events: {
    // Attacks also damage adjacent minions - handled by game
  },
});

// GVG_107 - Clockwork Giant - Costs (1) less for each card in your hand
cardScriptsRegistry.register('GVG_107', {
});

// GVG_108 - Siege Engine - Battlecry: Gain +1 Attack for each Armor you have
cardScriptsRegistry.register('GVG_108', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const armor = (controller as any).armor || 0;
    const buff = new Buff(source, source, { ATK: armor });
    buff.trigger(source);
  },
});

// GVG_121 - Clockwork Knight - Battlecry: Give a friendly Mech +1/+1
cardScriptsRegistry.register('GVG_121', {
});

// GVG_122 - Dragonling Mechanic - Battlecry: Summon a 2/1 Mechanical Dragonling
cardScriptsRegistry.register('GVG_122', {
});
