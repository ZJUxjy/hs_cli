// kobolds - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy, Shuffle } from '../../../actions';
import type { Entity } from '../../../core/entity';

// LOOT_069 - Corrupted Healbot
cardScriptsRegistry.register('LOOT_069', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      // Deal 5 damage - handled by game
    }
  },
});

// LOOT_122 - Dire Mole
cardScriptsRegistry.register('LOOT_122', {
  play: (ctx: ActionContext) => {
    // Battlecry - handled by game
  },
});

// LOOT_131 - Furnacefire Thermostat
cardScriptsRegistry.register('LOOT_131', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        // Discover a Dragon - handled by game
      }
    },
  },
});

// LOOT_132 - Gluttonous Ooze
cardScriptsRegistry.register('LOOT_132', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      // Destroy target - handled by game
    }
  },
});

// LOOT_134 - Shudderwraith
cardScriptsRegistry.register('LOOT_134', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const buff = new Buff(source, source, { ATK: 2 });
        buff.trigger(source);
      }
    },
  },
});

// LOOT_134e
cardScriptsRegistry.register('LOOT_134e', {
});

// LOOT_136 - Fungal Enchanter - Battlecry: Restore 2 Health to all friendly characters
cardScriptsRegistry.register('LOOT_388', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Heal all friendly characters - handled by game
  },
});

// LOOT_152 - Dorothee (actually Boisterous Bard) - Battlecry: Give your other minions +1 Health
cardScriptsRegistry.register('LOOT_152', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source) {
        const buff = new Buff(source, minion, { HEALTH: 1 });
        buff.trigger(source);
      }
    }
  },
});

// LOOT_152e - Inspired
cardScriptsRegistry.register('LOOT_152e', {
});
cardScriptsRegistry.register('LOOT_144', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 3);
      heal.trigger(source);
    }
  },
});

// LOOT_153 - Sonya Shadowdancer
cardScriptsRegistry.register('LOOT_153', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOOT_153');
      summon.trigger(source);
    }
  },
});

// LOOT_167 - Tanglespine
cardScriptsRegistry.register('LOOT_167', {
  play: (ctx: ActionContext) => {
    // Stun an enemy minion - handled by game
  },
});

// LOOT_184 - Cursed Disciple
cardScriptsRegistry.register('LOOT_184', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOOT_184t');
      summon.trigger(source);
    }
  },
});

// LOOT_233 - Cauldron Elemental
cardScriptsRegistry.register('LOOT_233', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hand?.length < 10) {
      // Give a random minion in your hand +2/+2 - handled by game
    }
  },
});

// LOOT_291 - Shudderwraith
cardScriptsRegistry.register('LOOT_291', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 3 damage to all other minions - handled by game
  },
});

// LOOT_347 - Kobold Apprentice - Battlecry: Deal 3 damage randomly split among all enemies
cardScriptsRegistry.register('LOOT_347', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const game = source.game;
    // Deal 3 damage randomly split among all enemies (1 damage to 3 random enemy minions)
    for (let i = 0; i < 3; i++) {
      const opponent = source.controller.opponent;
      const field = opponent.field || [];
      if (field.length > 0) {
        const targets = field.filter((m: any) => m !== source);
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)];
          const damage = new Damage(source, target, 1);
          damage.trigger(source);
        }
      }
    }
  },
});

// LOOT_375 - Scourge
cardScriptsRegistry.register('LOOT_375', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage to all minions - handled by game
  },
});

// LOOT_388 - Shudderwraith
cardScriptsRegistry.register('LOOT_388', {
  play: (ctx: ActionContext) => {
    // Deal 4 damage - handled by game
  },
});

// LOOT_413 - Meat Wagon
cardScriptsRegistry.register('LOOT_413', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Summon a minion from your deck - handled by game
  },
});
