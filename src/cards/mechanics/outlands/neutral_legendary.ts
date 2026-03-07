// outlands - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy, Morph } from '../../../actions';

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

// BT_255 - Kael'thas Sunstrider - Every third spell you cast each turn costs (0)
cardScriptsRegistry.register('BT_255', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      // Track spell count for Kael'thas
      if (!controller.kaelthasSpellCount) {
        controller.kaelthasSpellCount = 0;
      }
      controller.kaelthasSpellCount++;
      // Every third spell costs (0)
      if (controller.kaelthasSpellCount % 3 === 0) {
        // Give the spell cost (0) - handled by game
      }
    },
  },
});

// BT_255e - Kael'thas' Sunstrider buff
cardScriptsRegistry.register('BT_255e', {
});

// BT_735 - Al'ar - Deathrattle: Summon a 0/3 Ashes of Al'ar that resurrects this minion on your next turn
cardScriptsRegistry.register('BT_735', {
  deathrattle: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'BT_735t');
    summon.trigger(ctx.source);
  },
});

// BT_735t - Ashes of Al'ar - At the start of your turn, transform this into Al'ar
cardScriptsRegistry.register('BT_735t', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source;
      const morph = new Morph('BT_735');
      morph.trigger(source, source);
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

// BT_850 - Magtheridon - Dormant. Battlecry: Summon three 1/3 enemy Warders. Awaken after they die
cardScriptsRegistry.register('BT_850', {
  play: (ctx: ActionContext) => {
    // Summon three 1/3 enemy Hellfire Warders
    const summon1 = new Summon(ctx.source, 'BT_850t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon(ctx.source, 'BT_850t');
    summon2.trigger(ctx.source);
    const summon3 = new Summon(ctx.source, 'BT_850t');
    summon3.trigger(ctx.source);
  },
});
