// uldum - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// ULD_161 - Plot Twist (Rare)
// Shuffle your hand into your deck. Draw that many cards
cardScriptsRegistry.register('ULD_161', {
  events: {
    // Shuffle your hand into your deck, draw that many cards
  },
});

// ULD_162 - Dark Pharaoh (Epic)
// Battlecry: Add a random Lackey to your hand
cardScriptsRegistry.register('ULD_162', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Add a random Lackey to your hand
  },
});

// ULD_163 - Rafaam's Scheme (Epic)
// Summon a 2/2 Legionnaire with Taunt
cardScriptsRegistry.register('ULD_163', {
  play: (ctx: ActionContext) => {
    // Summon a 2/2 Legionnaire with Taunt
  },
});

// ULD_163e - Legionnaire buff
cardScriptsRegistry.register('ULD_163e', {
  deathrattle: (ctx: ActionContext) => {
    // ???
  },
});

// ULD_165 - Pharaoh's Blessing (Rare)
// Give a minion +8/+8. Divine Shield
cardScriptsRegistry.register('ULD_165', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Give a minion +8/+8 and Divine Shield
  },
});

// ULD_167 - Plague of Wrath (Rare)
// Destroy all minions. (Cards that didn't start in your deck restore 5 Health instead)
cardScriptsRegistry.register('ULD_167', {
  play: (ctx: ActionContext) => {
    // Destroy all minions
  },
});

// ULD_168 - Aranasi Broodwatcher (Common)
// Taunt. Deathrattle: Restore 4 Health to your hero
cardScriptsRegistry.register('ULD_168', {
  play: (ctx: ActionContext) => {
    // Restore 4 Health to your hero
  },
});

// ULD_168e - Broodwatcher buff
cardScriptsRegistry.register('ULD_168e', {
});

// ULD_168e3 - ???
cardScriptsRegistry.register('ULD_168e3', {
});

// ULD_140 - Desert Spear (Rare)
// After your hero attacks, summon a 1/1 Cobra with Poisonous
cardScriptsRegistry.register('ULD_140', {
  play: (ctx: ActionContext) => {
    // After your hero attacks, summon a 1/1 Cobra with Poisonous
  },
});

// ULD_140p - ???
cardScriptsRegistry.register('ULD_140p', {
});

// ULD_140e - Cobra buff
cardScriptsRegistry.register('ULD_140e', {
  events: {
    // ???
  },
});

// ULD_160 - Crystalizer (Rare)
// Battlecry: Deal 5 damage to your hero. Gain 5 Armor
cardScriptsRegistry.register('ULD_160', {
  play: (ctx: ActionContext) => {
    // Deal 5 damage to your hero, gain 5 Armor
  },
});

// ULD_324 - ???
cardScriptsRegistry.register('ULD_324', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // ???
  },
});

// ULD_717 - ???
