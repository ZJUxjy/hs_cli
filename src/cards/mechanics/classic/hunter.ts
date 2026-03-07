// classic - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff } from '../../../actions';
import { Race, CardType } from '../../../enums';
import { Entity } from '../../../core/entity';

// CS2_237 Timber Wolf - Your other Beasts have +1 Attack
cardScriptsRegistry.register('CS2_237', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Give +1 attack to friendly beasts at end of turn
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const field = controller.field || [];
      for (const minion of field) {
        if (minion !== source && (minion as any).race === Race.BEAST) {
          const buff = new Buff(source, minion, { ATK: 1 });
          buff.trigger(source);
        }
      }
    },
  },
});

// DS1_070 Starving Buzzard - Whenever you summon a Beast, draw a card
cardScriptsRegistry.register('DS1_070', {
  events: {
    MINION_SUMMON: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.source) {
        const summoned = event.source as Entity;
        if ((summoned as any).race === Race.BEAST) {
          // Draw a card
          const { Draw } = require('../../../actions/draw');
          const drawAction = new Draw(ctx.source);
          drawAction.trigger(ctx.source);
        }
      }
    },
  },
});

// DS1_175
cardScriptsRegistry.register('DS1_175', {
});

// DS1_178
cardScriptsRegistry.register('DS1_178', {
});

// EX1_531 Cult Master - After a friendly minion dies, draw a card
cardScriptsRegistry.register('EX1_531', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.source) {
        const minion = event.source as Entity;
        const controller = (minion as any).controller;
        // Check if it was a friendly minion
        if (controller === (ctx.source as any).controller) {
          const { Draw } = require('../../../actions/draw');
          const drawAction = new Draw(ctx.source);
          drawAction.trigger(ctx.source);
        }
      }
    },
  },
});

// EX1_534 Tundra Rhino - Your Beasts have Charge
cardScriptsRegistry.register('EX1_534', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Give charge to friendly beasts
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const field = controller.field || [];
      for (const minion of field) {
        if ((minion as any).race === Race.BEAST) {
          (minion as any).charge = true;
        }
      }
    },
  },
});

// CS2_084 Multi-Shot - Deal 3 damage to two random enemy minions
cardScriptsRegistry.register('CS2_084', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    // Deal 3 damage to two random minions
    for (let i = 0; i < 2 && field.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const damage = new Damage(source, target, 3);
      damage.trigger(source);
    }
  },
});

// DS1_183 Tracking - Discover a card
cardScriptsRegistry.register('DS1_183', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would show a choice UI
    // For now, just log the effect
    console.log('Tracking: Player chooses a card to draw');
  },
});

// DS1_185 Houndmaster - Battlecry: Give a friendly Beast +2/+2 and Taunt
cardScriptsRegistry.register('DS1_185', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
      (ctx.target as any).taunt = true;
    }
  },
});

// EX1_537 Exploding Bloat - Deathrattle: Deal 2 damage to all enemy minions
cardScriptsRegistry.register('EX1_537', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    for (const minion of field) {
      const damage = new Damage(source, minion, 2);
      damage.trigger(source);
    }
  },
});

// EX1_538 Mutating Injection - Give a minion +4/+4 and Taunt
cardScriptsRegistry.register('EX1_538', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 4, HEALTH: 4 });
      buff.trigger(ctx.source);
      (ctx.target as any).taunt = true;
    }
  },
});

// EX1_539 Arcane Shot - Deal 2 damage to a target
cardScriptsRegistry.register('EX1_539', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// EX1_544 Starfire - Deal 5 damage. Draw a card
cardScriptsRegistry.register('EX1_544', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 5);
      damage.trigger(ctx.source);
    }
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// EX1_549 Savannah Highmane - Deathrattle: Summon two 2/2 Hyenas
cardScriptsRegistry.register('EX1_549', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon('EX1_549t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon('EX1_549t');
    summon2.trigger(ctx.source);
  },
});

// EX1_617 Kill Command - Deal 3 damage. If you control a Beast, deal 5 instead
cardScriptsRegistry.register('EX1_617', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller.field || [];
    // Check if we control a beast
    let hasBeast = false;
    for (const minion of field) {
      if ((minion as any).race === Race.BEAST) {
        hasBeast = true;
        break;
      }
    }
    const damageAmount = hasBeast ? 5 : 3;
    if (ctx.target) {
      const damage = new Damage(source, ctx.target, damageAmount);
      damage.trigger(source);
    }
  },
});

// NEW1_031 Scavenging Hyena - Whenever a friendly Beast dies, gain +2/+1
cardScriptsRegistry.register('NEW1_031', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.source) {
        const minion = event.source as Entity;
        const controller = (minion as any).controller;
        // Check if it was a friendly beast
        if (controller === (ctx.source as any).controller &&
            (minion as any).race === Race.BEAST) {
          const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 1 });
          buff.trigger(ctx.source);
        }
      }
    },
  },
});

// CS2_084e
cardScriptsRegistry.register('CS2_084e', {
});

// DS1_183 - Multi-Shot - Deal 3 damage to two random enemy minions
cardScriptsRegistry.register('DS1_183', {
  requirements: {
    [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    // Deal 3 damage to two random minions
    for (let i = 0; i < 2 && field.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(3);
      damageAction.trigger(ctx.source, target);
    }
  },
});

// DS1_184 - Tracking - Discover a card from your deck
cardScriptsRegistry.register('DS1_184', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would show a choice UI
    // For now, just log the effect
    console.log('Tracking: Player chooses a card to draw');
  },
});

// DS1_185 - Arcane Shot - Deal 5 damage
cardScriptsRegistry.register('DS1_185', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(5);
      damageAction.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_537 - Explosive Shot - Deal 6 damage to a minion and 3 damage to adjacent minions
cardScriptsRegistry.register('EX1_537', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const { Damage } = require('../../../actions/damage');
      // Deal 6 damage to target
      const damageAction = new Damage(6);
      damageAction.trigger(ctx.source, target);

      // Deal 3 damage to adjacent minions (handled by game logic)
    }
  },
});

// EX1_538 - Unleash the Hounds - Summon a 1/1 Hound with Charge for each enemy minion
cardScriptsRegistry.register('EX1_538', {
  requirements: {
    [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1,
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    for (let i = 0; i < enemyMinions.length; i++) {
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon('DS1_188');
      summonAction.trigger(ctx.source);
    }
  },
});

// EX1_539 - Kill Command - Deal 3 damage. If you control a Beast, deal 5 damage instead
cardScriptsRegistry.register('EX1_539', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const friendlyMinions = controller.field || [];
      let hasBeast = false;
      for (const minion of friendlyMinions) {
        if ((minion as any).race === 'BEAST') {
          hasBeast = true;
          break;
        }
      }
      const damage = hasBeast ? 5 : 3;
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(damage);
      damageAction.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_544 - Flare - Destroy all enemy Secrets and gain +2 Attack
cardScriptsRegistry.register('EX1_544', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Destroy all enemy secrets (handled by game logic)
    // Give hero +2 Attack
    const hero = controller.hero;
    if (hero) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('EX1_544e', { ATK: 2 });
      buffAction.trigger(ctx.source, hero);
    }
  },
});

// EX1_549 - Snipe - Secret: When your opponent plays a minion, deal 4 damage to it
cardScriptsRegistry.register('EX1_549', {
  play: (ctx: ActionContext) => {
    // Secret effect: handled by game logic when opponent plays a minion
  },
});

// EX1_617 - Deadly Shot - Destroy a random enemy minion
cardScriptsRegistry.register('EX1_617', {
  requirements: {
    [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    if (field.length > 0) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, target);
    }
  },
});

// NEW1_031 - Animal Companion - Summon a random 3-Cost Beast
cardScriptsRegistry.register('NEW1_031', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const beasts = ['Mtg_Raptor', 'CS2_120', 'EX1_028'];
    const randomBeast = beasts[Math.floor(Math.random() * beasts.length)];
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(randomBeast);
    summonAction.trigger(ctx.source);
  },
});

// EX1_533 - Misdirection - Secret: When your opponent attacks your hero, instead they attack another random character
cardScriptsRegistry.register('EX1_533', {
});

// EX1_554 - Snake Trap - Secret: When your opponent plays a minion, summon three 1/1 Snakes
cardScriptsRegistry.register('EX1_554', {
});

// EX1_609 - Snipe - already registered above as EX1_549
cardScriptsRegistry.register('EX1_609', {
});

// EX1_610 - Explosive Trap - Secret: When your hero is attacked, deal 2 damage to all enemies
cardScriptsRegistry.register('EX1_610', {
});

// EX1_611 - Freezing Trap - Secret: When your opponent plays a minion, return it to your opponent's hand
cardScriptsRegistry.register('EX1_611', {
});

// EX1_611e - Freezing Trap Enchantment
cardScriptsRegistry.register('EX1_611e', {
});

// DS1_188 - Gladiator's Longbow - Your hero is Immune while attacking
cardScriptsRegistry.register('DS1_188', {
});

// EX1_536 - Eaglehorn Bow - When a friendly Secret is revealed, gain +1 Attack
cardScriptsRegistry.register('EX1_536', {
  events: {
    SECRET_REVEALED: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 3) + 1;
    },
  },
});
