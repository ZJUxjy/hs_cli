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

// DS1_183
cardScriptsRegistry.register('DS1_183', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// DS1_184
cardScriptsRegistry.register('DS1_184', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// DS1_185
cardScriptsRegistry.register('DS1_185', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_537
cardScriptsRegistry.register('EX1_537', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_538
cardScriptsRegistry.register('EX1_538', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_539
cardScriptsRegistry.register('EX1_539', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_544
cardScriptsRegistry.register('EX1_544', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_549
cardScriptsRegistry.register('EX1_549', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_617
cardScriptsRegistry.register('EX1_617', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// NEW1_031
cardScriptsRegistry.register('NEW1_031', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_533
cardScriptsRegistry.register('EX1_533', {
});

// EX1_554
cardScriptsRegistry.register('EX1_554', {
});

// EX1_609
cardScriptsRegistry.register('EX1_609', {
});

// EX1_610
cardScriptsRegistry.register('EX1_610', {
});

// EX1_611
cardScriptsRegistry.register('EX1_611', {
});

// EX1_611e
cardScriptsRegistry.register('EX1_611e', {
  events: {
    // TODO: implement events
  },
});

// DS1_188
cardScriptsRegistry.register('DS1_188', {
});

// EX1_536
cardScriptsRegistry.register('EX1_536', {
  events: { /* TODO */ },
});
