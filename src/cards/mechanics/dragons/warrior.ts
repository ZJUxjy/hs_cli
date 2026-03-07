// dragons - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DRG_019 - Scion of Ruin: Rush. Battlecry: If you've Invoked Galakrond twice, summon two copies of this.
cardScriptsRegistry.register('DRG_019', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;

    const invokeCount = (controller.galakrondInvokes || 0);
    if (invokeCount >= 2) {
      for (let i = 0; i < 2 && (controller.field?.length || 0) < 7; i++) {
        controller.field?.push({ id: 'DRG_019', attack: 3, health: 3, rush: true } as any);
      }
    }
  },
});

// DRG_020 - EVIL Quartermaster: Battlecry: Add a Lackey to your hand. Gain 3 Armor.
cardScriptsRegistry.register('DRG_020', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;

    // Add a random Lackey to hand
    const lackeys = ['LOOT_541t', 'LOOT_542t', 'LOOT_543t', 'LOOT_544t', 'LOOT_545t', 'LOOT_547t', 'CFM_321t'];
    const randomLackey = lackeys[Math.floor(Math.random() * lackeys.length)];
    if (controller.hand?.length < 10) {
      controller.hand.push({ id: randomLackey } as any);
    }

    // Gain 3 Armor
    if (controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 3;
    }
  },
});

// DRG_023 - Skybarge: After you summon a Pirate, deal 2 damage to a random enemy.
cardScriptsRegistry.register('DRG_023', {
  events: {
    MINION_SUMMON: (ctx: any) => {
      if (ctx.event?.minion?.race === 'PIRATE') {
        const controller = (ctx.source as any)?.controller;
        const opponent = controller?.opponent;
        if (!opponent) return;

        const targets: any[] = [];
        if (opponent.hero) targets.push(opponent.hero);
        if (opponent.field?.length > 0) targets.push(...opponent.field);

        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)];
          const { Damage } = require('../../../actions/damage');
          const damageAction = new Damage(2);
          damageAction.trigger(ctx.source, target);
        }
      }
    },
  },
});

// DRG_024 - Sky Raider: Battlecry: Add a random Pirate to your hand.
cardScriptsRegistry.register('DRG_024', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;

    // Add a random Pirate to hand
    const pirates = ['CS2_146', 'CS2_147', 'CS2_148', 'EX1_129', 'NEW1_022', 'ICC_028'];
    const randomPirate = pirates[Math.floor(Math.random() * pirates.length)];
    if (controller.hand?.length < 10) {
      controller.hand.push({ id: randomPirate } as any);
    }
  },
});

// DRG_026
cardScriptsRegistry.register('DRG_026', {
});

// DRG_022 - Ramming Speed: Force a minion to attack one of its neighbors.
cardScriptsRegistry.register('DRG_022', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (!target) return;

    const controller = (ctx.source as any)?.controller;
    const opponent = controller?.opponent;
    if (!opponent?.field) return;

    const field = [...(controller.field || []), ...(opponent.field || [])];
    const targetIndex = field.indexOf(target);

    if (targetIndex === -1) return;

    // Get possible neighbors
    const neighbors = [];
    if (targetIndex > 0) neighbors.push(field[targetIndex - 1]);
    if (targetIndex < field.length - 1) neighbors.push(field[targetIndex + 1]);

    if (neighbors.length > 0) {
      const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (neighbor) {
        const { Damage } = require('../../../actions/damage');
        const damageAction = new Damage((target as any).attack || 0);
        damageAction.trigger(target, neighbor);
      }
    }
  },
});

// DRG_249 - Awaken!: Invoke Galakrond. Deal 1 damage to all minions.
cardScriptsRegistry.register('DRG_249', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller) {
      (controller as any).galakrondInvokes = ((controller as any).galakrondInvokes || 0) + 1;
    }

    // Deal 1 damage to all minions
    const allMinions = [
      ...((controller?.field || []) as any[]),
      ...((controller?.opponent?.field || []) as any[])
    ];

    for (const minion of allMinions) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(1);
      damageAction.trigger(ctx.source, minion);
    }
  },
});

// DRG_500 - Molten Breath: Deal $5 damage to a minion. If you're holding a Dragon, gain 5 Armor.
cardScriptsRegistry.register('DRG_500', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    const controller = (ctx.source as any)?.controller;
    if (!target || !controller) return;

    // Deal 5 damage to target
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(5);
    damageAction.trigger(ctx.source, target);

    // If holding a Dragon, gain 5 Armor
    const hasDragon = (controller.hand || []).some((c: any) => c.race === 'DRAGON');
    if (hasDragon && controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 5;
    }
  },
});

// DRG_021 - Ritual Chopper: Battlecry: Invoke Galakrond.
cardScriptsRegistry.register('DRG_021', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller) {
      (controller as any).galakrondInvokes = ((controller as any).galakrondInvokes || 0) + 1;
    }
  },
});

// DRG_025 - Ancharrr: After your hero attacks, draw a Pirate from your deck.
cardScriptsRegistry.register('DRG_025', {
  play: (ctx: ActionContext) => {
    // Placeholder
  },
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.source === (ctx.source as any)?.controller?.hero) {
        const controller = (ctx.source as any)?.controller;
        if (!controller?.deck) return;

        // Find a Pirate in deck
        const pirates = controller.deck.filter((c: any) => c.race === 'PIRATE');
        if (pirates.length > 0) {
          const pirate = pirates[0];
          // Move from deck to hand
          const deckIndex = controller.deck.indexOf(pirate);
          if (deckIndex > -1) {
            controller.deck.splice(deckIndex, 1);
            if (controller.hand?.length < 10) {
              controller.hand.push(pirate);
            }
          }
        }
      }
    },
  },
});

// DRG_650t3 - Galakrond, Azeroth's End: Battlecry: Draw 4 minions. Give them +4/+4. Equip a 5/2 Claw.
cardScriptsRegistry.register('DRG_650t3', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;

    // Draw 4 minions and give them +4/+4
    for (let i = 0; i < 4; i++) {
      const { Draw } = require('../../../actions/draw');
      const drawAction = new Draw(ctx.source, 1);
      drawAction.trigger(ctx.source);
    }

    // Apply +4/+4 to drawn minions
    const drawnMinions = (controller.hand || []).slice(-4);
    for (const minion of drawnMinions) {
      (minion as any).attack = ((minion as any).attack || 0) + 4;
      (minion as any).health = ((minion as any).health || 0) + 4;
    }

    // Equip a 5/2 weapon
    if (controller.hero) {
      controller.hero.weapon = { id: 'DRG_650t3w', attack: 5, durability: 2 };
    }
  },
});

// DRG_238p
cardScriptsRegistry.register('DRG_238p', {
});
