// Classic Demon Hunter Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { PlayReq } from '../../../enums/playreq';
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';

// === Minions ===

// Shadowhoof Slayer - Battlecry: Give your hero +1 Attack this turn
cardScriptsRegistry.register('BT_142', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const buff = new Buff(ctx.source, controller.hero, { ATK: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// BT_142e - Shadowhoof Slayer buff
cardScriptsRegistry.register('BT_142e', {});

// Sightless Watcher - Battlecry: Look at 3 cards in your deck
cardScriptsRegistry.register('BT_323', {
  play: (_ctx: ActionContext) => {
    // Would peek at deck
  },
});

// Satyr Overseer - After your hero attacks, summon a 2/2 Satyr
cardScriptsRegistry.register('BT_352', {
  events: {
    ATTACK: () => {
      // Only triggers on hero attack
    },
  },
});

// BT_352t - Satyr
cardScriptsRegistry.register('BT_352t', {});

// Glaivebound Adept - Battlecry: If your hero attacked this turn, deal 4 damage
cardScriptsRegistry.register('BT_495', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 4);
      dmg.trigger(ctx.source);
    }
  },
});

// === Spells ===

// Chaos Strike - Give your hero +2 Attack and draw a card
cardScriptsRegistry.register('BT_035', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const buff = new Buff(ctx.source, controller.hero, { ATK: 2 });
      buff.trigger(ctx.source);
    }
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// BT_035e - Chaos Strike buff
cardScriptsRegistry.register('BT_035e', {});

// Coordinated Strike - Summon three 1/1 Illidari
cardScriptsRegistry.register('BT_036', {
  play: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'BT_036t');
    const summon2 = new Summon(ctx.source, 'BT_036t');
    const summon3 = new Summon(ctx.source, 'BT_036t');
    summon1.trigger(ctx.source);
    summon2.trigger(ctx.source);
    summon3.trigger(ctx.source);
  },
});

// BT_036t - Illidari
cardScriptsRegistry.register('BT_036t', {});

// Chaos Nova - Deal 4 damage to all minions
cardScriptsRegistry.register('BT_235', {
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = (game as any).player1?.field || [];
      const p2Field = (game as any).player2?.field || [];
      for (const minion of [...p1Field, ...p2Field]) {
        const dmg = new Damage(ctx.source, minion, 4);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Inner Demon - Give your hero +8 Attack this turn
cardScriptsRegistry.register('BT_512', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const buff = new Buff(ctx.source, controller.hero, { ATK: 8 });
      buff.trigger(ctx.source);
    }
  },
});

// BT_512e - Inner Demon buff
cardScriptsRegistry.register('BT_512e', {});

// Soul Cleave - Deal 2 damage to two random enemy minions (Lifesteal)
cardScriptsRegistry.register('BT_740', {
  requirements: { [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1 },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    const field = opponent?.field || [];
    if (field.length > 0) {
      const shuffled = [...field].sort(() => Math.random() - 0.5);
      const targets = shuffled.slice(0, 2);
      for (const target of targets) {
        const dmg = new Damage(ctx.source, target, 2);
        dmg.trigger(ctx.source);
      }
    }
  },
});

console.log('[Classic Demon Hunter] Registered card scripts');
