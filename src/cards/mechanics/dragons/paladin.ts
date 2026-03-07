// dragons - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Silence, Summon, Destroy, GainArmor } from '../../../actions';
import { Race } from '../../../enums';

// DRG_225 - Sky Claw - Your other Mechs have +1 Attack. Battlecry: Summon two 1/1 Microcopters
cardScriptsRegistry.register('DRG_225', {
  play: (ctx: ActionContext) => {
    // Battlecry: Summon two 1/1 Microcopters
    for (let i = 0; i < 2; i++) {
      const summon = new Summon(ctx.source, 'DRG_225t');
      summon.trigger(ctx.source);
    }
  },
});

// DRG_226 - Amber Watcher - Battlecry: Restore 8 Health
cardScriptsRegistry.register('DRG_226', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const heal = new Heal(ctx.source, ctx.target, 8);
      heal.trigger(ctx.source);
    }
  },
});

// DRG_229 - Bronze Explorer - Lifesteal. Battlecry: Discover a Dragon
cardScriptsRegistry.register('DRG_229', {
  play: (ctx: ActionContext) => {
    // Battlecry: Discover a Dragon - handled by game
  },
});

// DRG_231 - Lightforged Crusader - Battlecry: If your deck has no Neutral cards, add 5 random Paladin cards to your hand
cardScriptsRegistry.register('DRG_231', {
  play: (ctx: ActionContext) => {
    // Handled by game - adds Paladin cards if deck has no Neutral cards
  },
});

// DRG_232 - Lightforged Zealot - Battlecry: If your deck has no Neutral cards, equip a 4/2 Truesilver Champion
cardScriptsRegistry.register('DRG_232', {
  play: (ctx: ActionContext) => {
    // Handled by game - equips Truesilver Champion if deck has no Neutral cards
  },
});

// DRG_235 - Dragonrider Talritha - Deathrattle: Give a Dragon in your hand +3/+3 and this Deathrattle
cardScriptsRegistry.register('DRG_235', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const dragons = hand.filter((c: any) => (c as any).race === Race.DRAGON);
    if (dragons.length > 0) {
      const randomIndex = Math.floor(Math.random() * dragons.length);
      const dragon = dragons[randomIndex];
      const buff = new Buff(ctx.source, dragon, { ATK: 3, HEALTH: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// DRG_235e - Talritha's buff
cardScriptsRegistry.register('DRG_235e', {
});

// DRG_309 - Nozdormu the Timeless - Battlecry: Set each player to 10 Mana Crystals
cardScriptsRegistry.register('DRG_309', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = (ctx.source as any).game.getOpponent(controller);
    // Set both players to 10 Mana Crystals
    controller.maxMana = 10;
    if (opponent) {
      opponent.maxMana = 10;
    }
  },
});

// DRG_008
cardScriptsRegistry.register('DRG_008', {
});

// DRG_233 - Sand Breath - Give a minion +1/+2. Give it Divine Shield if you're holding a Dragon
cardScriptsRegistry.register('DRG_233', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 1, HEALTH: 2 });
      buff.trigger(ctx.source);
      // Check if holding a Dragon
      const controller = (ctx.source as any).controller;
      const hand = controller.hand || [];
      const hasDragon = hand.some((c: any) => (c as any).race === Race.DRAGON);
      if (hasDragon) {
        (ctx.target as any).divineShield = true;
      }
    }
  },
});

// DRG_258
cardScriptsRegistry.register('DRG_258', {
});
