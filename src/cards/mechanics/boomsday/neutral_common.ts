// boomsday - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage } from '../../../actions';

// BOT_020 - Skaterbot
// Magnetic, Rush
cardScriptsRegistry.register('BOT_020', {
  magnetic: true,
});

// BOT_021 - Bronze Gatekeeper
// Magnetic, Taunt
cardScriptsRegistry.register('BOT_021', {
  magnetic: true,
});

// BOT_031 - Goblin Bomb
// Deathrattle: Deal 2 damage to the enemy hero
cardScriptsRegistry.register('BOT_031', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const opponent = source?.controller?.opponent;
    if (opponent?.hero) {
      const damageAction = new Damage(source, opponent.hero, 2);
      damageAction.trigger(source);
    }
  },
});

// BOT_079 Star Aligner - Battlecry: If you control 3 minions with 7 health, deal 7 damage
cardScriptsRegistry.register('BOT_079', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    let count7Health = 0;
    for (const minion of field) {
      if ((minion as any).health === 7) count7Health++;
    }
    if (count7Health >= 3) {
      const damageAction = new Damage(source, controller.opponent.hero, 7);
      damageAction.trigger(source);
    }
  },
});

// BOT_083 Whirlwind Tempest - Your minions with "Battlecry" have +1 Attack
cardScriptsRegistry.register('BOT_083', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      const field = controller?.field || [];
      for (const minion of field) {
        if ((minion as any).hasBattlecry) {
          (minion as any).attack += 1;
        }
      }
    },
  },
});

// BOT_267 Mechanical Egg - Deathrattle: Summon a 4/4 Mech
cardScriptsRegistry.register('BOT_267', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('BOT_267t');
    summon.trigger(ctx.source);
  },
});

// BOT_308 Augmented Elekk - Deathrattle: Shuffle the highest Cost minion into your deck
cardScriptsRegistry.register('BOT_308', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const field = opponent?.field || [];
    if (field.length === 0) return;
    // Find highest cost minion
    let highestCost = -1;
    let highestMinion = null;
    for (const minion of field) {
      const cost = (minion as any).cost || 0;
      if (cost > highestCost) {
        highestCost = cost;
        highestMinion = minion;
      }
    }
    if (highestMinion) {
      const cardId = (highestMinion as any).id;
      const { Shuffle } = require('../../../actions/shuffle');
      const shuffleAction = new Shuffle(cardId);
      shuffleAction.trigger(source);
    }
  },
});

// BOT_413 Glow-Tron - Magnetic
cardScriptsRegistry.register('BOT_413', {
  magnetic: true,
});

// BOT_431 Microtech Controller - Battlecry: Summon two 1/1 Microbots
cardScriptsRegistry.register('BOT_431', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon('BOT_431t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon('BOT_431t');
    summon2.trigger(ctx.source);
  },
});

// BOT_445 Necrium Veil - Deathrattle: Return a random friendly minion to your hand
cardScriptsRegistry.register('BOT_445', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const others = field.filter((m: any) => m !== source);
    if (others.length === 0) return;
    const randomMinion = others[Math.floor(Math.random() * others.length)];
    const cardId = (randomMinion as any).id;
    const { Give } = require('../../../actions/give');
    const giveAction = new Give(cardId);
    giveAction.trigger(source, controller);
  },
});

// BOT_448 Replicating Rod - After you draw a Mech, summon a copy
cardScriptsRegistry.register('BOT_448', {
  events: {
    DRAW: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.source) {
        const source = event.source as any;
        if ((source as any).race === 'MECH') {
          const cardId = (source as any).id;
          const { Summon } = require('../../../actions/summon');
          const summonAction = new Summon(cardId);
          summonAction.trigger(ctx.source);
        }
      }
    },
  },
});

// BOT_532 Upgradeable Framebot - No special ability
cardScriptsRegistry.register('BOT_532', {
});

// BOT_535 Zilliax - Magnetic, Lifesteal, Taunt, Divine Shield
cardScriptsRegistry.register('BOT_535', {
  magnetic: true,
});

// BOT_550 Holomancer - At the end of your turn, give all minions -1 Attack
cardScriptsRegistry.register('BOT_550', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      const opponent = controller?.opponent;
      const myField = controller?.field || [];
      const oppField = opponent?.field || [];
      // Reduce all minions' attack by 1
      for (const minion of [...myField, ...oppField]) {
        (minion as any).attack = Math.max(0, (minion as any).attack - 1);
      }
    },
  },
});

// BOT_562 Spark Engine - Battlecry: Add a 0/2 Spark to your hand
cardScriptsRegistry.register('BOT_562', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const { Give } = require('../../../actions/give');
    const giveAction = new Give('BOT_562t');
    giveAction.trigger(source, controller);
  },
});

// BOT_562e
cardScriptsRegistry.register('BOT_562e', {
});

// BOT_563 Sparks - No special ability
cardScriptsRegistry.register('BOT_563', {
});

// BOT_606 The Boomship - Battlecry: Summon 3 random minions from your deck
cardScriptsRegistry.register('BOT_606', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const deck = controller?.deck || [];
    const targets = [...deck].sort(() => Math.random() - 0.5).slice(0, 3);
    const { Summon } = require('../../../actions/summon');
    for (const target of targets) {
      const summonAction = new Summon((target as any).id);
      summonAction.trigger(source);
    }
  },
});
