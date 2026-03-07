// ungoro - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Shuffle } from '../../../actions';
import { CardLoader } from '../../../cards/loader';
import { Race, CardType } from '../../../enums';
import { Entity } from '../../../core/entity';
import { CardDefinition } from '../../../cards';

// Helper function to get random beast cards
function getRandomBeastCards(count: number): CardDefinition[] {
  const beastCards = CardLoader.filter({
    type: CardType.MINION,
    race: Race.BEAST,
  });

  if (beastCards.length === 0) return [];

  const result: CardDefinition[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * beastCards.length);
    result.push(beastCards[randomIndex]);
  }
  return result;
}

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
      const target = ctx.target as Entity;
      if ((target as any).deathrattle) {
        // Execute deathrattle directly
        const deathrattleCtx: ActionContext = {
          source: target,
          game: ctx.game,
        };
        (target as any).deathrattle(deathrattleCtx);
      }
    }
  },
});

// UNG_912 Jeweled Macaw
// Battlecry: Add a random Beast to your hand
cardScriptsRegistry.register('UNG_912', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;

    // Get random beast cards
    const beasts = getRandomBeastCards(1);
    if (beasts.length === 0) return;

    // Give the beast to controller's hand
    const giveAction = new Give(beasts[0].id);
    giveAction.trigger(ctx.source, controller);
  },
});

// UNG_913 Tolvir Warden
// Battlecry: Add 2 random Beasts to your hand
cardScriptsRegistry.register('UNG_913', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;

    // Get 2 random beast cards
    const beasts = getRandomBeastCards(2);
    if (beasts.length === 0) return;

    // Add beasts to hand
    for (const beast of beasts) {
      const giveAction = new Give(beast.id);
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
      const target = ctx.target as Entity;
      if ((target as any).deathrattle) {
        const deathrattleCtx: ActionContext = {
          source: target,
          game: ctx.game,
        };
        (target as any).deathrattle(deathrattleCtx);
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
        const source = event.source as Entity;
        if (source.type === CardType.SPELL && (source as any).secret) {
          // Give this minion charge
          const minion = ctx.source as Entity;
          (minion as any).charge = true;
        }
      }
    },
  },
});

// UNG_910 - Grievous Bite - Deal 2 damage to a minion and 1 damage to adjacent minions
cardScriptsRegistry.register('UNG_910', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// UNG_916 - Stampede - Each friendly Beast gets +1/+1 this turn
cardScriptsRegistry.register('UNG_916', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if ((minion as any).race === Race.BEAST) {
        const { Buff } = require('../../../actions/buff');
        const buff = new Buff('UNG_916e', { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source, minion);
      }
    }
  },
});

// UNG_916e - Stampede Enchantment
cardScriptsRegistry.register('UNG_916e', {
});

// UNG_917 - Cave Hydra - Also damages the minions next to the target
cardScriptsRegistry.register('UNG_917', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// UNG_917t1 - Headless Horseman's Mount - Charge
cardScriptsRegistry.register('UNG_917t1', {
});

// UNG_920 - The Marsh Queen - Quest: Play 7 minions
cardScriptsRegistry.register('UNG_920', {
});

// UNG_920t1 - Queen Carnassa - Battlecry: Draw 3 beasts
cardScriptsRegistry.register('UNG_920t1', {
  play: (ctx: ActionContext) => {
    // Draw 3 random beasts
    const beasts = getRandomBeastCards(3);
    const controller = (ctx.source as any).controller;
    for (const beast of beasts) {
      const giveAction = new Give(beast.id);
      giveAction.trigger(ctx.source, controller);
    }
  },
});

// UNG_920t2 - 15/15 Body
cardScriptsRegistry.register('UNG_920t2', {
});

// UNG_908 - Infest - Give your minions "Deathrattle: Summon a random Beast"
cardScriptsRegistry.register('UNG_908', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      // Give deathrattle to summon a beast
      (minion as any).deathrattle = (ctx: ActionContext) => {
        const beasts = getRandomBeastCards(1);
        if (beasts.length > 0) {
          const { Summon } = require('../../../actions/summon');
          const summonAction = new Summon(beasts[0].id);
          summonAction.trigger(ctx.source);
        }
      };
    }
  },
});

// UNG_801 - Dispatch Kodo - Battlecry: Deal damage equal to this minion's Attack
cardScriptsRegistry.register('UNG_801', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const attack = (ctx.source as any).attack || 3;
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, ctx.target, attack);
      damage.trigger(ctx.source);
    }
  },
});
