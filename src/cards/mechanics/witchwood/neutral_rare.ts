// witchwood - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// GIL_125 - Mad Hatter - Battlecry: Randomly toss 3 hats to other minions. Each hat gives +1/+1.
cardScriptsRegistry.register('GIL_125', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];

    // Randomly toss 3 hats to other minions
    const otherMinions = field.filter((m: any) => m !== source);
    const targets = [];
    for (let i = 0; i < 3 && otherMinions.length > 0; i++) {
      const idx = Math.floor(Math.random() * otherMinions.length);
      targets.push(otherMinions[idx]);
      otherMinions.splice(idx, 1);
    }

    for (const target of targets) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff(source, 'GIL_125e');
      buff.apply(target);
    }
  },
});

// GIL_202
cardScriptsRegistry.register('GIL_202', {
});

// Hand
cardScriptsRegistry.register('Hand', {
});

// GIL_202t
cardScriptsRegistry.register('GIL_202t', {
});

// Hand
cardScriptsRegistry.register('Hand', {
});

// GIL_584 - Witchwood Piper - Battlecry: Draw the lowest Cost minion from your deck
cardScriptsRegistry.register('GIL_584', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];

    // Find the lowest cost minion in deck
    let lowestCost = Infinity;
    let lowestCostMinions: any[] = [];
    for (const card of deck) {
      if (card.type === 'MINION') {
        const cost = card.cost || 0;
        if (cost < lowestCost) {
          lowestCost = cost;
          lowestCostMinions = [card];
        } else if (cost === lowestCost) {
          lowestCostMinions.push(card);
        }
      }
    }

    if (lowestCostMinions.length > 0) {
      const targetCard = lowestCostMinions[Math.floor(Math.random() * lowestCostMinions.length)];
      const { Draw } = require('../../../actions/draw');
      const draw = new Draw();
      draw.trigger(source, targetCard);
    }
  },
});

// GIL_601 - Scaleworm - Battlecry: If you're holding a Dragon, gain +1 Attack and Rush
cardScriptsRegistry.register('GIL_601', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];

    // Check if holding a Dragon
    const hasDragon = hand.some((card: any) => card.race === 'DRAGON');

    if (hasDragon) {
      source.atk = (source.atk || 0) + 1;
      source.rush = true;
    }
  },
});

// GIL_622 - Lifedrinker - Battlecry: Deal 3 damage to the enemy hero. Restore 3 health to your hero
cardScriptsRegistry.register('GIL_622', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;

    // Deal 3 damage to enemy hero
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(3);
    damageAction.trigger(source, opponent.hero);

    // Restore 3 health to your hero
    const { Heal } = require('../../../actions/heal');
    const healAction = new Heal(source, 3);
    healAction.trigger(source, controller.hero);
  },
});

// GIL_623 - Witchwood Grizzly - Taunt. Battlecry: Lose 1 Health for each card in your opponent's hand.
cardScriptsRegistry.register('GIL_623', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const opponentHandSize = opponent.hand ? opponent.hand.length : 0;

    // Deal damage to self equal to opponent's hand size
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(source, opponentHandSize);
    damage.trigger(source, source);
  },
});

// GIL_624 - Night Prowler - Battlecry: If this is the only minion on the battlefield, gain +3/+3.
cardScriptsRegistry.register('GIL_624', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];

    // Check if this is the only minion on the battlefield (including opponent's field)
    const opponent = controller.opponent;
    const oppField = opponent?.field || [];
    const totalFieldSize = (field.length || 0) + (oppField.length || 0);

    if (totalFieldSize === 1) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff(source, 'GIL_624e');
      buff.apply(source);
    }
  },
});

// GIL_648 - Chief Inspector - Battlecry: Destroy all enemy Secrets
cardScriptsRegistry.register('GIL_648', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const secrets = opponent.secrets || [];

    for (const secret of secrets) {
      (secret as any).destroyed = true;
    }
  },
});
