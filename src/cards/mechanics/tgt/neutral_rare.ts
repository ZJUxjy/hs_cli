// tgt - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Heal, Give, Draw } from '../../../actions';

// AT_086 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('AT_086', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
  },
});

// AT_086e - Shudderwraith buff
cardScriptsRegistry.register('AT_086e', {
  events: {
    // Gains +2/+2 when you have 4 other minions - handled by game
  },
});

// AT_088 - Nexus-Champion Saraad - Inspire: Add a random spell to your hand
cardScriptsRegistry.register('AT_088', {
  events: {
    // Add random spell to hand - handled by game
  },
});

// AT_105 - Evil Heckler - Taunt
cardScriptsRegistry.register('AT_105', {
  play: (ctx: ActionContext) => {
    // Has Taunt - handled by game
  },
});

// AT_106 - Tournament Attendee - Battlecry: Give a friendly minion Taunt
cardScriptsRegistry.register('AT_106', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).taunt = true;
    }
  },
});

// AT_108 - Captured Jormungar - Battlecry: Deal 2 damage to your hero
cardScriptsRegistry.register('AT_108', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hero = controller.hero;
    const damage = new Damage(source, hero, 2);
    damage.trigger(source);
  },
});

// AT_109 - North Sea Kraken - Battlecry: Deal 3 damage
cardScriptsRegistry.register('AT_109', {
});

// AT_110 - Kvaldir Raider - Battlecry: Gain +2/+2 for each - Attack you control
cardScriptsRegistry.register('AT_110', {
});

// AT_112 - Frigid Snobold - Battlecry: Deal 2 damage
cardScriptsRegistry.register('AT_112', {
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// AT_115 - Bronze Whelp - Battlecry: Give your Dragons +1 Attack
cardScriptsRegistry.register('AT_115', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if ((minion as any).race === 'DRAGON') {
        const buff = new Buff(source, minion, { ATK: 1 });
        buff.trigger(source);
      }
    }
  },
});

// AT_115e - Bronze Whelp buff
cardScriptsRegistry.register('AT_115e', {
  events: {
    // Dragons have +1 Attack - handled by game
  },
});
