// dragons - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Heal, Damage, Draw } from '../../../actions';

// DRG_096 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('DRG_096', {
  play: (ctx: ActionContext) => {
    // Trigger all friendly minions' Deathrattles
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if ((minion as any).deathrattle) {
        // Trigger deathrattle
        (minion as any).deathrattle(ctx);
      }
    }
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // ???
  },
});

// DRG_096e - Shudderwraith buff
cardScriptsRegistry.register('DRG_096e', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // ???
  },
});

// DRG_096e2 - Shudderwraith buff
cardScriptsRegistry.register('DRG_096e2', {
});

// DRG_216 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('DRG_216', {
});

// DRG_218 - Murloc Tidehunter (Common)
// Battlecry: Summon a 1/1 Murloc
cardScriptsRegistry.register('DRG_218', {
  play: (ctx: ActionContext) => {
    // Summon a 1/1 Murloc
    const summon = new Summon(ctx.source, 'CS2_168');
    summon.trigger(ctx.source);
  },
});

// DRG_223 - Scargil (Legendary)
// Your Murlocs cost (1)
cardScriptsRegistry.register('DRG_223', {
  play: (ctx: ActionContext) => {
    // Your Murlocs cost (1) - handled by game
  },
});

// - Soup DRG_224 (Common)
// Restore 5 Health
cardScriptsRegistry.register('DRG_224', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Restore 5 Health
    const target = ctx.target;
    if (target) {
      const heal = new Heal(ctx.source, target, 5);
      heal.trigger(ctx.source);
    }
  },
});

// DRG_224t - ???
cardScriptsRegistry.register('DRG_224t', {
});
