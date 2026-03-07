// gangs - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// CFM_610 - Doubling Imp (Rare)
// Battlecry: Summon a copy of this minion
cardScriptsRegistry.register('CFM_610', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summon = new Summon(source, source.cardId);
    summon.trigger(source);
  },
});

// CFM_663 - Hex (Common)
// Transform a minion into a 0/1 Frog with Taunt
cardScriptsRegistry.register('CFM_663', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target as any;
    if (target) {
      // Transform into Frog (0/1 with Taunt)
      target.attack = 0;
      target.maxHealth = 1;
      target.damage = 0;
      target.taunt = true;
      target.race = '';
    }
  },
});

// CFM_699 - Possessed Villager (Common)
// Deathrattle: Summon a 1/1 Shadow
cardScriptsRegistry.register('CFM_699', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summon = new Summon(source, 'CFM_699t');
    summon.trigger(source);
  },
});

// CFM_699e - Possessed Villager buff
cardScriptsRegistry.register('CFM_699e', {
});

// CFM_750 - Burgly Bully (Epic)
// Whenever your opponent casts a spell, add a Coin to your hand
cardScriptsRegistry.register('CFM_750', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const event = ctx.event;
      if (event?.source && (event.source as any).controller !== controller) {
        const give = new Give('GAME_005');
        give.trigger(source, controller);
      }
    },
  },
});

// CFM_751 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('CFM_751', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source) {
        const { executeDeathrattle } = require('../../index');
        executeDeathrattle(minion);
      }
    }
  },
});

// CFM_900 - Fist of Jaraxxus (Rare)
// Destroy a random enemy minion
cardScriptsRegistry.register('CFM_900', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const enemyField = opponent.field || [];
    if (enemyField.length > 0) {
      const target = enemyField[Math.floor(Math.random() * enemyField.length)];
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
});

// CFM_094 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('CFM_094', {
});

// CFM_608 - Kabal Trafficker (Rare)
// Deathrattle: Add a random Demon to your hand
cardScriptsRegistry.register('CFM_608', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Add a random Demon to your hand (handled by game)
  },
});

// CFM_611 - Reno Jackson (Legendary)
// Battlecry: Restore 10 Health
cardScriptsRegistry.register('CFM_611', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const heal = new Heal(source, controller.hero, 10);
    heal.trigger(source);
  },
});

// CFM_695 - Felguard (Rare)
// Taunt. Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('CFM_695', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const enemyField = opponent.field || [];
    if (enemyField.length > 0) {
      const target = enemyField[Math.floor(Math.random() * enemyField.length)];
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
});
