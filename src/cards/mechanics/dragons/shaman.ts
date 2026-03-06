// dragons - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DRG_096 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('DRG_096', {
  play: (ctx: ActionContext) => {
    // Trigger all friendly minions' Deathrattles
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
  },
});

// DRG_223 - Scargil (Legendary)
// Your Murlocs cost (1)
cardScriptsRegistry.register('DRG_223', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Your Murlocs cost (1)
  },
});

// - Soup DRG_224 (Common)
// Restore 5 Health
cardScriptsRegistry.register('DRG_224', {
  play: (ctx: ActionContext) => {
    // Restore 5 Health
  },
});

// DRG_224t - ???
cardScriptsRegistry.register('DRG_224t', {
});
