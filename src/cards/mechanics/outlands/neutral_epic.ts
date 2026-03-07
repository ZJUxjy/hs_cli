// outlands - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';
import type { Entity } from '../../../core/entity';

// BT_190 - Fungal Fortunes - Draw 3 cards
cardScriptsRegistry.register('BT_190', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      // After you cast a spell, gain +2 Attack this turn
    },
  },
});

// BT_729 - Scrapyard Colossus - Deathrattle: Summon a 7/7 Ancient
cardScriptsRegistry.register('BT_729', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Summon a 7/7 Ancient - handled by game
  },
});

// BT_733 - Mo'arg Artificer - All minions take double damage from spells.
cardScriptsRegistry.register('BT_733', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Set global spell damage multiplier - simplified implementation
    // Full implementation would track spell damage multiplier on game state
    (controller as any).spellDamageMultiplier = 2;
  },
});
