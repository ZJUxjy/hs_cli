// gvg - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Give, Draw, Summon } from '../../../actions';

// GVG_020 - Floating Watcher - Battlecry: If you have 3+ Mechs, gain +4/+4
cardScriptsRegistry.register('GVG_020', {
  events: {
    // When you draw a card, gain +1 Attack - handled by game
  },
});

// GVG_021 - Son of the Flame - Deal 6 damage
cardScriptsRegistry.register('GVG_021', {
});

// GVG_077 - Twisting Nether - Destroy all minions
cardScriptsRegistry.register('GVG_077', {
  events: {
    // Destroy all minions - handled by game
  },
});

// GVG_100 - Void Crusher - Battlecry: Destroy a random enemy minion. Deathrattle: Your minions get +1/+1
cardScriptsRegistry.register('GVG_100', {
  events: {
    // Deathrattle: Your minions get +1/+1 - handled by game
  },
});

// GVG_015 - Flame Imp - Battlecry: Deal 3 damage to your hero
cardScriptsRegistry.register('GVG_015', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hero = controller.hero;
    const damage = new Damage(source, hero, 3);
    damage.trigger(source);
  },
});

// GVG_019 - Imp-losion - Deal 2 damage to a minion. Summon a 1/1 Imp
cardScriptsRegistry.register('GVG_019', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// GVG_045 - Dark Bombardment - At the end of your turn, deal 2 damage to a random enemy
cardScriptsRegistry.register('GVG_045', {
  play: (ctx: ActionContext) => {
    // At end of turn, deal 2 damage to random enemy - handled by game
  },
});
