// dragons - adventure.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy, Freeze, Morph } from '../../../actions';
import type { Entity } from '../../../core/entity';

// YOD_040 - Steel Beetle - Battlecry: If you're holding a spell that costs 5 or more, gain 5 Armor
cardScriptsRegistry.register('YOD_040', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const hand = controller?.hand || [];
    // Check if holding a spell that costs 5 or more
    const hasExpensiveSpell = hand.some((card: any) => card && card.type === 'SPELL' && (card.cost || 0) >= 5);
    if (hasExpensiveSpell && controller?.hero) {
      const heal = new Heal(source, controller.hero, 5);
      heal.trigger(source);
    }
  },
});

// YOD_001 - Rising Winds - Twinspell Choose One - Draw a card; or Summon a 3/2 Eagle
cardScriptsRegistry.register('YOD_001', {
});

// YOD_001b - Rising Winds (Draw option) - Draw a card
cardScriptsRegistry.register('YOD_001b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const draw = new Draw(source);
    draw.trigger(source);
  },
});

// YOD_001c - Rising Winds (Summon option) - Summon a 3/2 Eagle
cardScriptsRegistry.register('YOD_001c', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'YOD_001t');
      summon.trigger(source);
    }
  },
});

// YOD_004 - Chopshop Copter - After a friendly Mech dies, add a random Mech to your hand
cardScriptsRegistry.register('YOD_004', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      // Simplified: would need to check if destroyed card was a friendly mech
      // Add a random mech to hand - simplified
      const give = new Give('EX1_028'); // Kobold Geomancer placeholder for mech
      give.trigger(source, controller);
    },
  },
});

// YOD_036 - Rotnest Drake - Battlecry: If you're holding a Dragon, destroy a random enemy minion
cardScriptsRegistry.register('YOD_036', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const hand = controller?.hand || [];
    // Check if holding a Dragon
    const hasDragon = hand.some((card: any) => card && card.type === 'MINION' && card.race === 'DRAGON');
    const opponent = controller?.opponent;
    if (hasDragon && opponent?.field && opponent.field.length > 0) {
      const randomMinion = opponent.field[Math.floor(Math.random() * opponent.field.length)];
      const destroy = new Destroy();
      destroy.trigger(source, randomMinion);
    }
  },
});

// YOD_005 - Fresh Scent - Twinspell Give a Beast +2/+2
cardScriptsRegistry.register('YOD_005', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_TARGET_IS_RACE]: 0, // BEAST
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// YOD_007 - Animated Avalanche - Battlecry: If you played an Elemental last turn, summon a copy of this
cardScriptsRegistry.register('YOD_007', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Check if played an Elemental last turn - simplified check
    // In real implementation, would track if elemental was played last turn
    const playedElementalLastTurn = false; // Simplified
    if (playedElementalLastTurn && controller?.field?.length < 7) {
      // Would summon a copy of this minion
    }
  },
});

// YOD_009 - The Amazing Reno - Battlecry: Make all minions disappear (destroy all minions)
cardScriptsRegistry.register('YOD_009', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Destroy all minions on both sides
    if (controller?.field) {
      for (const minion of [...controller.field]) {
        const destroy = new Destroy();
        destroy.trigger(source, minion);
      }
    }
    if (opponent?.field) {
      for (const minion of [...opponent.field]) {
        const destroy = new Destroy();
        destroy.trigger(source, minion);
      }
    }
  },
});

// YOD_009h - What Does This Do? - Passive: At the start of your turn, cast a random spell
cardScriptsRegistry.register('YOD_009h', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      // Would need to cast a random spell - simplified
      // This is a passive hero power effect
    },
  },
});

// YOD_043 - Scalelord - Battlecry: Give your Murlocs Divine Shield
cardScriptsRegistry.register('YOD_043', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field || [];
    // Give Divine Shield to all Murlocs (would need a divine shield buff)
    for (const minion of field) {
      if ((minion as any).race === 'MURLOC') {
        // Divine Shield is a tag, would need to set it
        (minion as any).divineShield = true;
      }
    }
  },
});

// YOD_012 - Air Raid - Twinspell Summon two 1/1 Silver Hand Recruits with Taunt
cardScriptsRegistry.register('YOD_012', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'CS2_101t');
      summon.trigger(source);
    }
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'CS2_101t');
      summon.trigger(source);
    }
  },
});

// YOD_013 - Cleric of Scales - Battlecry: If you're holding a Dragon, Discover a spell from your deck
cardScriptsRegistry.register('YOD_013', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const hand = controller?.hand || [];
    // Check if holding a Dragon
    const hasDragon = hand.some((card: any) => card && card.type === 'MINION' && card.race === 'DRAGON');
    if (hasDragon) {
      // Would need to discover a spell from deck - simplified
      const deck = controller?.deck || [];
      const spells = deck.filter((card: any) => card && card.type === 'SPELL');
      if (spells.length > 0) {
        const randomSpell = spells[Math.floor(Math.random() * spells.length)];
        const give = new Give(randomSpell);
        give.trigger(source, controller);
      }
    }
  },
});

// YOD_014 - Aeon Reaver - Battlecry: Deal damage to a minion equal to its Attack
cardScriptsRegistry.register('YOD_014', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const targetAtk = (target as any).atk || 0;
      const damage = new Damage(source, target, targetAtk);
      damage.trigger(source);
    }
  },
});

// YOD_015 - Dark Prophecy - Discover a 2-Cost minion. Summon it and give it +3 Health
cardScriptsRegistry.register('YOD_015', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      // Would need to discover a 2-cost minion - simplified
      const summon = new Summon(source, 'CS2_172'); // placeholder
      summon.trigger(source);
      // Would need to buff with +3 health
    }
  },
});

// YOD_016 - Skyvateer - Stealth Deathrattle: Draw a card
cardScriptsRegistry.register('YOD_016', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const draw = new Draw(source);
    draw.trigger(source);
  },
});

// YOD_017
cardScriptsRegistry.register('YOD_017', {
});

// YOD_018 - Waxmancy - Discover a Battlecry minion. Reduce its Cost by 2
cardScriptsRegistry.register('YOD_018', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Would need to discover a battlecry minion - simplified
    // Give a card with cost reduction
    if (controller?.hand) {
      // Would apply a -2 cost buff to a card in hand
    }
  },
});

// YOD_018e - Waxmancy Enchantment - Cost reduction removed when card is played
cardScriptsRegistry.register('YOD_018e', {
  events: {
    // This buff is removed when the card is played (implemented via the buff system)
  },
});

// YOD_020 - Explosive Evolution - Transform a minion into a random one that costs 3 more
cardScriptsRegistry.register('YOD_020', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      // Would need to morph into a minion that costs 3 more - simplified
      const morph = new Morph('CS2_172'); // placeholder
      morph.trigger(source, target);
    }
  },
});

// YOD_041 - Eye of the Storm - Summon three 5/6 Elementals with Taunt. Overload: (3)
cardScriptsRegistry.register('YOD_041', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    for (let i = 0; i < 3; i++) {
      if (controller?.field?.length < 7) {
        const summon = new Summon(source, 'YOD_041t');
        summon.trigger(source);
      }
    }
  },
});

// YOD_042 - The Fist of Ra-den - After you cast a spell, summon a Legendary minion of that Cost
cardScriptsRegistry.register('YOD_042', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Only trigger for spells played by controller
      if (event?.source && (event.source as any).controller === controller) {
        const card = event.source;
        if ((card as any).type === 'SPELL') {
          const cost = (card as any).cost || 0;
          if (cost > 0 && controller?.field?.length < 7) {
            // Would need to summon a random legendary of that cost - simplified
            const summon = new Summon(source, 'CS2_172'); // placeholder
            summon.trigger(source);
            // Deal 1 damage to self (weapon durability)
            if (controller?.hero) {
              const damage = new Damage(source, source, 1);
              damage.trigger(source);
            }
          }
        }
      }
    },
  },
});

// YOD_026 - Fiendish Servant - Deathrattle: Give this minion's Attack to a random friendly minion
cardScriptsRegistry.register('YOD_026', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field || [];
    // Filter out self
    const otherMinions = field.filter((minion: any) => minion !== source);
    if (otherMinions.length > 0) {
      const randomMinion = otherMinions[Math.floor(Math.random() * otherMinions.length)];
      const sourceAtk = (source as any).atk || 0;
      const buff = new Buff(source, randomMinion, { ATK: sourceAtk });
      buff.trigger(source);
    }
  },
});

// YOD_026e - Fiendish Servant Buff
cardScriptsRegistry.register('YOD_026e', {
});

// YOD_027 - Chaos Gazer - Battlecry: Corrupt a playable card in your opponent's hand
cardScriptsRegistry.register('YOD_027', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hand && opponent.hand.length > 0) {
      // Find a playable card (cost <= opponent mana + 1)
      const playableCards = opponent.hand.filter((card: any) => {
        const manaAvailable = (opponent as any).mana || 0;
        return (card.cost || 0) <= manaAvailable + 1;
      });
      if (playableCards.length > 0) {
        const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        // Apply corrupt buff - simplified
      }
    }
  },
});

// YOD_027e - Chaos Gazer Corrupt Buff - Destroy at end of turn if not played
cardScriptsRegistry.register('YOD_027e', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Destroy the card if it wasn't played - simplified
    },
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // Debug/placeholder card - no implementation needed
  },
});

// YOD_025 - Twisted Knowledge - Discover 2 Warlock cards
cardScriptsRegistry.register('YOD_025', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Would need to discover 2 warlock cards - simplified
    // Give a warlock card
    const give = new Give('CS2_022'); // placeholder warlock card
    give.trigger(source, controller);
    const give2 = new Give('CS2_022'); // placeholder
    give2.trigger(source, controller);
  },
});

// YOD_022 - Risky Skipper - After you play a minion, deal 1 damage to all minions
cardScriptsRegistry.register('YOD_022', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Only trigger when a minion is played by controller
      if (event?.source && (event.source as any).controller === controller) {
        const card = event.source;
        if ((card as any).type === 'MINION') {
          // Deal 1 damage to all minions
          if (controller?.field) {
            for (const minion of controller.field) {
              const damage = new Damage(source, minion, 1);
              damage.trigger(source);
            }
          }
          const opponent = controller?.opponent;
          if (opponent?.field) {
            for (const minion of opponent.field) {
              const damage = new Damage(source, minion, 1);
              damage.trigger(source);
            }
          }
        }
      }
    },
  },
});

// YOD_024 - Bomb Wrangler - Whenever this minion takes damage, summon a 1/1 Boom Bot
cardScriptsRegistry.register('YOD_024', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Only trigger when this minion takes damage
      if (event?.target === source && controller?.field?.length < 7) {
        const summon = new Summon(source, 'GVG_110t');
        summon.trigger(source);
      }
    },
  },
});

// YOD_023 - Boom Squad - Discover a Lackey, Mech, or Dragon
cardScriptsRegistry.register('YOD_023', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Would need to choose between Lackey, Mech, Dragon - simplified
    const give = new Give('GILA_583'); // placeholder lackey
    give.trigger(source, controller);
  },
});

// YOD_028 - Skydiving Instructor - Battlecry: Summon a 1-Cost minion from your deck
cardScriptsRegistry.register('YOD_028', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = controller?.deck || [];
    // Find 1-cost minions in deck
    const oneCostMinions = deck.filter((card: any) => card && card.type === 'MINION' && (card.cost || 0) === 1);
    if (oneCostMinions.length > 0 && controller?.field?.length < 7) {
      const randomMinion = oneCostMinions[Math.floor(Math.random() * oneCostMinions.length)];
      const summon = new Summon(source, randomMinion);
      summon.trigger(source);
    }
  },
});

// YOD_029 - Hailbringer - Battlecry: Summon two 1/1 Ice Shards that Freeze
cardScriptsRegistry.register('YOD_029', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    for (let i = 0; i < 2; i++) {
      if (controller?.field?.length < 7) {
        const summon = new Summon(source, 'YOD_029t');
        summon.trigger(source);
      }
    }
  },
});

// YOD_029t - Ice Shard - Whenever this attacks a character, Freeze it
cardScriptsRegistry.register('YOD_029t', {
  events: {
    ATTACK: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const event = ctx.event;
      if (event?.target) {
        const freeze = new Freeze();
        freeze.trigger(source, event.target);
      }
    },
  },
});

// YOD_030 - Licensed Adventurer - Battlecry: If you control a Quest, add a Coin to your hand
cardScriptsRegistry.register('YOD_030', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field || [];
    // Check if controlling a Quest (card with QUEST tag)
    const hasQuest = field.some((card: any) => card && (card as any).quest);
    if (hasQuest) {
      const give = new Give('GAME_005'); // The Coin
      give.trigger(source, controller);
    }
  },
});

// YOD_032
cardScriptsRegistry.register('YOD_032', {
});

// YOD_006 - Escaped Manasaber - Stealth Whenever this attacks, gain 1 Mana Crystal this turn only
cardScriptsRegistry.register('YOD_006', {
  events: {
    ATTACK: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.hero) {
        (controller.hero as any).tempMana = ((controller.hero as any).tempMana || 0) + 1;
      }
    },
  },
});

// YOD_033 - Boompistol Bully - Battlecry: Enemy Battlecry cards cost 5 more next turn
cardScriptsRegistry.register('YOD_033', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Would need to apply a cost increase to opponent's battlecry cards - simplified
    // Buff that destroys at start of turn
    if (opponent?.hand) {
      // Would apply buff to battlecry cards in hand
    }
  },
});

// YOD_033e - Boompistol Bully Enchantment - Destroy at start of turn
cardScriptsRegistry.register('YOD_033e', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      // Buff is destroyed at start of turn - would be handled by the buff system
    },
  },
});

// YOD_035 - Grand Lackey Erkh - After you play a Lackey, add a Lackey to your hand
cardScriptsRegistry.register('YOD_035', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Only trigger when a Lackey is played by controller
      if (event?.source && (event.source as any).controller === controller) {
        const card = event.source;
        // Check if it's a lackey (simplified - would need proper lackey check)
        if ((card as any).lackey) {
          const give = new Give('GILA_583'); // placeholder lackey
          give.trigger(source, controller);
        }
      }
    },
  },
});

// YOD_038 - Sky Gen'ral Kragg - Taunt Battlecry: If you've played a Quest this game, summon a 4/2 Parrot with Rush
cardScriptsRegistry.register('YOD_038', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Check if a Quest has been played this game - simplified
    const playedQuest = false;
    if (playedQuest && controller?.field?.length < 7) {
      const summon = new Summon(source, 'YOD_038t');
      summon.trigger(source);
    }
  },
});
