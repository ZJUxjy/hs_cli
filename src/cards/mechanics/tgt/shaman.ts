// tgt - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage } from '../../../actions';

// AT_046 - Totem Golem - Deathrattle: Summon a 1/1 Boulderfist
cardScriptsRegistry.register('AT_046', {
  play: (ctx: ActionContext) => {
    // Summon 1/1 Boulderfist on death - handled by game
  },
});

// AT_047 - Draenei Totemcarver - Battlecry: Give your other Totems +2/+2
cardScriptsRegistry.register('AT_047', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source && (minion as any).race === 'TOTEM') {
        const buff = new Buff(source, minion, { ATK: 2, HEALTH: 2 });
        buff.trigger(source);
      }
    }
  },
});

// AT_049 - Unstable Elemental - Battlecry: Draw a card. If it's a minion, reduce its Cost by (2)
cardScriptsRegistry.register('AT_049', {
});

// AT_054 - Lava Shock - Deal 2 damage. Unlock your Frozen mana crystals
cardScriptsRegistry.register('AT_054', {
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 2);
      damage.trigger(ctx.source);
    }
    // Unlock Frozen mana crystals - handled by game
  },
});

// AT_048 - Lava Burst - Deal 5 damage
cardScriptsRegistry.register('AT_048', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 5);
      damage.trigger(ctx.source);
    }
  },
});

// AT_051 - Elemental Destruction - Deal 4 damage to all minions. Overload: (5)
cardScriptsRegistry.register('AT_051', {
  play: (ctx: ActionContext) => {
    // Deal 4 damage to all minions - handled by game
  },
});

// AT_053 - Thunder Bluff Valiant - Inspire: Give your other Totems +1 Attack
cardScriptsRegistry.register('AT_053', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source && (minion as any).race === 'TOTEM') {
        const buff = new Buff(source, minion, { ATK: 1 });
        buff.trigger(source);
      }
    }
  },
});

// AT_050 - Reno Jackson - Battlecry: If your deck has no duplicates, restore 10 Health
cardScriptsRegistry.register('AT_050', {
  deathrattle: (ctx: ActionContext) => {
    // Return to hand - handled by game
  },
});

// AT_050t - Elise Starseeker - Battlecry: Add 'Elise Bane' to your hand
cardScriptsRegistry.register('AT_050t', {
});
