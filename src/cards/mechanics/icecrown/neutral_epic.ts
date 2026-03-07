// icecrown - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Give, Buff, Damage, Draw, Destroy } from '../../../actions';
import { Entity } from '../../../core/entity';
import { Race } from '../../../enums';
import { GameTag } from '../../../enums';

// ICC_025 - Rattling Rascal - Battlecry: Summon a 5/5 Skeleton. Deathrattle: Summon one for your opponent.
cardScriptsRegistry.register('ICC_025', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'ICC_025t');
    summon.trigger(ctx.source);
  },
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const summon = new Summon(source, 'ICC_025t');
    summon.trigger(source);
  },
});

// ICC_096 - Furnacefire Colossus - Battlecry: Discard all weapons from your hand and gain their stats.
cardScriptsRegistry.register('ICC_096', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = [...controller.hand];

    let totalAttack = 0;
    let totalDurability = 0;

    // Find all weapons in hand and discard them
    for (const card of hand) {
      if ((card as any).type === 'weapon') {
        totalAttack += (card as any).attack || 0;
        totalDurability += (card as any).durability || 0;
        // Discard the weapon
        card.zone = 'GRAVEYARD';
      }
    }

    // Remove weapons from hand array
    controller.hand = hand.filter((card: any) => card.type !== 'weapon');

    // Gain stats from discarded weapons
    if (totalAttack > 0 || totalDurability > 0) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: totalAttack, HEALTH: totalDurability });
      buff.trigger(ctx.source);
    }
  },
});

// ICC_098 - Tomb Lurker - Battlecry: Add a random Deathrattle minion that died this game to your hand.
cardScriptsRegistry.register('ICC_098', {
  play: (ctx: ActionContext) => {
    // Add random Deathrattle minion to hand - handled by game
    // In full implementation, would need game state tracking
  },
});

// ICC_701 - Skulking Geist - Battlecry: Destroy all 1-Cost spells in both hands and decks.
cardScriptsRegistry.register('ICC_701', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;

    // Destroy 1-cost spells in both decks
    const myDeck = controller.deck || [];
    const oppDeck = opponent.deck || [];

    // Destroy all 1-cost spells in my deck
    for (let i = myDeck.length - 1; i >= 0; i--) {
      const card = myDeck[i];
      if ((card as any).type === 'spell' && (card as any).cost === 1) {
        (card as any).zone = 'GRAVEYARD';
        myDeck.splice(i, 1);
      }
    }

    // Destroy all 1-cost spells in opponent's deck
    for (let i = oppDeck.length - 1; i >= 0; i--) {
      const card = oppDeck[i];
      if ((card as any).type === 'spell' && (card as any).cost === 1) {
        (card as any).zone = 'GRAVEYARD';
        oppDeck.splice(i, 1);
      }
    }

    // Destroy 1-cost spells in both hands
    const myHand = controller.hand || [];
    const oppHand = opponent.hand || [];

    for (let i = myHand.length - 1; i >= 0; i--) {
      const card = myHand[i];
      if ((card as any).type === 'spell' && (card as any).cost === 1) {
        (card as any).zone = 'GRAVEYARD';
        myHand.splice(i, 1);
      }
    }

    for (let i = oppHand.length - 1; i >= 0; i--) {
      const card = oppHand[i];
      if ((card as any).type === 'spell' && (card as any).cost === 1) {
        (card as any).zone = 'GRAVEYARD';
        oppHand.splice(i, 1);
      }
    }
  },
});

// ICC_706 - Nerubian Unraveler - Enemy spells cost (2) more.
cardScriptsRegistry.register('ICC_706', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = (controller as any)?.opponent;
    // Enemy spells cost +2 - simplified implementation
    // Full implementation would track spell cost modifier on opponent
    if (opponent) {
      (opponent as any).spellCostModifier = ((opponent as any).spellCostModifier || 0) + 2;
    }
  },
});

// ICC_810 - Deathaxe Punisher - Battlecry: Give a random Lifesteal minion in your hand +2/+2.
cardScriptsRegistry.register('ICC_810', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];

    // Find all Lifesteal minions in hand
    const lifestealMinions = hand.filter((card: any) =>
      card.type === 'minion' && card.mechanics && card.mechanics.includes('LIFESTEAL')
    );

    if (lifestealMinions.length > 0) {
      const target = lifestealMinions[Math.floor(Math.random() * lifestealMinions.length)];
      const buff = new Buff(ctx.source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// ICC_812 - Meat Wagon - Deathrattle: Summon a minion from your deck with less Attack than this.
cardScriptsRegistry.register('ICC_812', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];
    const sourceAttack = source.attack || 0;

    // Find minions with less Attack
    const candidates = deck.filter((card: any) =>
      card.type === 'minion' && (card.attack || 0) < sourceAttack
    );

    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const cardId = target.id;
      const summon = new Summon(ctx.source, cardId);
      summon.trigger(ctx.source);
    }
  },
});

// ICC_901 - Drakkari Enchanter - Your end of turn effects trigger twice.
cardScriptsRegistry.register('ICC_901', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // End of turn effects trigger twice - simplified implementation
    (controller as any).extraEndTurnEffects = true;
  },
});

// ICC_912 - Corpsetaker - Battlecry: Gain Taunt if your deck has a Taunt minion.
// Repeat for Divine Shield, Lifesteal, Windfury.
cardScriptsRegistry.register('ICC_912', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = controller.deck || [];

    // Check deck for each keyword
    const hasTaunt = deck.some((card: any) =>
      card.type === 'minion' && card.mechanics && card.mechanics.includes('Taunt')
    );
    const hasDivineShield = deck.some((card: any) =>
      card.type === 'minion' && card.mechanics && card.mechanics.includes('DIVINE_SHIELD')
    );
    const hasLifesteal = deck.some((card: any) =>
      card.type === 'minion' && card.mechanics && card.mechanics.includes('LIFESTEAL')
    );
    const hasWindfury = deck.some((card: any) =>
      card.type === 'minion' && card.mechanics && card.mechanics.includes('WINDFURY')
    );

    // Apply keywords to this minion
    if (hasTaunt) {
      if (!(source as any).mechanics) (source as any).mechanics = [];
      if (!(source as any).mechanics.includes('Taunt')) {
        (source as any).mechanics.push('Taunt');
      }
    }
    if (hasDivineShield) {
      if (!(source as any).mechanics) (source as any).mechanics = [];
      if (!(source as any).mechanics.includes('DIVINE_SHIELD')) {
        (source as any).mechanics.push('DIVINE_SHIELD');
      }
    }
    if (hasLifesteal) {
      if (!(source as any).mechanics) (source as any).mechanics = [];
      if (!(source as any).mechanics.includes('LIFESTEAL')) {
        (source as any).mechanics.push('LIFESTEAL');
      }
    }
    if (hasWindfury) {
      if (!(source as any).mechanics) (source as any).mechanics = [];
      if (!(source as any).mechanics.includes('WINDFURY')) {
        (source as any).mechanics.push('WINDFURY');
      }
    }
  },
});
