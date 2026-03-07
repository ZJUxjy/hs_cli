// classic - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// EX1_005 - Big Game Hunter - Battlecry: Destroy a minion with 7 or more Attack
cardScriptsRegistry.register('EX1_005', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_MIN_ATTACK]: 7,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
    }
  },
});

// EX1_105
cardScriptsRegistry.register('EX1_105', {
});

// EX1_507
cardScriptsRegistry.register('EX1_507', {
});

// EX1_564 - Faceless Manipulator - Battlecry: Choose a minion and become a copy of it
cardScriptsRegistry.register('EX1_564', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const source = ctx.source as any;
      // Copy the target's stats and keywords
      source.atk = target.atk;
      source.health = target.health;
      source.maxHealth = target.maxHealth;
      source.taunt = target.taunt;
      source.divineShield = target.divineShield;
      source.windfury = target.windfury;
      source.stealthed = target.stealthed;
      source.poisonous = target.poisonous;
      source.lifesteal = target.lifesteal;
      // Copy the card ID for visual representation
      source.cardId = target.cardId;
    }
  },
});

// EX1_586
cardScriptsRegistry.register('EX1_586', {
});

// EX1_590 - Blood Knight - Battlecry: All minions lose Divine Shield. Gain +3/+3 for each Shield lost
cardScriptsRegistry.register('EX1_590', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];

    let shieldCount = 0;
    for (const minion of allMinions) {
      if (minion.divineShield) {
        minion.divineShield = false;
        shieldCount++;
      }
    }

    // Gain +3/+3 for each shield lost
    if (shieldCount > 0) {
      source.atk = (source.atk || 0) + (3 * shieldCount);
      source.health = (source.health || 0) + (3 * shieldCount);
      source.maxHealth = (source.maxHealth || 0) + (3 * shieldCount);
    }
  },
});

// EX1_620
cardScriptsRegistry.register('EX1_620', {
});

// NEW1_016 - Captain's Parrot - Battlecry: Draw a Pirate from your deck
cardScriptsRegistry.register('NEW1_016', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];

    // Find pirates in deck
    const pirates = deck.filter((card: any) => {
      // Check if card has Race.PIRATE - we need to check the card data
      return (card.race === 'PIRATE');
    });

    if (pirates.length > 0) {
      // Draw a random pirate
      const randomPirate = pirates[Math.floor(Math.random() * pirates.length)];
      const { Draw } = require('../../../actions/draw');
      const drawAction = new Draw(source, 1, randomPirate.cardId);
      drawAction.trigger(source);
    }
  },
});

// NEW1_017 - Hungry Crab - Battlecry: Destroy a Murloc and gain +2/+2
cardScriptsRegistry.register('NEW1_017', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_RACE]: 14, // Murloc
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Destroy the Murloc
      (ctx.target as any).destroyed = true;
      // Gain +2/+2
      const source = ctx.source as any;
      source.atk = (source.atk || 0) + 2;
      source.health = (source.health || 0) + 2;
      source.maxHealth = (source.maxHealth || 0) + 2;
    }
  },
});

// NEW1_021 - Doomsayer - At the start of your turn, destroy ALL minions
cardScriptsRegistry.register('NEW1_021', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const opponent = controller.opponent;
      const allMinions = [...(controller.field || []), ...(opponent.field || [])];
      for (const minion of allMinions) {
        (minion as any).destroyed = true;
      }
    },
  },
});

// NEW1_027
cardScriptsRegistry.register('NEW1_027', {
});

// EX1_188 - Barrens Stablehand - Battlecry: Summon a random Beast
cardScriptsRegistry.register('EX1_188', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // List of beast card IDs - in a real implementation, this would be fetched from card data
    const beastCardIds = [
      'CS2_120', // Wolf
      'CS2_121', // boar
      'DS1_070', // Hound
      'EX1_534', // Savannah Highmane
      // Add more beast IDs as needed
    ];

    const randomBeast = beastCardIds[Math.floor(Math.random() * beastCardIds.length)];
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(randomBeast);
    summonAction.trigger(source);
  },
});
