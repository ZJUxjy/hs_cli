// wog - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon } from '../../../actions';

// OG_070
cardScriptsRegistry.register('OG_070', {
});

// OG_080 - Shadow Strike - Deal 5 damage to an undamaged character
cardScriptsRegistry.register('OG_080', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 5);
      damage.trigger(ctx.source);
    }
  },
});

// OG_267 - Xaril - Deathrattle: Add a random poison to your hand
cardScriptsRegistry.register('OG_267', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const poisons = ['OG_267t1', 'OG_267t2', 'OG_267t3', 'OG_267t4'];
    const randomPoison = poisons[Math.floor(Math.random() * poisons.length)];
    const giveAction = new Give(randomPoison);
    giveAction.trigger(source, controller);
  },
});

// OG_330 - Blink Fox - Deathrattle: Add a random card to your hand
cardScriptsRegistry.register('OG_330', {
  deathrattle: (ctx: ActionContext) => {
    // Add random card to hand - simplified
    const source = ctx.source as any;
    const drawAction = new Draw(source, 1);
    drawAction.trigger(source);
  },
});

// OG_291 - Shadowcaster - Battlecry: Choose a friendly minion. Add a 1/1 copy to your hand
cardScriptsRegistry.register('OG_291', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as any;
      const controller = source.controller;
      const giveAction = new Give((ctx.target as any).cardId);
      giveAction.trigger(source, controller);
    }
  },
});

// OG_291e
cardScriptsRegistry.register('OG_291e', {
});

// OG_282 - Shudderwraith - Battlecry: Copy a random minion from your opponent's hand
cardScriptsRegistry.register('OG_282', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const oppHand = opponent?.hand || [];
    if (oppHand.length > 0) {
      const randomCard = oppHand[Math.floor(Math.random() * oppHand.length)];
      const giveAction = new Give((randomCard as any).cardId);
      giveAction.trigger(source, controller);
    }
  },
});

// OG_072 - Southsea Squidface - Battlecry: Give your weapon +2 Attack
cardScriptsRegistry.register('OG_072', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    if (controller?.weapon) {
      const buff = new Buff(source, controller.weapon, { ATK: 2 });
      buff.trigger(source);
    }
  },
});

// OG_073 - Undercity Huckster - Deathrattle: Add a random class card to your hand
cardScriptsRegistry.register('OG_073', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    // Deathrattle effect - simplified
  },
});

// OG_176 - Burgly Bully - Whenever your opponent casts a spell, add a coin to your hand
cardScriptsRegistry.register('OG_176', {
  play: (ctx: ActionContext) => {
    // Handled by event system
  },
});
