// Classic Rogue Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';
import { Destroy } from '../../../actions/destroy';

// Import selectors
import { PlayReq } from '../../../enums/playreq';

// === Minions ===

// Defias Ringleader - Combo: Summon a 2/1 Defias Bandit
cardScriptsRegistry.register('EX1_131', {
  combo: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'EX1_131t');
    summon.trigger(ctx.source);
  },
});

// EX1_131t - Defias Bandit
cardScriptsRegistry.register('EX1_131t', {});

// SI:7 Agent - Combo: Deal 2 damage
cardScriptsRegistry.register('EX1_134', {
  requirements: { [PlayReq.REQ_TARGET_FOR_COMBO]: 0 },
  combo: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
    }
  },
});

// Edwin VanCleef - Combo: Gain +2/+2 for each other card played this turn
cardScriptsRegistry.register('EX1_613', {
  combo: (ctx: ActionContext) => {
    // Would calculate cards played this turn
  },
});

// EX1_613e - Edwin VanCleef buff
cardScriptsRegistry.register('EX1_613e', {});

// Kidnapper - Combo: Return a minion to its owner's hand
cardScriptsRegistry.register('NEW1_005', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_FOR_COMBO]: 0 },
  combo: (ctx: ActionContext) => {
    // Would bounce minion to hand
  },
});

// Master of Disguise - Combo: Give a friendly minion Stealth
cardScriptsRegistry.register('NEW1_014', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IS_NOT_SELF]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  combo: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).stealthed = true;
    }
  },
});

// NEW1_014e - Disguised buff
cardScriptsRegistry.register('NEW1_014e', {});

// === Spells ===

// Backstab - Deal 2 damage to an undamaged minion
cardScriptsRegistry.register('CS2_072', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_UNDAMAGED_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
    }
  },
});

// Cold Blood - Give a minion +2 Attack. Combo: +4 instead
cardScriptsRegistry.register('CS2_073', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2 });
      buff.trigger(ctx.source);
    }
  },
  combo: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 4 });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_073e - Cold Blood buff
cardScriptsRegistry.register('CS2_073e', {});

// CS2_073e2 - Cold Blood combo buff
cardScriptsRegistry.register('CS2_073e2', {});

// Deadly Poison - Give your weapon +2 Attack
cardScriptsRegistry.register('CS2_074', {
  requirements: { [PlayReq.REQ_WEAPON_EQUIPPED]: 0 },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.weapon) {
      const buff = new Buff(ctx.source, controller.weapon, { ATK: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_074e - Deadly Poison buff
cardScriptsRegistry.register('CS2_074e', {});

// Sinister Strike - Deal 3 damage to the enemy hero
cardScriptsRegistry.register('CS2_075', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const dmg = new Damage(ctx.source, opponent.hero, 3);
      dmg.trigger(ctx.source);
    }
  },
});

// Assassinate - Destroy an enemy minion
cardScriptsRegistry.register('CS2_076', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);
    }
  },
});

// Sprint - Draw 4 cards
cardScriptsRegistry.register('CS2_077', {
  play: (ctx: ActionContext) => {
    const draw1 = new Draw(ctx.source, 1);
    const draw2 = new Draw(ctx.source, 1);
    const draw3 = new Draw(ctx.source, 1);
    const draw4 = new Draw(ctx.source, 1);
    draw1.trigger(ctx.source);
    draw2.trigger(ctx.source);
    draw3.trigger(ctx.source);
    draw4.trigger(ctx.source);
  },
});

// Blade Flurry - Destroy your weapon and deal its damage to all enemies
cardScriptsRegistry.register('CS2_233', {
  requirements: { [PlayReq.REQ_WEAPON_EQUIPPED]: 0 },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const weapon = controller?.weapon;
    const attack = (weapon as any)?.attack || 0;
    const opponent = controller?.opponent;

    // Deal damage to all enemies
    if (opponent?.hero && attack > 0) {
      const dmg = new Damage(ctx.source, opponent.hero, attack);
      dmg.trigger(ctx.source);
    }
    if (opponent?.field) {
      for (const minion of opponent.field) {
        const dmg = new Damage(ctx.source, minion, attack);
        dmg.trigger(ctx.source);
      }
    }

    // Destroy weapon
    if (weapon) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, weapon);
    }
  },
});

// Eviscerate - Deal 2 damage. Combo: 4 instead
cardScriptsRegistry.register('EX1_124', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
    }
  },
  combo: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 4);
      dmg.trigger(ctx.source);
    }
  },
});

// Betrayal - Deal a minion's damage to its neighbors
cardScriptsRegistry.register('EX1_126', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Would deal attack damage to adjacent minions
  },
});

// Conceal - Give your minions Stealth until your next turn
cardScriptsRegistry.register('EX1_128', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      (minion as any).stealthed = true;
    }
  },
});

// EX1_128e - Conceal buff
cardScriptsRegistry.register('EX1_128e', {});

// Fan of Knives - Deal 1 damage to all enemies and draw a card
cardScriptsRegistry.register('EX1_129', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;

    // Damage all enemies
    if (opponent?.hero) {
      const dmg = new Damage(ctx.source, opponent.hero, 1);
      dmg.trigger(ctx.source);
    }
    if (opponent?.field) {
      for (const minion of opponent.field) {
        const dmg = new Damage(ctx.source, minion, 1);
        dmg.trigger(ctx.source);
      }
    }

    // Draw card
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// Headcrack - Deal 2 damage. Combo: Return this to your hand next turn
cardScriptsRegistry.register('EX1_137', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const dmg = new Damage(ctx.source, opponent.hero, 2);
      dmg.trigger(ctx.source);
    }
  },
  combo: (ctx: ActionContext) => {
    // Would return to hand at end of turn
  },
});

// Shadowstep - Return a minion to hand and reduce cost by 2
cardScriptsRegistry.register('EX1_144', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Would bounce to hand and reduce cost
  },
});

// EX1_144e - Shadowstep buff
cardScriptsRegistry.register('EX1_144e', {});

// Preparation - Next spell costs 2 less
cardScriptsRegistry.register('EX1_145', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    (controller as any).spellCostReduction = 2;
  },
});

// EX1_145o - Preparation buff
cardScriptsRegistry.register('EX1_145o', {});

// Shiv - Deal 1 damage and draw a card
cardScriptsRegistry.register('EX1_278', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
    }
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// Sap - Return an enemy minion to its owner's hand
cardScriptsRegistry.register('EX1_581', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Would bounce to hand
  },
});

// Vanish - Return all minions to owner's hand
cardScriptsRegistry.register('NEW1_004', {
  play: (ctx: ActionContext) => {
    // Would bounce all minions
  },
});

// === Weapons ===

// Perdition's Blade - Deal 1 damage. Combo: 2 instead
cardScriptsRegistry.register('EX1_133', {
  requirements: { [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
    }
  },
  combo: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
    }
  },
});

// Pilfer - Add a random card from another class to your hand
cardScriptsRegistry.register('EX1_182', {
  play: (_ctx: ActionContext) => {
    // Would add random card
  },
});

// Plaguebringer - Battlecry: Give a friendly minion Poisonous
cardScriptsRegistry.register('EX1_191', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).poisonous = true;
    }
  },
});

console.log('[Classic Rogue] Registered card scripts');
