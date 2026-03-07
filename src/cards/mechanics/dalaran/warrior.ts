// dalaran - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_060 - Clockwork Goblin - Battlecry: Shuffle a Bomb into your opponent's deck
cardScriptsRegistry.register('DAL_060', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const { Shuffle } = require('../../../actions/shuffle');
    // Shuffle a bomb into opponent's deck - simplified
  },
});

// DAL_064 - Blastmaster Boom - Battlecry: Summon two 1/1 Boom Bots for each Bomb in your opponent's deck
cardScriptsRegistry.register('DAL_064', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const deck = opponent.deck || [];

    // Count bombs in opponent's deck
    let bombCount = 0;
    for (const card of deck) {
      if ((card as any).id && (card as any).id.includes('BOT')) {
        bombCount++;
      }
    }

    // Summon 2 Boom Bots for each bomb
    const { Summon } = require('../../../actions/summon');
    for (let i = 0; i < bombCount * 2; i++) {
      const summonAction = new Summon('DAL_064t');
      summonAction.trigger(ctx.source);
    }
  },
});

// DAL_070 - The Boom Reaver - Battlecry: Summon a copy of a minion in your deck. Give it Rush
cardScriptsRegistry.register('DAL_070', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    const minions = deck.filter((c: any) => c.type === 'minion');

    if (minions.length > 0) {
      const randomIndex = Math.floor(Math.random() * minions.length);
      const randomMinion = minions[randomIndex];

      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon(randomMinion);
      summonAction.trigger(ctx.source);
    }
  },
});

// DAL_759
cardScriptsRegistry.register('DAL_759', {
  events: {
    // TODO: implement events
  },
});

// DAL_770 - Omega Devastator - Battlecry: If you have 10 Mana Crystals, deal 10 damage to a minion
cardScriptsRegistry.register('DAL_770', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const maxMana = controller.maxResources || 10;

    if (maxMana >= 10 && ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, ctx.target, 10);
      damage.trigger(ctx.source);
    }
  },
});

// DAL_059
cardScriptsRegistry.register('DAL_059', {
  requirements: {
    // TODO: add requirements
  },
});

// DAL_062
cardScriptsRegistry.register('DAL_062', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// DAL_062e
cardScriptsRegistry.register('DAL_062e', {
  events: {
    // TODO: implement events
  },
});

// DAL_769 - Improve Morale - Deal $1 damage to a minion. If it survives, add a Lackey to your hand
cardScriptsRegistry.register('DAL_769', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);

      // If it survives, add a Lackey to hand
      if (!target.destroyed && target.health > 0) {
        const controller = (ctx.source as any).controller;
        const { Draw } = require('../../../actions/draw');
        const drawAction = new Draw();
        drawAction.trigger(controller);
      }
    }
  },
});

// DAL_063
cardScriptsRegistry.register('DAL_063', {
  events: { /* TODO */ },
});
