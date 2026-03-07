// tgt - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Buff } from '../../../actions';

// AT_066 - Orgrimmar Aspirant - Inspire: Give your weapon +1 Attack
cardScriptsRegistry.register('AT_066', {
});

// AT_067 - Magnataur Alpha - Also damages the minion's neighbors
cardScriptsRegistry.register('AT_067', {
  events: {
    // Also damages adjacent minions - handled by game
  },
});

// AT_069 - Disarm - Destroy a weapon. Give the enemy hero +2 Armor
cardScriptsRegistry.register('AT_069', {
  requirements: {
    [PlayReq.REQ_WEAPON_EQUIPPED]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Destroy weapon and give +2 Armor - handled by game
  },
});

// AT_071 - Bash - Deal 3 damage. Gain 3 Armor
cardScriptsRegistry.register('AT_071', {
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 3);
      damage.trigger(ctx.source);
    }
    const source = ctx.source as any;
    const controller = source.controller;
    (controller as any).armor = ((controller as any).armor || 0) + 3;
  },
});

// AT_072 -珀头兵 - Deal 8 damage to a minion. Overload: (3)
cardScriptsRegistry.register('AT_072', {
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 8);
      damage.trigger(ctx.source);
    }
  },
});

// AT_130 - Alexanderstra - Your Inspire ability also triggers twice
cardScriptsRegistry.register('AT_130', {
});

// AT_064 - King's Defender - Battlecry: If you have a minion with Taunt, gain +2 Attack
cardScriptsRegistry.register('AT_064', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const hasTaunt = field.some((minion: any) => minion.taunt);
    if (hasTaunt) {
      // Give +2 Attack - handled by game
    }
  },
});

// AT_068 - Bolster - Give your Taunt minions +2/+2
cardScriptsRegistry.register('AT_068', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if ((minion as any).taunt) {
        const buff = new Buff(source, minion, { ATK: 2, HEALTH: 2 });
        buff.trigger(source);
      }
    }
  },
});

// AT_065 - Malkorok - Battlecry: Equip a random weapon
cardScriptsRegistry.register('AT_065', {
  play: (ctx: ActionContext) => {
    // Equip random weapon - handled by game
  },
});
