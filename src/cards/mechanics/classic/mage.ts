// classic - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CS2_033 - Sorcerer's Apprentice
cardScriptsRegistry.register('CS2_033', {
  events: {
    // TODO: implement events - your spells cost 1 less
  },
});

// EX1_274 - Kirin Tor Mage
cardScriptsRegistry.register('EX1_274', {
  events: {
    // TODO: implement events - spells cost 1 less
  },
});

// EX1_559 - Mana Wyrm
cardScriptsRegistry.register('EX1_559', {
  events: {
    // TODO: implement events - gain +1 attack when you cast a spell
  },
});

// EX1_608 - Sorcerer's Apprentice
cardScriptsRegistry.register('EX1_608', {
});

// EX1_612 - Teleport
cardScriptsRegistry.register('EX1_612', {
  play: (ctx: ActionContext) => {
    // Return a friendly minion to your hand
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];

    if (friendlyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * friendlyMinions.length);
      const target = friendlyMinions[randomIndex];
      target.zone = 'HAND';
      // Remove from field
      controller.field = controller.field.filter((m: any) => m !== target);
    }
  },
});

// EX1_612o - Teleport Enchantment
cardScriptsRegistry.register('EX1_612o', {
  events: {
    // TODO: implement events
  },
});

// NEW1_012 - Flame Leviathan
cardScriptsRegistry.register('NEW1_012', {
  events: {
    // TODO: implement events
  },
});

// CS2_022 - Polymorph
cardScriptsRegistry.register('CS2_022', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Transform target into a 1/1 Sheep
    const { Morph } = require('../actions/morph');
    const morphAction = new Morph('CS2_tk1');
    morphAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_023 - Arcane Intellect
cardScriptsRegistry.register('CS2_023', {
  play: (ctx: ActionContext) => {
    // Draw 2 cards
    const { Draw } = require('../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// CS2_024 - Frost Nova
cardScriptsRegistry.register('CS2_024', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Freeze all enemy minions
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    for (const minion of enemyMinions) {
      (minion as any).frozen = true;
    }
  },
});

// CS2_025 - Fireball
cardScriptsRegistry.register('CS2_025', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 6 damage
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(6);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_026 - Flamestrike
cardScriptsRegistry.register('CS2_026', {
  play: (ctx: ActionContext) => {
    // Deal 4 damage to all enemy minions
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    for (const minion of enemyMinions) {
      const { Damage } = require('../actions/damage');
      const damageAction = new Damage(4);
      damageAction.trigger(ctx.source, minion);
    }
  },
});

// CS2_027 - Mirror Entity
cardScriptsRegistry.register('CS2_027', {
  play: (ctx: ActionContext) => {
    // Secret: When your opponent plays a minion, summon a copy of it
  },
});

// CS2_028 - Ice Block
cardScriptsRegistry.register('CS2_028', {
  play: (ctx: ActionContext) => {
    // Secret: When your hero takes lethal damage, prevent it and become Immune this turn
  },
});

// CS2_029 - Vaporize
cardScriptsRegistry.register('CS2_029', {
  play: (ctx: ActionContext) => {
    // Secret: When your opponent plays a minion, destroy it
  },
});

// CS2_031 - Cone of Cold
cardScriptsRegistry.register('CS2_031', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Freeze target and adjacent minions, deal 1 damage
    const target = ctx.target as any;
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(1);
    damageAction.trigger(ctx.source, target);

    // Freeze target
    target.frozen = true;
  },
});

// CS2_032 - Firelands Portal
cardScriptsRegistry.register('CS2_032', {
  play: (ctx: ActionContext) => {
    // Deal 5 damage, add 2/2 elemental to hand
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(5);
    damageAction.trigger(ctx.source, ctx.target!);

    // Draw a card
    const { Draw } = require('../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(ctx.source);
  },
});

// EX1_275 - Cone of Cold
cardScriptsRegistry.register('EX1_275', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Freeze target
    const target = ctx.target as any;
    target.frozen = true;
  },
});

// EX1_277 - Pyroblast
cardScriptsRegistry.register('EX1_277', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 10 damage
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(10);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_279 - Blizzard
cardScriptsRegistry.register('EX1_279', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage to all enemy minions and Freeze them
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    for (const minion of enemyMinions) {
      const { Damage } = require('../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, minion);
      (minion as any).frozen = true;
    }
  },
});

// tt_010 - Spellbender
cardScriptsRegistry.register('tt_010', {
});

// EX1_287 - Counterspell
cardScriptsRegistry.register('EX1_287', {
});

// EX1_289
cardScriptsRegistry.register('EX1_289', {
});

// EX1_294
cardScriptsRegistry.register('EX1_294', {
});

// EX1_295
cardScriptsRegistry.register('EX1_295', {
});

// EX1_594
cardScriptsRegistry.register('EX1_594', {
});

// EX1_179
cardScriptsRegistry.register('EX1_179', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_180
cardScriptsRegistry.register('EX1_180', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
