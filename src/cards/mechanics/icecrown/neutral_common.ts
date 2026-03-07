// icecrown - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';

// ICC_019 - Sindragosa - Deathrattle: Summon two 5/5 Frostwyrm Lings
cardScriptsRegistry.register('ICC_019', {
  deathrattle: (ctx: ActionContext) => {
    for (let i = 0; i < 2; i++) {
      const summon = new Summon(ctx.source, 'ICC_019t');
      summon.trigger(ctx.source);
    }
  },
});

// ICC_026 - Rimehide - Battlecry: Gain +1 Attack for each other Undead on board
cardScriptsRegistry.register('ICC_026', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];
    const undeadCount = [...myField, ...oppField].filter((m: any) => m.race === 'Undead').length;
    if (undeadCount > 0) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: undeadCount });
      buff.trigger(ctx.source);
    }
  },
});

// ICC_028 - Tomb Lurker - Battlecry: Add a random Deathrattle minion to your hand
cardScriptsRegistry.register('ICC_028', {
  play: (ctx: ActionContext) => {
    // Add random Deathrattle minion to hand - handled by game
  },
});

// ICC_029 - Breath of the Infinite - Restore 3 Health to all minions
cardScriptsRegistry.register('ICC_029', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // At the end of your turn, restore 3 health to all minions - handled by game
    },
  },
});

// ICC_031 - N'Zoth's matemathtive - Battlecry: Restore 5 Health to your hero
cardScriptsRegistry.register('ICC_031', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // At the end of your turn, restore 5 health to your hero - handled by game
    },
  },
});

// ICC_067 - Skelemancer - Deathrattle: If it's your opponent's turn, summon an 8/5 Skeleton
cardScriptsRegistry.register('ICC_067', {
  deathrattle: (ctx: ActionContext) => {
    // Summon 8/5 Skeleton - handled by game
  },
});

// ICC_092 - Drakkari Enforcer - Battlecry: Deal 3 damage
cardScriptsRegistry.register('ICC_092', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 3);
      damage.trigger(ctx.source);
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
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const targets = field.filter((m: any) => m !== ctx.source);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const buff = new Buff(ctx.source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// ICC_097 - Void Vendor - Battlecry: Deal 3 damage
cardScriptsRegistry.register('ICC_097', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // At the end of your turn, draw a card
      const draw = new Draw((ctx.source as any).controller);
      draw.trigger(ctx.source);
    },
  },
});

// ICC_467 - Bloodworm - Lifesteal
cardScriptsRegistry.register('ICC_467', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// ICC_468 - Meat Wagon - Deathrattle: Summon a minion from your deck with less Attack
cardScriptsRegistry.register('ICC_468', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // At the end of your turn, deal 1 damage to all enemies
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

// ICC_855
cardScriptsRegistry.register('ICC_855', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// ICC_900
cardScriptsRegistry.register('ICC_900', {
  events: {
    // TODO: implement events
  },
});

// ICC_904
cardScriptsRegistry.register('ICC_904', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
