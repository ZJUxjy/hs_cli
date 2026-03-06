// boomsday - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage } from '../../../actions';
import { Entity } from '../../../core/entity';

// BOT_280
cardScriptsRegistry.register('BOT_280', {
  events: {
    // TODO: implement events
  },
});

// BOT_280e
cardScriptsRegistry.register('BOT_280e', {
});

// BOT_296
cardScriptsRegistry.register('BOT_296', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_401
cardScriptsRegistry.register('BOT_401', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BOT_447
cardScriptsRegistry.register('BOT_447', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_511
cardScriptsRegistry.register('BOT_511', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_511t
cardScriptsRegistry.register('BOT_511t', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_540
cardScriptsRegistry.register('BOT_540', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_544 - Loose Specimen
// Battlecry: Deal 6 damage randomly split among other friendly minions
cardScriptsRegistry.register('BOT_544', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field as Entity[];

    if (!field || field.length <= 1) return; // Only source, no other minions

    // Get other friendly minions (exclude self)
    const otherMinions = field.filter((minion: Entity) => minion !== source);
    if (otherMinions.length === 0) return;

    // Deal 6 damage randomly split
    let damageRemaining = 6;
    while (damageRemaining > 0 && otherMinions.length > 0) {
      // Pick a random minion
      const randomIndex = Math.floor(Math.random() * otherMinions.length);
      const target = otherMinions[randomIndex];

      // Deal 1 damage
      const damageAction = new Damage(source, target, 1);
      damageAction.trigger(source);

      damageRemaining--;

      // Remove dead minions
      if ((target as any).dead || (target as any).health <= 0) {
        otherMinions.splice(randomIndex, 1);
      }
    }
  },
});

// BOT_552
cardScriptsRegistry.register('BOT_552', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_559
cardScriptsRegistry.register('BOT_559', {
  events: { /* TODO */ },
});
