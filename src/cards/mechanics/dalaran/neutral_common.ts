// dalaran - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';

// DAL_077 - Mana Addict (Rare)
// After you cast a spell, gain +2 Attack this turn
cardScriptsRegistry.register('DAL_077', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // After you cast a spell, gain +2 Attack this turn - handled by game
  },
});

// DAL_078 - Sunreaver Spy (Rare)
// Battlecry: If you control a Secret, gain +1/+1
cardScriptsRegistry.register('DAL_078', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const secrets = controller.secrets || [];
    if (secrets.length > 0) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// DAL_086 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('DAL_086', {
  play: (ctx: ActionContext) => {
    // Trigger all friendly minions' Deathrattles - handled by game
  },
});

// DAL_088 - Whirlwind Tempest (Epic)
// Your minions with "Battlecry" have +1 Attack and Rush
cardScriptsRegistry.register('DAL_088', {
  deathrattle: (ctx: ActionContext) => {
    // Your minions with "Battlecry" have +1 Attack and Rush
  },
});

// DAL_089 - Dragonmaw Scuttler (Common)
// Your other Dragons have +1/+1
cardScriptsRegistry.register('DAL_089', {
  play: (ctx: ActionContext) => {
    // Your other Dragons have +1/+1
  },
});

// DAL_095 - Arcane Watcher (Rare)
// Can't be targeted by spells
cardScriptsRegistry.register('DAL_095', {
  play: (ctx: ActionContext) => {
    // Can't be targeted by spells
  },
});

// DAL_400 - Prismatic Lens (Rare)
// Draw a minion and a spell. Reduce their Cost by (1)
cardScriptsRegistry.register('DAL_400', {
  play: (ctx: ActionContext) => {
    // Draw a minion and a spell, reduce cost by 1
  },
});

// DAL_544 - Magic Carpet (Epic)
// Your 1-cost minions have +1 Attack and Rush
cardScriptsRegistry.register('DAL_544', {
  play: (ctx: ActionContext) => {
    // Your 1-cost minions have +1 Attack and Rush
  },
});

// DAL_551 - Fel Lord (Rare)
// Taunt. Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('DAL_551', {
});

// DAL_560 - Rays of the Sun (Common)
// Discover a Heal
cardScriptsRegistry.register('DAL_560', {
  play: (ctx: ActionContext) => {
    // Discover a Heal
  },
});

// DAL_566 - Portal Keeper (Rare)
// Battlecry: Open a portal that summons two 2/1 Demons
cardScriptsRegistry.register('DAL_566', {
  deathrattle: (ctx: ActionContext) => {
    // Battlecry: Open a portal that summons two 2/1 Demons
  },
});

// DAL_735 - Dalaran Librarian (Common)
// Battlecry: Silence adjacent minions
cardScriptsRegistry.register('DAL_735', {
  play: (ctx: ActionContext) => {
    // Silence adjacent minions
  },
});

// DAL_743 - Violet Spellsword (Common)
// Battlecry: Gain +1/+1 for each spell in your hand
cardScriptsRegistry.register('DAL_743', {
  deathrattle: (ctx: ActionContext) => {
    // Gain +1/+1 for each spell in your hand
  },
});

// DAL_744 - Sunreaver Spy (Rare)
// Battlecry: If you control a Secret, gain +1/+1
cardScriptsRegistry.register('DAL_744', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // If you control a Secret, gain +1/+1
  },
});

// DAL_744e - Sunreaver Spy buff
cardScriptsRegistry.register('DAL_744e', {
});

// DAL_747 - Hench-Clan Sneak (Rare)
// Can't be targeted by spells
cardScriptsRegistry.register('DAL_747', {
  play: (ctx: ActionContext) => {
    // Can't be targeted by spells
  },
});

// DAL_771 - Safeguard (Rare)
// Taunt. Deathrattle: Summon a 0/2 with Taunt
cardScriptsRegistry.register('DAL_771', {
  events: {
    // Taunt. Deathrattle: Summon a 0/2 with Taunt
  },
});
