// Classic Paladin Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Buff } from '../../../actions/buff';
import { Heal } from '../../../actions/heal';

// Import selectors
import { PlayReq } from '../../../enums/playreq';

// === Minions ===

// Guardian of Kings - Battlecry: Restore 6 Health to your hero
cardScriptsRegistry.register('CS2_088', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(ctx.source, controller.hero, 6);
      heal.trigger(ctx.source);
    }
  },
});

// Argent Protector - Battlecry: Give a friendly minion Divine Shield
cardScriptsRegistry.register('EX1_362', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IS_NOT_SELF]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).divineShield = true;
    }
  },
});

// Aldor Peacekeeper - Battlecry: Change an enemy minion's Attack to 1
cardScriptsRegistry.register('EX1_382', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_382e - Aldor Peacekeeper debuff
cardScriptsRegistry.register('EX1_382e', {});

// Tirion Fordring - Deathrattle: Equip a 1/3 Ashbringer
cardScriptsRegistry.register('EX1_383', {
  deathrattle: (ctx: ActionContext) => {
    // Would equip weapon
  },
});

// === Spells ===

// Blessing of Might - Give a minion +3 Attack
cardScriptsRegistry.register('CS2_087', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_087e - Blessing of Might buff
cardScriptsRegistry.register('CS2_087e', {});

// Holy Light - Restore 6 Health
cardScriptsRegistry.register('CS2_089', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const heal = new Heal(ctx.source, ctx.target, 6);
      heal.trigger(ctx.source);
    }
  },
});

// Blessing of Kings - Give a minion +4/+4
cardScriptsRegistry.register('CS2_092', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 4, HEALTH: 4 });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_092e - Blessing of Kings buff
cardScriptsRegistry.register('CS2_092e', {});

// Consecration - Deal 2 damage to all enemies
cardScriptsRegistry.register('CS2_093', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
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
  },
});

// Hammer of Wrath - Deal 3 damage and draw a card
cardScriptsRegistry.register('CS2_094', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 3);
      dmg.trigger(ctx.source);
    }
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// Divine Favor - Draw cards until you have as many as your opponent
cardScriptsRegistry.register('EX1_349', {
  play: (ctx: ActionContext) => {
    // Would draw cards to match opponent hand count
  },
});

// Lay on Hands - Restore 8 Health and draw 3 cards
cardScriptsRegistry.register('EX1_354', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const heal = new Heal(ctx.source, ctx.target, 8);
      heal.trigger(ctx.source);
    }
    const draw1 = new Draw(ctx.source, 1);
    const draw2 = new Draw(ctx.source, 1);
    const draw3 = new Draw(ctx.source, 1);
    draw1.trigger(ctx.source);
    draw2.trigger(ctx.source);
    draw3.trigger(ctx.source);
  },
});

// Blessed Champion - Double a minion's Attack
cardScriptsRegistry.register('EX1_355', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const currentAtk = target.attack || 0;
      const buff = new Buff(ctx.source, ctx.target, { ATK: currentAtk });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_355e - Blessed Champion buff
cardScriptsRegistry.register('EX1_355e', {});

// Humility - Change a minion's Attack to 1
cardScriptsRegistry.register('EX1_360', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.attack = 1;
    }
  },
});

// EX1_360e - Humility debuff
cardScriptsRegistry.register('EX1_360e', {});

// Blessing of Wisdom - Draw a card when minion attacks
cardScriptsRegistry.register('EX1_363', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Add event listener for attack to draw card
    }
  },
});

// EX1_363e - Blessing of Wisdom buff
cardScriptsRegistry.register('EX1_363e', {});

// Holy Wrath - Draw a card and deal damage equal to its cost
cardScriptsRegistry.register('EX1_365', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
    // Would deal damage equal to card cost
  },
});

// Hand of Protection - Give a minion Divine Shield
cardScriptsRegistry.register('EX1_371', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).divineShield = true;
    }
  },
});

// Avenging Wrath - Deal 8 damage randomly split among enemies
cardScriptsRegistry.register('EX1_384', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    const targets: any[] = [];
    if (opponent?.hero) targets.push(opponent.hero);
    if (opponent?.field) targets.push(...opponent.field);
    for (let i = 0; i < 8; i++) {
      if (targets.length === 0) break;
      const idx = Math.floor(Math.random() * targets.length);
      const target = targets[idx];
      const dmg = new Damage(ctx.source, target, 1);
      dmg.trigger(ctx.source);
    }
  },
});

// Equality - Set all minions' Health to 1
cardScriptsRegistry.register('EX1_619', {
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = (game as any).player1?.field || [];
      const p2Field = (game as any).player2?.field || [];
      for (const minion of [...p1Field, ...p2Field]) {
        const target = minion as any;
        target.maxHealth = 1;
        if (target.health > 1) {
          target.damage = (target.health || 0) - 1;
        }
      }
    }
  },
});

// EX1_619e - Equality debuff
cardScriptsRegistry.register('EX1_619e', {});

// === Secrets ===

// Noble Sacrifice - When an enemy attacks, summon a 2/1 Defender
cardScriptsRegistry.register('EX1_130', {});

// Eye for an Eye - When your hero takes damage, deal that much to the enemy hero
cardScriptsRegistry.register('EX1_132', {});

// Redemption - When a friendly minion dies, return it to life with 1 Health
cardScriptsRegistry.register('EX1_136', {});

// Repentance - After your opponent plays a minion, reduce its Health to 1
cardScriptsRegistry.register('EX1_379', {});

// EX1_379e - Repentance debuff
cardScriptsRegistry.register('EX1_379e', {});

// === Weapons ===

// Truesilver Champion - Whenever your hero attacks, restore 2 Health
cardScriptsRegistry.register('CS2_097', {
  events: {
    ATTACK: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      if (controller?.hero) {
        const heal = new Heal(ctx.source, controller.hero, 2);
        heal.trigger(ctx.source);
      }
    },
  },
});

// Sword of Justice - After you summon a minion, give it +1/+1 and this loses 1 durability
cardScriptsRegistry.register('EX1_366', {
  events: {
    MINION_SUMMON: (ctx: ActionContext) => {
      if (ctx.target) {
        const buff = new Buff(ctx.source, ctx.target, { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source);
      }
    },
  },
});

// EX1_366e - Sword of Justice buff
cardScriptsRegistry.register('EX1_366e', {});

// Righteousness - Give your minions Divine Shield
cardScriptsRegistry.register('EX1_184', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      (minion as any).divineShield = true;
    }
  },
});

console.log('[Classic Paladin] Registered card scripts');
