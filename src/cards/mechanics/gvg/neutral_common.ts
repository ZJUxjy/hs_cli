// gvg - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon } from '../../../actions';
import { Entity } from '../../../core/entity';

// GVG_006 Shielded Minibot - No special ability
cardScriptsRegistry.register('GVG_006', {
});

// GVG_013 Cogmaster - No special ability
cardScriptsRegistry.register('GVG_013', {
});

// GVG_065 Floating Watcher - Battlecry: If you have 3+ Mechs, gain +4/+4
cardScriptsRegistry.register('GVG_065', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    // Count mechs
    let mechCount = 0;
    for (const minion of field) {
      if ((minion as any).race === 'MECH') mechCount++;
    }
    if (mechCount >= 3) {
      const buff = new Buff(source, source, { ATK: 4, HEALTH: 4 });
      buff.trigger(source);
    }
  },
});

// GVG_067 Malorne - Deathrattle: Return to your hand
cardScriptsRegistry.register('GVG_067', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const cardId = source.id;
    const { Give } = require('../../../actions/give');
    const giveAction = new Give(cardId);
    giveAction.trigger(source, controller);
  },
});

// GVG_068 Mech-Bear-Catm - At the end of your turn, add a Spare Part to your hand
cardScriptsRegistry.register('GVG_068', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const { Give } = require('../../../actions/give');
      // In full implementation, add random spare part
    },
  },
});

// GVG_069Djinni of Zephyrs - Your healing effects also damage the opposite enemy hero
cardScriptsRegistry.register('GVG_069', {
  play: (ctx: ActionContext) => {
    // In full implementation, implement dual effect
  },
});

// GVG_075 StEtienne - Your hero power also gives Taunt
cardScriptsRegistry.register('GVG_075', {
});

// GVG_076 Sneed's Old Shredder - Deathrattle: Summon a random legendary minion
cardScriptsRegistry.register('GVG_076', {
  deathrattle: (ctx: ActionContext) => {
    // In full implementation, summon random legendary
  },
});

// GVG_078 Toshley - Battlecry: Add a Spare Part to your hand
cardScriptsRegistry.register('GVG_078', {
  play: (ctx: ActionContext) => {
    // In full implementation, add spare part
  },
});

// GVG_082 Siltfin Spiritwalker - Deathrattle: Give your minions +1/+1
cardScriptsRegistry.register('GVG_082', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    for (const minion of field) {
      const buff = new Buff(source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// GVG_090 Enhance-o Mechano - Battlecry: Give all other minions Windfury
cardScriptsRegistry.register('GVG_090', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    for (const minion of field) {
      if (minion !== source) {
        (minion as any).windfury = true;
      }
    }
  },
});

// GVG_096 Foe Reaper 4000 - Also damages adjacent minions
cardScriptsRegistry.register('GVG_096', {
});

// GVG_102 Blingtron 3000 - Battlecry: Equip a random weapon
cardScriptsRegistry.register('GVG_102', {
  play: (ctx: ActionContext) => {
    // In full implementation, equip random weapon
  },
});

// GVG_103 Hemet Nesingwary - Battlecry: Destroy a Beast
cardScriptsRegistry.register('GVG_103', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
    }
  },
});
