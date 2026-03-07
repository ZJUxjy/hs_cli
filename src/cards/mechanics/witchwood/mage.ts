// witchwood - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Freeze, Give } from '../../../actions';

// GIL_116 - Vex Crow - Battlecry: If you controlling another Mage, add 3 Murlocs to your hand
cardScriptsRegistry.register('GIL_116', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Check if controlling another mage - would need game state
  },
});

// GIL_549 - Duskbreaker - Battlecry: If you're holding a Dragon, deal 3 damage to all other minions
cardScriptsRegistry.register('GIL_549', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(ctx.source, minion, 3);
        damage.trigger(ctx.source);
      }
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 3);
      damage.trigger(ctx.source);
    }
  },
});

// GIL_640 - Cinderstorm - Deal 5 damage randomly split among enemy characters
cardScriptsRegistry.register('GIL_640', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const targets: any[] = [...(opponent.field || [])];
    if (opponent.hero) targets.push(opponent.hero);

    // Deal 1 damage 5 times randomly
    for (let i = 0; i < 5; i++) {
      if (targets.length === 0) break;
      const randomIndex = Math.floor(Math.random() * targets.length);
      const target = targets[randomIndex];
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// GIL_645 - Snap Freeze - Freeze a minion. If it's already Frozen, destroy it
cardScriptsRegistry.register('GIL_645', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if (target.frozen) {
        target.destroyed = true;
      } else {
        target.frozen = true;
      }
    }
  },
});

// GIL_664 - Arcane Typo - Put a 'Fireball' into your opponent's hand
cardScriptsRegistry.register('GIL_664', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const giveAction = new Give('CS2_025');
    giveAction.trigger(ctx.source, opponent);
  },
});

// GIL_691 - Frost Lich Jaina - Battlecry: Summon a 3/6 Water Elemental
cardScriptsRegistry.register('GIL_691', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('ICC_823t');
    summonAction.trigger(ctx.source);
  },
});

// GIL_838 - Witchwood Apple - Draw 3 cards
cardScriptsRegistry.register('GIL_838', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// GIL_147 - Bonfire - Draw 2 cards
cardScriptsRegistry.register('GIL_147', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// GIL_548 - Mirror Entity - Already in classic
cardScriptsRegistry.register('GIL_548', {
});

// GIL_801 - Shudderwraith - Already in icecrown
cardScriptsRegistry.register('GIL_801', {
});
