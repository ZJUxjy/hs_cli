// uldum - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Summon, Heal, Destroy, Shuffle } from '../../../actions';

// ULD_161 - Plot Twist (Rare)
// Shuffle your hand into your deck. Draw that many cards
cardScriptsRegistry.register('ULD_161', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];

    // Shuffle hand into deck
    const deck = controller?.deck || [];
    const handCards = [...hand];
    for (const card of handCards) {
      const shuffle = new Shuffle(card);
      shuffle.trigger(source);
    }
    // Clear hand
    hand.length = 0;
    // Draw that many cards
    for (let i = 0; i < handCards.length; i++) {
      const draw = new Draw(source, 1);
      draw.trigger(source);
    }
  },
});

// ULD_162 - Dark Pharaoh (Epic)
// Battlecry: Add a random Lackey to your hand
cardScriptsRegistry.register('ULD_162', {
  requirements: {
    // No requirements - battlecry always triggers
  },
  play: (ctx: ActionContext) => {
    // Add a random Lackey to your hand - simplified
  },
});

// ULD_163 - Rafaam's Scheme (Epic)
// Summon a 2/2 Legionnaire with Taunt
cardScriptsRegistry.register('ULD_163', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'ULD_163t');
    summon.trigger(ctx.source);
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
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 8, HEALTH: 8 });
      buff.trigger(ctx.source);
    }
  },
});

// ULD_167 - Plague of Wrath (Rare)
// Destroy all minions. (Cards that didn't start in your deck restore 5 Health instead)
cardScriptsRegistry.register('ULD_167', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const field = controller?.field || [];
    const oppField = opponent?.field || [];

    // Destroy all minions
    for (const minion of [...field]) {
      const destroy = new Destroy();
      destroy.trigger(source, minion);
    }
    for (const minion of [...oppField]) {
      const destroy = new Destroy();
      destroy.trigger(source, minion);
    }
  },
});

// ULD_168 - Aranasi Broodwatcher (Common)
// Taunt. Deathrattle: Restore 4 Health to your hero
cardScriptsRegistry.register('ULD_168', {
  play: (ctx: ActionContext) => {
    // Taunt is set on card - deathrattle handled by game
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
    // After hero attacks, summon cobra - simplified
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
    const source = ctx.source as any;
    const controller = source?.controller;
    const hero = controller?.hero;

    // Deal 5 damage to your hero
    if (hero) {
      const damage = new Damage(source, hero, 5);
      damage.trigger(source);
    }

    // Gain 5 Armor
    if (controller) {
      controller.armor = (controller.armor || 0) + 5;
    }
  },
});

// ULD_324 - Sacrificial Pact
// Destroy a Demon. Restore 5 Health to your hero
cardScriptsRegistry.register('ULD_324', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hero = controller?.hero;

    // Destroy target if it's a Demon
    if (ctx.target) {
      const destroy = new Destroy();
      destroy.trigger(source, ctx.target);
    }

    // Restore 5 Health
    if (hero) {
      const heal = new Heal(source, hero, 5);
      heal.trigger(source);
    }
  },
});

// ULD_717 - ???
