// the_shrounded_city - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Buff, Attack } from '../../../actions';
import type { Entity } from '../../../core/entity';

// DINO_400 - Barricade Basher - Whenever you gain Armor, gain +2/+2 and attack a random enemy minion
cardScriptsRegistry.register('DINO_400', {
  events: {
    ARMOR_GAIN: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      // Gain +2/+2
      const buff = new Buff(source, source, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
      // Attack a random enemy minion
      const opponent = controller?.opponent;
      const enemyField = opponent?.field || [];
      if (enemyField.length > 0) {
        const randomMinion = enemyField[Math.floor(Math.random() * enemyField.length)];
        const attack = new Attack(source, randomMinion);
        attack.trigger(source);
      }
    },
  },
});

// DINO_401 - The Great Dracorex - Rush. After this attacks an enemy minion, it damages ALL other enemy minions
cardScriptsRegistry.register('DINO_401', {
  events: {
    AFTER_ATTACK: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const target = ctx.target;
      // Only trigger if target is an enemy minion
      if (target) {
        const controller = (source as any).controller;
        const opponent = controller?.opponent;
        const enemyField = opponent?.field || [];
        // Deal 1 damage to all other enemy minions
        for (const minion of enemyField) {
          if (minion !== target) {
            const damage = new Damage(source, minion, 1);
            damage.trigger(source);
          }
        }
      }
    },
  },
});

// DINO_433
cardScriptsRegistry.register('DINO_433', {
});

// TLC_478
cardScriptsRegistry.register('TLC_478', {
});

// TLC_600
cardScriptsRegistry.register('TLC_600', {
});

// TLC_601
cardScriptsRegistry.register('TLC_601', {
});

// TLC_602
cardScriptsRegistry.register('TLC_602', {
});

// TLC_602t
cardScriptsRegistry.register('TLC_602t', {
});

// TLC_606
cardScriptsRegistry.register('TLC_606', {
});

// TLC_620
cardScriptsRegistry.register('TLC_620', {
});

// TLC_622
cardScriptsRegistry.register('TLC_622', {
});

// TLC_622e
cardScriptsRegistry.register('TLC_622e', {
});

// TLC_622t
cardScriptsRegistry.register('TLC_622t', {
});

// TLC_623
cardScriptsRegistry.register('TLC_623', {
});

// TLC_623e
cardScriptsRegistry.register('TLC_623e', {
});

// TLC_624
cardScriptsRegistry.register('TLC_624', {
});

// TLC_632
cardScriptsRegistry.register('TLC_632', {
});

// TLC_632t
cardScriptsRegistry.register('TLC_632t', {
});

// TLC_632t2
cardScriptsRegistry.register('TLC_632t2', {
});
