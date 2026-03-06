// Classic Priest Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';
import { Heal } from '../../../actions/heal';
import { Destroy } from '../../../actions/destroy';
import { Silence } from '../../../actions/silence';

// Import selectors
import { PlayReq } from '../../../enums/playreq';

// === Minions ===

// Northshire Cleric - Whenever a character is healed, draw a card
cardScriptsRegistry.register('CS2_235', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      // Would need to track healing
    },
  },
});

// Cabal Shadow Priest - Battlecry: Take control of an enemy minion with 2 or less Attack
cardScriptsRegistry.register('EX1_091', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 2,
  },
  play: (ctx: ActionContext) => {
    // Would take control
  },
});

// Lightspawn - Attack always equals Health
cardScriptsRegistry.register('EX1_335', {});

// Lightwell - At the start of your turn, restore 3 Health to a damaged friendly character
cardScriptsRegistry.register('EX1_341', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const field = controller?.field || [];
      const damagedFriendly = field.filter((m: any) => (m as any).damage > 0);
      if (damagedFriendly.length > 0) {
        const target = damagedFriendly[Math.floor(Math.random() * damagedFriendly.length)];
        const heal = new Heal(ctx.source, target, 3);
        heal.trigger(ctx.source);
      }
    },
  },
});

// Prophet Velen - Double your healing, spell damage, and hero power
cardScriptsRegistry.register('EX1_350', {});

// Auchenai Soulpriest - Your healing is now damaging
cardScriptsRegistry.register('EX1_591', {});

// Temple Enforcer - Battlecry: Give a friendly minion +3 Health
cardScriptsRegistry.register('EX1_623', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { HEALTH: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_623e - Temple Enforcer buff
cardScriptsRegistry.register('EX1_623e', {});

// Psychic Conjurer - Battlecry: Copy a card from your opponent's deck
cardScriptsRegistry.register('EX1_193', {
  play: (_ctx: ActionContext) => {
    // Would copy card from enemy deck
  },
});

// Kul Tiran Chaplain - Battlecry: Give a friendly minion +2 Health
cardScriptsRegistry.register('EX1_195', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_195e - Kul Tiran Chaplain buff
cardScriptsRegistry.register('EX1_195e', {});

// Scarlet Subjugator - Battlecry: Give an enemy minion -2 Attack
cardScriptsRegistry.register('EX1_196', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.attack = Math.max(0, (target.attack || 0) - 2);
    }
  },
});

// EX1_196e - Scarlet Subjugator debuff
cardScriptsRegistry.register('EX1_196e', {});

// Natalie Seline - Battlecry: Destroy a minion and gain its Health
cardScriptsRegistry.register('EX1_198', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const health = target.health || target.maxHealth || 0;
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);
      const buff = new Buff(ctx.source, ctx.source, { HEALTH: health });
      buff.trigger(ctx.source);
    }
  },
});

// === Spells ===

// Power Word: Shield - Give a minion +2 Health
cardScriptsRegistry.register('CS2_004', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_004e - Power Word: Shield buff
cardScriptsRegistry.register('CS2_004e', {});

// Holy Nova - Deal 2 damage to all enemies and restore 2 Health to all friendly characters
cardScriptsRegistry.register('CS1_113', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;

    // Damage enemies
    if (opponent?.hero) {
      const dmg = new Damage(ctx.source, opponent.hero, 2);
      dmg.trigger(ctx.source);
    }
    if (opponent?.field) {
      for (const minion of opponent.field) {
        const dmg = new Damage(ctx.source, minion, 2);
        dmg.trigger(ctx.source);
      }
    }

    // Heal friendly
    if (controller?.hero) {
      const heal = new Heal(ctx.source, controller.hero, 2);
      heal.trigger(ctx.source);
    }
    if (controller?.field) {
      for (const minion of controller.field) {
        const heal = new Heal(ctx.source, minion, 2);
        heal.trigger(ctx.source);
      }
    }
  },
});

// Mind Control - Take control of an enemy minion
cardScriptsRegistry.register('CS1_129', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Would take control
  },
});

// Inner Fire - Change a minion's Attack to match its Health
cardScriptsRegistry.register('CS1_129', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.attack = target.health || target.maxHealth || 0;
    }
  },
});

// CS1_129e - Inner Fire buff
cardScriptsRegistry.register('CS1_129e', {});

// Holy Smite - Deal 3 damage
cardScriptsRegistry.register('CS1_130', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 3);
      dmg.trigger(ctx.source);
    }
  },
});

// Mind Vision - Copy a random card from opponent's hand
cardScriptsRegistry.register('CS2_234', {
  play: (_ctx: ActionContext) => {
    // Would copy from enemy hand
  },
});

// Shadow Word: Pain - Destroy a minion with 3 or less Attack
cardScriptsRegistry.register('CS2_234', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 3,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);
    }
  },
});

// Divine Spirit - Double a minion's Health
cardScriptsRegistry.register('CS2_236', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const maxHealth = target.maxHealth || target.health || 0;
      const buff = new Buff(ctx.source, ctx.target, { HEALTH: maxHealth });
      buff.trigger(ctx.source);
    }
  },
});

// Mind Blast - Deal 5 damage to the enemy hero
cardScriptsRegistry.register('DS1_233', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const dmg = new Damage(ctx.source, opponent.hero, 5);
      dmg.trigger(ctx.source);
    }
  },
});

// Silence - Silence a minion
cardScriptsRegistry.register('EX1_332', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const silence = new Silence(ctx.source, ctx.target);
      silence.trigger(ctx.source);
    }
  },
});

// Shadow Madness - Take control of an enemy minion until end of turn
cardScriptsRegistry.register('EX1_334', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 3,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Would take temporary control
  },
});

// EX1_334e - Shadow Madness buff
cardScriptsRegistry.register('EX1_334e', {});

// Thoughtsteal - Copy 2 cards from opponent's deck
cardScriptsRegistry.register('EX1_339', {
  play: (_ctx: ActionContext) => {
    // Would copy cards from enemy deck
  },
});

// Mindgames - Summon a random minion from opponent's deck or 0/4 Shadow
cardScriptsRegistry.register('EX1_345', {
  requirements: { [PlayReq.REQ_NUM_MINION_SLOTS]: 1 },
  play: (ctx: ActionContext) => {
    // Would try to summon from enemy deck
    const summon = new Summon(ctx.source, 'EX1_345t');
    summon.trigger(ctx.source);
  },
});

// EX1_345t - Shadow
cardScriptsRegistry.register('EX1_345t', {});

// Circle of Healing - Restore 4 Health to all minions
cardScriptsRegistry.register('EX1_621', {
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = (game as any).player1?.field || [];
      const p2Field = (game as any).player2?.field || [];
      for (const minion of [...p1Field, ...p2Field]) {
        const heal = new Heal(ctx.source, minion, 4);
        heal.trigger(ctx.source);
      }
    }
  },
});

// Shadow Word: Death - Destroy a minion with 5 or more Attack
cardScriptsRegistry.register('EX1_622', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_MIN_ATTACK]: 5,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);
    }
  },
});

// Holy Fire - Deal 5 damage and restore 5 Health to your hero
cardScriptsRegistry.register('EX1_624', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 5);
      dmg.trigger(ctx.source);
    }
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(ctx.source, controller.hero, 5);
      heal.trigger(ctx.source);
    }
  },
});

// Shadowform - Your Hero Power becomes "Deal 2 damage"
cardScriptsRegistry.register('EX1_625', {
  play: (_ctx: ActionContext) => {
    // Would change hero power
  },
});

// EX1_625t - Mind Spike (Shadowform)
cardScriptsRegistry.register('EX1_625t', {});

// EX1_625t2 - Mind Shatter (Shadowform upgraded)
cardScriptsRegistry.register('EX1_625t2', {});

// Mass Dispel - Silence all enemy minions and draw a card
cardScriptsRegistry.register('EX1_626', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.field) {
      for (const minion of opponent.field) {
        const silence = new Silence(ctx.source, minion);
        silence.trigger(ctx.source);
      }
    }
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// Radiance - Restore 5 Health to your hero
cardScriptsRegistry.register('EX1_192', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(ctx.source, controller.hero, 5);
      heal.trigger(ctx.source);
    }
  },
});

// Power Infusion - Give a minion +2/+2
cardScriptsRegistry.register('EX1_194', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_194e - Power Infusion buff
cardScriptsRegistry.register('EX1_194e', {});

// Shadow Word: Ruin - Destroy all minions with 5 or more Attack
cardScriptsRegistry.register('EX1_197', {
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = (game as any).player1?.field || [];
      const p2Field = (game as any).player2?.field || [];
      for (const minion of [...p1Field, ...p2Field]) {
        if ((minion as any).attack >= 5) {
          const destroy = new Destroy();
          destroy.trigger(ctx.source, minion);
        }
      }
    }
  },
});

console.log('[Classic Priest] Registered card scripts');
