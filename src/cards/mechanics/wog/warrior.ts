// wog - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// OG_149 - Ravaging Ghoul - Battlecry: Deal 1 damage to all other minions.
cardScriptsRegistry.register('OG_149', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const myField = controller.field || [];
    const opponent = controller.opponent;
    const oppField = opponent?.field || [];

    // Deal 1 damage to all other minions
    for (const minion of [...myField, ...oppField]) {
      if (minion !== source) {
        const { Damage } = require('../../../actions/damage');
        const damage = new Damage(source, 1);
        damage.trigger(source, minion);
      }
    }
  },
});

// OG_218
cardScriptsRegistry.register('OG_218', {
});

// OG_220 - Malkorok - Battlecry: Equip a random weapon.
cardScriptsRegistry.register('OG_220', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Equip a random weapon - simplified
    // In full implementation, would select from a list of random weapons
  },
});

// OG_312 - N'Zoth's First Mate - Battlecry: Equip a 1/3 Rusty Hook.
cardScriptsRegistry.register('OG_312', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Equip a 1/3 Rusty Hook - simplified
    // In full implementation, would create and equip the weapon
  },
});

// OG_315 - Bloodsail Cultist - Battlecry: If you control another Pirate, give your weapon +1/+1.
cardScriptsRegistry.register('OG_315', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];

    // Check if controlling another Pirate
    const otherPirates = field.filter((m: any) => m !== source && m.race === 'PIRATE');
    if (otherPirates.length > 0 && controller.weapon) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff(source, 'OG_315e');
      buff.apply(controller.weapon);
    }
  },
});

// OG_301 - Ancient Shieldbearer - Battlecry: If your C'Thun has at least 10 Attack, gain 10 Armor.
cardScriptsRegistry.register('OG_301', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Check C'Thun attack - simplified
    // In full implementation, would check actual C'Thun minion attack
    const { GainArmor } = require('../../../actions/gainarmor');
    const gainArmor = new GainArmor(controller, 10);
    gainArmor.trigger(source);
  },
});

// OG_276 - Blood Warriors - Add a copy of each damaged friendly minion to your hand.
cardScriptsRegistry.register('OG_276', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];

    // Find damaged friendly minions
    const damagedMinions = field.filter((m: any) => (m.health || 0) < (m.maxHealth || m.health || 0));

    // Add a copy of each to hand
    const { Give } = require('../../../actions/give');
    for (const minion of damagedMinions) {
      const give = new Give(controller, minion.cardId);
      give.trigger(source);
    }
  },
});

// OG_314 - Blood To Ichor - Deal $1 damage to a minion. If it survives, summon a 2/2 Slime.
cardScriptsRegistry.register('OG_314', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: true,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;

    // Deal 1 damage
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(source, 1);
    damage.trigger(source, target);

    // If survives, summon 2/2 Slime - simplified, check after damage
    const targetHealth = (target.health || 0) - 1;
    if (targetHealth > 0) {
      const { Summon } = require('../../../actions/summon');
      const summon = new Summon(source, 'OG_314t');
      summon.trigger(source);
    }
  },
});

// OG_033 - Tentacles for Arms - Deathrattle: Return this to your hand.
cardScriptsRegistry.register('OG_033', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Return this weapon to hand
    const { Give } = require('../../../actions/give');
    const give = new Give(controller, 'OG_033');
    give.trigger(source);
  },
});
