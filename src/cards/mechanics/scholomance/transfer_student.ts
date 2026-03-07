// scholomance - transfer_student.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Give, Summon, Damage } from '../../../actions';

// SCH_199
cardScriptsRegistry.register('SCH_199', {
});

// Hand - Used for card positioning effects (simplified)
cardScriptsRegistry.register('Hand', {
});

// Deck - Used for card positioning effects (simplified)
cardScriptsRegistry.register('Deck', {
});

// SCH_199t2 - Transfer Student (Darkshire)
// Spellburst: Deal 3 damage
cardScriptsRegistry.register('SCH_199t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 3;
    }
  },
});

// SCH_199t3 - Transfer Student (Stormwind)
// Spellburst: Restore 3 Health
cardScriptsRegistry.register('SCH_199t3', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.health = Math.min(target.health + 3, target.maxHealth || target.health);
    }
  },
});

// SCH_199t5 - Transfer Student (Scholomance)
// Deathrattle: Draw a card
cardScriptsRegistry.register('SCH_199t5', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller?.deck && controller.deck.length > 0 && controller.hand?.length < 10) {
      controller.hand.push(controller.deck.shift());
    }
  },
});

// SCH_199t6 - Transfer Student (Uldum)
// Battlecry and Deathrattle: Add a Random Legendary minion to your hand
cardScriptsRegistry.register('SCH_199t6', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller?.hand?.length < 10) {
      // Add a random legendary minion
      const legendaryMinions = ['CS2_118', 'CS2_122', 'CS2_124', 'EX1_100', 'EX1_110'];
      controller.hand.push({ id: legendaryMinions[Math.floor(Math.random() * legendaryMinions.length)] } as any);
    }
  },
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller?.hand?.length < 10) {
      const legendaryMinions = ['CS2_118', 'CS2_122', 'CS2_124', 'EX1_100', 'EX1_110'];
      controller.hand.push({ id: legendaryMinions[Math.floor(Math.random() * legendaryMinions.length)] } as any);
    }
  },
});

// SCH_199t7 - Transfer Student (Tolvir) - At the end of your turn, reduce the Cost of a random card in your hand by (2)
cardScriptsRegistry.register('SCH_199t7', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Reduce cost - handled by game engine (simplified)
    },
  },
});

// SCH_199t7e - Cost reduction buff
cardScriptsRegistry.register('SCH_199t7e', {
});

// SCH_199t8
cardScriptsRegistry.register('SCH_199t8', {
});

// SCH_199t9 - Transfer Student (Dalaran)
// Battlecry: Discover a new basic Hero Power
cardScriptsRegistry.register('SCH_199t9', {
  play: (ctx: ActionContext) => {
    // Simplified: just add a random hero power to hand
    const controller = (ctx.source as any)?.controller;
    if (controller?.hand?.length < 10) {
      const heroPowers = ['HERO_01bp', 'HERO_02bp', 'HERO_03bp', 'HERO_04bp', 'HERO_05bp', 'HERO_06bp', 'HERO_07bp', 'HERO_08bp', 'HERO_09bp', 'HERO_10bp'];
      controller.hand.push({ id: heroPowers[Math.floor(Math.random() * heroPowers.length)] } as any);
    }
  },
});

// SCH_199t10 - Transfer Student (Northrend)
// Battlecry: Spend all your Mana. Summon a random minion of that Cost
cardScriptsRegistry.register('SCH_199t10', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;

    const manaSpent = controller.usedMana || 0;
    if (manaSpent > 0 && controller.field?.length < 7) {
      // Simplified: summon a random minion with cost = mana spent
      const minionPool: Record<number, string[]> = {
        1: ['CS2_101', 'CS2_118'],
        2: ['CS2_106', 'CS2_120'],
        3: ['CS2_124', 'CS2_127'],
        4: ['CS2_131', 'CS2_134'],
        5: ['CS2_138', 'CS2_142'],
        6: ['CS2_146', 'CS2_147'],
        7: ['CS2_150', 'CS2_151'],
      };
      const pool = minionPool[manaSpent] || minionPool[1];
      controller.field.push({ id: pool[Math.floor(Math.random() * pool.length)] } as any);
    }
  },
});

// SCH_199t11 - Transfer Student (Karazhan) - Battlecry: Add a Karazhan Portal spell to your hand
cardScriptsRegistry.register('SCH_199t11', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.hand?.length < 10) {
      const portals = ['KAR_073', 'KAR_077', 'KAR_091', 'KAR_075', 'KAR_076'];
      const cardId = portals[Math.floor(Math.random() * portals.length)];
      controller.hand.push({ id: cardId } as any);
    }
  },
});

// SCH_199t12 - Transfer Student (Goblins vs Gnomes) - Battlecry: Give a random minion in your hand +2/+2
cardScriptsRegistry.register('SCH_199t12', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
    const minionsInHand = hand.filter((c: any) => c?.type === 'minion');
    if (minionsInHand.length > 0) {
      const target = minionsInHand[Math.floor(Math.random() * minionsInHand.length)];
      const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// SCH_199t13 - Transfer Student (Un'Goro) - Battlecry: Adapt
cardScriptsRegistry.register('SCH_199t13', {
  play: (ctx: ActionContext) => {
    // Adapt - handled by game engine (simplified)
  },
});

// SCH_199t14 - Transfer Student (Frozen Throne) - Deathrattle: Add a random Death Knight card to your hand
cardScriptsRegistry.register('SCH_199t14', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.hand?.length < 10) {
      // Random Death Knight card - simplified
      const dkCards = ['ICC_314', 'ICC_832', 'ICC_091', 'ICC_855'];
      const cardId = dkCards[Math.floor(Math.random() * dkCards.length)];
      controller.hand.push({ id: cardId } as any);
    }
  },
});

// SCH_199t15 - Transfer Student (Kobolds) - Battlecry: Recruit a minion that costs 2 or less
cardScriptsRegistry.register('SCH_199t15', {
  play: (ctx: ActionContext) => {
    // Recruit - handled by game engine (simplified)
  },
});

// SCH_199t17 - Transfer Student (The Witchwood) - Battlecry: If you have 10 Mana Crystals, gain +5/+5
cardScriptsRegistry.register('SCH_199t17', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const maxMana = controller?.maxMana || 0;
    if (maxMana >= 10) {
      const buff = new Buff(source, source, { ATK: 5, HEALTH: 5 });
      buff.trigger(source);
    }
  },
});

// SCH_199t18
cardScriptsRegistry.register('SCH_199t18', {
});

// SCH_199t19 - Transfer Student (Rise of Shadows) - Battlecry: Add a Lackey to your hand
cardScriptsRegistry.register('SCH_199t19', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.hand?.length < 10) {
      // Random Lackey - simplified
      const lackeys = ['LOOT_542', 'LOOT_541', 'LOOT_540', 'LOOT_539', 'LOOT_538', 'LOOT_537'];
      const cardId = lackeys[Math.floor(Math.random() * lackeys.length)];
      controller.hand.push({ id: cardId } as any);
    }
  },
});

// SCH_199t21 - Transfer Student (Dragons) - Battlecry: Discover a Dragon
cardScriptsRegistry.register('SCH_199t21', {
  play: (ctx: ActionContext) => {
    // Discover a Dragon - handled by game engine (simplified)
  },
});

// SCH_199t22
cardScriptsRegistry.register('SCH_199t22', {
});

// SCH_199t23 - Transfer Student (Dual Class) - Battlecry: Add a Dual Class card to your hand
cardScriptsRegistry.register('SCH_199t23', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.hand?.length < 10) {
      // Random dual class card - simplified
      const dualCards = ['LOOT_161', 'LOOT_160', 'LOOT_159'];
      const cardId = dualCards[Math.floor(Math.random() * dualCards.length)];
      controller.hand.push({ id: cardId } as any);
    }
  },
});

// SCH_199t24 - Transfer Student (Boomsday) - Battlecry: Add a random weapon to your hand
cardScriptsRegistry.register('SCH_199t24', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.hand?.length < 10) {
      // Random weapon - simplified
      const weapons = ['CS2_106', 'CS2_124', 'CS2_146'];
      const cardId = weapons[Math.floor(Math.random() * weapons.length)];
      controller.hand.push({ id: cardId } as any);
    }
  },
});

// SCH_199t25 - Transfer Student (Uldum) - Battlecry: Add an Uldum Plague spell to your hand
cardScriptsRegistry.register('SCH_199t25', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.hand?.length < 10) {
      const plagues = ['ULD_718', 'ULD_717', 'ULD_715', 'ULD_172', 'ULD_707'];
      const cardId = plagues[Math.floor(Math.random() * plagues.length)];
      controller.hand.push({ id: cardId } as any);
    }
  },
});
