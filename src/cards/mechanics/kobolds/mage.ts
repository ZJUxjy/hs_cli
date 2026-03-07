// kobolds - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon } from '../../../actions';
import { Entity } from '../../../core/entity';

// LOOT_170 Dragon's Fury - Reveal a spell from your deck
cardScriptsRegistry.register('LOOT_170', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const deck = controller?.deck || [];
    if (deck.length > 0) {
      const randomSpell = deck[Math.floor(Math.random() * deck.length)];
      // In full implementation, reveal to both players
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

// LOOT_535 Cinderstorm - Deal 3 damage to a character
cardScriptsRegistry.register('LOOT_535', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// LOOT_537 Meteorologist - Battlecry: If there are 3+ Spells in your hand, deal 4 damage
cardScriptsRegistry.register('LOOT_537', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
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

// LOOT_537e
cardScriptsRegistry.register('LOOT_537e', {
});

// LOOT_101
cardScriptsRegistry.register('LOOT_101', {
});

// LOOT_103
cardScriptsRegistry.register('LOOT_103', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_103t1
cardScriptsRegistry.register('LOOT_103t1', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_103t2
cardScriptsRegistry.register('LOOT_103t2', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_104
cardScriptsRegistry.register('LOOT_104', {
  requirements: {
    // TODO: add requirements
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_104e
cardScriptsRegistry.register('LOOT_104e', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_106
cardScriptsRegistry.register('LOOT_106', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_106t
cardScriptsRegistry.register('LOOT_106t', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_172
cardScriptsRegistry.register('LOOT_172', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_108
cardScriptsRegistry.register('LOOT_108', {
  events: { /* TODO */ },
});
