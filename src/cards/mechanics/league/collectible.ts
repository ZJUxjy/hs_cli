// league - collectible.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy, Shuffle } from '../../../actions';
import type { Entity } from '../../../core/entity';

// LOE_003 - Entomb
cardScriptsRegistry.register('LOE_003', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      // Put target into deck - handled by game
    }
  },
});

// LOE_006 - Excavated Evil
cardScriptsRegistry.register('LOE_006', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Deal 3 damage to all enemy minions
    for (const minion of opponent?.field || []) {
      const damage = new Damage(source, minion, 3);
      damage.trigger(source);
    }
    // Shuffle into opponent's deck - handled by game
  },
});

// LOE_009 - Sir Finley Mrrgl
cardScriptsRegistry.register('LOE_009', {
  events: {
    DRAW: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const buff = new Buff(source, source, { ATK: 1 });
        buff.trigger(source);
      }
    },
  },
});

// LOE_011 - Reno Jackson - Battlecry: If your deck has no duplicates, fully heal your hero
cardScriptsRegistry.register('LOE_011', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = controller?.deck || [];

    // Check if deck has no duplicates
    const cardIds = deck.map((card: any) => card.id);
    const hasDuplicates = new Set(cardIds).size !== cardIds.length;

    if (!hasDuplicates) {
      // Fully heal hero
      const hero = controller?.hero;
      if (hero) {
        const heal = new Heal(source, hero, 30);
        heal.trigger(source);
      }
    }
  },
});

// LOE_012 - Tomb Pillager - Deathrattle: Get a Coin
cardScriptsRegistry.register('LOE_012', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const give = new Give('GAME_005'); // The Coin
    give.trigger(source, controller);
  },
});

// LOE_016 - Museum Curator
cardScriptsRegistry.register('LOE_016', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        // Discover a Deathrattle minion - handled by game
      }
    },
  },
});

// LOE_017 - Twilight Elder
cardScriptsRegistry.register('LOE_017', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Discover a Dragon - handled by game
  },
});

// LOE_017e
cardScriptsRegistry.register('LOE_017e', {
});

// LOE_018 - Ethan the Necrophile
cardScriptsRegistry.register('LOE_018', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer && controller?.field?.length > 0) {
        // Resurrect a friendly minion - handled by game
      }
    },
  },
});

// LOE_019 - Obsidian Destroyer
cardScriptsRegistry.register('LOE_019', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOE_019t');
      summon.trigger(source);
    }
  },
});

// LOE_020 - Scream
cardScriptsRegistry.register('LOE_020', {
  play: (ctx: ActionContext) => {
    // Transform friendly minions into 1/1's - handled by game
  },
});

// LOE_023 - Jungle Moon
cardScriptsRegistry.register('LOE_023', {
  play: (ctx: ActionContext) => {
    // Gain 2 Mana Crystals - handled by game
  },
});

// LOE_029 - Elise Starseeker
cardScriptsRegistry.register('LOE_029', {
  play: (ctx: ActionContext) => {
    // Add Map to the Golden Monkey to your deck - handled by game
  },
});

// LOE_038
cardScriptsRegistry.register('LOE_038', {
});

// LOE_039 - Raven Idol
cardScriptsRegistry.register('LOE_039', {
  play: (ctx: ActionContext) => {
    // Discover a minion or spell - handled by game
  },
});

// LOE_046 - Huge Toad - Deathrattle: Deal 1 damage to a random enemy
cardScriptsRegistry.register('LOE_046', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    const targets: any[] = [...(opponent?.field || [])];
    if (opponent?.hero) targets.push(opponent.hero);

    if (targets.length > 0) {
      const randomTarget = targets[Math.floor(Math.random() * targets.length)];
      const damage = new Damage(source, randomTarget, 1);
      damage.trigger(source);
    }
  },
});

// LOE_047 - Unearthed Raptor
cardScriptsRegistry.register('LOE_047', {
  play: (ctx: ActionContext) => {
    // Copy a Deathrattle minion from your deck - handled by game
  },
});

// LOE_050 - Summoning Stone
cardScriptsRegistry.register('LOE_050', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'LOE_050t');
      summon.trigger(source);
    }
  },
});

// LOE_051 - Shudderwraith
cardScriptsRegistry.register('LOE_051', {
});

// LOE_053 - Fossilized Devilsaur
cardScriptsRegistry.register('LOE_053', {
  events: {
    AFTER_MINION_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (ctx.event?.source?.controller === controller) {
        // Battlecry - handled by game
      }
    },
  },
});

// LOE_061 - Sleight of Hand
cardScriptsRegistry.register('LOE_061', {
  play: (ctx: ActionContext) => {
    // Put 2 random cards from your deck into your hand - handled by game
  },
});

// LOE_073 - Anyfin Can Happen
cardScriptsRegistry.register('LOE_073', {
  play: (ctx: ActionContext) => {
    // Deal 10 damage - handled by game
  },
});

// LOE_076 - Desert Camel
cardScriptsRegistry.register('LOE_076', {
  play: (ctx: ActionContext) => {
    // Put two 1/1 Locusts into your hand - handled by game
  },
});

// LOE_077 - Keeper of Uldaman
cardScriptsRegistry.register('LOE_077', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      // Set minion's Attack and Health to 3 - handled by game
    }
  },
});

// LOE_079 - Animated Armor
cardScriptsRegistry.register('LOE_079', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Your hero can only take 1 damage at a time - handled by game
  },
});

// LOE_019t - Saronite Taskmaster
cardScriptsRegistry.register('LOE_019t', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage to your hero - handled by game
  },
});

// LOE_019t2 - Lava Shock
cardScriptsRegistry.register('LOE_019t2', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage - handled by game
  },
});

// LOE_086 - Gemcaster
cardScriptsRegistry.register('LOE_086', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        // Your next spell costs 0 - handled by game
      }
    },
  },
});

// LOE_089 - Terrorscale Stalker
cardScriptsRegistry.register('LOE_089', {
  deathrattle: (ctx: ActionContext) => {
    // Trigger a random friendly minion's deathrattle - handled by game
  },
});

// LOE_092 - Neferset Raptor
cardScriptsRegistry.register('LOE_092', {
  play: (ctx: ActionContext) => {
    // Give your other minions +1 Attack - handled by game
  },
});

// LOEA16_3 - Unstable Portal
cardScriptsRegistry.register('LOEA16_3', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Add a random minion to your hand - handled by game
  },
});

// LOEA16_4 - Shudderwraith
cardScriptsRegistry.register('LOEA16_4', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage - handled by game
  },
});

// LOEA16_5 - Feral Rage
cardScriptsRegistry.register('LOEA16_5', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Gain 8 Armor or Deal 8 damage - handled by game
  },
});

// LOE_107 - Elise Trailblazer
cardScriptsRegistry.register('LOE_107', {
  play: (ctx: ActionContext) => {
    // Put a 'Map of the Golden Monkey' into your deck - handled by game
  },
});

// LOE_110 - Golden Monkey
cardScriptsRegistry.register('LOE_110', {
  play: (ctx: ActionContext) => {
    // Transform your hand and deck into legendary minions - handled by game
  },
});

// LOE_110t - Golden Monkey buff
cardScriptsRegistry.register('LOE_110t', {
});

// LOE_116 - Forgotten Torch
cardScriptsRegistry.register('LOE_116', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage. Shuffle a 'Roaring Torch' into your deck - handled by game
  },
});

// LOE_119 - Roaring Torch
cardScriptsRegistry.register('LOE_119', {
});

// LOE_002 - Finders Keepers
cardScriptsRegistry.register('LOE_002', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Discover a card with Overload - handled by game
  },
});

// LOE_002t - Timely Card
cardScriptsRegistry.register('LOE_002t', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Draw a card - handled by game
  },
});

// LOE_007 - Curiosity
cardScriptsRegistry.register('LOE_007', {
  play: (ctx: ActionContext) => {
    // Draw a card when you cast a spell - handled by game
  },
});

// LOE_007t - Explorer's Eye
cardScriptsRegistry.register('LOE_007t', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Your cards cost (1) less - handled by game
    },
  },
});

// LOE_026 - Gnomish Inventor
cardScriptsRegistry.register('LOE_026', {
  play: (ctx: ActionContext) => {
    // Draw a card - handled by game
  },
});

// LOE_104 - Rumbling Elemental
cardScriptsRegistry.register('LOE_104', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage - handled by game
  },
});

// LOE_105 - Obsidian Construct
cardScriptsRegistry.register('LOE_105', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Your minions have +1 Attack - handled by game
  },
});

// LOE_105e
cardScriptsRegistry.register('LOE_105e', {
});

// LOE_111 - Confessor Paletress
cardScriptsRegistry.register('LOE_111', {
  play: (ctx: ActionContext) => {
    // Reveal a minion in your deck - handled by game
  },
});

// LOE_113 - Reno Jackson
cardScriptsRegistry.register('LOE_113', {
  play: (ctx: ActionContext) => {
    // If your deck has no duplicates, heal for 10 - handled by game
  },
});

// LOE_115 - Journey to the City
cardScriptsRegistry.register('LOE_115', {
  play: (ctx: ActionContext) => {
    // Gain 6 Armor - handled by game
  },
});

// LOE_115a - Explore the City
cardScriptsRegistry.register('LOE_115a', {
  play: (ctx: ActionContext) => {
    // Draw 2 cards - handled by game
  },
});

// LOE_115b - Explore the City
cardScriptsRegistry.register('LOE_115b', {
  play: (ctx: ActionContext) => {
    // Gain 6 Armor - handled by game
  },
});

// LOE_021 - Evil Heckler
cardScriptsRegistry.register('LOE_021', {
});

// LOE_027
cardScriptsRegistry.register('LOE_027', {
});

// LOE_118
cardScriptsRegistry.register('LOE_118', {
});

// LOE_118e
cardScriptsRegistry.register('LOE_118e', {
});
