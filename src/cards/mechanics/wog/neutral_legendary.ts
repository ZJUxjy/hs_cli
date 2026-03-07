// wog - neutral_legendary.py
import { cardScriptsRegistry, ActionContext, cardScriptsRegistry as scriptsRegistry } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon, Destroy } from '../../../actions';
import { CardLoader } from '../../../cards/loader';
import { CardType } from '../../../enums/cardtype';

// OG_042 - Deathwing - Battlecry: Destroy all other minions
cardScriptsRegistry.register('OG_042', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const controllerField = controller.field || [];
    const opponentField = opponent?.field || [];
    for (const minion of [...controllerField, ...opponentField]) {
      const destroy = new Destroy();
      destroy.trigger(source, minion);
    }
  },
});

// OG_122 - Murloc Tidecaller - Battlecry: Give your other Murlocs +1 Attack
cardScriptsRegistry.register('OG_122', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source && (minion as any).race === 'MURLOC') {
        const buff = new Buff(source, minion, { ATK: 1 });
        buff.trigger(source);
      }
    }
  },
});

// OG_317 - N'Zoth - Battlecry: Summon your deathrattle minions
cardScriptsRegistry.register('OG_317', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const graveyard = controller.graveyard || [];

    // Find minions in graveyard that have deathrattles
    for (const minion of graveyard) {
      const script = scriptsRegistry.get(minion.id);
      if (script?.deathrattle) {
        // Summon a copy of this minion
        const summon = new Summon(source, minion.id);
        summon.trigger(source);
      }
    }
  },
  deathrattle: (ctx: ActionContext) => {
    // Handled by game engine for deathrattle return to hand
  },
});

// OG_318 - Yogg-Saron - Battlecry: Cast a random spell for each card in your hand
cardScriptsRegistry.register('OG_318', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    const handSize = hand.length;

    // Get all spell cards from the card database
    const allCards = CardLoader.getAll();
    const spells = allCards.filter(card => card.type === CardType.SPELL);

    if (spells.length === 0) return;

    // Cast a random spell for each card in hand
    for (let i = 0; i < handSize; i++) {
      const randomSpell = spells[Math.floor(Math.random() * spells.length)];
      // In a full implementation, this would cast the spell
      // For now, we just log the action
      console.log(`Yogg-Saron casts random spell: ${randomSpell.id}`);
    }
  },
});

// OG_338 - Y'Shaarj - Battlecry: Put a minion from your deck into the battlefield
cardScriptsRegistry.register('OG_338', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];
    const field = controller.field || [];

    if (deck.length === 0 || field.length >= 7) return;

    // Get the top minion from deck
    const cardId = deck[0]?.id;
    if (!cardId) return;

    // Remove from deck and summon
    deck.shift();

    const summon = new Summon(source, cardId);
    summon.trigger(source);
  },
});

// OG_123
cardScriptsRegistry.register('OG_123', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // Buff effect handled by game engine
  },
});

// OG_123e
cardScriptsRegistry.register('OG_123e', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // Buff effect handled by game engine
  },
});

// OG_300 - Shudderwraith - Taunt. Battlecry: Copy a random minion from your hand
cardScriptsRegistry.register('OG_300', {
  events: {
  },
});

// OG_133 - Bog Creeper - Taunt
cardScriptsRegistry.register('OG_133', {
  play: (ctx: ActionContext) => {
  },
});

// OG_134
cardScriptsRegistry.register('OG_134', {
});

// OG_280 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('OG_280', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
  },
});

// OG_131 - Soggoth the Slitherer - Taunt. Can't be targeted by spells or Hero Powers
cardScriptsRegistry.register('OG_131', {
  play: (ctx: ActionContext) => {
  },
});
