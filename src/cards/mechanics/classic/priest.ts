// classic - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CS2_235 - Northshire Cleric
cardScriptsRegistry.register('CS2_235', {
  events: {
    // TODO: implement events - heal triggers draw
  },
});

// EX1_091 - Cabal Shadow Priest
cardScriptsRegistry.register('EX1_091', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 2,
  },
  play: (ctx: ActionContext) => {
    // Take control of enemy minion with 2 or less Attack
    const target = ctx.target as any;
    const controller = (ctx.source as any).controller;
    const opponent = (target as any).controller;

    // Remove from opponent's field
    if (opponent.field) {
      opponent.field = opponent.field.filter((m: any) => m !== target);
    }

    // Add to controller's field
    if (controller.field) {
      controller.field.push(target);
    }
    target.controller = controller;
  },
});

// EX1_335 - Lightwell
cardScriptsRegistry.register('EX1_335', {
});

// EX1_341 - Lightspawn
cardScriptsRegistry.register('EX1_341', {
});

// EX1_350 - Thoughtsteal
cardScriptsRegistry.register('EX1_350', {
});

// EX1_591 - Mindgames
cardScriptsRegistry.register('EX1_591', {
});

// EX1_623 - Shadow Word: Death
cardScriptsRegistry.register('EX1_623', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_MIN_ATTACK]: 5,
  },
  play: (ctx: ActionContext) => {
    // Destroy target minion with 5 or more Attack
    (ctx.target as any).destroyed = true;
  },
});

// EX1_193 - Shadow Word: Pain
cardScriptsRegistry.register('EX1_193', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 3,
  },
  play: (ctx: ActionContext) => {
    // Destroy target minion with 3 or less Attack
    (ctx.target as any).destroyed = true;
  },
});

// EX1_195 - Lightwarden
cardScriptsRegistry.register('EX1_195', {
  events: {
    // TODO: implement events - gain attack when healed
  },
});

// EX1_196 - Shadowboxer
cardScriptsRegistry.register('EX1_196', {
  events: {
    // TODO: implement events - deal 1 damage when a minion is healed
  },
});

// EX1_196e - Shadowboxer Enchantment
cardScriptsRegistry.register('EX1_196e', {
});

// EX1_198 - Temple Enforcer
cardScriptsRegistry.register('EX1_198', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target +3/+6
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('EX1_198e', { ATK: 3, HEALTH: 6 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_004 - Holy Nova
cardScriptsRegistry.register('CS2_004', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage to all enemies, restore 2 health to all friendly minions
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Deal 2 damage to enemy minions
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const { Damage } = require('../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, minion);
    }

    // Heal friendly minions for 2
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const { Heal } = require('../actions/heal');
      const healAction = new Heal(2);
      healAction.trigger(ctx.source, minion);
    }
  },
});

// CS1_112 - Holy Smite
cardScriptsRegistry.register('CS1_112', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 3 damage
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(3);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS1_113 - Mind Blast
cardScriptsRegistry.register('CS1_113', {
  play: (ctx: ActionContext) => {
    // Deal 5 damage to enemy hero
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(5);
    damageAction.trigger(ctx.source, opponent.hero);
  },
});

// CS1_129 - Shadow Madness
cardScriptsRegistry.register('CS1_129', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 3,
  },
  play: (ctx: ActionContext) => {
    // Take control of enemy minion with 3 or less Attack until end of turn
    const target = ctx.target as any;
    const controller = (ctx.source as any).controller;
    const opponent = (target as any).controller;

    // Remove from opponent's field
    if (opponent.field) {
      opponent.field = opponent.field.filter((m: any) => m !== target);
    }

    // Add to controller's field
    if (controller.field) {
      controller.field.push(target);
    }
    target.controller = controller;

    // Store to return control at end of turn
    (target as any).originalController = opponent;
  },
});

// CS1_129e - Shadow Madness Enchantment
cardScriptsRegistry.register('CS1_129e', {
});

// CS1_130 - Cabal Shadow Priest
cardScriptsRegistry.register('CS1_130', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(2);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_003 - Mind Vision
cardScriptsRegistry.register('CS2_003', {
  play: (ctx: ActionContext) => {
    // Put a copy of a random card from opponent's hand into your hand
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const opponentHand = opponent.hand || [];

    if (opponentHand.length > 0) {
      const randomIndex = Math.floor(Math.random() * opponentHand.length);
      const randomCard = opponentHand[randomIndex];

      // Add copy to controller's hand
      if (controller.hand) {
        controller.hand.push({ ...randomCard });
      }
    }
  },
});

// CS2_234 - Shadow Word: Pain - Destroy a minion with 3 or less Attack
cardScriptsRegistry.register('CS2_234', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if ((target.attack || 0) <= 3) {
        const { Destroy } = require('../../../actions/destroy');
        const destroyAction = new Destroy();
        destroyAction.trigger(ctx.source, target);
      }
    }
  },
});

// CS2_236 - Divine Spirit - Double a minion's Health
cardScriptsRegistry.register('CS2_236', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const currentHealth = target.health || 1;
      const maxHealth = target.maxHealth || currentHealth;
      target.maxHealth = maxHealth * 2;
      target.health = currentHealth * 2;
    }
  },
});

// DS1_233 - Mind Blast - Deal 5 damage to the enemy hero
cardScriptsRegistry.register('DS1_233', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const hero = opponent.hero;
    if (hero) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(5);
      damageAction.trigger(ctx.source, hero);
    }
  },
});

// EX1_332 - Silence - Silence a minion
cardScriptsRegistry.register('EX1_332', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Silence } = require('../../../actions/silence');
      const silenceAction = new Silence();
      silenceAction.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_334 - Shadow Madness - Gain control of an enemy minion with 3 or less Attack
cardScriptsRegistry.register('EX1_334', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if ((target.attack || 0) <= 3) {
        const controller = (ctx.source as any).controller;
        const opponent = controller.opponent;
        // Take control of the minion
        target.controller = controller;
        // Move to friendly field
        const { Remove } = require('../../../actions/remove');
        const removeAction = new Remove();
        removeAction.trigger(ctx.source, target);
        const { PutOnBoard } = require('../../../actions/putonboard');
        const putAction = new PutOnBoard();
        putAction.trigger(ctx.source, target);
      }
    }
  },
});

// EX1_334e
cardScriptsRegistry.register('EX1_334e', {
});

// EX1_339 - Thoughtsteal - Copy 2 cards from your opponent's deck and put them into your hand
cardScriptsRegistry.register('EX1_339', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would copy cards from opponent's deck
    console.log('Thoughtsteal: Copy 2 cards from opponent deck');
  },
});

// EX1_345 - Mindgames - Put a copy of a random minion from your opponent's deck into the battlefield
cardScriptsRegistry.register('EX1_345', {
  requirements: {},
  play: (ctx: ActionContext) => {
    // In a full implementation, this would summon a random opponent minion
    console.log('Mindgames: Summon a random minion from opponent deck');
  },
});

// EX1_621 - Circle of Healing - Restore 4 Health to all minions
cardScriptsRegistry.register('EX1_621', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const { Heal } = require('../../../actions/heal');
      const healAction = new Heal(4);
      healAction.trigger(ctx.source, minion);
    }
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const { Heal } = require('../../../actions/heal');
      const healAction = new Heal(4);
      healAction.trigger(ctx.source, minion);
    }
  },
});

// EX1_622 - Shadow Word: Death - Destroy a minion with 5 or more Attack
cardScriptsRegistry.register('EX1_622', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if ((target.attack || 0) >= 5) {
        const { Destroy } = require('../../../actions/destroy');
        const destroyAction = new Destroy();
        destroyAction.trigger(ctx.source, target);
      }
    }
  },
});

// EX1_624 - Holy Fire - Deal 5 damage. Restore 5 Health to your hero
cardScriptsRegistry.register('EX1_624', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(5);
      damageAction.trigger(ctx.source, ctx.target);
    }
    const controller = (ctx.source as any).controller;
    const hero = controller.hero;
    if (hero) {
      const { Heal } = require('../../../actions/heal');
      const healAction = new Heal(5);
      healAction.trigger(ctx.source, hero);
    }
  },
});

// EX1_625 - Shadowform - Your Hero Power becomes "Deal 2 damage"
cardScriptsRegistry.register('EX1_625', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would change the hero power
  },
});

// EX1_625t - Shadowform Hero Power
cardScriptsRegistry.register('EX1_625t', {
});

// EX1_625t2 - Shadowform Hero Power
cardScriptsRegistry.register('EX1_625t2', {
});

// EX1_626 - Mass Dispel - Silence all enemy minions, draw a card
cardScriptsRegistry.register('EX1_626', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const { Silence } = require('../../../actions/silence');
      const silenceAction = new Silence();
      silenceAction.trigger(ctx.source, minion);
    }
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// EX1_192 - Shadow Word: Ruin - Destroy all minions with 3 or less Attack
cardScriptsRegistry.register('EX1_192', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      if ((minion.attack || 0) <= 3) {
        const { Destroy } = require('../../../actions/destroy');
        const destroyAction = new Destroy();
        destroyAction.trigger(ctx.source, minion);
      }
    }
  },
});

// EX1_194 - Temple Enforcer - Battlecry: Give a friendly minion +3 Health
cardScriptsRegistry.register('EX1_194', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('EX1_194e', { HEALTH: 3 });
      buffAction.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_197
cardScriptsRegistry.register('EX1_197', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
