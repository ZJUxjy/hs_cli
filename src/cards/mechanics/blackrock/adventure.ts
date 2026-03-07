// blackrock - adventure.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy, Shuffle } from '../../../actions';
import type { Entity } from '../../../core/entity';

// BRMA01_2
cardScriptsRegistry.register('BRMA01_2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA01_2H
cardScriptsRegistry.register('BRMA01_2H', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA01_3
cardScriptsRegistry.register('BRMA01_3', {
});

// BRMA02_2
cardScriptsRegistry.register('BRMA02_2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA02_2H
cardScriptsRegistry.register('BRMA02_2H', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA03_2
cardScriptsRegistry.register('BRMA03_2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA04_2
cardScriptsRegistry.register('BRMA04_2', {
});

// BRMA05_2
cardScriptsRegistry.register('BRMA05_2', {
});

// BRMA05_2H
cardScriptsRegistry.register('BRMA05_2H', {
});

// BRMA06_2
cardScriptsRegistry.register('BRMA06_2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA06_2H
cardScriptsRegistry.register('BRMA06_2H', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA07_2
cardScriptsRegistry.register('BRMA07_2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA07_2H
cardScriptsRegistry.register('BRMA07_2H', {
});

// BRMA08_2
cardScriptsRegistry.register('BRMA08_2', {
});

// BRMA08_2H
cardScriptsRegistry.register('BRMA08_2H', {
});

// BRMA09_2
cardScriptsRegistry.register('BRMA09_2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA09_2H
cardScriptsRegistry.register('BRMA09_2H', {
});

// BRMA09_3
cardScriptsRegistry.register('BRMA09_3', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA09_3H
cardScriptsRegistry.register('BRMA09_3H', {
});

// BRMA09_4
cardScriptsRegistry.register('BRMA09_4', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA09_4H
cardScriptsRegistry.register('BRMA09_4H', {
});

// BRMA09_5
cardScriptsRegistry.register('BRMA09_5', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA09_5H
cardScriptsRegistry.register('BRMA09_5H', {
});

// BRMA10_3
cardScriptsRegistry.register('BRMA10_3', {
});

// BRMA10_3H
cardScriptsRegistry.register('BRMA10_3H', {
});

// BRMA11_2
cardScriptsRegistry.register('BRMA11_2', {
});

// BRMA11_2H
cardScriptsRegistry.register('BRMA11_2H', {
});

// BRMA12_2
cardScriptsRegistry.register('BRMA12_2', {
});

// BRMA12_2H
cardScriptsRegistry.register('BRMA12_2H', {
});

// BRMA12_10
cardScriptsRegistry.register('BRMA12_10', {
});

// BRMA13_2
cardScriptsRegistry.register('BRMA13_2', {
});

// BRMA13_2H
cardScriptsRegistry.register('BRMA13_2H', {
});

// BRMA13_4
cardScriptsRegistry.register('BRMA13_4', {
});

// BRMA13_4H
cardScriptsRegistry.register('BRMA13_4H', {
});

// BRMA14_2
cardScriptsRegistry.register('BRMA14_2', {
});

// BRMA14_2H
cardScriptsRegistry.register('BRMA14_2H', {
});

// BRMA14_4
cardScriptsRegistry.register('BRMA14_4', {
});

// BRMA14_4H
cardScriptsRegistry.register('BRMA14_4H', {
});

// BRMA14_6
cardScriptsRegistry.register('BRMA14_6', {
});

// BRMA14_6H
cardScriptsRegistry.register('BRMA14_6H', {
});

// BRMA14_8
cardScriptsRegistry.register('BRMA14_8', {
});

// BRMA14_8H
cardScriptsRegistry.register('BRMA14_8H', {
});

// BRMA14_10
cardScriptsRegistry.register('BRMA14_10', {
});

// BRMA14_10H
cardScriptsRegistry.register('BRMA14_10H', {
});

// BRMA15_2 - The Alchemist - Passive: When a minion is summoned, both players draw a card
cardScriptsRegistry.register('BRMA15_2', {
});

// BRMA15_2H - The Alchemist (Heroic)
cardScriptsRegistry.register('BRMA15_2H', {
});

// BRMA16_2
cardScriptsRegistry.register('BRMA16_2', {
});

// BRMA16_2H
cardScriptsRegistry.register('BRMA16_2H', {
});

// BRMA17_5
cardScriptsRegistry.register('BRMA17_5', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA17_5H
cardScriptsRegistry.register('BRMA17_5H', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// BRMA17_8
cardScriptsRegistry.register('BRMA17_8', {
});

// BRMA17_8H
cardScriptsRegistry.register('BRMA17_8H', {
});

// BRMA03_3
cardScriptsRegistry.register('BRMA03_3', {
});

// BRMA03_3H
cardScriptsRegistry.register('BRMA03_3H', {
});

// BRMA10_4
cardScriptsRegistry.register('BRMA10_4', {
});

// BRMA10_4H
cardScriptsRegistry.register('BRMA10_4H', {
});

// BRMA04_3
cardScriptsRegistry.register('BRMA04_3', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMA04_3t');
      summon.trigger(source);
    }
  },
});

// BRMA04_3H
cardScriptsRegistry.register('BRMA04_3H', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMA04_3t');
      summon.trigger(source);
    }
  },
});

// BRMA12_8t
cardScriptsRegistry.register('BRMA12_8t', {
});

// BRMA13_5
cardScriptsRegistry.register('BRMA13_5', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 4);
      damage.trigger(source);
    }
  },
});

// BRMA_01
cardScriptsRegistry.register('BRMA_01', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMA01_4');
      summon.trigger(source);
    }
  },
});

// BRMA01_4
cardScriptsRegistry.register('BRMA01_4', {
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

// BRMA05_3
cardScriptsRegistry.register('BRMA05_3', {
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

// BRMA05_3e
cardScriptsRegistry.register('BRMA05_3e', {
});

// BRMA05_3H
cardScriptsRegistry.register('BRMA05_3H', {
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

// BRMA05_3He - Living Bomb Enchantment (Heroic) - At the start of your turn, deal 10 damage to all enemies
cardScriptsRegistry.register('BRMA05_3He', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      // Deal 10 damage to all enemy characters
      if (opponent?.hero) {
        const damage = new Damage(source, opponent.hero, 10);
        damage.trigger(source);
      }
      if (opponent?.field) {
        for (const minion of opponent.field) {
          const damage = new Damage(source, minion, 10);
          damage.trigger(source);
        }
      }
    },
  },
});

// BRMA07_3
cardScriptsRegistry.register('BRMA07_3', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMA07_3t');
      summon.trigger(source);
    }
  },
});

// BRMA08_3
cardScriptsRegistry.register('BRMA08_3', {
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

// BRMA09_6
cardScriptsRegistry.register('BRMA09_6', {
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

// BRMA04_4
cardScriptsRegistry.register('BRMA04_4', {
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

// BRMA04_4H
cardScriptsRegistry.register('BRMA04_4H', {
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

// BRMA11_3
cardScriptsRegistry.register('BRMA11_3', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMA11_3t');
      summon.trigger(source);
    }
  },
});

// BRMA12_8
cardScriptsRegistry.register('BRMA12_8', {
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

// BRMA14_11
cardScriptsRegistry.register('BRMA14_11', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMA14_11t');
      summon.trigger(source);
    }
  },
});

// BRMA13_8
cardScriptsRegistry.register('BRMA13_8', {
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

// BRMA15_3
cardScriptsRegistry.register('BRMA15_3', {
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

// BRMA14_3
cardScriptsRegistry.register('BRMA14_3', {
});

// BRMA14_5 - Toxitron - At the start of your turn, deal 1 damage to all other minions
cardScriptsRegistry.register('BRMA14_5', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const field = controller?.field || [];
      // Deal 1 damage to all other minions
      for (const minion of field) {
        if (minion !== source) {
          const damage = new Damage(source, minion, 1);
          damage.trigger(source);
        }
      }
    },
  },
});

// BRMA14_5H - Toxitron (Heroic) - At the start of your turn, deal 1 damage to all other minions
cardScriptsRegistry.register('BRMA14_5H', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const field = controller?.field || [];
      // Deal 1 damage to all other minions
      for (const minion of field) {
        if (minion !== source) {
          const damage = new Damage(source, minion, 1);
          damage.trigger(source);
        }
      }
    },
  },
});

// BRMA14_7
cardScriptsRegistry.register('BRMA14_7', {
});

// BRMA14_7H
cardScriptsRegistry.register('BRMA14_7H', {
});

// BRMA14_9 - Magmatron - Whenever a player plays a card, Magmatron deals 2 damage to them
cardScriptsRegistry.register('BRMA14_9', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const event = ctx.event;
      if (event?.source) {
        const targetController = (event.source as any).controller;
        if (targetController?.hero) {
          const damage = new Damage(source, targetController.hero, 2);
          damage.trigger(source);
        }
      }
    },
  },
});

// BRMA14_9H - Magmatron (Heroic) - Whenever a player plays a card, Magmatron deals 2 damage to them
cardScriptsRegistry.register('BRMA14_9H', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const event = ctx.event;
      if (event?.source) {
        const targetController = (event.source as any).controller;
        if (targetController?.hero) {
          const damage = new Damage(source, targetController.hero, 2);
          damage.trigger(source);
        }
      }
    },
  },
});

// BRMA16_3
cardScriptsRegistry.register('BRMA16_3', {
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

// BRMA16_4
cardScriptsRegistry.register('BRMA16_4', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const heal = new Heal(source, source, 3);
      heal.trigger(source);
    }
  },
});

// BRMA17_4
cardScriptsRegistry.register('BRMA17_4', {
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

// BRMA10_6 - Razorgore's Claws (Unused) - Whenever a Corrupted Egg dies, gain +1 Attack
cardScriptsRegistry.register('BRMA10_6', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      // Simplified: when Corrupted Egg dies, gain +1 Attack
      const buff = new Buff(source, source, { ATK: 1 });
      buff.trigger(source);
    },
  },
});

// BRMA16_5 - Dragonteeth - Whenever your opponent plays a card, gain +1 Attack
cardScriptsRegistry.register('BRMA16_5', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const event = ctx.event;
      if (event?.source) {
        const eventController = (event.source as any).controller;
        const controller = (source as any).controller;
        if (eventController === controller?.opponent) {
          const buff = new Buff(source, source, { ATK: 1 });
          buff.trigger(source);
        }
      }
    },
  },
});

// BRMA12_3 - Brood Affliction: Red - At the start of your turn, deal 1 damage to your hero
cardScriptsRegistry.register('BRMA12_3', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      // Trigger for the controller who has this card in hand (simplified - always trigger)
      if (controller?.hero) {
        const damage = new Damage(source, controller.hero, 1);
        damage.trigger(source);
      }
    },
  },
});

// Hand (BRMA12_3 - Brood Affliction: Red)
cardScriptsRegistry.register('Hand', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Only trigger for the controller who has this card in hand
      if (controller?.hero) {
        const damage = new Damage(source, controller.hero, 1);
        damage.trigger(source);
      }
    },
  },
});

// BRMA12_3H - Brood Affliction: Red (Heroic) - At the start of your turn, deal 3 damage to your hero
cardScriptsRegistry.register('BRMA12_3H', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      if (controller?.hero) {
        const damage = new Damage(source, controller.hero, 3);
        damage.trigger(source);
      }
    },
  },
});

// Hand (BRMA12_3H - Brood Affliction: Red Heroic)
cardScriptsRegistry.register('Hand', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      if (controller?.hero) {
        const damage = new Damage(source, controller.hero, 3);
        damage.trigger(source);
      }
    },
  },
});

// BRMA12_4 - Brood Affliction: Green - At the start of your turn, heal your opponent for 2
cardScriptsRegistry.register('BRMA12_4', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (opponent?.hero) {
        const heal = new Heal(source, opponent.hero, 2);
        heal.trigger(source);
      }
    },
  },
});

// Hand (BRMA12_4 - Brood Affliction: Green)
cardScriptsRegistry.register('Hand', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (opponent?.hero) {
        const heal = new Heal(source, opponent.hero, 2);
        heal.trigger(source);
      }
    },
  },
});

// BRMA12_4H - Brood Affliction: Green (Heroic) - At the start of your turn, heal your opponent for 6
cardScriptsRegistry.register('BRMA12_4H', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (opponent?.hero) {
        const heal = new Heal(source, opponent.hero, 6);
        heal.trigger(source);
      }
    },
  },
});

// Hand (BRMA12_4H - Brood Affliction: Green Heroic)
cardScriptsRegistry.register('Hand', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      const event = ctx.event;
      if (opponent?.hero) {
        const heal = new Heal(source, opponent.hero, 6);
        heal.trigger(source);
      }
    },
  },
});

// BRMA12_5 - Brood Affliction: Blue - Enemy spells cost 1 less (implemented via update in Python, simplified here)
cardScriptsRegistry.register('BRMA12_5', {
});

// Hand (BRMA12_5 - Brood Affliction: Blue)
cardScriptsRegistry.register('Hand', {
});

// BRMA12_5H - Brood Affliction: Blue (Heroic) - Enemy spells cost 3 less (simplified)
cardScriptsRegistry.register('BRMA12_5H', {
});

// Hand (BRMA12_5H - Brood Affliction: Blue Heroic)
cardScriptsRegistry.register('Hand', {
});

// BRMA12_6 - Brood Affliction: Black - When you draw a card, give a copy to your opponent
cardScriptsRegistry.register('BRMA12_6', {
});

// Hand (BRMA12_6 - Brood Affliction: Black)
cardScriptsRegistry.register('Hand', {
  events: {
    DRAW: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      // When you draw a card, give a copy to your opponent (simplified)
      if (opponent) {
        const give = new Give('CS2_172'); // placeholder
        give.trigger(source, opponent);
      }
    },
  },
});

// BRMA12_6H - Brood Affliction: Black (Heroic) - When you draw a card, give a copy to your opponent
cardScriptsRegistry.register('BRMA12_6H', {
});

// Hand (BRMA12_6H - Brood Affliction: Black Heroic)
cardScriptsRegistry.register('Hand', {
  events: {
    DRAW: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      // When you draw a card, give a copy to your opponent (simplified)
      if (opponent) {
        const give = new Give('CS2_172'); // placeholder
        give.trigger(source, opponent);
      }
    },
  },
});

// BRMA12_7 - Brood Affliction: Bronze - Enemy minions cost 1 less (simplified)
cardScriptsRegistry.register('BRMA12_7', {
});

// Hand (BRMA12_7 - Brood Affliction: Bronze)
cardScriptsRegistry.register('Hand', {
});

// BRMA12_7H - Brood Affliction: Bronze (Heroic) - Enemy minions cost 3 less (simplified)
cardScriptsRegistry.register('BRMA12_7H', {
});

// Hand (BRMA12_7H - Brood Affliction: Bronze Heroic)
cardScriptsRegistry.register('Hand', {
});
