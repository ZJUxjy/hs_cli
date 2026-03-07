// league - adventure.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy, Shuffle, Morph } from '../../../actions';
import type { Entity } from '../../../core/entity';

// LOEA02_02 - Djinn's Intuition - Draw a card, give opponent a random wish
cardScriptsRegistry.register('LOEA02_02', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Draw a card for controller
    const draw = new Draw(source);
    draw.trigger(source);
    // Give opponent a random wish (LOEA02_03, LOEA02_04, LOEA02_05, LOEA02_06, LOEA02_10)
    const wishCards = ['LOEA02_03', 'LOEA02_04', 'LOEA02_05', 'LOEA02_06', 'LOEA02_10'];
    const randomWish = wishCards[Math.floor(Math.random() * wishCards.length)];
    if (opponent) {
      const give = new Give(randomWish);
      give.trigger(source, opponent);
    }
  },
});

// LOEA02_02h - Djinn's Intuition (Heroic) - Draw a card, gain 1 mana, give opponent a random wish
cardScriptsRegistry.register('LOEA02_02h', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Draw a card for controller
    const draw = new Draw(source);
    draw.trigger(source);
    // Gain 1 mana crystal
    if (controller?.hero) {
      (controller.hero as any).tempMana = (controller.hero as any).tempMana || 0;
      (controller.hero as any).tempMana += 1;
    }
    // Give opponent a random wish
    const wishCards = ['LOEA02_03', 'LOEA02_04', 'LOEA02_05', 'LOEA02_06', 'LOEA02_10'];
    const randomWish = wishCards[Math.floor(Math.random() * wishCards.length)];
    if (opponent) {
      const give = new Give(randomWish);
      give.trigger(source, opponent);
    }
  },
});

// LOEA02_03
cardScriptsRegistry.register('LOEA02_03', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA02_03t');
      summon.trigger(source);
    }
  },
});

// LOEA02_04
cardScriptsRegistry.register('LOEA02_04', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 3);
      heal.trigger(source);
    }
  },
});

// LOEA02_05
cardScriptsRegistry.register('LOEA02_05', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 2);
      damage.trigger(source);
    }
  },
});

// LOEA02_06
cardScriptsRegistry.register('LOEA02_06', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = controller?.deck || [];
    if (deck.length > 0) {
      const draw = new Draw(source);
      draw.trigger(source);
    }
  },
});

// LOEA02_10
cardScriptsRegistry.register('LOEA02_10', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA02_10t');
      summon.trigger(source);
    }
  },
});

// LOEA02_10a
cardScriptsRegistry.register('LOEA02_10a', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// LOEA01_02
cardScriptsRegistry.register('LOEA01_02', {
});

// LOEA01_02h - Blessings of the Sun (Heroic) - When you summon Rod of the Sun, give it +3/+3
cardScriptsRegistry.register('LOEA01_02h', {
  events: {
    SUMMON: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      if ((event?.card as any)?.cardId === 'LOEA01_11h' && event?.card) {
        const buff = new Buff(source, event.card, { ATK: 3, HEALTH: 3 });
        buff.trigger(source);
      }
    },
  },
});

// LOEA01_11 - Rod of the Sun - Deathrattle: Summon a Rod of the Sun for your opponent
cardScriptsRegistry.register('LOEA01_11', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent) {
      const summon = new Summon(source, 'LOEA01_11');
      summon.trigger(source);
    }
  },
});

// LOEA01_11h - Rod of the Sun (Heroic) - Deathrattle: Summon a Rod of the Sun for your opponent
cardScriptsRegistry.register('LOEA01_11h', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent) {
      const summon = new Summon(source, 'LOEA01_11h');
      summon.trigger(source);
    }
  },
});

// LOEA01_12 - Tol'vir Hoplite - Deathrattle: Deal 5 damage to both heroes
cardScriptsRegistry.register('LOEA01_12', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Deal 5 damage to both heroes
    const damage1 = new Damage(source, controller.hero, 5);
    damage1.trigger(source);
    if (opponent?.hero) {
      const damage2 = new Damage(source, opponent.hero, 5);
      damage2.trigger(source);
    }
  },
});

// LOEA01_12h - Tol'vir Hoplite (Heroic) - Deathrattle: Deal 5 damage to both heroes
cardScriptsRegistry.register('LOEA01_12h', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Deal 5 damage to both heroes
    const damage1 = new Damage(source, controller.hero, 5);
    damage1.trigger(source);
    if (opponent?.hero) {
      const damage2 = new Damage(source, opponent.hero, 5);
      damage2.trigger(source);
    }
  },
});

// LOEA04_06
cardScriptsRegistry.register('LOEA04_06', {
});

// LOEA04_06a
cardScriptsRegistry.register('LOEA04_06a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA04_06t');
      summon.trigger(source);
    }
  },
});

// LOEA04_06b
cardScriptsRegistry.register('LOEA04_06b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 2 });
      buff.trigger(source);
    }
  },
});

// LOEA04_28
cardScriptsRegistry.register('LOEA04_28', {
});

// LOEA04_28a
cardScriptsRegistry.register('LOEA04_28a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA04_28t');
      summon.trigger(source);
    }
  },
});

// LOEA04_28b
cardScriptsRegistry.register('LOEA04_28b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 3);
      damage.trigger(source);
    }
  },
});

// LOEA04_29
cardScriptsRegistry.register('LOEA04_29', {
});

// LOEA04_29a
cardScriptsRegistry.register('LOEA04_29a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 3);
      damage.trigger(source);
    }
  },
});

// LOEA04_29b
cardScriptsRegistry.register('LOEA04_29b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 4);
      heal.trigger(source);
    }
  },
});

// LOEA04_30
cardScriptsRegistry.register('LOEA04_30', {
});

// LOEA04_30a
cardScriptsRegistry.register('LOEA04_30a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA04_30t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'LOEA04_30t');
      summon2.trigger(source);
    }
  },
});

// LOEA04_31b
cardScriptsRegistry.register('LOEA04_31b', {
});

// LOEA04_25 - Seething Statue - At the end of your turn, deal 2 damage to all enemies
cardScriptsRegistry.register('LOEA04_25', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      // Deal 2 damage to all enemies (both hero and minions)
      const targets: any[] = [];
      if (opponent?.hero) targets.push(opponent.hero);
      if (opponent?.field) targets.push(...opponent.field);
      for (const target of targets) {
        const damage = new Damage(source, target, 2);
        damage.trigger(source);
      }
    },
  },
});

// LOEA04_25h - Seething Statue (Heroic) - At the end of your turn, deal 5 damage to all enemies
cardScriptsRegistry.register('LOEA04_25h', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      // Deal 5 damage to all enemies (both hero and minions)
      const targets: any[] = [];
      if (opponent?.hero) targets.push(opponent.hero);
      if (opponent?.field) targets.push(...opponent.field);
      for (const target of targets) {
        const damage = new Damage(source, target, 5);
        damage.trigger(source);
      }
    },
  },
});

// LOE_024t - Rolling Boulder - At the end of your turn, destroy the minion to the left
cardScriptsRegistry.register('LOE_024t', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const field = controller?.field || [];
      const sourceIndex = field.indexOf(source);
      // Destroy the minion to the left (index - 1)
      if (sourceIndex > 0) {
        const target = field[sourceIndex - 1];
        const destroy = new Destroy();
        destroy.trigger(source, target);
      }
    },
  },
});

// LOEA05_02
cardScriptsRegistry.register('LOEA05_02', {
});

// LOEA05_02a
cardScriptsRegistry.register('LOEA05_02a', {
});

// LOEA05_02h
cardScriptsRegistry.register('LOEA05_02h', {
});

// LOEA05_02ha
cardScriptsRegistry.register('LOEA05_02ha', {
});

// LOEA05_03
cardScriptsRegistry.register('LOEA05_03', {
});

// LOEA05_03h
cardScriptsRegistry.register('LOEA05_03h', {
});

// LOEA07_29
cardScriptsRegistry.register('LOEA07_29', {
});

// LOEA07_18
cardScriptsRegistry.register('LOEA07_18', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 2);
      damage.trigger(source);
    }
  },
});

// LOEA07_20
cardScriptsRegistry.register('LOEA07_20', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 2);
      damage.trigger(source);
    }
  },
});

// LOEA07_26
cardScriptsRegistry.register('LOEA07_26', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = controller?.deck || [];
    if (deck.length > 0) {
      const draw = new Draw(source);
      draw.trigger(source);
    }
  },
});

// LOEA07_28
cardScriptsRegistry.register('LOEA07_28', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 1);
      damage.trigger(source);
    }
  },
});

// LOEA06_02
cardScriptsRegistry.register('LOEA06_02', {
});

// LOEA06_02h
cardScriptsRegistry.register('LOEA06_02h', {
});

// LOEA06_03
cardScriptsRegistry.register('LOEA06_03', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 3);
      damage.trigger(source);
    }
  },
});

// LOEA06_03h
cardScriptsRegistry.register('LOEA06_03h', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 5);
      damage.trigger(source);
    }
  },
});

// LOEA06_04
cardScriptsRegistry.register('LOEA06_04', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, source, { ATK: 2 });
      buff.trigger(source);
    }
  },
});

// LOEA06_04h
cardScriptsRegistry.register('LOEA06_04h', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, source, { ATK: 4 });
      buff.trigger(source);
    }
  },
});

// LOEA09_2
cardScriptsRegistry.register('LOEA09_2', {
});

// LOEA09_2H
cardScriptsRegistry.register('LOEA09_2H', {
});

// LOEA09_3
cardScriptsRegistry.register('LOEA09_3', {
});

// LOEA09_3H
cardScriptsRegistry.register('LOEA09_3H', {
});

// LOEA09_3b
cardScriptsRegistry.register('LOEA09_3b', {
});

// LOEA09_3c
cardScriptsRegistry.register('LOEA09_3c', {
});

// LOEA09_3d
cardScriptsRegistry.register('LOEA09_3d', {
});

// LOEA09_6
cardScriptsRegistry.register('LOEA09_6', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 2);
      damage.trigger(source);
    }
  },
});

// LOEA09_6H
cardScriptsRegistry.register('LOEA09_6H', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA09_6t');
      summon.trigger(source);
    }
  },
});

// LOEA09_7
cardScriptsRegistry.register('LOEA09_7', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA09_7t');
      summon.trigger(source);
    }
  },
});

// LOEA09_7H
cardScriptsRegistry.register('LOEA09_7H', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA09_7t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'LOEA09_7t');
      summon2.trigger(source);
    }
  },
});

// LOEA09_9
cardScriptsRegistry.register('LOEA09_9', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 3);
      damage.trigger(source);
    }
  },
});

// LOEA09_9H
cardScriptsRegistry.register('LOEA09_9H', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 5);
      damage.trigger(source);
    }
  },
});

// LOEA10_2
cardScriptsRegistry.register('LOEA10_2', {
});

// LOEA10_2H
cardScriptsRegistry.register('LOEA10_2H', {
});

// LOEA10_5
cardScriptsRegistry.register('LOEA10_5', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA10_5t');
      summon.trigger(source);
    }
  },
});

// LOEA10_5H
cardScriptsRegistry.register('LOEA10_5H', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA10_5t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'LOEA10_5t');
      summon2.trigger(source);
    }
  },
});

// LOEA13_2
cardScriptsRegistry.register('LOEA13_2', {
});

// LOEA13_2H
cardScriptsRegistry.register('LOEA13_2H', {
});

// LOEA14_2
cardScriptsRegistry.register('LOEA14_2', {
});

// LOEA14_2H
cardScriptsRegistry.register('LOEA14_2H', {
});

// LOEA15_2
cardScriptsRegistry.register('LOEA15_2', {
});

// LOEA15_2H
cardScriptsRegistry.register('LOEA15_2H', {
});

// LOEA09_4 - Rare Spear - Whenever your opponent plays a Rare card, gain +2/+2
cardScriptsRegistry.register('LOEA09_4', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const event = ctx.event;
      if (event?.source) {
        const eventController = (event.source as any).controller;
        const controller = (source as any).controller;
        if (eventController === controller?.opponent) {
          // Check if it's a Rare card (rarity = 3)
          const card = event.source;
          if ((card as any).rarity === 3) {
            const buff = new Buff(source, source, { ATK: 2, HEALTH: 2 });
            buff.trigger(source);
          }
        }
      }
    },
  },
});

// LOEA09_4H - Rare Spear (Heroic) - Whenever your opponent plays a Rare card, gain +2/+2
cardScriptsRegistry.register('LOEA09_4H', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const event = ctx.event;
      if (event?.source) {
        const eventController = (event.source as any).controller;
        const controller = (source as any).controller;
        if (eventController === controller?.opponent) {
          // Check if it's a Rare card (rarity = 3)
          const card = event.source;
          if ((card as any).rarity === 3) {
            const buff = new Buff(source, source, { ATK: 2, HEALTH: 2 });
            buff.trigger(source);
          }
        }
      }
    },
  },
});

// LOEA16_2
cardScriptsRegistry.register('LOEA16_2', {
});

// LOEA16_2H
cardScriptsRegistry.register('LOEA16_2H', {
});

// LOEA16_16
cardScriptsRegistry.register('LOEA16_16', {
});

// LOEA16_16H
cardScriptsRegistry.register('LOEA16_16H', {
});

// LOEA16_6
cardScriptsRegistry.register('LOEA16_6', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 3);
      damage.trigger(source);
    }
  },
});

// LOEA16_7
cardScriptsRegistry.register('LOEA16_7', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA16_7t');
      summon.trigger(source);
    }
  },
});

// LOEA16_8
cardScriptsRegistry.register('LOEA16_8', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 5);
      heal.trigger(source);
    }
  },
});

// LOEA16_9
cardScriptsRegistry.register('LOEA16_9', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 3 });
      buff.trigger(source);
    }
  },
});

// LOEA16_10
cardScriptsRegistry.register('LOEA16_10', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
});

// LOEA16_11
cardScriptsRegistry.register('LOEA16_11', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA16_11t');
      summon.trigger(source);
    }
  },
});

// LOEA16_12
cardScriptsRegistry.register('LOEA16_12', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA16_12t');
      summon.trigger(source);
    }
  },
});

// LOEA16_14
cardScriptsRegistry.register('LOEA16_14', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 2);
      damage.trigger(source);
    }
  },
});

// LOEA16_15
cardScriptsRegistry.register('LOEA16_15', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// LOEA16_18 - Zinaar - At the end of your turn, add a random Wish to your hand
cardScriptsRegistry.register('LOEA16_18', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Only trigger on controller's turn end
      if (event?.turnPlayer === controller) {
        const wishCards = ['LOEA02_03', 'LOEA02_04', 'LOEA02_05', 'LOEA02_06', 'LOEA02_10'];
        const randomWish = wishCards[Math.floor(Math.random() * wishCards.length)];
        const give = new Give(randomWish);
        give.trigger(source, controller);
      }
    },
  },
});

// LOEA16_18H - Zinaar (Heroic) - At the end of your turn, add a random Wish to your hand
cardScriptsRegistry.register('LOEA16_18H', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      if (event?.turnPlayer === controller) {
        const wishCards = ['LOEA02_03', 'LOEA02_04', 'LOEA02_05', 'LOEA02_06', 'LOEA02_10'];
        const randomWish = wishCards[Math.floor(Math.random() * wishCards.length)];
        const give = new Give(randomWish);
        give.trigger(source, controller);
      }
    },
  },
});

// LOEA16_19 - Sun Raider Phaerix - At the end of your turn, give a random friendly minion Blessing of the Sun
cardScriptsRegistry.register('LOEA16_19', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      if (event?.turnPlayer === controller) {
        const field = controller?.field || [];
        if (field.length > 0) {
          const randomMinion = field[Math.floor(Math.random() * field.length)];
          const buff = new Buff(source, randomMinion, { immune: true }); // immune buff
          buff.trigger(source);
        }
      }
    },
  },
});

// LOEA16_19H
cardScriptsRegistry.register('LOEA16_19H', {
});

// LOEA16_21
cardScriptsRegistry.register('LOEA16_21', {
});

// LOEA16_21H
cardScriptsRegistry.register('LOEA16_21H', {
});

// LOEA16_22 - Archaedas - At the end of your turn, transform a random enemy minion into an Earthen
cardScriptsRegistry.register('LOEA16_22', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (event?.turnPlayer === controller && opponent?.field && opponent.field.length > 0) {
        const randomMinion = opponent.field[Math.floor(Math.random() * opponent.field.length)];
        const morph = new Morph('LOEA06_02t');
        morph.trigger(source, randomMinion);
      }
    },
  },
});

// LOEA16_22H - Archaedas (Heroic) - At the end of your turn, transform a random enemy minion into an Earthen
cardScriptsRegistry.register('LOEA16_22H', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (event?.turnPlayer === controller && opponent?.field && opponent.field.length > 0) {
        const randomMinion = opponent.field[Math.floor(Math.random() * opponent.field.length)];
        const morph = new Morph('LOEA06_02t');
        morph.trigger(source, randomMinion);
      }
    },
  },
});

// LOEA16_23 - Lord Slitherspear - At the end of your turn, summon a Hungry Naga for each enemy minion
cardScriptsRegistry.register('LOEA16_23', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (event?.turnPlayer === controller) {
        const enemyMinionCount = opponent?.field?.length || 0;
        for (let i = 0; i < enemyMinionCount; i++) {
          if (controller?.field?.length < 7) {
            const summon = new Summon(source, 'LOEA09_5');
            summon.trigger(source);
          }
        }
      }
    },
  },
});

// LOEA16_23H - Lord Slitherspear (Heroic) - At the end of your turn, summon a Hungry Naga for each enemy minion
cardScriptsRegistry.register('LOEA16_23H', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (event?.turnPlayer === controller) {
        const enemyMinionCount = opponent?.field?.length || 0;
        for (let i = 0; i < enemyMinionCount; i++) {
          if (controller?.field?.length < 7) {
            const summon = new Summon(source, 'LOEA09_5');
            summon.trigger(source);
          }
        }
      }
    },
  },
});

// LOEA16_24 - Giantfin - At the end of your turn, draw cards until you have as many as your opponent
cardScriptsRegistry.register('LOEA16_24', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (event?.turnPlayer === controller) {
        const opponentHandCount = opponent?.hand?.length || 0;
        const controllerHandCount = controller?.hand?.length || 0;
        const cardsToDraw = opponentHandCount - controllerHandCount;
        for (let i = 0; i < cardsToDraw; i++) {
          const draw = new Draw(source);
          draw.trigger(source);
        }
      }
    },
  },
});

// LOEA16_24H - Giantfin (Heroic) - At the end of your turn, draw 2 cards
cardScriptsRegistry.register('LOEA16_24H', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      if (event?.turnPlayer === controller) {
        const draw = new Draw(source);
        draw.trigger(source);
        const draw2 = new Draw(source);
        draw2.trigger(source);
      }
    },
  },
});

// LOEA16_26 - Skelesaurus Hex - At the end of your turn, give both players a random collectible minion with +2/+2
cardScriptsRegistry.register('LOEA16_26', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (event?.turnPlayer === controller) {
        // This would require a collectible random minion - simplifying for now
        // In real implementation, would need to select from collectible minions
        const give = new Give('CS2_172'); // Would need RandomCollectible
        give.trigger(source, controller);
        if (opponent) {
          const giveOpp = new Give('CS2_172');
          giveOpp.trigger(source, opponent);
        }
      }
    },
  },
});

// LOEA16_26H - Skelesaurus Hex (Heroic) - At the end of your turn, give yourself a random collectible minion with +2/+2
cardScriptsRegistry.register('LOEA16_26H', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      if (event?.turnPlayer === controller) {
        const give = new Give('CS2_172'); // Would need RandomCollectible
        give.trigger(source, controller);
      }
    },
  },
});

// LOEA16_27
cardScriptsRegistry.register('LOEA16_27', {
});

// LOEA16_27H
cardScriptsRegistry.register('LOEA16_27H', {
});

// LOEA16_20
cardScriptsRegistry.register('LOEA16_20', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 3);
      damage.trigger(source);
    }
  },
});

// LOE_008
cardScriptsRegistry.register('LOE_008', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 2 });
      buff.trigger(source);
    }
  },
});

// LOE_008H
cardScriptsRegistry.register('LOE_008H', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOE_008t');
      summon.trigger(source);
    }
  },
});

// LOEA_01
cardScriptsRegistry.register('LOEA_01', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 1);
      damage.trigger(source);
    }
  },
});

// LOEA_01H
cardScriptsRegistry.register('LOEA_01H', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 2);
      damage.trigger(source);
    }
  },
});

// LOEA15_3
cardScriptsRegistry.register('LOEA15_3', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA15_3t');
      summon.trigger(source);
    }
  },
});

// LOEA15_3H
cardScriptsRegistry.register('LOEA15_3H', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOEA15_3t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'LOEA15_3t');
      summon2.trigger(source);
    }
  },
});
