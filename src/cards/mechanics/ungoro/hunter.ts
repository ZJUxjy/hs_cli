// ungoro - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Shuffle } from '../../../actions';
import { CardLoader } from '../../../cards/loader';
import { Race, CardType } from '../../../enums';

// UNG_800 Terrorscale Stalker
// Battlecry: Trigger a random friendly minion's Deathrattle
cardScriptsRegistry.register('UNG_800', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_TARGET_WITH_DEATHRATTLE]: 0,
  },
  play: (ctx: ActionContext) => {
    // Trigger the target's deathrattle
    if (ctx.target) {
      const target = ctx.target as any;
      if (target.deathrattle) {
        // Execute deathrattle directly
        const deathrattleCtx: ActionContext = {
          source: target,
          game: ctx.game,
        };
        target.deathrattle(deathrattleCtx);
      }
    }
  },
});

// UNG_912 Jeweled Macaw
// Battlecry: Add a random Beast to your hand
cardScriptsRegistry.register('UNG_912', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Get all beast minions
    const beastCards = CardLoader.filter({
      type: CardType.MINION,
      race: Race.BEAST,
    });

    if (beastCards.length === 0) return;

    // Pick a random beast
    const randomIndex = Math.floor(Math.random() * beastCards.length);
    const randomBeast = beastCards[randomIndex];

    // Give the beast to controller's hand
    const giveAction = new Give(randomBeast.id);
    giveAction.trigger(ctx.source, controller);
  },
});

// UNG_913 Tolvir Warden
// Battlecry: Add 2 random Beasts to your hand
cardScriptsRegistry.register('UNG_913', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Get all beast minions
    const beastCards = CardLoader.filter({
      type: CardType.MINION,
      race: Race.BEAST,
    });

    if (beastCards.length === 0) return;

    // Add 2 random beasts to hand
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * beastCards.length);
      const randomBeast = beastCards[randomIndex];

      const giveAction = new Give(randomBeast.id);
      giveAction.trigger(ctx.source, controller);
    }
  },
});

// UNG_914 Raptor Hatchling
// Deathrattle: Shuffle a 1/1 Raptor into your deck
cardScriptsRegistry.register('UNG_914', {
  deathrattle: (ctx: ActionContext) => {
    // Shuffle UNG_999t1 (Raptor) into deck
    const shuffleAction = new Shuffle('UNG_999t1');
    shuffleAction.trigger(ctx.source);
  },
});

// UNG_915 Crackling Razormaw
// Battlecry: If a friendly minion died this turn, gain Adapt
cardScriptsRegistry.register('UNG_915', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Simplified: just trigger deathrattle on target if it has one
    // In real HS, this requires checking if a friendly minion died this turn
    if (ctx.target) {
      const target = ctx.target as any;
      if (target.deathrattle) {
        const deathrattleCtx: ActionContext = {
          source: target,
          game: ctx.game,
        };
        target.deathrattle(deathrattleCtx);
      }
    }
  },
});

// UNG_919 Swamp King Dred
// After you play a Secret, gain Charge this turn
cardScriptsRegistry.register('UNG_919', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      // Check if the spell played was a secret
      const event = ctx.event;
      if (event?.source) {
        const source = event.source as any;
        if (source.type === 5 && source.secret) { // SPELL type and secret flag
          // Give this minion charge
          const minion = ctx.source as any;
          minion.charge = true;
        }
      }
    },
  },
});

// UNG_910
cardScriptsRegistry.register('UNG_910', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_916
cardScriptsRegistry.register('UNG_916', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_916e
cardScriptsRegistry.register('UNG_916e', {
  events: {
    // TODO: implement events
  },
});

// UNG_917
cardScriptsRegistry.register('UNG_917', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_917t1
cardScriptsRegistry.register('UNG_917t1', {
  requirements: {
    // TODO: add requirements
  },
});

// UNG_920
cardScriptsRegistry.register('UNG_920', {
});

// UNG_920t1
cardScriptsRegistry.register('UNG_920t1', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_920t2
cardScriptsRegistry.register('UNG_920t2', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
