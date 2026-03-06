// boomsday - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { CardType, Race } from '../../../enums';
import { Entity } from '../../../core/entity';
import { Summon } from '../../../actions';

// BOT_238 - Dr. Boom, Mad Genius
// Battlecry: For the rest of the game, your Mechs have Rush
cardScriptsRegistry.register('BOT_238', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const game = ctx.game;

    // Mark that Dr. Boom's battlecry has been used
    (controller as any).mechsHaveRush = true;

    // Give rush to all existing mechs on the field
    const field = controller?.field as Entity[];
    if (field) {
      for (const minion of field) {
        if ((minion as any).race === Race.MECHANICAL) {
          (minion as any).rush = true;
        }
      }
    }

    // Also need to handle future mechs - we can
    // that will be checked when mechs are summoned use a global flag
    // This is a simplified implementation
  },
  events: {
    MINION_SUMMON: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;

      // If controller has mechsHaveRush from Dr. Boom
      if ((controller as any).mechsHaveRush) {
        const event = ctx.event;
        if (event?.source) {
          const summonedMinion = event.source as Entity;
          // Check if the summoned minion is a Mech
          if ((summonedMinion as any).race === Race.MECHANICAL) {
            (summonedMinion as any).rush = true;
          }
        }
      }
    },
  },
});

// BOT_069 - The Boomship
// Battlecry: Summon 3 random minions from your hand. Give them Rush
cardScriptsRegistry.register('BOT_069', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const hand = controller?.hand as Entity[];

    if (!hand || hand.length === 0) return;

    // Get all minion cards from hand
    const minionsInHand = hand.filter((card: Entity) => (card as any).type === CardType.MINION);

    if (minionsInHand.length === 0) return;

    // Summon up to 3 random minions
    const summonCount = Math.min(3, minionsInHand.length);
    for (let i = 0; i < summonCount; i++) {
      if (minionsInHand.length === 0) break;

      // Pick a random minion
      const randomIndex = Math.floor(Math.random() * minionsInHand.length);
      const minionToSummon = minionsInHand[randomIndex];

      // Remove from hand
      minionsInHand.splice(randomIndex, 1);
      const handIndex = hand.indexOf(minionToSummon);
      if (handIndex !== -1) {
        hand.splice(handIndex, 1);
      }

      // Summon the minion
      const summonAction = new Summon(source, minionToSummon as any);
      summonAction.trigger(source);

      // Give rush to the summoned minion
      const field = controller?.field as Entity[];
      if (field && field.length > 0) {
        const lastMinion = field[field.length - 1];
        (lastMinion as any).rush = true;
      }
    }
  },
});

// BOT_424
cardScriptsRegistry.register('BOT_424', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BOT_548
cardScriptsRegistry.register('BOT_548', {
});

// BOT_548e
cardScriptsRegistry.register('BOT_548e', {
});

// BOT_555
cardScriptsRegistry.register('BOT_555', {
  events: {
    // TODO: implement events
  },
});

// BOT_573
cardScriptsRegistry.register('BOT_573', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_700
cardScriptsRegistry.register('BOT_700', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BOT_700e
cardScriptsRegistry.register('BOT_700e', {
  deathrattle: (ctx: ActionContext) => { /* TODO */ },
});
