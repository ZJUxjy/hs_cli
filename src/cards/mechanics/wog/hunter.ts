// wog - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon } from '../../../actions';

// OG_179 - Infested Wolf - Deathrattle: Summon two 1/1 Spiders
cardScriptsRegistry.register('OG_179', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summonAction1 = new Summon(source, 'OG_179t');
    summonAction1.trigger(source);
    const summonAction2 = new Summon(source, 'OG_179t');
    summonAction2.trigger(source);
  },
});

// OG_292 - Forlorn Stalker - Battlecry: Give all minions in your hand +1 Attack
cardScriptsRegistry.register('OG_292', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    for (const card of hand) {
      if ((card as any).type === 'MINION') {
        const buff = new Buff(source, card, { ATK: 1 });
        buff.trigger(source);
      }
    }
  },
});

// OG_216 - Giant Sand Worm - Whenever this attacks and kills a minion, it can attack again
cardScriptsRegistry.register('OG_216', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_309 - Abyssal Enforcer - Battlecry: Deal 3 damage to all other characters
cardScriptsRegistry.register('OG_309', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    // Deal 3 damage to all other characters
    const myField = controller.field || [];
    const oppField = opponent?.field || [];
    for (const minion of [...myField, ...oppField]) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 3);
        damage.trigger(source);
      }
    }
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 3);
      damage.trigger(source);
    }
  },
});

// OG_308 - Jeweled Scarab - Battlecry: Discover a 2-cost minion
cardScriptsRegistry.register('OG_308', {
  events: {
  },
});

// OG_045 - Bearshark - Can't be targeted by spells or Hero Powers
cardScriptsRegistry.register('OG_045', {
  play: (ctx: ActionContext) => {
  },
});

// OG_045a - PTR Block - Battlecry: Destroy all Beasts
cardScriptsRegistry.register('OG_045a', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_061 - Infest - Give your minions Deathrattle: Summon a random Beast
cardScriptsRegistry.register('OG_061', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// OG_211 - Onyx Bishop - Battlecry: Summon a friendly minion that died this game
cardScriptsRegistry.register('OG_211', {
  play: (ctx: ActionContext) => {
  },
});
