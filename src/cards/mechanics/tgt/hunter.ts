// tgt - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// AT_010 - Ram Wrangler - Battlecry: If you have a Beast, summon a random 2-Cost Beast
cardScriptsRegistry.register('AT_010', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];
    let hasBeast = false;
    for (const minion of friendlyMinions) {
      if ((minion as any).race === 'BEAST') {
        hasBeast = true;
        break;
      }
    }
    if (hasBeast) {
      const beasts = ['Mtg_Raptor', 'CS2_120'];
      const randomBeast = beasts[Math.floor(Math.random() * beasts.length)];
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon(randomBeast);
      summonAction.trigger(ctx.source);
    }
  },
});

// AT_057 - Stablemaster - Battlecry: Give a Beast +2 Health and Taunt
cardScriptsRegistry.register('AT_057', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('AT_057e', { HEALTH: 2, TAUNT: 1 });
      buffAction.trigger(ctx.source, ctx.target);
    }
  },
});

// AT_058 - King's Elekk - Battlecry: Reveal a minion in each deck. If yours costs more, draw it
cardScriptsRegistry.register('AT_058', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would reveal cards and draw if yours is higher cost
    console.log("King's Elekk: Battlecry effect");
  },
});

// AT_059 - Bear Trap
cardScriptsRegistry.register('AT_059', {
});

// AT_063 - Dart Trap - Secret: When your opponent casts a spell, draw a card
cardScriptsRegistry.register('AT_063', {
});

// AT_063t - Dart Trap Enchantment
cardScriptsRegistry.register('AT_063t', {
});

// AT_056 - Powershot - Deal 2 damage to a minion and 1 damage to the owner
cardScriptsRegistry.register('AT_056', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, ctx.target);
      // Deal 1 damage to owner
      const controller = (ctx.source as any).controller;
      const hero = controller.hero;
      if (hero) {
        const damageAction2 = new Damage(1);
        damageAction2.trigger(ctx.source, hero);
      }
    }
  },
});

// AT_061 - Lock and Load - Each time you cast a spell this turn, add a random Hunter card to your hand
cardScriptsRegistry.register('AT_061', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would add cards when you cast spells
  },
});

// AT_061e - Lock and Load Enchantment
cardScriptsRegistry.register('AT_061e', {
});

// AT_062 - Ball of Spiders - Summon three 1/1 Webspinners
cardScriptsRegistry.register('AT_062', {
  requirements: {},
  play: (ctx: ActionContext) => {
    for (let i = 0; i < 3; i++) {
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon('AT_063t');
      summonAction.trigger(ctx.source);
    }
  },
});

// AT_060 - Webspinner - Deathrattle: Add a random Beast to your hand
cardScriptsRegistry.register('AT_060', {
  deathrattle: (ctx: ActionContext) => {
    // In a full implementation, this would add a random Beast to hand
    console.log('Webspinner: Add random Beast to hand');
  },
});
