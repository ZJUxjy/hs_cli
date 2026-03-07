// outlands - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';

// BT_126 - Fungal Fortunes - Draw 3 cards
cardScriptsRegistry.register('BT_126', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Draw 3 cards - handled by game
  },
});

// BT_126e - Fungal Fortunes buff
cardScriptsRegistry.register('BT_126e', {
  deathrattle: (ctx: ActionContext) => {
    // Deathrattle handled by game
  },
});

// BT_255
cardScriptsRegistry.register('BT_255', {
});

// BT_255e
cardScriptsRegistry.register('BT_255e', {
});

// BT_735
cardScriptsRegistry.register('BT_735', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BT_735t - Replicator - At the end of your turn, gain +1/+1
cardScriptsRegistry.register('BT_735t', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    },
  },
});

// BT_737 - Kael'thas Sunstrider - Every third spell cast each turn costs (0)
cardScriptsRegistry.register('BT_737', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Every third spell costs (0) - handled by game
  },
});

// BT_850
cardScriptsRegistry.register('BT_850', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
