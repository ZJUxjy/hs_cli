// classic - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CS2_042 - Rockbiter Weapon
cardScriptsRegistry.register('CS2_042', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target +3 Attack this turn
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('CS2_042e', { ATK: 3 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_258 - Far Sight
cardScriptsRegistry.register('EX1_258', {
  play: (ctx: ActionContext) => {
    // Draw a card, reduce its cost by 3
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// EX1_565 - Flametongue Totem
cardScriptsRegistry.register('EX1_565', {
});

// EX1_575 - Totemic Might
cardScriptsRegistry.register('EX1_575', {
  play: (ctx: ActionContext) => {
    // Give your Totems +2/+2
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      if ((minion as any).race === 'TOTEM') {
        const { Buff } = require('../../../actions/buff');
        const buffAction = new Buff('EX1_575e', { ATK: 2, HEALTH: 2 });
        buffAction.trigger(ctx.source, minion);
      }
    }
  },
});

// EX1_587 - Lava Burst
cardScriptsRegistry.register('EX1_587', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 5 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(5);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_037 - Lightning Bolt
cardScriptsRegistry.register('CS2_037', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 3 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(3);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_038 - Ancestral Healing
cardScriptsRegistry.register('CS2_038', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Restore minion to full health and give it Taunt
    const target = ctx.target as any;
    const { Heal } = require('../../../actions/heal');
    const healAction = new Heal(target.maxHealth || target.health);
    healAction.trigger(ctx.source, target);

    // Give Taunt
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('CS2_101e', { TAUNT: 1 });
    buffAction.trigger(ctx.source, target);
  },
});

// CS2_038e - Ancestral Healing Enchantment
cardScriptsRegistry.register('CS2_038e', {
  deathrattle: (ctx: ActionContext) => {
    // Summon a 2/1
  },
});

// CS2_039 - Windfury
cardScriptsRegistry.register('CS2_039', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target minion Windfury
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('CS2_039e', { WINDFURY: 1 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_041 - Frost Shock
cardScriptsRegistry.register('CS2_041', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage and Freeze
    const target = ctx.target as any;
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(2);
    damageAction.trigger(ctx.source, target);

    // Freeze
    target.frozen = true;
  },
});

// CS2_045 - Hex
cardScriptsRegistry.register('CS2_045', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Transform target into a 0/1 Frog with Taunt
    const { Morph } = require('../../../actions/morph');
    const morphAction = new Morph('CS2_045t');
    morphAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_046 - Bloodlust - Give your minions +3 Attack this turn
cardScriptsRegistry.register('CS2_046', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('CS2_046e', { ATK: 3 });
      buffAction.trigger(ctx.source, minion);
    }
  },
});

// CS2_053 - Feral Spirit - Summon two 2/3 Spirit Wolves with Taunt
cardScriptsRegistry.register('CS2_053', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction1 = new Summon('CS2_101');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon('CS2_101');
    summonAction2.trigger(ctx.source);
  },
});

// CS2_053e - Spirit Wolf Enchantment
cardScriptsRegistry.register('CS2_053e', {
});

// EX1_238 - Lightning Storm - Deal 3 damage to an enemy minion. Overload: (2)
cardScriptsRegistry.register('EX1_238', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(3);
      damageAction.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_241 - Earth Elemental - Taunt. Overload: (3)
cardScriptsRegistry.register('EX1_241', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by card data (Taunt)
  },
});

// EX1_244 - Reincarnate - Destroy a minion, then return it to life with full Health
cardScriptsRegistry.register('EX1_244', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const cardId = (target as any).cardId;
      const controller = (ctx.source as any).controller;

      // Destroy the minion
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, target);

      // Resummon with full health (handled by deathrattle in card data)
      if (cardId) {
        const { Summon } = require('../../../actions/summon');
        const summonAction = new Summon(cardId);
        summonAction.trigger(ctx.source);
      }
    }
  },
});

// EX1_246 - Ancestral Spirit - Give a minion "Deathrattle: Resummon this minion"
cardScriptsRegistry.register('EX1_246', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const cardId = (target as any).cardId || (target as any).id;
      // Add deathrattle to resummon
      (target as any).deathrattle = () => {
        const { Summon } = require('../../../actions/summon');
        if (cardId) {
          const summonAction = new Summon(cardId);
          summonAction.trigger(ctx.source);
        }
      };
    }
  },
});

// EX1_248 - Hex - already registered above
cardScriptsRegistry.register('EX1_248', {
});

// EX1_251 - Lava Shock - Unlock your Overloaded Mana Crystals
cardScriptsRegistry.register('EX1_251', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Unlock overloaded mana crystals (handled by game logic)
    (controller as any).overloaded = 0;
  },
});

// EX1_245 - Stormforged Axe - Give your hero +2 Attack this turn
cardScriptsRegistry.register('EX1_245', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hero = controller.hero;
    if (hero) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('EX1_245e', { ATK: 2 });
      buffAction.trigger(ctx.source, hero);
    }
  },
});

// EX1_259 - Lava Burst - already registered as EX1_587 above
cardScriptsRegistry.register('EX1_259', {
});
