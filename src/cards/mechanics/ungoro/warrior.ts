// ungoro - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage } from '../../../actions';

// UNG_838 - Direhorn Hatchling - Taunt. Deathrattle: Summon a 6/9 Direhorn
cardScriptsRegistry.register('UNG_838', {
  deathrattle: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'UNG_838t');
    summon.trigger(ctx.source);
  },
});

// UNG_925 - Ornery Direhorn - Taunt. Battlecry: Adapt
cardScriptsRegistry.register('UNG_925', {
  play: (ctx: ActionContext) => {
    // Adapt effect - simplified: give +1/+1
    const source = ctx.source as any;
    source.attack = (source.attack || 6) + 1;
    source.health = (source.health || 6) + 1;
  },
});

// UNG_926 - Cornered Sentry - Taunt. Battlecry: Summon three 1/1 Raptors for your opponent
cardScriptsRegistry.register('UNG_926', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const { Summon } = require('../../../actions/summon');
    // Summon 3 Raptors for opponent
    for (let i = 0; i < 3; i++) {
      const summonAction = new Summon('UNG_926t1');
      summonAction.trigger(opponent);
    }
  },
});

// UNG_933 - King Mosh - Battlecry: Destroy all damaged minions
cardScriptsRegistry.register('UNG_933', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];

    // Destroy all damaged minions on both fields
    for (const minion of [...myField, ...oppField]) {
      if ((minion as any).damage && (minion as any).damage > 0) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// UNG_957 - Tar Lord - Taunt. Deathrattle: Deal 1 damage to all enemies.
cardScriptsRegistry.register('UNG_957', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const { Damage } = require('../../../actions/damage');
    // Deal 1 damage to all enemies - simplified
    const damage = new Damage(ctx.source, opponent.hero, 1);
    damage.trigger(ctx.source);
  },
});

// UNG_922 - Explore Un'Goro - Quest: Replace your deck with "Discover a card" spells. Reward: "I Am Murloc"
cardScriptsRegistry.register('UNG_922', {
  play: (ctx: ActionContext) => {
    // Quest card - handled by game
  },
});

// UNG_922t1 - I Am Murloc - Deal 4 damage. Summon a Murloc.
cardScriptsRegistry.register('UNG_922t1', {
  play: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 4);
    damage.trigger(ctx.source);
    // Summon murloc - handled by game
  },
});

// UNG_923 - Iron Hide - Gain 5 Armor.
cardScriptsRegistry.register('UNG_923', {
  play: (ctx: ActionContext) => {
    const { GainArmor } = require('../../../actions/gainarmor');
    const gainArmor = new GainArmor(ctx.source, 5);
    gainArmor.trigger(ctx.source);
  },
});

// UNG_927 - Sudden Genesis - Summon copies of your damaged minions.
cardScriptsRegistry.register('UNG_927', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if ((minion as any).damage && (minion as any).damage > 0) {
        const summon = new Summon(ctx.source, minion.id);
        summon.trigger(ctx.source);
      }
    }
  },
});

// UNG_934 - Fire Plume's Heart - Quest: Play 7 Taunt minions. Reward: Sulfuras.
cardScriptsRegistry.register('UNG_934', {
  // Quest card - handled by game
});

// UNG_934t1 - Sulfuras - Battlecry: Deal 8 damage. Your hero is Immune this turn.
cardScriptsRegistry.register('UNG_934t1', {
  play: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 8);
    damage.trigger(ctx.source);
    // Hero immune - handled by game
  },
});

// UNG_934t2
cardScriptsRegistry.register('UNG_934t2', {
});

// UNG_929
cardScriptsRegistry.register('UNG_929', {
});

// UNG_929e
cardScriptsRegistry.register('UNG_929e', {
});
