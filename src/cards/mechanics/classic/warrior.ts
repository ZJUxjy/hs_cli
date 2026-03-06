// Classic Warrior Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';
import { Destroy } from '../../../actions/destroy';
import { GainArmor } from '../../../actions/gainarmor';

// Import selectors
import { PlayReq } from '../../../enums/playreq';

// === Minions ===

// Arathi Weaponsmith - Battlecry: Summon a 2/2 Offhand Weapon
cardScriptsRegistry.register('EX1_398', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'EX1_398t');
    summon.trigger(ctx.source);
  },
});

// EX1_398t - Battle Axe
cardScriptsRegistry.register('EX1_398t', {});

// Armorsmith - Whenever a friendly minion takes damage, gain 1 Armor
cardScriptsRegistry.register('EX1_402', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.target) {
        const controller = (ctx.source as any).controller;
        if (controller?.hero) {
          const armor = new GainArmor(ctx.source, controller.hero, 1);
          armor.trigger(ctx.source);
        }
      }
    },
  },
});

// Grommash Hellscream - Enrage: +6 Attack
cardScriptsRegistry.register('EX1_414', {
  // Enrage mechanic
});

// EX1_414e - Grommash enrage buff
cardScriptsRegistry.register('EX1_414e', {});

// Cruel Taskmaster - Battlecry: Deal 1 damage to a minion and give it +2 Attack
cardScriptsRegistry.register('EX1_603', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IS_NOT_SELF]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2 });
      buff.trigger(ctx.source);
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
    }
  },
});

// EX1_603e - Cruel Taskmaster buff
cardScriptsRegistry.register('EX1_603e', {});

// Frothing Berserker - Whenever a minion takes damage, gain +1 Attack
cardScriptsRegistry.register('EX1_604', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 1 });
      buff.trigger(ctx.source);
    },
  },
});

// EX1_604o - Frothing Berserker buff
cardScriptsRegistry.register('EX1_604o', {});

// === Spells ===

// Charge - Give a friendly minion +2 Attack and Charge this turn
cardScriptsRegistry.register('CS2_103', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // This is a temporary buff - would need implementation
    }
  },
});

// CS2_103e - Charge buff
cardScriptsRegistry.register('CS2_103e', {});

// Rampage - Give a damaged minion +3/+3
cardScriptsRegistry.register('CS2_104', {
  requirements: {
    [PlayReq.REQ_DAMAGED_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if ((target.damage || 0) > 0) {
        const buff = new Buff(ctx.source, ctx.target, { ATK: 3, HEALTH: 3 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// CS2_104e - Rampage buff
cardScriptsRegistry.register('CS2_104e', {});

// Heroic Strike - Give your hero +4 Attack this turn
cardScriptsRegistry.register('CS2_105', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const buff = new Buff(ctx.source, controller.hero, { ATK: 4 });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_105e - Heroic Strike buff
cardScriptsRegistry.register('CS2_105e', {});

// Execute - Destroy a damaged enemy minion
cardScriptsRegistry.register('CS2_108', {
  requirements: {
    [PlayReq.REQ_DAMAGED_TARGET]: 0,
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if ((target.damage || 0) > 0) {
        const destroy = new Destroy();
        destroy.trigger(ctx.source, ctx.target);
      }
    }
  },
});

// Cleave - Deal 2 damage to two random enemy minions
cardScriptsRegistry.register('CS2_114', {
  requirements: { [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1 },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    const field = opponent?.field || [];
    if (field.length > 0) {
      const shuffled = [...field].sort(() => Math.random() - 0.5);
      const targets = shuffled.slice(0, 2);
      for (const target of targets) {
        const dmg = new Damage(ctx.source, target, 2);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Slam - Deal 2 damage to a minion. If it survives, draw a card.
cardScriptsRegistry.register('EX1_391', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
      // If survives, draw - would need to check if destroyed
    }
  },
});

// Battle Rage - Draw a card for each damaged friendly character
cardScriptsRegistry.register('EX1_392', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0 },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    let damagedCount = 0;
    for (const minion of field) {
      if ((minion as any).damage > 0) damagedCount++;
    }
    if ((controller?.hero as any)?.damage > 0) damagedCount++;
    for (let i = 0; i < damagedCount; i++) {
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    }
  },
});

// Whirlwind - Deal 1 damage to all minions
cardScriptsRegistry.register('EX1_400', {
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = (game as any).player1?.field || [];
      const p2Field = (game as any).player2?.field || [];
      for (const minion of [...p1Field, ...p2Field]) {
        const dmg = new Damage(ctx.source, minion, 1);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Brawl - Destroy all minions except one random one
cardScriptsRegistry.register('EX1_407', {
  requirements: { [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1 },
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = [...((game as any).player1?.field || [])];
      const p2Field = [...((game as any).player2?.field || [])];
      const allMinions = [...p1Field, ...p2Field];
      if (allMinions.length >= 2) {
        // Keep one random minion alive, destroy the rest
        const shuffled = allMinions.sort(() => Math.random() - 0.5);
        // Destroy all except the first one (survivor)
        for (const minion of shuffled.slice(1)) {
          const destroy = new Destroy();
          destroy.trigger(ctx.source, minion);
        }
      }
    }
  },
});

// Mortal Strike - Deal 4 damage. If your hero has 12 or less Health, deal 6 instead.
cardScriptsRegistry.register('EX1_408', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const hero = controller?.hero;
      const health = (hero as any)?.health || 30;
      const damage = health <= 12 ? 6 : 4;
      const dmg = new Damage(ctx.source, ctx.target, damage);
      dmg.trigger(ctx.source);
    }
  },
});

// Upgrade! - If you have a weapon, give it +1/+1. Otherwise, summon a 1/3 weapon.
cardScriptsRegistry.register('EX1_409', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.weapon) {
      const buff = new Buff(ctx.source, controller.weapon, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    } else {
      const summon = new Summon(ctx.source, 'EX1_409t');
      summon.trigger(ctx.source);
    }
  },
});

// EX1_409t - Heavy Axe
cardScriptsRegistry.register('EX1_409t', {});

// Shield Slam - Deal 1 damage to a minion for each Armor your hero has
cardScriptsRegistry.register('EX1_410', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const hero = controller?.hero;
      const armor = (hero as any)?.armor || 0;
      const dmg = new Damage(ctx.source, ctx.target, armor);
      dmg.trigger(ctx.source);
    }
  },
});

// Shield Block - Gain 5 Armor and draw a card
cardScriptsRegistry.register('EX1_606', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const armor = new GainArmor(ctx.source, controller.hero, 5);
      armor.trigger(ctx.source);
    }
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// Inner Rage - Deal 1 damage to a minion and give it +2 Attack
cardScriptsRegistry.register('EX1_607', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2 });
      buff.trigger(ctx.source);
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
    }
  },
});

// EX1_607e - Inner Rage buff
cardScriptsRegistry.register('EX1_607e', {});

// Commanding Shout - Your minions can't be reduced below 1 Health this turn
cardScriptsRegistry.register('NEW1_036', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      (minion as any).cannotBeReducedBelow1Health = true;
    }
  },
});

// NEW1_036e - Commanding Shout buff
cardScriptsRegistry.register('NEW1_036e', {});

// Warsong Commander - Your minions with Charge have +1 Attack
cardScriptsRegistry.register('EX1_084', {
  // Aura: Friendly minions with charge get +1 attack
});

// EX1_084e - Warsong Commander buff
cardScriptsRegistry.register('EX1_084e', {});

// === Weapons ===

// Gorehowl - Attack. After attacking a minion, gain +1 Attack
cardScriptsRegistry.register('EX1_411', {
  events: {
    ATTACK: (ctx: ActionContext) => {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 1 });
      buff.trigger(ctx.source);
    },
  },
});

// EX1_411e - Gorehowl buff (immune)
cardScriptsRegistry.register('EX1_411e', {});

// EX1_411e2 - Gorehowl attack penalty
cardScriptsRegistry.register('EX1_411e2', {});

console.log('[Classic Warrior] Registered card scripts');
