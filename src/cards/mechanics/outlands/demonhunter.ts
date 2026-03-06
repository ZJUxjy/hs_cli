// outlands - demonhunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// BT_187 - Aldrachi Warblades (Common)
// Lifesteal
cardScriptsRegistry.register('BT_187', {
});

// BT_321 - Chaos Strike (Common)
// Give your hero +2 Attack this turn. Draw a card
cardScriptsRegistry.register('BT_321', {
  play: (ctx: ActionContext) => {
    // Give your hero +2 Attack this turn. Draw a card
  },
});

// BT_480 - Immolation Aura (Rare)
// Deal 2 damage to all other minions
cardScriptsRegistry.register('BT_480', {
});

// BT_486 - Soul Cleave (Epic)
// Lifesteal. Deal 2 damage to two random minions
cardScriptsRegistry.register('BT_486', {
  events: {
    // Lifesteal. Deal 2 damage to two random minions
  },
});

// BT_493 - Felosophy (Epic)
// Duplicate a minion in your deck
cardScriptsRegistry.register('BT_493', {
  play: (ctx: ActionContext) => {
    // Duplicate a minion in your deck
  },
});

// BT_496 - Glaivebound Adept (Rare)
// Battlecry: Deal 4 damage
cardScriptsRegistry.register('BT_496', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage
  },
});

// BT_509 - Wrathscale Naga (Rare)
// After a friendly minion dies, deal 3 damage to a random enemy
cardScriptsRegistry.register('BT_509', {
  deathrattle: (ctx: ActionContext) => {
    // After a friendly minion dies, deal 3 damage
  },
});

// BT_761 - Coilfang Warlord (Rare)
// Deathrattle: Summon a 5/5 with Rush
cardScriptsRegistry.register('BT_761', {
  deathrattle: (ctx: ActionContext) => {
    // Summon a 5/5 with Rush
  },
});

// BT_934 - Eye Beam (Rare)
// Lifesteal. Deal 3 damage to a minion
cardScriptsRegistry.register('BT_934', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Lifesteal. Deal 3 damage to a minion
  },
});

// BT_429 - Il'gynoth (Legendary)
// Your hero Power deals 2 damage
cardScriptsRegistry.register('BT_429', {
  play: (ctx: ActionContext) => {
    // Your hero Power deals 2 damage
  },
});

// BT_429p - Il'gynoth hero power
cardScriptsRegistry.register('BT_429p', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
});

// BT_429p2 - Il'gynoth hero power upgraded
cardScriptsRegistry.register('BT_429p2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
});

// BT_491 - Warglaives of Azzinoth (Epic)
// After you play a minion, give it +2 Attack
cardScriptsRegistry.register('BT_491', {
  play: (ctx: ActionContext) => {
    // After you play a minion, give it +2 Attack
  },
});

// BT_514 - Skull of Gul'dan (Epic)
// Draw 3 cards. Reduce their Cost by (3)
cardScriptsRegistry.register('BT_514', {
  play: (ctx: ActionContext) => {
    // Draw 3 cards, reduce cost by 3
  },
});

// BT_601 - Metamorphosis (Legendary)
// Battlecry: Deal 5 damage. Gain 5 Armor
cardScriptsRegistry.register('BT_601', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 5 damage, gain 5 armor
  },
});

// BT_601e - Metamorphosis buff
cardScriptsRegistry.register('BT_601e', {
});

// BT_430 - Nethrandamus (Legendary)
// Battlecry: Summon two random 0-Cost minions
cardScriptsRegistry.register('BT_430', {
  events: {
    // Battlecry: Summon two random 0-Cost minions
  },
});
