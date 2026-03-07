// ungoro - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give } from '../../../actions';

// UNG_058 - Hallucination - Discover a card from your opponent's class
cardScriptsRegistry.register('UNG_058', {
  play: (ctx: ActionContext) => {
    // Discover - handled by game
  },
});

// UNG_063 - Bite of Sand (not in this set - might be UNG_063 is actually Giantaconda in Druid)

// UNG_064 - Razorpetal Volley - Summon two 1/1 Razorpetals
cardScriptsRegistry.register('UNG_064', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction1 = new Summon('UNG_064t');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon('UNG_064t');
    summonAction2.trigger(ctx.source);
  },
});

// UNG_065 - Obsidian Shard - Battlecry: Copy 3 cards from your opponent's hand
cardScriptsRegistry.register('UNG_065', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppHand = opponent.hand || [];
    // Copy 3 random cards from opponent's hand
    const count = Math.min(3, oppHand.length);
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * oppHand.length);
      const card = oppHand[randomIndex];
      if (card) {
        const giveAction = new Give(card.id);
        giveAction.trigger(ctx.source, controller);
      }
    }
  },
});

// UNG_065t - Obsidian Shard (actually Minion type)
cardScriptsRegistry.register('UNG_065t', {
});

// UNG_057 - The Caverns Below - Quest: Play 4 minions with the same name
cardScriptsRegistry.register('UNG_057', {
});

// UNG_057t1 - Crystal Core - Your minions become 4/4
cardScriptsRegistry.register('UNG_057t1', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      (minion as any).attack = 4;
      (minion as any).health = 4;
    }
  },
});

// UNG_060 - Envenom - Give your weapon "Deathrattle: Deal 2 damage to your hero"
cardScriptsRegistry.register('UNG_060', {
  play: (ctx: ActionContext) => {
    // Would need weapon attachment
  },
});

// UNG_067 - Surrender to Madness - Transform all your minions into ones that cost (3) more
cardScriptsRegistry.register('UNG_067', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      // Transform into higher cost minion - placeholder
      (minion as any).destroyed = true;
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon('CS2_122');
      summonAction.trigger(ctx.source);
    }
  },
});

// UNG_067t1 - Xaril - Poisoned Blood
cardScriptsRegistry.register('UNG_067t1', {
});

// UNG_067t1e - Poisoned Blade
cardScriptsRegistry.register('UNG_067t1e', {
});

// UNG_067t1e2 - Poisoned
cardScriptsRegistry.register('UNG_067t1e2', {
});

// UNG_823 - Hallucination (actually different - might be in warlock)

// UNG_856 - Jawbreaker - Battlecry: Summon a 1/1 Razorpetal
cardScriptsRegistry.register('UNG_856', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('UNG_064t');
    summonAction.trigger(ctx.source);
  },
});

// UNG_061 - Mimic Pod - Draw a card, then add a copy of it to your hand
cardScriptsRegistry.register('UNG_061', {
  play: (ctx: ActionContext) => {
    // Draw a card and copy it to hand - placeholder
  },
});

// UNG_809 - Jade Shuriken - Deal 2 damage. Combo: Deal 1 more
cardScriptsRegistry.register('UNG_809', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Check if combo was used - would need game state
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// UNG_810 - Jade Swarmer - Combo: Gain Stealth
cardScriptsRegistry.register('UNG_810', {
});

// UNG_811 - Shadowblade - Battlecry: Your hero is Immune this turn
cardScriptsRegistry.register('UNG_811', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      (controller.hero as any).immune = true;
    }
  },
});
