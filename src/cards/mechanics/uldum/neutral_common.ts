// uldum - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// ULD_174 - Phalanx Commander (Common)
// Your Taunt minions have +2 Attack
cardScriptsRegistry.register('ULD_174', {
  deathrattle: (ctx: ActionContext) => {
    // Your Taunt minions have +2 Attack
  },
  aura: {
    // Your Taunt minions have +2 Attack
  },
});

// ULD_179 - Candlebroker (Rare)
// Battlecry: Add a Lackey to your hand
cardScriptsRegistry.register('ULD_179', {
});

// ULD_182 - Desert Spear (Rare)
// After your hero attacks, summon a 1/1 Cobra with Poisonous
cardScriptsRegistry.register('ULD_182', {
  events: {
    // After your hero attacks, summon a 1/1 Cobra with Poisonous
  },
});

// ULD_183 - Jar Dealer (Common)
// Deathrattle: Add a 1/1 Candle to your hand
cardScriptsRegistry.register('ULD_183', {
  deathrattle: (ctx: ActionContext) => {
    // Add a 1/1 Candle to your hand
  },
});

// ULD_184 - Tina (Common)
// Deathrattle: Add a random 1-Cost minion to your hand
cardScriptsRegistry.register('ULD_184', {
  deathrattle: (ctx: ActionContext) => {
    // Add a random 1-Cost minion to your hand
  },
});

// ULD_185 - Mogu Cultist (Rare)
// Battlecry: If your deck has no duplicates, gain +1/+1
cardScriptsRegistry.register('ULD_185', {
});

// ULD_188 - Stonehill Defender (Rare)
// Battlecry: Discover a Taunt minion
cardScriptsRegistry.register('ULD_188', {
  play: (ctx: ActionContext) => {
    // Discover a Taunt minion
  },
});

// ULD_189 - Sand Drudge (Common)
// Deathrattle: Add a 1/1 Candle to your hand
cardScriptsRegistry.register('ULD_189', {
  play: (ctx: ActionContext) => {
    // Add a 1/1 Candle to your hand
  },
});

// ULD_189e - Sand Drudge buff
cardScriptsRegistry.register('ULD_189e', {
});

// ULD_190 - Pharaoh's Blessing (Rare)
// Give a minion +8/+8. Divine Shield
cardScriptsRegistry.register('ULD_190', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Give a minion +8/+8 and Divine Shield
  },
});

// ULD_191 - Ramkahen Wildtamer (Rare): Copy a random Beast in your deck
cardScriptsRegistry.register('ULD_191', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller?.deck) return;

    // Find all Beasts in deck
    const beasts = controller.deck.filter((c: any) => c.race === 'BEAST');
    if (beasts.length === 0) return;

    // Copy a random Beast
    const randomBeast = beasts[Math.floor(Math.random() * beasts.length)];
    if (controller?.hand?.length < 10) {
      controller.hand.push({
        id: (randomBeast as any).id,
      } as any);
    }
  },
});

// ULD_271 - Plague of Wrath (Rare)
// Destroy all minions.(Cards that didn't start in your deck restore 5 Health instead)
cardScriptsRegistry.register('ULD_271', {
  play: (ctx: ActionContext) => {
    // Destroy all minions
  },
});

// ULD_282 - Candlekeeper (Common)
// Battlecry: Add a 1/1 Candle to your hand
cardScriptsRegistry.register('ULD_282', {
  deathrattle: (ctx: ActionContext) => {
    // Add a 1/1 Candle to your hand
  },
});

// ULD_289 - Quicksand Elemental (Rare)
// Battlecry: Give all enemy minions -2 Attack this turn
cardScriptsRegistry.register('ULD_289', {
  play: (ctx: ActionContext) => {
    // Give all enemy minions -2 Attack this turn
  },
});

// ULD_712 - Injured Tol'vir (Common)
// Taunt. Battlecry: Deal 6 damage to this minion
cardScriptsRegistry.register('ULD_712', {
  play: (ctx: ActionContext) => {
    // Deal 6 damage to this minion
  },
});

// ULD_719 - Questing Explorer (Rare)
// Battlecry: Draw a card
cardScriptsRegistry.register('ULD_719', {
  play: (ctx: ActionContext) => {
    // Draw a card
  },
});
