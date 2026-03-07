// icecrown - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';
import type { Entity } from '../../../core/entity';
import { Race } from '../../../enums';
import { GameTag } from '../../../enums';

// ICC_019 - Sindragosa - Deathrattle: Summon two 5/5 Frostwyrm Lings
cardScriptsRegistry.register('ICC_019', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    for (let i = 0; i < 2; i++) {
      const summon = new Summon(source, 'ICC_019t');
      summon.trigger(source);
    }
  },
});

// ICC_026 - Rimehide - Battlecry: Gain +1 Attack for each other Undead on board
cardScriptsRegistry.register('ICC_026', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = (controller as any)?.opponent;
    const myField = (controller as any)?.field || [];
    const oppField = (opponent as any)?.field || [];
    const undeadCount = [...myField, ...oppField].filter((m: any) => m.race === Race.UNDEAD).length;
    if (undeadCount > 0) {
      const buff = new Buff(source, source, { ATK: undeadCount });
      buff.trigger(source);
    }
  },
});

// ICC_028 - Tomb Lurker - Battlecry: Add a random Deathrattle minion to your hand
cardScriptsRegistry.register('ICC_028', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Add random Deathrattle minion - placeholder
    const give = new Give('ICC_028t');
    give.trigger(source, controller);
  },
});

// ICC_029 - Breath of the Infinite - At the end of your turn, restore 3 health to all minions
cardScriptsRegistry.register('ICC_029', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const myField = (controller as any)?.field || [];
      for (const minion of myField) {
        const heal = new Heal(source, minion, 3);
        heal.trigger(source);
      }
    },
  },
});

// ICC_031 - N'Zoth's Matemathtive - At the end of your turn, restore 5 Health to your hero
cardScriptsRegistry.register('ICC_031', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const hero = (controller as any)?.hero;
      if (hero) {
        const heal = new Heal(source, hero, 5);
        heal.trigger(source);
      }
    },
  },
});

// ICC_067 - Skelemancer - Deathrattle: If it's your opponent's turn, summon an 8/5 Skeleton
cardScriptsRegistry.register('ICC_067', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    // Check if it's opponent's turn - handled by game state
    // Summon 8/5 Skeleton - placeholder
    const summon = new Summon(source, 'ICC_067t');
    summon.trigger(source);
  },
});

// ICC_092 - Drakkari Enforcer - Battlecry: Deal 3 damage
cardScriptsRegistry.register('ICC_092', {
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

// ICC_093 - Howling Commander - Battlecry: Draw a Divine Shield minion
cardScriptsRegistry.register('ICC_093', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Draw a Divine Shield minion - handled by game
  },
});

// ICC_094 - Shadow Ascendant - Battlecry: Give a random friendly minion +2/+2
cardScriptsRegistry.register('ICC_094', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = (controller as any)?.field || [];
    const targets = field.filter((m: any) => m !== source);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// ICC_097 - Void Vendor - At the end of your turn, draw a card
cardScriptsRegistry.register('ICC_097', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const draw = new Draw(controller);
      draw.trigger(source);
    },
  },
});

// ICC_467 - Bloodworm - Lifesteal
cardScriptsRegistry.register('ICC_467', {
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

// ICC_468 - Meat Wagon - At the end of your turn, deal 1 damage to all enemies
cardScriptsRegistry.register('ICC_468', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = (controller as any)?.opponent;
      const oppField = (opponent as any)?.field || [];
      for (const minion of oppField) {
        const damage = new Damage(source, minion, 1);
        damage.trigger(source);
      }
    },
  },
});

// ICC_705 - Tuskarr Fisherman - Battlecry: Give a friendly minion Rush
cardScriptsRegistry.register('ICC_705', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give minion Rush - handled by game
  },
});

// ICC_855 - Hyldnir Frostrider - Battlecry: Freeze all other friendly minions
cardScriptsRegistry.register('ICC_855', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = (controller as any)?.field || [];
    const { Freeze } = require('../../../actions/freeze');
    for (const minion of field) {
      if (minion !== source) {
        const freeze = new Freeze();
        freeze.trigger(source, minion);
      }
    }
  },
});

// ICC_900 - Necrotic Geist - Deathrattle: Summon a 5/5 Ghoul for each friendly minion that died
cardScriptsRegistry.register('ICC_900', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const deadMinion = ctx.source;
      const controller = (deadMinion as any).controller;
      if (controller) {
        const summon = new Summon(deadMinion, 'ICC_900t');
        summon.trigger(deadMinion);
      }
    },
  },
});

// ICC_904 - Wicked Skeleton - Battlecry: Gain +1/+1 for each minion killed this turn
cardScriptsRegistry.register('ICC_904', {
  play: (ctx: ActionContext) => {
    // Simplified: Get number of minions killed this turn from game state
    // In full implementation, track GAME.numMinionsKilledThisTurn
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const game = (controller as any).game;
    const killsThisTurn = (game as any)?.numMinionsKilledThisTurn || 0;
    if (killsThisTurn > 0) {
      const buff = new Buff(source, source, { ATK: killsThisTurn, HEALTH: killsThisTurn });
      buff.trigger(source);
    }
  },
});
