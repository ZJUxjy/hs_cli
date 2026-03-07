// dragons - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon } from '../../../actions';

// DRG_027 - Waxadred - Deathrattle: Shuffle 3 Waxes into your deck
cardScriptsRegistry.register('DRG_027', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    for (let i = 0; i < 3; i++) {
      const shuffleAction = new Shuffle('DRG_027t');
      shuffleAction.trigger(source);
    }
  },
});

// DRG_031
cardScriptsRegistry.register('DRG_031', {
});

// DRG_034 - Flik Skyshiv - Battlecry: Destroy a minion and its neighbors
cardScriptsRegistry.register('DRG_034', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const controller = (target as any).controller;
      const field = controller?.field || [];
      const idx = field.indexOf(target);
      // Destroy target
      (target as any).destroyed = true;
      // Destroy adjacent minions
      if (idx > 0) {
        (field[idx - 1] as any).destroyed = true;
      }
      if (idx < field.length - 1) {
        (field[idx + 1] as any).destroyed = true;
      }
    }
  },
});

// DRG_035 - Waxadred's Candle - Draw a card
cardScriptsRegistry.register('DRG_035', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// DRG_036 - Sky Stalker - Battlecry: Discover a Dragon
cardScriptsRegistry.register('DRG_036', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// DRG_036t - Emerald Skytalon - Battlecry: Deal 4 damage
cardScriptsRegistry.register('DRG_036t', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 4);
      damage.trigger(ctx.source);
    }
  },
});

// DRG_037 - Necrium Apothecary - Battlecry: Trigger deathrattle of a friendly Dragon
cardScriptsRegistry.register('DRG_037', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// DRG_028 - Umbral Skulker - Battlecry: Gain +3 Attack this turn
cardScriptsRegistry.register('DRG_028', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    source.attack = (source.attack || 0) + 3;
  },
});

// DRG_030 - Cursed Castaway - Battlecry: Copy a card from your opponent's hand
cardScriptsRegistry.register('DRG_030', {
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

// DRG_033 - Bloodsail Flybooter - Battlecry: Attach to a friendly Dragon
cardScriptsRegistry.register('DRG_033', {
  play: (ctx: ActionContext) => {
  },
});

// DRG_247 - Waggle Pick - Deathrattle: Return a random friendly Dragon to your hand
cardScriptsRegistry.register('DRG_247', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// DRG_610t3 - Galakrond, Azeroth's End - Battlecry: Draw 4 cards. They cost (0). Equip a 5/2 Claw.
cardScriptsRegistry.register('DRG_610t3', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Draw 4 cards
    for (let i = 0; i < 4; i++) {
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    }
    // Set drawn cards to cost 0 - handled by game
    // Equip 5/2 Claw - simplified, would need weapon implementation
  },
});

// DRG_238p2
cardScriptsRegistry.register('DRG_238p2', {
});

// DRG_610e - Galakrond's Wonder - Costs (0)
cardScriptsRegistry.register('DRG_610e', {
});
