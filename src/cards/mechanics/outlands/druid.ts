// outlands - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon } from '../../../actions';
import { Entity } from '../../../core/entity';

// BT_127 Archspore Msshi'fn - Deathrattle: Summon a 5/5 Lotus
cardScriptsRegistry.register('BT_127', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('BT_127t');
    summon.trigger(ctx.source);
  },
});

// BT_127e
cardScriptsRegistry.register('BT_127e', {
});

// BT_131 Fungal Fortunes - Draw 3 cards
cardScriptsRegistry.register('BT_131', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    for (let i = 0; i < 3; i++) {
      const drawAction = new Draw(ctx.source);
      drawAction.trigger(source);
    }
  },
});

// BT_133 Germination - Restore 4 Health to a minion
cardScriptsRegistry.register('BT_133', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(4);
      heal.trigger(ctx.source, ctx.target);
    }
  },
});

// BT_136
cardScriptsRegistry.register('BT_136', {
});

// BT_136t
cardScriptsRegistry.register('BT_136t', {
});

// BT_136ta
cardScriptsRegistry.register('BT_136ta', {
});

// BT_128 Surplus Collector - Battlecry: Destroy a different Allied minion
cardScriptsRegistry.register('BT_128', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const others = field.filter((m: any) => m !== source);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      (target as any).destroyed = true;
    }
  },
});

// BT_129 Glow-Tron - Battlecry: Give a friendly Mech +1/+1
cardScriptsRegistry.register('BT_129', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// BT_130 Rotnest Drake - Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('BT_130', {
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

// BT_132
cardScriptsRegistry.register('BT_132', {
});

// Hand
cardScriptsRegistry.register('Hand', {
});

// BT_134
cardScriptsRegistry.register('BT_134', {
});

// Hand
cardScriptsRegistry.register('Hand', {
});

// BT_135
cardScriptsRegistry.register('BT_135', {
});
