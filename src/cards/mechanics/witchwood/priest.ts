// witchwood - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// GIL_142 - Quartzfin - Lifesteal
cardScriptsRegistry.register('GIL_142', {
});

// Hand - Spirit container
cardScriptsRegistry.register('Hand', {
});

// GIL_142e - Quartzfin buff
cardScriptsRegistry.register('GIL_142e', {
});

// Hand - Spirit container
cardScriptsRegistry.register('Hand', {
});

// GIL_156 - Ghostfin - Lifesteal, Battlecry: Summon a 1/1 Elemental
cardScriptsRegistry.register('GIL_156', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summon = new Summon(source, 'GIL_156t');
    summon.trigger(source);
  },
});

// GIL_190 - Cobalt Scalebane - At the end of your turn, give another random friendly minion +3 Attack
cardScriptsRegistry.register('GIL_190', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const field = controller.field || [];
      const targets = field.filter((m: any) => m !== source);
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const buff = new Buff(source, target, { ATK: 3 });
        buff.trigger(source);
      }
    },
  },
});

// GIL_805 - Rotten Applebaum - Deathrattle: Restore 4 Health to your hero
cardScriptsRegistry.register('GIL_805', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const heal = new Heal(source, controller.hero, 4);
    heal.trigger(source);
  },
});

// GIL_835 - Holy Water - Deal 5 damage. Restore 5 Health to your hero
cardScriptsRegistry.register('GIL_835', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const target = ctx.target || controller.opponent?.hero;
    if (target) {
      const damage = new Damage(source, target, 5);
      damage.trigger(source);
    }
    const heal = new Heal(source, controller.hero, 5);
    heal.trigger(source);
  },
});

// GIL_837 - Crystalline Oracle - Battlecry: Copy a card from your opponent's deck and put it into your hand
cardScriptsRegistry.register('GIL_837', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const oppDeck = opponent.deck || [];
    if (oppDeck.length > 0) {
      const randomCard = oppDeck[Math.floor(Math.random() * oppDeck.length)];
      const give = new Give(randomCard.cardId || randomCard.id);
      give.trigger(source, controller);
    }
  },
});

// GIL_837e - Crystalline Oracle buff
cardScriptsRegistry.register('GIL_837e', {
});

// GIL_840 - Lady in White - Battlecry: Set the Attack and Health of all minions in your deck to 1
cardScriptsRegistry.register('GIL_840', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];
    for (const card of deck) {
      if (card.type === 'MINION') {
        card.attack = 1;
        card.maxHealth = 1;
      }
    }
  },
});

// GIL_134 - Chamelei - Battlecry: Restore 8 Health to your hero
cardScriptsRegistry.register('GIL_134', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const heal = new Heal(source, controller.hero, 8);
    heal.trigger(source);
  },
});

// GIL_661 - Holy Ripple - Deal 1 damage to all enemy minions. Restore 1 Health to all friendly minions
cardScriptsRegistry.register('GIL_661', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;

    // Deal 1 damage to all enemy minions
    const enemyField = opponent.field || [];
    for (const minion of enemyField) {
      const damage = new Damage(source, minion, 1);
      damage.trigger(source);
    }

    // Restore 1 Health to all friendly minions
    const friendlyField = controller.field || [];
    for (const minion of friendlyField) {
      const heal = new Heal(source, minion, 1);
      heal.trigger(source);
    }
  },
});

// GIL_813 - Spawn of Shadows - Battlecry: Deal 4 damage to each hero
cardScriptsRegistry.register('GIL_813', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;

    const damageToEnemy = new Damage(source, opponent.hero, 4);
    damageToEnemy.trigger(source);

    const damageToFriendly = new Damage(source, controller.hero, 4);
    damageToFriendly.trigger(source);
  },
});
