// Classic Hunter Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';
import { Destroy } from '../../../actions/destroy';

// Import selectors
import { PlayReq } from '../../../enums/playreq';

// === Minions ===

// Starving Buzzard - Whenever you summon a Beast, draw a card
cardScriptsRegistry.register('CS2_237', {
  events: {
    MINION_SUMMON: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.target && (event.target as any).race === 'beast') {
        const draw = new Draw(ctx.source, 1);
        draw.trigger(ctx.source);
      }
    },
  },
});

// Houndmaster - Battlecry: Give a friendly Beast +2/+2 and Taunt
cardScriptsRegistry.register('DS1_070', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_TARGET_IS_RACE]: 20, // BEAST = 20
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2, HEALTH: 2, taunt: true });
      buff.trigger(ctx.source);
    }
  },
});

// DS1_070o - Houndmaster buff
cardScriptsRegistry.register('DS1_070o', {});

// Timber Wolf - Your Beasts have +1 Attack
cardScriptsRegistry.register('DS1_175', {
  // Aura: All friendly beasts get +1 attack
});

// DS1_175o - Timber Wolf buff
cardScriptsRegistry.register('DS1_175o', {});

// Tundra Rhino - Your Beasts have Charge
cardScriptsRegistry.register('DS1_178', {
  // Aura: All friendly beasts have charge
});

// DS1_178e - Tundra Rhino buff
cardScriptsRegistry.register('DS1_178e', {});

// Scavenging Hyena - Whenever a friendly Beast dies, gain +2/+1
cardScriptsRegistry.register('EX1_531', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.target && (event.target as any).race === 'beast') {
        const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 1 });
        buff.trigger(ctx.source);
      }
    },
  },
});

// EX1_531e - Scavenging Hyena buff
cardScriptsRegistry.register('EX1_531e', {});

// Savannah Highmane - Deathrattle: Summon two 2/2 Hyenas
cardScriptsRegistry.register('EX1_534', {
  deathrattle: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'EX1_534t');
    const summon2 = new Summon(ctx.source, 'EX1_534t');
    summon1.trigger(ctx.source);
    summon2.trigger(ctx.source);
  },
});

// EX1_534t - Hyena
cardScriptsRegistry.register('EX1_534t', {});

// Leokk - Other minions have +1 Attack
cardScriptsRegistry.register('NEW1_033', {
  // Aura: Other friendly minions get +1 attack
});

// NEW1_033o - Leokk buff
cardScriptsRegistry.register('NEW1_033o', {});

// === Spells ===

// Hunter's Mark - Change a minion's Health to 1
cardScriptsRegistry.register('CS2_084', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.damage = (target.maxHealth || target.health || 0) - 1;
    }
  },
});

// CS2_084e - Hunter's Mark debuff
cardScriptsRegistry.register('CS2_084e', {});

// Multi-Shot - Deal 3 damage to two random enemy minions
cardScriptsRegistry.register('DS1_183', {
  requirements: { [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1 },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    const field = opponent?.field || [];
    if (field.length > 0) {
      // Get 2 random targets
      const shuffled = [...field].sort(() => Math.random() - 0.5);
      const targets = shuffled.slice(0, 2);
      for (const target of targets) {
        const dmg = new Damage(ctx.source, target, 3);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Tracking - Discover a card from your deck
cardScriptsRegistry.register('DS1_184', {
  play: (_ctx: ActionContext) => {
    // Would trigger card discovery from deck
  },
});

// Arcane Shot - Deal 2 damage
cardScriptsRegistry.register('DS1_185', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
    }
  },
});

// Explosive Shot - Deal 5 damage to a minion and 2 to adjacent minions
cardScriptsRegistry.register('EX1_537', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const field = target.controller?.field || [];
      const idx = field.indexOf(target);

      // Deal 5 to main target
      const dmg = new Damage(ctx.source, target, 5);
      dmg.trigger(ctx.source);

      // Deal 2 to adjacent
      if (idx > 0) {
        const left = field[idx - 1];
        const dmg2 = new Damage(ctx.source, left, 2);
        dmg2.trigger(ctx.source);
      }
      if (idx < field.length - 1) {
        const right = field[idx + 1];
        const dmg3 = new Damage(ctx.source, right, 2);
        dmg3.trigger(ctx.source);
      }
    }
  },
});

// Unleash the Hounds - For each enemy minion, summon a 1/1 Hound
cardScriptsRegistry.register('EX1_538', {
  requirements: {
    [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1,
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    const enemyCount = opponent?.field?.length || 0;

    for (let i = 0; i < enemyCount; i++) {
      const summon = new Summon(ctx.source, 'EX1_538t');
      summon.trigger(ctx.source);
    }
  },
});

// EX1_538t - Hound
cardScriptsRegistry.register('EX1_538t', {});

// Kill Command - Deal 3 damage. If you control a Beast, deal 5 instead.
cardScriptsRegistry.register('EX1_539', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const field = controller?.field || [];
      const hasBeast = field.some((m: any) => m.race === 'beast');
      const damage = hasBeast ? 5 : 3;
      const dmg = new Damage(ctx.source, ctx.target, damage);
      dmg.trigger(ctx.source);
    }
  },
});

// Flare - Destroy all enemy Secrets. Draw a card. All minions lose Stealth.
cardScriptsRegistry.register('EX1_544', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;

    // Destroy enemy secrets
    if (opponent?.secrets) {
      for (const secret of opponent.secrets) {
        const destroy = new Destroy();
        destroy.trigger(ctx.source, secret);
      }
    }

    // All minions lose stealth
    const game = (ctx.source as any).game;
    if (game) {
      // Would need to iterate through all minions
    }

    // Draw a card
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// Bestial Wrath - Give a friendly Beast +2 Attack and Immune this turn
cardScriptsRegistry.register('EX1_549', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_TARGET_IS_RACE]: 20, // BEAST
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2 });
      buff.trigger(ctx.source);
      // Immune is a temporary buff
    }
  },
});

// EX1_549o - Bestial Wrath buff
cardScriptsRegistry.register('EX1_549o', {});

// Deadly Shot - Destroy a random enemy minion
cardScriptsRegistry.register('EX1_617', {
  requirements: { [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1 },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    const field = opponent?.field || [];
    if (field.length > 0) {
      const idx = Math.floor(Math.random() * field.length);
      const target = field[idx];
      const destroy = new Destroy();
      destroy.trigger(ctx.source, target);
    }
  },
});

// Animal Companion - Summon a random Beast companion
cardScriptsRegistry.register('NEW1_031', {
  requirements: { [PlayReq.REQ_NUM_MINION_SLOTS]: 1 },
  play: (ctx: ActionContext) => {
    const companions = ['NEW1_032', 'NEW1_033', 'NEW1_034'];
    const randomCardId = companions[Math.floor(Math.random() * companions.length)];
    const summon = new Summon(ctx.source, randomCardId);
    summon.trigger(ctx.source);
  },
});

// NEW1_032 - Misha
cardScriptsRegistry.register('NEW1_032', {});

// NEW1_034 - Huffer
cardScriptsRegistry.register('NEW1_034', {});

// === Secrets ===

// Misdirection - When a character attacks your hero, instead it attacks another random character
cardScriptsRegistry.register('EX1_533', {});

// Snake Trap - When a friendly minion is attacked, summon three 1/1 Snakes
cardScriptsRegistry.register('EX1_554', {});

// Snipe - After your opponent plays a minion, deal 4 damage to it
cardScriptsRegistry.register('EX1_609', {
  events: {
    PLAY: () => {
      // Only triggers when opponent plays a minion
    },
  },
});

// Explosive Trap - When your hero is attacked, deal 2 damage to all enemies
cardScriptsRegistry.register('EX1_610', {});

// Freezing Trap - When an enemy minion attacks, return it to its owner's hand
cardScriptsRegistry.register('EX1_611', {});

// EX1_611e - Freezing Trap buff (cost +2)
cardScriptsRegistry.register('EX1_611e', {});

// === Weapons ===

// Gladiator's Longbow - Your hero is Immune while attacking
cardScriptsRegistry.register('DS1_188', {});

// Eaglehorn Bow - When a friendly secret is revealed, gain +1 durability
cardScriptsRegistry.register('EX1_536', {
  events: {
    SECRET_REVEALED: () => {
      // Would add durability
    },
  },
});

// EX1_536e - Eaglehorn Bow buff
cardScriptsRegistry.register('EX1_536e', {});

console.log('[Classic Hunter] Registered card scripts');
