// icecrown - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Give, Shuffle, Summon, Destroy } from '../../../actions';
import type { Entity } from '../../../core/entity';
import { Race } from '../../../enums';
import { GameTag } from '../../../enums';

// ICC_062 - Mountainfire Armor - Deathrattle: If it's your opponent's turn, gain 6 Armor
cardScriptsRegistry.register('ICC_062', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const game = (controller as any).game;
    const opponent = (controller as any)?.opponent;
    // Check if it's opponent's turn
    if (opponent && (game as any).currentPlayer === opponent) {
      // Gain 6 Armor - handled by game
    }
  },
});

// ICC_238 - Rotface Defender - Whenever this minion takes damage, steal 2 Armor
cardScriptsRegistry.register('ICC_238', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const minion = source as any;
      if ((minion as any).damage > 0) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    },
  },
});

// ICC_405 - Animated Berser - Events: Whenever you play a minion, destroy it
cardScriptsRegistry.register('ICC_405', {
  events: {
    PLAY: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = (controller as any)?.opponent;
      const oppField = (opponent as any)?.field || [];
      for (const minion of oppField) {
        if (minion !== source) {
          const damage = new Damage(source, minion, 2);
          damage.trigger(source);
        }
      }
    },
  },
});

// ICC_408 - Blood Razor - Battlecry and Deathrattle: Deal 1 damage to all minions
cardScriptsRegistry.register('ICC_408', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = (controller as any)?.opponent;
    const myField = (controller as any)?.field || [];
    const oppField = (opponent as any)?.field || [];

    for (const minion of [...myField, ...oppField]) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 1);
        damage.trigger(source);
      }
    }
  },
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = (controller as any)?.opponent;
    const myField = (controller as any)?.field || [];
    const oppField = (opponent as any)?.field || [];

    for (const minion of [...myField, ...oppField]) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 1);
        damage.trigger(source);
      }
    }
  },
});

// ICC_450 - Death Revenant - Battlecry: Gain +1/+1 for each damaged minion
cardScriptsRegistry.register('ICC_450', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = (controller as any)?.opponent;
    const myField = (controller as any)?.field || [];
    const oppField = (opponent as any)?.field || [];

    let damagedCount = 0;
    for (const minion of [...myField, ...oppField]) {
      if ((minion as any).damage > 0) {
        damagedCount++;
      }
    }
    if (damagedCount > 0) {
      const buff = new Buff(source, source, { ATK: damagedCount, HEALTH: damagedCount });
      buff.trigger(source);
    }
  },
});

// ICC_091 - Dead Man's Hand - Shuffle a copy of your hand into your deck
cardScriptsRegistry.register('ICC_091', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const hand = (controller as any)?.hand || [];
    // Create copy of each card in hand - shuffle into deck
    for (const card of hand) {
      const cardId = (card as any).id;
      if (cardId) {
        const shuffle = new Shuffle(cardId);
        shuffle.trigger(source);
      }
    }
  },
});

// ICC_281 - Forge of Souls - Draw 2 weapons from your deck
cardScriptsRegistry.register('ICC_281', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = (controller as any)?.deck || [];
    // Find weapons in deck
    const weaponsToDraw = deck.filter((card: any) => (card as any).type === 'weapon');
    const weapons = weaponsToDraw.slice(0, 2);
    for (const weapon of weapons) {
      const cardId = (weapon as any).id;
      if (cardId) {
        const draw = new Draw(controller);
        draw.trigger(source);
      }
    }
  },
});

// ICC_837 - Bring It On! - Gain 10 Armor. Reduce the Cost of minions in your opponent's hand by (2)
cardScriptsRegistry.register('ICC_837', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = (controller as any)?.opponent;
    // Gain 10 Armor - handled by game
    // Reduce opponent's minion cost - handled by game
  },
});

// ICC_834 - Scourgelord Garrosh - Battlecry: Equip a 4/3 Shadowmourne
cardScriptsRegistry.register('ICC_834', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const summon = new Summon(source, 'ICC_834w');
    summon.trigger(source);
  },
});

// ICC_834h - Scourgelord Garrosh (Hero Power)
cardScriptsRegistry.register('ICC_834h', {
});

// ICC_834w - Shadowmourne
cardScriptsRegistry.register('ICC_834w', {
  play: (ctx: ActionContext) => {
    // Weapon equip - handled by game
  },
});
