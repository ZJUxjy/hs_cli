// TGT (The Grand Tournament) Card Scripts
import { cardScriptsRegistry } from '../index';

// === Druid ===

// AT_042 - Darnassus Aspirant
cardScriptsRegistry.register('AT_042', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Each player gains 1 mana
    if (controller) {
      controller.maxMana = Math.min((controller.maxMana || 0) + 1, 10);
    }
    if (opponent) {
      opponent.maxMana = Math.min((opponent.maxMana || 1) + 1, 10);
    }
  },
});

// AT_043 - Savage Combatant
cardScriptsRegistry.register('AT_043', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
      }
    },
  },
});

// AT_044 - Wildwalker
cardScriptsRegistry.register('AT_044', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const beasts = controller?.field?.filter((m: any) => m.race === 'BEAST') || [];

    if (beasts.length > 0) {
      const target = beasts[Math.floor(Math.random() * beasts.length)];
      (target as any).atk = ((target as any).atk || 0) + 1;
      (target as any).maxHealth = ((target as any).maxHealth || 0) + 1;
    }
  },
});

// AT_045 - Knight of the Wild
cardScriptsRegistry.register('AT_045', {
  // Cost reduced by 1 when you have a beast - simplified
});

// AT_046 - Astral Communion
cardScriptsRegistry.register('AT_046', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    // Set mana to 10
    if (controller) {
      controller.maxMana = 10;
      controller.mana = 10;
    }

    // Discard hand
    if (controller?.hand) {
      controller.hand.length = 0;
    }
  },
});

// AT_047 - Fandral Staghelm
cardScriptsRegistry.register('AT_047', {
  // Choose One cards have both effects - aura
});

// AT_048 - Druid of the Saber
cardScriptsRegistry.register('AT_048', {
  play: (ctx: any) => {
    // Transform into Saber - simplified
  },
});

// AT_049 - Living Roots
cardScriptsRegistry.register('AT_049', {
  play: (ctx: any) => {
    // Choose: Deal 2 damage or Summon 2 1/1 Saplings - simplified
  },
});

// AT_050 - Darnassus Aspirant
cardScriptsRegistry.register('AT_050', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;

    // Lose 1 mana
    if (controller) {
      controller.maxMana = Math.max(1, (controller.maxMana || 0) - 1);
    }
  },
});

// === Hunter ===

// AT_010 - Ram Wrangler
cardScriptsRegistry.register('AT_010', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasBeast = controller?.field?.some((m: any) => m.race === 'BEAST');

    if (hasBeast && controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_BEAST' } as any);
    }
  },
});

// AT_056 - Powershot
cardScriptsRegistry.register('AT_056', {
  play: (ctx: any) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const controller = ctx.source?.controller;
      const opponent = controller?.opponent;

      // Deal 2 damage to target and adjacent minions
      target.health = (target.health || 0) - 2;

      const field = (target as any).controller?.field || [];
      const idx = field.indexOf(target);

      if (idx > 0) {
        (field[idx - 1] as any).health = ((field[idx - 1] as any).health || 0) - 2;
      }
      if (idx < field.length - 1) {
        (field[idx + 1] as any).health = ((field[idx + 1] as any).health || 0) - 2;
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_057 - Stablemaster
cardScriptsRegistry.register('AT_057', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).race === 'BEAST') {
      (ctx.target as any).immune = true;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_058 - King's Elekk
cardScriptsRegistry.register('AT_058', {
  play: (ctx: any) => {
    // Joust: If you win, draw the card - simplified
  },
});

// AT_059 - Brave Archer
cardScriptsRegistry.register('AT_059', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.hand?.length === 0) {
        const opponent = controller?.opponent;
        if (opponent?.hero) {
          (opponent.hero as any).health = ((opponent.hero as any).health || 0) - 2;
        }
      }
    },
  },
});

// AT_060 - Bear Trap
cardScriptsRegistry.register('AT_060', {
  events: {
    ATTACK: (ctx: any) => {
      // When your hero is attacked, summon a Bear - simplified
    },
  },
});

// AT_061 - Lock and Load
cardScriptsRegistry.register('AT_061', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller) {
      (controller as any).lockAndLoadActive = true;
    }
  },
});

// AT_062 - Ball of Spiders
cardScriptsRegistry.register('AT_062', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    for (let i = 0; i < 3 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'FP1_011' } as any); // Webspinner
    }
  },
  requirements: { 24: 1 },
});

// AT_063 - Acidmaw
cardScriptsRegistry.register('AT_063', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.source !== ctx.source && ctx.event?.target?.type === 'MINION') {
        (ctx.event.target as any).destroyed = true;
      }
    },
  },
});

// AT_063t - Dreadscale
cardScriptsRegistry.register('AT_063t', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        const opponent = controller?.opponent;
        const allMinions = [
          ...(controller?.field || []),
          ...(opponent?.field || [])
        ].filter((m: any) => m !== ctx.source);

        for (const minion of allMinions) {
          (minion as any).health = ((minion as any).health || 0) - 1;
        }
      }
    },
  },
});

// === Mage ===

// AT_001 - Polymorph: Boar
cardScriptsRegistry.register('AT_001', {
  play: (ctx: any) => {
    if (ctx.target) {
      // Transform into 4/2 Boar - simplified
      (ctx.target as any).transformed = 'AT_001t';
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_002 - Coldarra Drake
cardScriptsRegistry.register('AT_002', {
  // Your hero power costs (1) - aura
});

// AT_003 - Rhonin
cardScriptsRegistry.register('AT_003', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;

    for (let i = 0; i < 3 && controller?.hand?.length < 10; i++) {
      controller.hand.push({ id: 'AT_003t' } as any); // Arcane Blast
    }
  },
});

// AT_004 - Spellslinger
cardScriptsRegistry.register('AT_004', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Each player gets a random spell
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_SPELL' } as any);
    }
    if (opponent?.hand?.length < 10) {
      opponent.hand.push({ id: 'RANDOM_SPELL' } as any);
    }
  },
});

// AT_005 - Dalaran Aspirant
cardScriptsRegistry.register('AT_005', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        (ctx.source as any).spellPower = ((ctx.source as any).spellPower || 0) + 1;
      }
    },
  },
});

// AT_006 - Wilfred Fizzlebang
cardScriptsRegistry.register('AT_006', {
  events: {
    DRAW: (ctx: any) => {
      // Drawn minions cost (0) - simplified
    },
  },
});

// AT_007 - Effigy
cardScriptsRegistry.register('AT_007', {
  events: {
    DEATH: (ctx: any) => {
      // When friendly minion dies, destroy random enemy minion - simplified
    },
  },
});

// AT_008 - Spellslinger
cardScriptsRegistry.register('AT_008', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_SPELL' } as any);
    }
    if (opponent?.hand?.length < 10) {
      opponent.hand.push({ id: 'RANDOM_SPELL' } as any);
    }
  },
});

// AT_009 - Darnassus Aspirant
cardScriptsRegistry.register('AT_009', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (controller) {
      controller.maxMana = Math.min((controller.maxMana || 0) + 1, 10);
    }
    if (opponent) {
      opponent.maxMana = Math.min((opponent.maxMana || 0) + 1, 10);
    }
  },
});

// === Paladin ===

// AT_073 - Competitive Spirit
cardScriptsRegistry.register('AT_073', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.field?.length > 0) {
        for (const minion of controller.field) {
          (minion as any).atk = ((minion as any).atk || 0) + 1;
          (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 1;
        }
      }
    },
  },
});

// AT_074 - Seal of Champions
cardScriptsRegistry.register('AT_074', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 3;
      (ctx.target as any).divineShield = true;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_075 - Warhorse Trainer
cardScriptsRegistry.register('AT_075', {
  // Your Silver Hand Recruits have +1 Attack - aura
});

// AT_076 - Murloc Knight
cardScriptsRegistry.register('AT_076', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.field?.length < 7) {
        controller.field.push({ id: 'RANDOM_MURLOC' } as any);
      }
    },
  },
});

// AT_077 - Argent Lance
cardScriptsRegistry.register('AT_077', {
  play: (ctx: any) => {
    // Joust: If you win, +1 Durability - simplified
  },
});

// AT_078 - Enter the Coliseum
cardScriptsRegistry.register('AT_078', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Keep only the highest Attack minion on each side
    const findHighest = (field: any[]) => {
      if (!field || field.length === 0) return [];
      const highest = field.reduce((max: any, m: any) => {
        return ((m.atk || 0) > (max?.atk || 0)) ? m : max;
      }, field[0]);
      return [highest];
    };

    const friendlyHighest = findHighest(controller?.field || []);
    const enemyHighest = findHighest(opponent?.field || []);

    controller.field = friendlyHighest;
    opponent.field = enemyHighest;
  },
});

// AT_079 - Mysterious Challenger
cardScriptsRegistry.register('AT_079', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    // Summon 1 of each secret from your deck
    if (controller?.deck) {
      const secrets = controller.deck.filter((c: any) => c.secret);
      for (const secret of secrets) {
        if (controller.field?.length < 7) {
          controller.field.push(secret);
        }
      }
    }
  },
});

// AT_081 - Eadric the Pure
cardScriptsRegistry.register('AT_081', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    for (const minion of opponent?.field || []) {
      (minion as any).atk = 1;
    }
  },
});

// AT_104 - Tuskarr Jouster
cardScriptsRegistry.register('AT_104', {
  play: (ctx: any) => {
    // Joust: If you win, restore 7 Health to your hero - simplified
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + 7,
        (controller.hero as any).maxHealth || 30
      );
    }
  },
});

// === Priest ===

// AT_011 - Holy Champion
cardScriptsRegistry.register('AT_011', {
  // Gain +2 Attack when friendly character is healed - simplified
});

// AT_012 - Wyrmrest Agent
cardScriptsRegistry.register('AT_012', {
  // Has +2 Attack while you have a Dragon - aura
});

// AT_013 - Spawn of Shadows
cardScriptsRegistry.register('AT_013', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        const opponent = controller?.opponent;
        if (controller?.hero) {
          (controller.hero as any).health = ((controller.hero as any).health || 0) - 4;
        }
        if (opponent?.hero) {
          (opponent.hero as any).health = ((opponent.hero as any).health || 0) - 4;
        }
      }
    },
  },
});

// AT_014 - Confessor Paletress
cardScriptsRegistry.register('AT_014', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.field?.length < 7) {
        controller.field.push({ id: 'RANDOM_LEGENDARY' } as any);
      }
    },
  },
});

// AT_015 - Power Word: Glory
cardScriptsRegistry.register('AT_015', {
  play: (ctx: any) => {
    if (ctx.target) {
      // When the minion attacks, restore 4 Health to your hero - simplified
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_016 - Shadowfiend
cardScriptsRegistry.register('AT_016', {
  events: {
    DRAW: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.player === controller) {
        // Drawn cards cost (2) less - simplified
      }
    },
  },
});

// AT_017 - Tournament Medic
cardScriptsRegistry.register('AT_017', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.hero) {
        (controller.hero as any).health = Math.min(
          ((controller.hero as any).health || 0) + 2,
          (controller.hero as any).maxHealth || 30
        );
      }
    },
  },
});

// AT_018 - Refreshment Vendor
cardScriptsRegistry.register('AT_018', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + 4,
        (controller.hero as any).maxHealth || 30
      );
    }
    if (opponent?.hero) {
      (opponent.hero as any).health = Math.min(
        ((opponent.hero as any).health || 0) + 4,
        (opponent.hero as any).maxHealth || 30
      );
    }
  },
});

// AT_019 - Convert
cardScriptsRegistry.register('AT_019', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      if (controller?.hand?.length < 10) {
        controller.hand.push({ id: (ctx.target as any).id } as any);
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_020 - Herald Volazj
cardScriptsRegistry.register('AT_020', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    for (const minion of controller?.field || []) {
      if (minion !== ctx.source && controller?.hand?.length < 10) {
        controller.hand.push({ id: (minion as any).id, atk: 1, health: 1 } as any);
      }
    }
  },
});

// === Rogue ===

// AT_027 - Buccaneer
cardScriptsRegistry.register('AT_027', {
  // Your weapon has +1 Attack - aura effect
});

// AT_028 - Undercity Valiant
cardScriptsRegistry.register('AT_028', {
  play: (ctx: any) => {
    // Combo: Deal 1 damage - simplified
  },
});

// AT_029 - Defias Ringleader
cardScriptsRegistry.register('AT_029', {
  events: {
    PLAY: (ctx: any) => {
      // If opponent has more minions, +1/+1 - simplified
    },
  },
});

// AT_030 - Anub'arak
cardScriptsRegistry.register('AT_030', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;

    // Return to hand and summon a 4/4 Nerubian
    if (controller?.hand?.length < 10) {
      controller.hand.push(ctx.source);
    }
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'AT_030t' } as any);
    }
  },
});

// AT_031 - Shado-Pan Rider
cardScriptsRegistry.register('AT_031', {
  // Combo: +3 Attack - simplified
});

// AT_032 - Burgle
cardScriptsRegistry.register('AT_032', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Add 2 random cards from opponent's class
    for (let i = 0; i < 2 && controller?.hand?.length < 10; i++) {
      controller.hand.push({ id: 'OPPONENT_CLASS_CARD' } as any);
    }
  },
});

// AT_033 - Cutpurse
cardScriptsRegistry.register('AT_033', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.source === ctx.source) {
        const controller = ctx.source?.controller;
        if (controller) {
          controller.maxMana = Math.min((controller.maxMana || 0) + 1, 10);
        }
      }
    },
  },
});

// AT_034 - Shady Dealer
cardScriptsRegistry.register('AT_034', {
  play: (ctx: any) => {
    // +2/+2 if you played a pirate this turn - simplified
  },
});

// AT_035 - Pit Snake
cardScriptsRegistry.register('AT_035', {
  // Poisonous - handled by card definition
});

// AT_036 - Beneath the Grounds
cardScriptsRegistry.register('AT_036', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Shuffle 3 Nerubian Ambush into opponent's deck
    if (opponent?.deck) {
      for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * (opponent.deck.length + 1));
        opponent.deck.splice(idx, 0, { id: 'AT_036t' } as any);
      }
    }
  },
});

// AT_036t - Nerubian (from Beneath the Grounds)
cardScriptsRegistry.register('AT_036t', {
  // Drawn when from Beneath the Grounds - simplified
});

// AT_037 - Shado-Pan Rider
cardScriptsRegistry.register('AT_037', {
  // Combo: +3 Attack
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if ((controller as any).cardsPlayedThisTurn > 0) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 3;
    }
  },
});

// === Shaman ===

// AT_021 - Tuskarr Totemic
cardScriptsRegistry.register('AT_021', {
  play: (ctx: any) => {
    // Summon a random Totem - simplified
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      const totems = ['AT_022', 'AT_037', 'GVG_038', 'NEW1_009'];
      const totem = totems[Math.floor(Math.random() * totems.length)];
      controller.field.push({ id: totem } as any);
    }
  },
});

// AT_022 - Totem Golem
cardScriptsRegistry.register('AT_022', {
  // Overload: (1) - handled by card definition
});

// AT_023 - Healing Wave
cardScriptsRegistry.register('AT_023', {
  play: (ctx: any) => {
    // Joust: If you win, restore 14 Health,    // Otherwise restore 7 Health - simplified
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + 7,
        (controller.hero as any).maxHealth || 30
      );
    }
  },
});

// AT_024 - Thunder Bluff Valiant
cardScriptsRegistry.register('AT_024', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.field) {
        for (const minion of controller.field) {
          if ((minion as any).type === 'TOTEM' && minion !== ctx.source) {
            (minion as any).atk = ((minion as any).atk || 0) + 1;
            (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 1;
          }
        }
      }
    },
  },
});

// AT_025 - Draenei Totemcarver
cardScriptsRegistry.register('AT_025', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const totemCount = controller?.field?.filter((m: any) => m.type === 'TOTEM').length || 0;

    (ctx.source as any).atk = ((ctx.source as any).atk || 0) + totemCount;
    (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + totemCount;
  },
});

// AT_026 - The Mistcaller
cardScriptsRegistry.register('AT_026', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    // Give all minions in your hand and deck +1/+1 - simplified
    if (controller?.hand) {
      for (const card of controller.hand) {
        (card as any).atk = ((card as any).atk || 0) + 1;
        (card as any).maxHealth = ((card as any).maxHealth || 0) + 1;
      }
    }
  },
});

// AT_037 - Healing Totem
cardScriptsRegistry.register('AT_037', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.field) {
        for (const minion of controller.field) {
          if (minion !== ctx.source) {
            (minion as any).health = Math.min(
              ((minion as any).health || 0) + 1,
              (minion as any).maxHealth || 0
            );
          }
        }
      }
    },
  },
});

// AT_038 - Chillmaw
cardScriptsRegistry.register('AT_038', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON') ||
                     controller?.field?.some((m: any) => m.race === 'DRAGON');

    if (hasDragon) {
      const controller = ctx.source?.controller;
      const opponent = controller?.opponent;
      for (const minion of [...(controller?.field || []), ...(opponent?.field || [])]) {
        (minion as any).health = ((minion as any).health || 0) - 3;
      }
    }
  },
});

// AT_039 - Charged Hammer
cardScriptsRegistry.register('AT_039', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).spellPower = ((controller.hero as any).spellPower || 0) + 2;
    }
  },
  deathrattle: (ctx: any) => {
    // Replace hero power - simplified (summons a new weapon)
  },
});

// AT_040 - Tuskar's Flying Knife
cardScriptsRegistry.register('AT_040', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];
    if (targets.length > 0) {
      const idx = Math.floor(Math.random() * targets.length);
      (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 1;
    }
  },
});

// === Warlock ===

// AT_021 - Dreadsteed
cardScriptsRegistry.register('AT_021', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'AT_021' } as any); // Resummon itself
    }
  },
});

// AT_022 - Fearsome Doomguard
cardScriptsRegistry.register('AT_022', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    // Discard 2 random cards
    for (let i = 0; i < 2 && controller?.hand && controller.hand.length > 0; i++) {
      const idx = Math.floor(Math.random() * controller.hand.length);
      controller.hand.splice(idx, 1);
    }
  },
});

// AT_023 - Void Crusher
cardScriptsRegistry.register('AT_023', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        const opponent = controller?.opponent;

        // Destroy random friendly and enemy minion
        const friendlyMinions = controller?.field || [];
        const enemyMinions = opponent?.field || [];

        if (friendlyMinions.length > 0) {
          const idx = Math.floor(Math.random() * friendlyMinions.length);
          (friendlyMinions[idx] as any).destroyed = true;
        }
        if (enemyMinions.length > 0) {
          const idx = Math.floor(Math.random() * enemyMinions.length);
          (enemyMinions[idx] as any).destroyed = true;
        }
      }
    },
  },
});

// AT_024 - Tiny Knight of Evil
cardScriptsRegistry.register('AT_024', {
  events: {
    DISCARD: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
        (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;
      }
    },
  },
});

// AT_025 - Demonfuse
cardScriptsRegistry.register('AT_025', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).race === 'DEMON') {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 3;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 3;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_026 - Fearsome Doomguard
cardScriptsRegistry.register('AT_026', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    for (let i = 0; i < 2 && controller?.hand && controller.hand.length > 0; i++) {
      const idx = Math.floor(Math.random() * controller.hand.length);
      controller.hand.splice(idx, 1);
    }
  },
});

// AT_027 - Demonfuse
cardScriptsRegistry.register('AT_027', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).race === 'DEMON') {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 3;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 3;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_028 - Void Crusher
cardScriptsRegistry.register('AT_028', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        const opponent = controller?.opponent;

        // Destroy random friendly and enemy minion
        const friendlyMinions = controller?.field || [];
        const enemyMinions = opponent?.field || [];

        if (friendlyMinions.length > 0) {
          const idx = Math.floor(Math.random() * friendlyMinions.length);
          (friendlyMinions[idx] as any).destroyed = true;
        }
        if (enemyMinions.length > 0) {
          const idx = Math.floor(Math.random() * enemyMinions.length);
          (enemyMinions[idx] as any).destroyed = true;
        }
      }
    },
  },
});

// AT_029 - Wilfred Fizzlebang
cardScriptsRegistry.register('AT_029', {
  events: {
    DRAW: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.player === controller) {
        // Drawn minions cost (0) - simplified
      }
    },
  },
});

// AT_030 - Wrathguard
cardScriptsRegistry.register('AT_030', {
  events: {
    DAMAGE: (ctx: any) => {
      const damage = ctx.event?.amount || 0;
      const controller = ctx.source?.controller;
      if (controller?.hero && damage > 0) {
        (controller.hero as any).health = ((controller.hero as any).health || 0) - damage;
      }
    },
  },
});

// AT_031 - Floating Watcher
cardScriptsRegistry.register('AT_031', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source?.controller?.hero) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
        (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 2;
      }
    },
  },
});

// === Warrior ===

// AT_064 - Orgrimmar Aspirant
cardScriptsRegistry.register('AT_064', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.weapon) {
        (controller.weapon as any).atk = ((controller.weapon as any).atk || 0) + 1;
      }
    },
  },
});

// AT_065 - King's Defender
cardScriptsRegistry.register('AT_065', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasTaunt = controller?.field?.some((m: any) => m.taunt);

    if (hasTaunt) {
      (ctx.source as any).maxDurability = ((ctx.source as any).maxDurability || 0) + 1;
    }
  },
});

// AT_066 - Magnataur Alpha
cardScriptsRegistry.register('AT_066', {
  // Also damages the minions next to whoever he attacks - simplified
});

// AT_067 - Sparring Partner
cardScriptsRegistry.register('AT_067', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).taunt = true;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// AT_068 - Orgrimmar Aspirant
cardScriptsRegistry.register('AT_068', {
  events: {
    HERO_POWER: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.weapon) {
        (controller.weapon as any).atk = ((controller.weapon as any).atk || 0) + 1;
      }
    },
  },
});

// AT_069 - Alexstrasza's Champion
cardScriptsRegistry.register('AT_069', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasDragon = controller?.hand?.some((c: any) => c.race === 'DRAGON') ||
                     controller?.field?.some((m: any) => m.race === 'DRAGON');

    if (hasDragon) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
      (ctx.source as any).charge = true;
    }
  },
});

// AT_070 - Sea Reaver
cardScriptsRegistry.register('AT_070', {
  events: {
    DRAW: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.player === controller) {
        // Deal 1 damage to all minions - simplified
      }
    },
  },
});

// AT_071 - Bolster
cardScriptsRegistry.register('AT_071', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    for (const minion of controller?.field || []) {
      if ((minion as any).taunt) {
        (minion as any).atk = ((minion as any).atk || 0) + 2;
        (minion as any).maxHealth = ((minion as any).maxHealth || 0) + 2;
      }
    }
  },
});

// AT_072 - Bash
cardScriptsRegistry.register('AT_072', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 3;
    }
  },
  requirements: { 48: 0 },
});

// AT_100 - Varian Wrynn
cardScriptsRegistry.register('AT_100', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    // Draw 3 cards. Put minions directly into the battlefield
    for (let i = 0; i < 3 && controller?.deck && controller.deck.length > 0; i++) {
      const card = controller.deck.shift();

      if (card && (card as any).type === 'MINION' && controller?.field?.length < 7) {
        controller.field.push(card);
      } else if (controller?.hand?.length < 10) {
        controller.hand.push(card);
      }
    }
  },
});

// AT_106 - Bash
cardScriptsRegistry.register('AT_106', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 3;
    }
  },
  requirements: { 48: 0 },
});

// AT_107 - Bear Trap
cardScriptsRegistry.register('AT_107', {
  events: {
    ATTACK: (ctx: any) => {
      // When your hero is attacked, summon a Bear - simplified
    },
  },
});

// AT_108 - Acidmaw
cardScriptsRegistry.register('AT_108', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.source !== ctx.source && ctx.event?.target?.type === 'MINION') {
        (ctx.event.target as any).destroyed = true;
      }
    },
  },
});

// AT_109 - Dreadscale
cardScriptsRegistry.register('AT_109', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        const opponent = controller?.opponent;
        const allMinions = [
          ...(controller?.field || []),
          ...(opponent?.field || [])
        ].filter((m: any) => m !== ctx.source);

        for (const minion of allMinions) {
          (minion as any).health = ((minion as any).health || 0) - 1;
        }
      }
    },
  },
});

console.log('[TGT] Registered card scripts');
