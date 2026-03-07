// boomsday - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Draw, Summon } from '../../../actions';

// BOT_034 - Venomizer
// Battlecry: Give your other Mechs Poisonous
cardScriptsRegistry.register('BOT_034', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field as any[];
    if (!field) return;

    for (const minion of field) {
      if (minion !== source && (minion as any).race === 'MECHANICAL') {
        (minion as any).poisonous = true;
      }
    }
  },
});

// BOT_035
cardScriptsRegistry.register('BOT_035', {
});

// BOT_038 - Secret Plan
// Discover a Secret
cardScriptsRegistry.register('BOT_038', {
  requirements: {
    // Discover effect handled by game
  },
  play: (ctx: ActionContext) => {
    // Discover a secret - handled by game
  },
});

// BOT_039
cardScriptsRegistry.register('BOT_039', {
});

// BOT_251 - Worgen Abomination
// At the end of your turn, deal 2 damage to all other minions
cardScriptsRegistry.register('BOT_251', {
  deathrattle: (ctx: ActionContext) => {
    // At end of turn, deal 2 damage to all other minions - handled by game
  },
});

// BOT_251e
cardScriptsRegistry.register('BOT_251e', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// BOT_033 - Cybertech Chip
// Battlecry: Give your minions "Deathrattle: Summon a 1/1 Rat"
cardScriptsRegistry.register('BOT_033', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field as any[];
    if (!field) return;

    for (const minion of field) {
      if (minion !== source) {
        (minion as any).deathrattleSummonRat = true;
      }
    }
  },
});

// BOT_402 - Boommaster Flark
// Battlecry: Deal 10 damage randomly split among all enemy minions
cardScriptsRegistry.register('BOT_402', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    if (!opponent) return;

    const oppField = opponent?.field as any[] || [];
    if (oppField.length === 0) return;

    // Deal 10 damage randomly split
    let damageRemaining = 10;
    const targets = [...oppField];
    while (damageRemaining > 0 && targets.length > 0) {
      const randomIndex = Math.floor(Math.random() * targets.length);
      const target = targets[randomIndex];

      const damage = new Damage(source, target, 1);
      damage.trigger(source);

      damageRemaining--;

      if ((target as any).dead || (target as any).health <= 0) {
        targets.splice(randomIndex, 1);
      }
    }
  },
});

// BOT_429 - Unleash the Beast
// Battlecry: Summon a 5/5 Wyvern with Rush
cardScriptsRegistry.register('BOT_429', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const summonAction = new Summon(ctx.source, 'BOT_429t');
    summonAction.trigger(ctx.source);
  },
});

// BOT_437 - Wing Commander
// Battlecry: Give all friendly Mechs +2 Attack
cardScriptsRegistry.register('BOT_437', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field as any[];
    if (!field) return;

    for (const minion of field) {
      if ((minion as any).race === 'MECHANICAL') {
        (minion as any).bonusAttack = ((minion as any).bonusAttack || 0) + 2;
      }
    }
  },
});

// BOT_437e - Wing Commander buff
cardScriptsRegistry.register('BOT_437e', {
  events: {
    // Handled by game
  },
});

// BOT_438 - Springpaw
// Battlecry: Summon a random Beast
cardScriptsRegistry.register('BOT_438', {
  play: (ctx: ActionContext) => {
    // Summon random Beast - handled by game
  },
});

// BOT_438e - Springpaw buff
cardScriptsRegistry.register('BOT_438e', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});
