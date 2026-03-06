// Classic Warlock Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';
import { Heal } from '../../../actions/heal';
import { Destroy } from '../../../actions/destroy';

// Import selectors
import { PlayReq } from '../../../enums/playreq';

// === Minions ===

// Blood Imp - At end of turn, give a random friendly minion +1 Health
cardScriptsRegistry.register('CS2_059', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const field = controller?.field || [];
      if (field.length > 1) {
        const others = field.filter((m: any) => m !== ctx.source);
        if (others.length > 0) {
          const randomMinion = others[Math.floor(Math.random() * others.length)];
          const buff = new Buff(ctx.source, randomMinion, { HEALTH: 1 });
          buff.trigger(ctx.source);
        }
      }
    },
  },
});

// CS2_059o - Blood Imp buff
cardScriptsRegistry.register('CS2_059o', {});

// Dread Infernal - Battlecry: Deal 1 damage to all other characters
cardScriptsRegistry.register('CS2_064', {
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = (game as any).player1?.field || [];
      const p2Field = (game as any).player2?.field || [];
      const p1Hero = (game as any).player1?.hero;
      const p2Hero = (game as any).player2?.hero;

      for (const minion of [...p1Field, ...p2Field]) {
        if (minion !== ctx.source) {
          const dmg = new Damage(ctx.source, minion, 1);
          dmg.trigger(ctx.source);
        }
      }
      if (p1Hero) {
        const dmg = new Damage(ctx.source, p1Hero, 1);
        dmg.trigger(ctx.source);
      }
      if (p2Hero) {
        const dmg = new Damage(ctx.source, p2Hero, 1);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Felguard - Battlecry: Destroy one of your Mana Crystals
cardScriptsRegistry.register('EX1_301', {
  play: (_ctx: ActionContext) => {
    // Would reduce max mana
  },
});

// Void Terror - Battlecry: Destroy adjacent minions and gain their stats
cardScriptsRegistry.register('EX1_304', {
  play: (ctx: ActionContext) => {
    // Would destroy adjacent and gain stats
  },
});

// EX1_304e - Void Terror buff
cardScriptsRegistry.register('EX1_304e', {});

// Felstalker - Battlecry: Discard a random card
cardScriptsRegistry.register('EX1_306', {
  play: (ctx: ActionContext) => {
    // Would discard random card
  },
});

// Doomguard - Battlecry: Discard two random cards
cardScriptsRegistry.register('EX1_310', {
  play: (ctx: ActionContext) => {
    // Would discard 2 random cards
  },
});

// Pit Lord - Battlecry: Deal 5 damage to your hero
cardScriptsRegistry.register('EX1_313', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const dmg = new Damage(ctx.source, controller.hero, 5);
      dmg.trigger(ctx.source);
    }
  },
});

// Summoning Portal - Your minions cost (2) less
cardScriptsRegistry.register('EX1_315', {});

// Flame Imp - Battlecry: Deal 3 damage to your hero
cardScriptsRegistry.register('EX1_319', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const dmg = new Damage(ctx.source, controller.hero, 3);
      dmg.trigger(ctx.source);
    }
  },
});

// Lord Jaraxxus - Battlecry: Summon a 3/2 weapon and replace hero
cardScriptsRegistry.register('EX1_323', {
  play: (ctx: ActionContext) => {
    // Would summon weapon and transform
  },
});

// EX1_tk33 - Inferno (hero power)
cardScriptsRegistry.register('EX1_tk33', {});

// === Spells ===

// Drain Life - Deal 2 damage and restore 2 Health to your hero
cardScriptsRegistry.register('CS2_061', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
    }
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(ctx.source, controller.hero, 2);
      heal.trigger(ctx.source);
    }
  },
});

// Hellfire - Deal 3 damage to all characters
cardScriptsRegistry.register('CS2_062', {
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = (game as any).player1?.field || [];
      const p2Field = (game as any).player2?.field || [];
      const p1Hero = (game as any).player1?.hero;
      const p2Hero = (game as any).player2?.hero;

      for (const minion of [...p1Field, ...p2Field]) {
        const dmg = new Damage(ctx.source, minion, 3);
        dmg.trigger(ctx.source);
      }
      if (p1Hero) {
        const dmg = new Damage(ctx.source, p1Hero, 3);
        dmg.trigger(ctx.source);
      }
      if (p2Hero) {
        const dmg = new Damage(ctx.source, p2Hero, 3);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Corruption - Enemy minion is destroyed at start of your turn
cardScriptsRegistry.register('CS2_063', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).destroyedAtTurnStart = true;
    }
  },
});

// CS2_063e - Corruption buff
cardScriptsRegistry.register('CS2_063e', {});

// Shadow Bolt - Deal 4 damage to a minion
cardScriptsRegistry.register('CS2_057', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 4);
      dmg.trigger(ctx.source);
    }
  },
});

// Mortal Coil - Deal 1 damage. If it kills, draw a card
cardScriptsRegistry.register('EX1_302', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
      // Would check if killed and draw
    }
  },
});

// Shadowflame - Deal a friendly minion's Attack to all enemy minions, then destroy it
cardScriptsRegistry.register('EX1_303', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const attack = target.attack || 0;
      const controller = (ctx.source as any).controller;
      const opponent = controller?.opponent;

      // Deal attack to all enemy minions
      if (opponent?.field) {
        for (const minion of opponent.field) {
          const dmg = new Damage(ctx.source, minion, attack);
          dmg.trigger(ctx.source);
        }
      }

      // Destroy the source
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);
    }
  },
});

// Soulfire - Deal 4 damage and discard a random card
cardScriptsRegistry.register('EX1_308', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 4);
      dmg.trigger(ctx.source);
    }
    // Would discard random card
  },
});

// Siphon Soul - Destroy a minion and restore 3 Health to your hero
cardScriptsRegistry.register('EX1_309', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);
    }
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(ctx.source, controller.hero, 3);
      heal.trigger(ctx.source);
    }
  },
});

// Twisting Nether - Destroy all minions
cardScriptsRegistry.register('EX1_312', {
  play: (ctx: ActionContext) => {
    const game = (ctx.source as any).game;
    if (game) {
      const p1Field = (game as any).player1?.field || [];
      const p2Field = (game as any).player2?.field || [];
      for (const minion of [...p1Field, ...p2Field]) {
        const destroy = new Destroy();
        destroy.trigger(ctx.source, minion);
      }
    }
  },
});

// Power Overwhelming - Give a friendly minion +4/+4. Destroy it at end of turn
cardScriptsRegistry.register('EX1_316', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 4, HEALTH: 4 });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_316e - Power Overwhelming buff
cardScriptsRegistry.register('EX1_316e', {});

// Sense Demons - Put 2 random Demons from your deck into your hand
cardScriptsRegistry.register('EX1_317', {
  play: (_ctx: ActionContext) => {
    // Would draw demons from deck
  },
});

// Bane of Doom - Deal 2 damage. If it kills, summon a random Demon
cardScriptsRegistry.register('EX1_320', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
      // Would check if killed and summon demon
    }
  },
});

// Demonfire - Deal 2 damage to a minion. If it's a friendly Demon, give +2/+2
cardScriptsRegistry.register('EX1_596', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if (target.race === 'demon') {
        const buff = new Buff(ctx.source, ctx.target, { ATK: 2, HEALTH: 2 });
        buff.trigger(ctx.source);
      } else {
        const dmg = new Damage(ctx.source, ctx.target, 2);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// EX1_596e - Demonfire buff
cardScriptsRegistry.register('EX1_596e', {});

// Sacrificial Pact - Destroy a Demon and restore 5 Health to your hero
cardScriptsRegistry.register('NEW1_003', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_TARGET_IS_RACE]: 15, // DEMON
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);
    }
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(ctx.source, controller.hero, 5);
      heal.trigger(ctx.source);
    }
  },
});

// Call of the Void - Add a random Demon to your hand
cardScriptsRegistry.register('EX1_181', {
  play: (_ctx: ActionContext) => {
    // Would add random demon
  },
});

// Siegebreaker - Taunt. Your other Demons have +1 Attack
cardScriptsRegistry.register('EX1_185', {});

console.log('[Classic Warlock] Registered card scripts');
