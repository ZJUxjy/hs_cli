// kobolds - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give, Shuffle } from '../../../actions';

// LOOT_170 Dragon's Fury - Reveal a spell from your deck and cast it
cardScriptsRegistry.register('LOOT_170', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    if (deck.length > 0) {
      // Cast a random spell from deck
    }
  },
});

// LOOT_231 Frost Lich Jaina - Battlecry: Summon a 3/6 Water Elemental
cardScriptsRegistry.register('LOOT_231', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('LOOT_231t');
    summon.trigger(ctx.source);
  },
});

// LOOT_535 Cinderstorm - Deal 3 damage randomly split among enemy characters
cardScriptsRegistry.register('LOOT_535', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const targets: any[] = [...(opponent.field || [])];
    if (opponent.hero) targets.push(opponent.hero);

    // Deal 1 damage 3 times randomly
    for (let i = 0; i < 3; i++) {
      if (targets.length === 0) break;
      const randomIndex = Math.floor(Math.random() * targets.length);
      const target = targets[randomIndex];
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// LOOT_537 Meteorologist - Battlecry: If there are 3+ Spells in your hand, deal 4 damage
cardScriptsRegistry.register('LOOT_537', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    // Count spells in hand
    let spellCount = 0;
    for (const card of hand) {
      if ((card as any).type === 'SPELL') spellCount++;
    }
    // If 3+ spells, deal 4 damage
    if (spellCount >= 3 && ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 4);
      damage.trigger(ctx.source);
    }
  },
});

// LOOT_537e - Meteorologist Enchantment
cardScriptsRegistry.register('LOOT_537e', {
});

// LOOT_101 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('LOOT_101', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all other friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(ctx.source, minion, 2);
        damage.trigger(ctx.source);
      }
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
  },
});

// LOOT_103 - Elemental Evocation - Next element costs (0)
cardScriptsRegistry.register('LOOT_103', {
  play: (ctx: ActionContext) => {
    // Set next elemental cost to 0 - placeholder
  },
});

// LOOT_103t1 - Elemental Evocation Effect
cardScriptsRegistry.register('LOOT_103t1', {
});

// LOOT_103t2 - Elemental Evocation Effect
cardScriptsRegistry.register('LOOT_103t2', {
});

// LOOT_104 - Pyroblast - Deal 10 damage
cardScriptsRegistry.register('LOOT_104', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 10);
      damage.trigger(ctx.source);
    }
  },
});

// LOOT_104e - Pyroblast Enchantment
cardScriptsRegistry.register('LOOT_104e', {
});

// LOOT_106 - Steam Surger - Battlecry: Add an Elemental to your hand
cardScriptsRegistry.register('LOOT_106', {
  play: (ctx: ActionContext) => {
    // Add random elemental to hand - placeholder
  },
});

// LOOT_106t - Steam Surger Token
cardScriptsRegistry.register('LOOT_106t', {
});

// LOOT_172 - Deck of Wonders - Shuffle 5 Scrolls into your deck. Cast one at random
cardScriptsRegistry.register('LOOT_172', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Shuffle 5 scrolls into deck
    for (let i = 0; i < 5; i++) {
      const shuffleAction = new Shuffle('LOOT_172t');
      shuffleAction.trigger(ctx.source);
    }
  },
});

// LOOT_108 - Arcane Artificer - Battlecry: Add an Elemental to your hand
cardScriptsRegistry.register('LOOT_108', {
  play: (ctx: ActionContext) => {
    // Add random elemental - placeholder
  },
});

// LOOT_161 - Mana Prism - Draw a card
cardScriptsRegistry.register('LOOT_161', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// LOOT_132 - Explodinator - Battlecry: Deal 3 damage to all other minions
cardScriptsRegistry.register('LOOT_132', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all other friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(ctx.source, minion, 3);
        damage.trigger(ctx.source);
      }
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 3);
      damage.trigger(ctx.source);
    }
  },
});
