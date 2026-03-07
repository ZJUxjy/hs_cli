// dragons - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Summon, Heal, Draw } from '../../../actions';

// DRG_010 - Druid of the Swarm (Rare)
// Choose One - Transform into a 2/1 with Rush, or a 1/3 with Taunt
cardScriptsRegistry.register('DRG_010', {
  play: (ctx: ActionContext) => {
    // Transform into a 2/1 with Rush, or a 1/3 with Taunt
  },
});

// DRG_095 - Emeriss (Legendary)
// Battlecry: Change the Cost of minions in your hand to (5)
cardScriptsRegistry.register('DRG_095', {
  play: (ctx: ActionContext) => {
    // Change the cost of minions in your hand to 5
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    for (const card of hand) {
      if ((card as any).type === 'MINION') {
        (card as any).manaCost = 5;
      }
    }
  },
});

// DRG_095e - Emeriss buff
cardScriptsRegistry.register('DRG_095e', {
});

// DRG_252 - Swamp Dragon (Common)
// Deathrattle: Add a random Dragon to your hand
cardScriptsRegistry.register('DRG_252', {
  deathrattle: (ctx: ActionContext) => {
    // Add a random Dragon to your hand
    const controller = (ctx.source as any).controller;
    // Simplified: Add a placeholder card - in real implementation would add random Dragon
    const hand = controller.hand || [];
    // In a real implementation, we would add a random dragon card
  },
});

// DRG_253 - Dragonmaw Sky Stalker (Rare)
// Deathrattle: Summon a 5/6 Dragon with Taunt
cardScriptsRegistry.register('DRG_253', {
  deathrattle: (ctx: ActionContext) => {
    // Summon a 5/6 Dragon with Taunt
    const summon = new Summon(ctx.source, 'DRG_253t');
    summon.trigger(ctx.source);
  },
});

// DRG_254 - Riding Yeti (Common)
// Deathrattle: Give a random minion in your hand +2/+2
cardScriptsRegistry.register('DRG_254', {
  play: (ctx: ActionContext) => {
    // Give a random minion in your hand +2/+2
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const minions = hand.filter((c: any) => c.type === 'MINION');
    if (minions.length > 0) {
      const randomMinion = minions[Math.floor(Math.random() * minions.length)];
      const buff = new Buff(ctx.source, randomMinion, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// DRG_256 - Bronze Explorer (Common)
// Battlecry: Discover a Dragon
cardScriptsRegistry.register('DRG_256', {
  play: (ctx: ActionContext) => {
    // Discover a Dragon - simplified implementation
    // In a real implementation, this would show a discover UI
  },
});

// DRG_006 - Twilight Ember (Common)
// Battlecry: Give your minions "Deathrattle: Deal 1 damage to your hero"
cardScriptsRegistry.register('DRG_006', {
  play: (ctx: ActionContext) => {
    // Give your minions "Deathrattle: Deal 1 damage to your hero"
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      // Add deathrattle effect - simplified implementation
      const originalDeathrattle = (minion as any).deathrattle;
      (minion as any).deathrattle = (ctx: ActionContext) => {
        if (originalDeathrattle) {
          originalDeathrattle(ctx);
        }
        const damage = new Damage(ctx.source, controller.hero, 1);
        damage.trigger(ctx.source);
      };
    }
  },
});

// DRG_251 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('DRG_251', {
});

// DRG_255 - Scaleworm (Rare)
// Deathrattle: Give a random friendly Dragon +1/+1
cardScriptsRegistry.register('DRG_255', {
});

// DRG_007 - Green Jelly (Common)
// Deathrattle: Give a random minion in your hand +3/+3
cardScriptsRegistry.register('DRG_007', {
});
