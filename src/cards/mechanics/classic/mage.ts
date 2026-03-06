// Classic Mage Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';
import { Morph } from '../../../actions/morph';
import { Give } from '../../../actions/give';

// === Minions ===

// Water Elemental - Freeze any character that damages it
cardScriptsRegistry.register('CS2_033', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      if (ctx.event?.target) {
        (ctx.event.target as any).frozen = true;
      }
    },
  },
});

// Ethereal Arcanist - If you control a Secret at the end of your turn, gain +2/+2
cardScriptsRegistry.register('EX1_274', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const secrets = controller?.secrets || [];
      if (secrets.length > 0) {
        const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 2 });
        buff.trigger(ctx.source);
      }
    },
  },
});

// Archmage Antonidas - Whenever you cast a spell, add a 'Fireball' to your hand
cardScriptsRegistry.register('EX1_559', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      if (controller) {
        const give = new Give('CS2_029');
        give.trigger(ctx.source, controller);
      }
    },
  },
});

// Sorcerer's Apprentice - Your spells cost (1) less
cardScriptsRegistry.register('EX1_608', {
});

// Kirin Tor Mage - Battlecry: Discover a Secret
cardScriptsRegistry.register('EX1_612', {
  play: (_ctx: ActionContext) => {
    // Would trigger secret discovery
  },
});

// Mana Wyrm - Whenever you cast a spell, gain +1 Attack
cardScriptsRegistry.register('NEW1_012', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 1 });
      buff.trigger(ctx.source);
    },
  },
});

// === Spells ===

// Polymorph - Transform a minion into a 1/1 Sheep
cardScriptsRegistry.register('CS2_022', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const morph = new Morph('CS2_tk1');
      morph.trigger(ctx.source, ctx.target);
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// Arcane Intellect - Draw 2 cards
cardScriptsRegistry.register('CS2_023', {
  play: (ctx: ActionContext) => {
    const draw1 = new Draw(ctx.source, 1);
    const draw2 = new Draw(ctx.source, 1);
    draw1.trigger(ctx.source);
    draw2.trigger(ctx.source);
  },
});

// Frostbolt - Deal 3 damage and Freeze
cardScriptsRegistry.register('CS2_024', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 3);
      dmg.trigger(ctx.source);
      (ctx.target as any).frozen = true;
    }
  },
  requirements: { 48: 0 },
});

// Arcane Explosion - Deal 1 damage to all enemy minions
cardScriptsRegistry.register('CS2_025', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.field) {
      for (const minion of opponent.field) {
        const dmg = new Damage(ctx.source, minion, 1);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Frost Nova - Freeze all enemy minions
cardScriptsRegistry.register('CS2_026', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.field) {
      for (const minion of opponent.field) {
        (minion as any).frozen = true;
      }
    }
  },
});

// Mirror Image - Summon two 0/2 minions with Taunt
cardScriptsRegistry.register('CS2_027', {
  play: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'CS2_mirror');
    const summon2 = new Summon(ctx.source, 'CS2_mirror');
    summon1.trigger(ctx.source);
    summon2.trigger(ctx.source);
  },
  requirements: { 24: 1 },
});

// Blizzard - Deal 2 damage to all enemy minions and Freeze them
cardScriptsRegistry.register('CS2_028', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.field) {
      for (const minion of opponent.field) {
        const dmg = new Damage(ctx.source, minion, 2);
        dmg.trigger(ctx.source);
        (minion as any).frozen = true;
      }
    }
  },
});

// Fireball - Deal 6 damage
cardScriptsRegistry.register('CS2_029', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 6);
      dmg.trigger(ctx.source);
    }
  },
  requirements: { 48: 0 },
});

// Ice Lance - If target is Frozen, deal 4 instead. Otherwise, Freeze
cardScriptsRegistry.register('CS2_031', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if (target.frozen) {
        const dmg = new Damage(ctx.source, ctx.target, 4);
        dmg.trigger(ctx.source);
      } else {
        target.frozen = true;
      }
    }
  },
  requirements: { 48: 0 },
});

// Flamestrike - Deal 4 damage to all enemy minions
cardScriptsRegistry.register('CS2_032', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.field) {
      for (const minion of opponent.field) {
        const dmg = new Damage(ctx.source, minion, 4);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Cone of Cold - Deal 1 damage to a minion and its neighbors, Freeze them
cardScriptsRegistry.register('EX1_275', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const field = (target as any).controller?.field || [];
      const idx = field.indexOf(target);

      const dmg1 = new Damage(ctx.source, target, 1);
      dmg1.trigger(ctx.source);
      target.frozen = true;

      if (idx > 0) {
        const left = field[idx - 1];
        const dmg2 = new Damage(ctx.source, left, 1);
        dmg2.trigger(ctx.source);
        (left as any).frozen = true;
      }

      if (idx < field.length - 1) {
        const right = field[idx + 1];
        const dmg3 = new Damage(ctx.source, right, 1);
        dmg3.trigger(ctx.source);
        (right as any).frozen = true;
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// Arcane Missiles - Deal 3 damage randomly split among all enemies
cardScriptsRegistry.register('EX1_277', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    const targets: any[] = [];

    if (opponent?.hero) targets.push(opponent.hero);
    if (opponent?.field) targets.push(...opponent.field);

    for (let i = 0; i < 3; i++) {
      if (targets.length === 0) break;
      const idx = Math.floor(Math.random() * targets.length);
      const target = targets[idx];
      const dmg = new Damage(ctx.source, target, 1);
      dmg.trigger(ctx.source);
    }
  },
});

// Pyroblast - Deal 10 damage
cardScriptsRegistry.register('EX1_279', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 10);
      dmg.trigger(ctx.source);
    }
  },
  requirements: { 48: 0 },
});

// Secrets
cardScriptsRegistry.register('EX1_287', {});
cardScriptsRegistry.register('EX1_289', {});
cardScriptsRegistry.register('EX1_294', {});
cardScriptsRegistry.register('EX1_295', {});
cardScriptsRegistry.register('EX1_594', {});

// Icicle - Deal 2 damage. If Frozen, draw a card
cardScriptsRegistry.register('EX1_179', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);

      if (target.frozen) {
        const draw = new Draw(ctx.source, 1);
        draw.trigger(ctx.source);
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// Tome of Intellect
cardScriptsRegistry.register('EX1_180', {
  play: (_ctx: ActionContext) => {
    // Would give a random mage spell
  },
});

console.log('[Classic Mage] Registered card scripts');
