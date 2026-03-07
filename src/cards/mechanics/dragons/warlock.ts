// dragons - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Silence, Summon, Destroy } from '../../../actions';
import { Race } from '../../../enums';

// DRG_201 - Crazed Netherwing - Battlecry: If you're holding a Dragon, deal 3 damage to all other characters
cardScriptsRegistry.register('DRG_201', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const hasDragon = hand.some((c: any) => (c as any).race === Race.DRAGON);
    if (hasDragon) {
      const opponent = (ctx.source as any).game.getOpponent(controller);
      // Deal 3 damage to all other characters - simplified to opponent hero
      const damage = new Damage(ctx.source, opponent, 3);
      damage.trigger(ctx.source);
    }
  },
});

// DRG_202 - Dragonblight Cultist - Battlecry: Invoke Galakrond. Gain +1 Attack for each other friendly minion
cardScriptsRegistry.register('DRG_202', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    // Count other friendly minions
    const count = field.length - 1;
    if (count > 0) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: count });
      buff.trigger(ctx.source);
    }
  },
});

// DRG_203 - Veiled Worshipper - Battlecry: If you've Invoked twice, draw 3 cards
cardScriptsRegistry.register('DRG_203', {
  play: (ctx: ActionContext) => {
    // Invoke mechanic is complex - simplified implementation
    const controller = (ctx.source as any).controller;
    const invokeCount = (controller as any).invokeCount || 0;
    if (invokeCount >= 2) {
      for (let i = 0; i < 3; i++) {
        const draw = new Draw(ctx.source, 1);
        draw.trigger(ctx.source);
      }
    }
  },
});

// DRG_207
cardScriptsRegistry.register('DRG_207', {
});

// DRG_208 - Valdris Felgorge - Battlecry: Increase your maximum hand size to 12. Draw 4 cards
cardScriptsRegistry.register('DRG_208', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Increase max hand size to 12
    (controller as any).maxHandSize = 12;
    // Draw 4 cards
    for (let i = 0; i < 4; i++) {
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    }
  },
});

// DRG_209 - Zzeraku the Warped - Whenever your hero takes damage, summon a 6/6 Nether Drake
cardScriptsRegistry.register('DRG_209', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      if ((ctx.target as any).isHero) {
        const summon = new Summon(ctx.source, 'DRG_209t');
        summon.trigger(ctx.source);
      }
    },
  },
});

// DRG_204 - Dark Skies - Deal $1 damage to a random minion. Repeat for each card in your hand
cardScriptsRegistry.register('DRG_204', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const handCount = hand.length;
    // Simplified: deal 1 damage to random minion for each card in hand
    for (let i = 0; i < handCount; i++) {
      const opponent = (ctx.source as any).game.getOpponent(controller);
      const field = (opponent?.field || []) as any[];
      if (field.length > 0) {
        const randomMinion = field[Math.floor(Math.random() * field.length)];
        const damage = new Damage(ctx.source, randomMinion, 1);
        damage.trigger(ctx.source);
      }
    }
  },
});

// DRG_205 - Nether Breath - Deal $2 damage. If you're holding a Dragon, deal $4 damage with Lifesteal instead
cardScriptsRegistry.register('DRG_205', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const hand = controller.hand || [];
      const hasDragon = hand.some((c: any) => (c as any).race === Race.DRAGON);
      const damageAmount = hasDragon ? 4 : 2;
      const damage = new Damage(ctx.source, ctx.target, damageAmount);
      damage.trigger(ctx.source);
    }
  },
});

// DRG_206 - Rain of Fire - Deal $1 damage to all characters
cardScriptsRegistry.register('DRG_206', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = (ctx.source as any).game.getOpponent(controller);
    // Deal 1 damage to all characters (both heroes)
    const damage = new Damage(ctx.source, controller.hero, 1);
    damage.trigger(ctx.source);
    if (opponent) {
      const damageOpp = new Damage(ctx.source, opponent.hero, 1);
      damageOpp.trigger(ctx.source);
    }
  },
});

// DRG_250 - Fiendish Rites - Invoke Galakrond. Give your minions +1 Attack
cardScriptsRegistry.register('DRG_250', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      const buff = new Buff(ctx.source, minion, { ATK: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// DRG_600t3 - Galakrond, Azeroth's End (Warlock) - Battlecry: Summon 4 random Demons. Equip a 5/2 Claw
cardScriptsRegistry.register('DRG_600t3', {
  play: (ctx: ActionContext) => {
    // Simplified: summon 4 random demons (would need demon card list)
    // Equipment would need weapon implementation
  },
});

// DRG_238p3
cardScriptsRegistry.register('DRG_238p3', {
});
