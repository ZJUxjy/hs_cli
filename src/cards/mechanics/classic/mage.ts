// classic - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Morph } from '../../../actions';

// CS2_033 - Sorcerer's Apprentice - Your spells cost (1) less
cardScriptsRegistry.register('CS2_033', {
});

// EX1_274 - Kirin Tor Mage - Spell Damage +1
cardScriptsRegistry.register('EX1_274', {
  play: (ctx: ActionContext) => {
    // Set spell damage bonus - handled by game loop
    (ctx.source as any).spellDamage = 1;
  },
});

// EX1_559 - Mana Wyrm - After you cast a spell, gain +1 Attack
cardScriptsRegistry.register('EX1_559', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 1) + 1;
    },
  },
});

// EX1_608 - Sorcerer's Apprentice (Original)
cardScriptsRegistry.register('EX1_608', {
});

// EX1_612 - Teleport - Return a friendly minion to your hand
cardScriptsRegistry.register('EX1_612', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];

    if (friendlyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * friendlyMinions.length);
      const target = friendlyMinions[randomIndex];
      target.zone = 'HAND';
      controller.field = controller.field.filter((m: any) => m !== target);
    }
  },
});

// NEW1_012 - Flame Leviathan - Deal 2 damage to all minions
cardScriptsRegistry.register('NEW1_012', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
  },
});

// CS2_022 - Polymorph - Transform a minion into a 1/1 Sheep
cardScriptsRegistry.register('CS2_022', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const morphAction = new Morph('CS2_tk1');
      morphAction.trigger(ctx.source, ctx.target);
    }
  },
});

// CS2_023 - Arcane Intellect - Draw 2 cards
cardScriptsRegistry.register('CS2_023', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
    const drawAction2 = new Draw(ctx.source, 1);
    drawAction2.trigger(ctx.source);
  },
});

// CS2_024 - Frost Nova - Freeze all enemy minions
cardScriptsRegistry.register('CS2_024', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    for (const minion of enemyMinions) {
      (minion as any).frozen = true;
    }
  },
});

// CS2_025 - Fireball - Deal 6 damage
cardScriptsRegistry.register('CS2_025', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 6);
      damage.trigger(ctx.source);
    }
  },
});

// CS2_026 - Flamestrike - Deal 4 damage to all enemy minions
cardScriptsRegistry.register('CS2_026', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    for (const minion of enemyMinions) {
      const damage = new Damage(ctx.source, minion, 4);
      damage.trigger(ctx.source);
    }
  },
});

// CS2_027 - Mirror Entity - Secret: When your opponent plays a minion, summon a copy of it
cardScriptsRegistry.register('CS2_027', {
});

// CS2_028 - Ice Block - Secret: When your hero takes lethal damage, prevent it
cardScriptsRegistry.register('CS2_028', {
});

// CS2_029 - Vaporize - Secret: When your opponent plays a minion, destroy it
cardScriptsRegistry.register('CS2_029', {
});

// CS2_031 - Cone of Cold - Freeze a minion and deal 1 damage to it
cardScriptsRegistry.register('CS2_031', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 1);
      damage.trigger(ctx.source);
      (ctx.target as any).frozen = true;
    }
  },
});

// CS2_032 - Firelands Portal - Deal 5 damage. Summon a random 2-Cost Minion
cardScriptsRegistry.register('CS2_032', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 5);
      damage.trigger(ctx.source);
    }
    // Summon a 2-cost elemental (Fire Elemental 5/4)
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('CS2_121');
    summonAction.trigger(ctx.source);
  },
});

// EX1_275 - Frostbolt - Freeze a minion and deal 3 damage
cardScriptsRegistry.register('EX1_275', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
      (ctx.target as any).frozen = true;
    }
  },
});

// EX1_277 - Pyroblast - Deal 10 damage
cardScriptsRegistry.register('EX1_277', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 10);
      damage.trigger(ctx.source);
    }
  },
});

// EX1_279 - Blizzard - Deal 2 damage to all enemy minions and Freeze them
cardScriptsRegistry.register('EX1_279', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    for (const minion of enemyMinions) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
      (minion as any).frozen = true;
    }
  },
});

// tt_010 - Spellbender - Secret: When your opponent casts a spell, summon a 1/3
cardScriptsRegistry.register('tt_010', {
});

// EX1_287 - Counterspell - Secret: When your opponent casts a spell, counter it
cardScriptsRegistry.register('EX1_287', {
});

// EX1_289 - Ice Barrier - Secret: When your hero is attacked, gain 8 Armor
cardScriptsRegistry.register('EX1_289', {
});

// EX1_294 - Mirror Image - Summon two 0/2 minions with Taunt
cardScriptsRegistry.register('EX1_294', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction1 = new Summon('CS2_mirror');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon('CS2_mirror');
    summonAction2.trigger(ctx.source);
  },
});

// EX1_295 - Arcane Missiles - Deal 3 damage randomly split among enemy characters
cardScriptsRegistry.register('EX1_295', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const targets: any[] = [...(opponent.field || [])];
    if (opponent.hero) targets.push(opponent.hero);

    // Deal 1 damage 3 times randomly
    for (let i = 0; i < 3; i++) {
      if (targets.length === 0) break;
      const randomIndex = Math.floor(Math.random() * targets.length);
      const target = targets[randomIndex];
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);
      // Remove if destroyed
      if ((target as any).destroyed) {
        targets.splice(randomIndex, 1);
      }
    }
  },
});

// EX1_594 - Vaporize - Already registered above as CS2_029
// Re-registering as EX1_594 if different
cardScriptsRegistry.register('EX1_594', {
});

// EX1_179 - Tome of Intellect - Add a random Mage spell to your hand
cardScriptsRegistry.register('EX1_179', {
  play: (ctx: ActionContext) => {
    // Random mage spell - would need card database
    const { Give } = require('../../../actions/give');
    // Placeholder - actual implementation needs card lookup
  },
});

// EX1_180 - Recall - Return 1, 2, and 3 friendly minions to your hand
cardScriptsRegistry.register('EX1_180', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    // Return up to 3 minions to hand
    for (let i = 0; i < Math.min(3, field.length); i++) {
      const minion = field[0];
      if (minion) {
        minion.zone = 'HAND';
        controller.field = controller.field.filter((m: any) => m !== minion);
      }
    }
  },
});
