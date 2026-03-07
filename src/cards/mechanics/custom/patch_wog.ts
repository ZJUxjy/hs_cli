// custom - patch_wog.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy, Bounce } from '../../../actions';

// VAN_NEW1_008 - Yogg-Saron, Hope's End - Battlecry: Cast a random spell for each card you've played this game
cardScriptsRegistry.register('VAN_NEW1_008', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Cast a random spell (handled by game)
  },
});

// VAN_NEW1_008a - Choice: Cast a spell
cardScriptsRegistry.register('VAN_NEW1_008a', {
  play: (ctx: ActionContext) => {
    // Cast a random spell (handled by game)
  },
});

// VAN_EX1_571 - Obsidian Destroyer - Battlecry: Summon a 1/1 Shadow
cardScriptsRegistry.register('VAN_EX1_571', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summon = new Summon(source, 'EX1_tk9');
    summon.trigger(source);
  },
});

// VAN_EX1_tk9b - Shadow (token)
cardScriptsRegistry.register('VAN_EX1_tk9b', {
});

// VAN_EX1_166 - Mindgames - Put a copy of a random minion from your opponent's deck into your hand
cardScriptsRegistry.register('VAN_EX1_166', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
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

// VAN_CS2_203 - Jungle Panther - Stealth
cardScriptsRegistry.register('VAN_CS2_203', {
});

// VAN_EX1_005 - Tauren Warrior - Taunt
cardScriptsRegistry.register('VAN_EX1_005', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target || source;
    const buff = new Buff(source, target, { ATK: 3, HEALTH: 3 });
    buff.trigger(source);
  },
});

// VAN_CS2_084 - Wrath - Choose One - Deal 3 damage to a minion or Deal 1 damage to all enemy minions
cardScriptsRegistry.register('VAN_CS2_084', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 3);
      damage.trigger(source);
    }
  },
});

// VAN_CS2_233 - Savagery - Deal your hero's Attack damage to a minion
cardScriptsRegistry.register('VAN_CS2_233', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const target = ctx.target;
    const heroAttack = controller.hero?.attack || 0;
    if (target) {
      const damage = new Damage(source, target, heroAttack);
      damage.trigger(source);
    }
  },
});

// VAN_NEW1_019 - Sneed's Old Shredder - Deathrattle: Summon a random legendary minion
cardScriptsRegistry.register('VAN_NEW1_019', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Summon a random legendary minion (handled by game)
  },
});

// VAN_EX1_029 - leper gnome - Deathrattle: Deal 2 damage to the enemy hero
cardScriptsRegistry.register('VAN_EX1_029', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const damage = new Damage(source, opponent.hero, 2);
    damage.trigger(source);
  },
});

// VAN_EX1_089 - Panther - Charge
cardScriptsRegistry.register('VAN_EX1_089', {
});

// VAN_EX1_620 - Fungal Enchanter - Battlecry: Restore 2 Health to all friendly characters
cardScriptsRegistry.register('VAN_EX1_620', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Restore 2 Health to all friendly minions
    const field = controller.field || [];
    for (const minion of field) {
      const heal = new Heal(source, minion, 2);
      heal.trigger(source);
    }

    // Restore 2 Health to hero
    if (controller.hero) {
      const heal = new Heal(source, controller.hero, 2);
      heal.trigger(source);
    }
  },
});

// VAN_NEW1_014 - Pint-Sized Summoner - The first minion you play each turn costs (2) less
cardScriptsRegistry.register('VAN_NEW1_014', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // First minion costs (2) less (handled by game)
  },
});

// VAN_NEW1_014e - Pint-Sized Summoner buff
cardScriptsRegistry.register('VAN_NEW1_014e', {
});
