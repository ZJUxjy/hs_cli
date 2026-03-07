// League of Explorers Card Scripts
import { cardScriptsRegistry } from '../index';

// === Collectible Minions ===

// LOE_003 - Ethereal Conjurer
cardScriptsRegistry.register('LOE_003', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_SPELL' } as any);
    }
  },
});

// LOE_006 - Museum Curator
cardScriptsRegistry.register('LOE_006', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_DEATHRATTLE_MINION' } as any);
    }
  },
});

// LOE_009 - Obsidian Destroyer
cardScriptsRegistry.register('LOE_009', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.field?.length < 7) {
        controller.field.push({ id: 'LOE_009t' } as any);
      }
    },
  },
});

// LOE_011 - Reno Jackson
cardScriptsRegistry.register('LOE_011', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // If no duplicates in deck, fully heal - simplified
    if (controller?.hero) {
      (controller.hero as any).health = (controller.hero as any).maxHealth || 30;
    }
  },
});

// LOE_012 - Tomb Pillager
cardScriptsRegistry.register('LOE_012', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'GAME_005' } as any);
    }
  },
});

// LOE_016 - Rumbling Elemental
cardScriptsRegistry.register('LOE_016', {
  events: {
    PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (
        ctx.event?.source?.controller === controller &&
        ctx.event?.card !== ctx.source &&
        (ctx.event?.card as any)?.battlecry
      ) {
        const opponent = controller?.opponent;
        const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];
        if (targets.length > 0) {
          const idx = Math.floor(Math.random() * targets.length);
          (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 2;
        }
      }
    },
  },
});

// LOE_017 - Keeper of Uldaman
cardScriptsRegistry.register('LOE_017', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = 3;
      (ctx.target as any).maxHealth = 3;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// LOE_018 - Tunnel Trogg
cardScriptsRegistry.register('LOE_018', {
  // Gain +1 attack when overload - simplified
});

// LOE_019 - Unearthed Raptor
cardScriptsRegistry.register('LOE_019', {
  play: (ctx: any) => {
    // Copy deathrattle from target - simplified
  },
  requirements: { 1: 0, 49: 0 },
});

// LOE_020 - Desert Camel
cardScriptsRegistry.register('LOE_020', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Summon 1-cost minion from each deck - simplified
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_1_MINION' } as any);
    }
    if (opponent?.field?.length < 7) {
      opponent.field.push({ id: 'RANDOM_COST_1_MINION' } as any);
    }
  },
});

// LOE_023 - Dark Peddler
cardScriptsRegistry.register('LOE_023', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      // Discover a 1-cost card
      controller.hand.push({ id: 'RANDOM_COST_1_CARD' } as any);
    }
  },
});

// LOE_029 - Jeweled Scarab
cardScriptsRegistry.register('LOE_029', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      // Discover a 3-cost card
      controller.hand.push({ id: 'RANDOM_COST_3_CARD' } as any);
    }
  },
});

// LOE_038 - Naga Sea Witch
cardScriptsRegistry.register('LOE_038', {
  // Cards in hand cost 5 - simplified aura
});

// LOE_039 - Gorillabot A-3
cardScriptsRegistry.register('LOE_039', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasMech = (controller?.field || []).some(
      (m: any) => m !== ctx.source && m.race === 'MECH'
    );
    if (hasMech && controller?.hand?.length < 10) {
      // Discover a Mech
      controller.hand.push({ id: 'RANDOM_MECH' } as any);
    }
  },
});

// LOE_038 - Naga Sea Witch
cardScriptsRegistry.register('LOE_038', {
  // Cards in hand cost 5 - simplified aura
});

// LOE_039 - Gorillabot A-3
cardScriptsRegistry.register('LOE_039', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasMech = (controller?.field || []).some(
      (m: any) => m !== ctx.source && m.race === 'MECH'
    );
    if (hasMech && controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_MECH' } as any);
    }
  },
});

// LOE_046 - Huge Toad
cardScriptsRegistry.register('LOE_046', {
  deathrattle: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];
    if (targets.length > 0) {
      const idx = Math.floor(Math.random() * targets.length);
      (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 1;
    }
  },
});

// LOE_047 - Tomb Spider
cardScriptsRegistry.register('LOE_047', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      // Discover a Beast
      controller.hand.push({ id: 'RANDOM_BEAST' } as any);
    }
  },
});

// LOE_115 - Raven Idol
cardScriptsRegistry.register('LOE_115', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      // Discover a minion or spell
      controller.hand.push({ id: 'RANDOM_MINION' } as any);
    }
  },
});

// LOE_050 - Mounted Raptor
cardScriptsRegistry.register('LOE_050', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_1_MINION' } as any);
    }
  },
});

// LOE_051 - Jungle Moonkin
cardScriptsRegistry.register('LOE_051', {
  // Both players have +2 spell damage - simplified aura
});

// LOE_053 - Djinni of Zephyrs
cardScriptsRegistry.register('LOE_053', {
  // Copy spell targeting friendly minion - simplified
});

// LOE_061 - Anubisath Sentinel
cardScriptsRegistry.register('LOE_061', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const otherMinions = (controller?.field || []).filter((m: any) => m !== ctx.source);
    if (otherMinions.length > 0) {
      const idx = Math.floor(Math.random() * otherMinions.length);
      (otherMinions[idx] as any).atk = ((otherMinions[idx] as any).atk || 0) + 3;
      (otherMinions[idx] as any).maxHealth = ((otherMinions[idx] as any).maxHealth || 0) + 3;
    }
  },
});

// LOE_073 - Fossilized Devilsaur
cardScriptsRegistry.register('LOE_073', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasBeast = (controller?.field || []).some((m: any) => m.race === 'BEAST');
    if (hasBeast) {
      (ctx.source as any).taunt = true;
    }
  },
});

// LOE_076 - Sir Finley Mrrgglton
cardScriptsRegistry.register('LOE_076', {
  play: (ctx: any) => {
    // Discover basic hero power - simplified
  },
});

// LOE_077 - Brann Bronzebeard
cardScriptsRegistry.register('LOE_077', {
  // Battlecries trigger twice - simplified aura
});

// LOE_079 - Elise Starseeker
cardScriptsRegistry.register('LOE_079', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck) {
      const idx = Math.floor(Math.random() * (controller.deck.length + 1));
      controller.deck.splice(idx, 0, { id: 'LOE_019t' } as any);
    }
  },
});

// LOE_019t - Map to the Golden Monkey
cardScriptsRegistry.register('LOE_019t', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck) {
      controller.deck.push({ id: 'LOE_019t2' } as any);
    }
    if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
      controller.hand.push(controller.deck.shift());
    }
  },
});

// LOE_019t2 - Golden Monkey
cardScriptsRegistry.register('LOE_019t2', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Replace hand and deck with legendaries - simplified
    for (let i = 0; i < (controller?.hand?.length || 0); i++) {
      controller.hand[i] = { id: 'RANDOM_LEGENDARY_MINION' } as any;
    }
  },
});

// LOE_086 - Summoning Stone
cardScriptsRegistry.register('LOE_086', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.source?.controller === controller && controller?.field?.length < 7) {
        const cost = (ctx.event?.source as any)?.cost || 0;
        controller.field.push({ id: `RANDOM_COST_${cost}_MINION` } as any);
      }
    },
  },
});

// LOE_089 - Wobbling Runts
cardScriptsRegistry.register('LOE_089', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) controller.field.push({ id: 'LOE_089t' } as any);
    if (controller?.field?.length < 7) controller.field.push({ id: 'LOE_089t2' } as any);
    if (controller?.field?.length < 7) controller.field.push({ id: 'LOE_089t3' } as any);
  },
});

// LOE_092 - Arch-Thief Rafaam
cardScriptsRegistry.register('LOE_092', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      const artifacts = ['LOEA16_3', 'LOEA16_4', 'LOEA16_5'];
      const idx = Math.floor(Math.random() * artifacts.length);
      controller.hand.push({ id: artifacts[idx] } as any);
    }
  },
});

// LOEA16_3 - Lantern of Power
cardScriptsRegistry.register('LOEA16_3', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 10;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 10;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// LOEA16_4 - Timepiece of Horror
cardScriptsRegistry.register('LOEA16_4', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];

    for (let i = 0; i < 10 && targets.length > 0; i++) {
      const idx = Math.floor(Math.random() * targets.length);
      (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 1;
    }
  },
});

// LOEA16_5 - Mirror of Doom
cardScriptsRegistry.register('LOEA16_5', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (let i = 0; i < 7 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'LOEA16_5t' } as any);
    }
  },
  requirements: { 24: 1 },
});

// LOE_107 - Eerie Statue
cardScriptsRegistry.register('LOE_107', {
  // Can only attack if only minion - simplified
});

// LOE_110 - Ancient Shade
cardScriptsRegistry.register('LOE_110', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck) {
      controller.deck.push({ id: 'LOE_110t' } as any);
    }
  },
});

// LOE_110t - Ancient Curse
cardScriptsRegistry.register('LOE_110t', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = ((controller.hero as any).health || 0) - 7;
    }
  },
});

// LOE_116 - Reliquary Seeker
cardScriptsRegistry.register('LOE_116', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if ((controller?.field?.length || 0) === 7) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 4;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 4;
    }
  },
});

// LOE_119 - Animated Armor
cardScriptsRegistry.register('LOE_119', {
  // Hero takes no damage from abilities - simplified
});

// === Spells ===

// LOE_002 - Forgotten Torch
cardScriptsRegistry.register('LOE_002', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 3;
    }
    const controller = ctx.source?.controller;
    if (controller?.deck) {
      controller.deck.push({ id: 'LOE_002t' } as any);
    }
  },
  requirements: { 48: 0 },
});

// LOE_002t - Roaring Torch
cardScriptsRegistry.register('LOE_002t', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 6;
    }
  },
  requirements: { 48: 0 },
});

// LOE_003 - Ethereal Conjurer
cardScriptsRegistry.register('LOE_003', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      // Discover a Mage spell
      controller.hand.push({ id: 'RANDOM_MAGE_SPELL' } as any);
    }
  },
});

// LOE_006 - Museum Curator
cardScriptsRegistry.register('LOE_006', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      // Discover a Deathrattle minion
      controller.hand.push({ id: 'RANDOM_DEATHRATTLE_MINION' } as any);
    }
  },
});

// LOE_007 - Curse of Rafaam
cardScriptsRegistry.register('LOE_007', {
  play: (ctx: any) => {
    const opponent = ctx.source?.controller?.opponent;
    if (opponent?.hand?.length < 10) {
      opponent.hand.push({ id: 'LOE_007t' } as any);
    }
  },
});

// LOE_007t - Cursed!
cardScriptsRegistry.register('LOE_007t', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.hero) {
        (controller.hero as any).health = ((controller.hero as any).health || 0) - 2;
      }
    },
  },
});

// LOE_026 - Anyfin Can Happen
cardScriptsRegistry.register('LOE_026', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    // Summon 7 murlocs that died - simplified
    for (let i = 0; i < 7 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'RANDOM_MURLOC' } as any);
    }
  },
});

// LOE_104 - Entomb
cardScriptsRegistry.register('LOE_104', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      const targetController = (ctx.target as any).controller;

      // Remove from opponent's field
      if (targetController?.field) {
        const idx = targetController.field.indexOf(ctx.target);
        if (idx !== -1) targetController.field.splice(idx, 1);
      }

      // Add to player's deck
      if (controller?.deck) {
        controller.deck.push(ctx.target);
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// LOE_105 - Explorer's Hat
cardScriptsRegistry.register('LOE_105', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 1;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 1;
      (ctx.target as any).explorerHat = true;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// LOE_111 - Excavated Evil
cardScriptsRegistry.register('LOE_111', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [...(controller?.field || []), ...(opponent?.field || [])];

    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 3;
    }

    if (opponent?.deck) {
      opponent.deck.push({ id: 'LOE_111' } as any);
    }
  },
});

// LOE_113 - Everyfin is Awesome
cardScriptsRegistry.register('LOE_113', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (const minion of controller?.field || []) {
      (minion as any).atk = ((minion as any).atk || 0) + 2;
      (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 2;
    }
  },
});

// LOE_115 - Raven Idol
cardScriptsRegistry.register('LOE_115', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_MINION' } as any);
    }
  },
});

// === Secrets ===

// LOE_021 - Dart Trap
cardScriptsRegistry.register('LOE_021', {
  // Secret: when opponent uses hero power, deal 5 damage - simplified
});

// LOE_027 - Sacred Trial
cardScriptsRegistry.register('LOE_027', {
  // Secret: when opponent has 4+ minions, destroy one - simplified
});

// === Weapons ===

// LOE_118 - Cursed Blade
cardScriptsRegistry.register('LOE_118', {
  // Double damage taken - simplified
});

console.log('[League] Registered card scripts');
