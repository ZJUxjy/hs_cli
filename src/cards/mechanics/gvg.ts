// GVG (Goblins vs Gnomes) Card Scripts
import { cardScriptsRegistry } from '../index';

// === Druid ===

// GVG_030 - Anodized Robo Cub
cardScriptsRegistry.register('GVG_030', {
  play: (ctx: any) => {
    // Choose One: Charge or Taunt - simplified
  },
});

// GVG_031 - Recycle
cardScriptsRegistry.register('GVG_031', {
  play: (ctx: any) => {
    // Shuffle target into opponent's deck - simplified
  },
  requirements: { 1: 0, 48: 0 },
});

// GVG_032 - Grove Tender
cardScriptsRegistry.register('GVG_032', {
  play: (ctx: any) => {
    // Choose One: Gain mana or draw - simplified
  },
});

// GVG_033 - Tree of Life
cardScriptsRegistry.register('GVG_033', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    // Heal all characters to full
    if (controller?.hero) {
      (controller.hero as any).health = (controller.hero as any).maxHealth;
    }
    if (opponent?.hero) {
      (opponent.hero as any).health = (opponent.hero as any).maxHealth;
    }
  },
});

// GVG_034 - Mech-Bear-Cat
cardScriptsRegistry.register('GVG_034', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        const controller = ctx.source?.controller;
        if (controller?.hand?.length < 10) {
          controller.hand.push({ id: 'SPAREPART' } as any);
        }
      }
    },
  },
});

// GVG_035 - Malorne
cardScriptsRegistry.register('GVG_035', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.deck) {
      const idx = Math.floor(Math.random() * (controller.deck.length + 1));
      controller.deck.splice(idx, 0, ctx.source);
    }
  },
});

// GVG_041 - Dark Wispers
cardScriptsRegistry.register('GVG_041', {
  play: (ctx: any) => {
    // Choose One: +5/+5 Taunt or 5 Treants - simplified
  },
});

// GVG_080 - Druid of the Fang
cardScriptsRegistry.register('GVG_080', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasBeast = controller?.field?.some((m: any) => m.race === 'BEAST');
    if (hasBeast) {
      (ctx.source as any).transformed = 'GVG_080t';
    }
  },
});

// === Hunter ===

// GVG_073 - Call Pet
cardScriptsRegistry.register('GVG_073', {
  play: (ctx: any) => {
    // Draw a beast, if it's a secret summon it - simplified
  },
});

// GVG_074 - Kill Command
cardScriptsRegistry.register('GVG_074', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      const hasBeast = controller?.field?.some((m: any) => m.race === 'BEAST');
      const damage = hasBeast ? 5 : 3;
      (ctx.target as any).health = ((ctx.target as any).health || 0) - damage;
    }
  },
  requirements: { 48: 0 },
});

// GVG_085 - King of Beasts
cardScriptsRegistry.register('GVG_085', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const beasts = controller?.field?.filter((m: any) => m.race === 'BEAST') || [];
    (ctx.source as any).atk = ((ctx.source as any).atk || 0) + beasts.length;
  },
});

// GVG_086 - Metaltooth Leaper
cardScriptsRegistry.register('GVG_086', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const mechs = controller?.field?.filter((m: any) => m.race === 'MECH' && m !== ctx.source) || [];
    for (const mech of mechs) {
      (mech as any).atk = ((mech as any).atk || 0) + 2;
    }
  },
});

// GVG_087 - Cobra Shot
cardScriptsRegistry.register('GVG_087', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 3;
      const owner = (ctx.target as any).controller;
      if (owner?.hero) {
        (owner.hero as any).health = ((owner.hero as any).health || 0) - 3;
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// GVG_088 - Gahz'rilla
cardScriptsRegistry.register('GVG_088', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        const currentAtk = (ctx.source as any).atk || 0;
        (ctx.source as any).atk = currentAtk + currentAtk;
      }
    },
  },
});

// GVG_094 - Steamwheedle Sniper
cardScriptsRegistry.register('GVG_094', {
  events: {
    HERO_POWER: (ctx: any) => {
      // Inspire: Deal 2 damage to random enemy - simplified
    },
  },
});

// === Mage ===

// GVG_001 - Flamecannon
cardScriptsRegistry.register('GVG_001', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const enemyMinions = opponent?.field || [];

    if (enemyMinions.length > 0) {
      const target = enemyMinions[Math.floor(Math.random() * enemyMinions.length)];
      (target as any).health = ((target as any).health || 0) - 4;
    }
  },
  requirements: { 9: 1 },
});

// GVG_002 - Snowchugger
cardScriptsRegistry.register('GVG_002', {
  events: {
    DAMAGE: (ctx: any) => {
      const damageSource = ctx.event?.source;
      if (damageSource && ctx.event?.target === ctx.source) {
        (damageSource as any).frozen = true;
      }
    },
  },
});

// GVG_003 - Unstable Portal
cardScriptsRegistry.register('GVG_003', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'RANDOM_MINION', costReduction: 3 } as any);
    }
  },
});

// GVG_004 - Goblin Blastmage
cardScriptsRegistry.register('GVG_004', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasMech = controller?.field?.some((m: any) => m.race === 'MECH');

    if (hasMech) {
      const opponent = controller?.opponent;
      const targets: any[] = [];
      if (opponent?.hero) targets.push(opponent.hero);
      if (opponent?.field) targets.push(...opponent.field);

      for (let i = 0; i < 4 && targets.length > 0; i++) {
        const idx = Math.floor(Math.random() * targets.length);
        (targets[idx] as any).health = ((targets[idx] as any).health || 0) - 1;
      }
    }
  },
});

// GVG_005 - Echo of Medivh
cardScriptsRegistry.register('GVG_005', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const field = controller?.field || [];

    for (const minion of field) {
      if (controller?.hand?.length < 10) {
        controller.hand.push({ ...(minion as any) });
      }
    }
  },
});

// GVG_007 - Flame Leviathan
cardScriptsRegistry.register('GVG_007', {
  events: {
    DRAW: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (ctx.event?.player === controller) {
        const opponent = controller?.opponent;
        const allTargets: any[] = [];

        if (controller?.hero) allTargets.push(controller.hero);
        if (controller?.field) allTargets.push(...controller.field);
        if (opponent?.hero) allTargets.push(opponent.hero);
        if (opponent?.field) allTargets.push(...opponent.field);

        for (const target of allTargets) {
          (target as any).health = ((target as any).health || 0) - 2;
        }
      }
    },
  },
});

// === Paladin ===

// GVG_056 - Seal of Light
cardScriptsRegistry.register('GVG_056', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + 4,
        (controller.hero as any).maxHealth || 30
      );
      (controller.hero as any).atk = ((controller.hero as any).atk || 0) + 2;
    }
  },
});

// GVG_057 - Muster for Battle
cardScriptsRegistry.register('GVG_057', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    for (let i = 0; i < 3 && controller?.field?.length < 7; i++) {
      controller.field.push({ id: 'CS2_101t' } as any);
    }

    if (controller && !controller.weapon) {
      controller.weapon = { id: 'GVG_057t' } as any;
    }
  },
});

// GVG_058 - Quartermaster
cardScriptsRegistry.register('GVG_058', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const recruits = controller?.field?.filter((m: any) => m.id === 'CS2_101t') || [];

    for (const recruit of recruits) {
      (recruit as any).atk = ((recruit as any).atk || 0) + 2;
      (recruit as any).maxHealth = ((recruit as any).maxHealth || 0) + 2;
    }
  },
});

// GVG_059 - Scarlet Purifier
cardScriptsRegistry.register('GVG_059', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      const opponent = controller?.opponent;
      const allMinions = [
        ...(controller?.field || []),
        ...(opponent?.field || [])
      ];

      for (const minion of allMinions) {
        if ((minion as any).deathrattle) {
          (minion as any).health = ((minion as any).health || 0) - 2;
        }
      }
    },
  },
});

// GVG_060 - Cobalt Guardian
cardScriptsRegistry.register('GVG_060', {
  events: {
    MINION_SUMMON: (ctx: any) => {
      // Gain Divine Shield when Mech summoned - simplified
    },
  },
});

// GVG_061 - Light of the Naaru
cardScriptsRegistry.register('GVG_061', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = Math.min(
        ((ctx.target as any).health || 0) + 3,
        (ctx.target as any).maxHealth || 30
      );

      if ((ctx.target as any).health < (ctx.target as any).maxHealth) {
        const controller = ctx.source?.controller;
        if (controller?.field?.length < 7) {
          controller.field.push({ id: 'EX1_001' } as any);
        }
      }
    }
  },
  requirements: { 48: 0 },
});

// GVG_062 - Bolvar Fordragon
cardScriptsRegistry.register('GVG_062', {
  events: {
    DEATH: (ctx: any) => {
      // Gain +1 Attack when friendly minion dies while in hand - simplified
    },
  },
});

// GVG_063 - Toshley
cardScriptsRegistry.register('GVG_063', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'SPAREPART' } as any);
    }
  },
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'SPAREPART' } as any);
    }
  },
});

// GVG_101 - Shielded Minibot
cardScriptsRegistry.register('GVG_101', {
  // Divine Shield - handled by card definition
});

// === Priest ===

// GVG_010 - Lightbomb
cardScriptsRegistry.register('GVG_010', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || [])
    ];

    for (const minion of allMinions) {
      const atk = (minion as any).atk || 0;
      (minion as any).health = ((minion as any).health || 0) - atk;
    }
  },
});

// GVG_011 - Velen's Chosen
cardScriptsRegistry.register('GVG_011', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 2;
      (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 4;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// GVG_020 - Thoughtsteal
cardScriptsRegistry.register('GVG_020', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    for (let i = 0; i < 2 && opponent?.deck && controller?.hand?.length < 10; i++) {
      if (opponent.deck.length > 0) {
        const idx = Math.floor(Math.random() * opponent.deck.length);
        controller.hand.push(opponent.deck[idx]);
      }
    }
  },
});

// GVG_070 - Shadowbomber
cardScriptsRegistry.register('GVG_070', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (controller?.hero) {
      (controller.hero as any).health = ((controller.hero as any).health || 0) - 3;
    }
    if (opponent?.hero) {
      (opponent.hero as any).health = ((opponent.hero as any).health || 0) - 3;
    }
  },
});

// GVG_074 - Vol'jin
cardScriptsRegistry.register('GVG_074', {
  play: (ctx: any) => {
    if (ctx.target && ctx.source) {
      const targetHealth = (ctx.target as any).health;
      const sourceHealth = (ctx.source as any).health;

      (ctx.target as any).health = sourceHealth;
      (ctx.source as any).health = targetHealth;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// === Rogue ===

// GVG_027 - Iron Sensei
cardScriptsRegistry.register('GVG_027', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      const mechs = controller?.field?.filter((m: any) => m.race === 'MECH' && m !== ctx.source) || [];

      if (mechs.length > 0) {
        const target = mechs[Math.floor(Math.random() * mechs.length)];
        (target as any).atk = ((target as any).atk || 0) + 2;
        (target as any).maxHealth = ((target as any).maxHealth || 0) + 2;
      }
    },
  },
});

// GVG_028 - Goblin Auto-Barber
cardScriptsRegistry.register('GVG_028', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.weapon) {
      (controller.weapon as any).atk = ((controller.weapon as any).atk || 0) + 1;
    }
  },
});

// GVG_042 - Trade Prince Gallywix
cardScriptsRegistry.register('GVG_042', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      const caster = ctx.event?.source?.controller;
      if (caster === controller?.opponent && controller?.hand?.length < 10) {
        controller.hand.push({ ...(ctx.event?.source as any) });
      }
    },
  },
});

// GVG_043 - Sabotage
cardScriptsRegistry.register('GVG_043', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    if (opponent?.weapon) {
      opponent.weapon = null;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// GVG_044 - Tinker's Sharpsword Oil
cardScriptsRegistry.register('GVG_044', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.weapon) {
      (controller.weapon as any).atk = ((controller.weapon as any).atk || 0) + 3;
    }
    const mechs = controller?.field?.filter((m: any) => m.race === 'MECH') || [];
    for (const mech of mechs) {
      (mech as any).atk = ((mech as any).atk || 0) + 1;
    }
  },
});

// GVG_045 - Tomb Pillager
cardScriptsRegistry.register('GVG_045', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'GAME_005' } as any); // The Coin
    }
  },
});

// GVG_046 - Ogre Ninja
cardScriptsRegistry.register('GVG_046', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      (target as any).frozen = true;
    }
  },
});

// GVG_047 - Sneed's Old Shredder
cardScriptsRegistry.register('GVG_047', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_LEGENDARY_MINION' } as any);
    }
  },
});

// GVG_055 - Sneaky Devil
cardScriptsRegistry.register('GVG_055', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    if (opponent?.field?.length > 0) {
      const target = opponent.field[Math.floor(Math.random() * opponent.field.length)];
      (target as any).atk = Math.max(0, ((target as any).atk || 0) - 2);
    }
  },
});

// GVG_056 - Floating Watcher
cardScriptsRegistry.register('GVG_056', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source?.controller?.hero) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
        (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 2;
      }
    },
  },
});

// === Shaman ===

// GVG_006 - Crackle
cardScriptsRegistry.register('GVG_006', {
  play: (ctx: any) => {
    if (ctx.target) {
      const damage = Math.floor(Math.random() * 4) + 3; // 3-6
      (ctx.target as any).health = ((ctx.target as any).health || 0) - damage;
    }
  },
  requirements: { 48: 0 },
});

// GVG_007 - Ancestral Knowledge
cardScriptsRegistry.register('GVG_007', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    for (let i = 0; i < 2 && controller?.hand?.length < 10; i++) {
      if (controller?.deck && controller.deck.length > 0) {
        controller.hand.push(controller.deck.shift());
      }
    }
  },
});

// GVG_019 - Siltfin Spiritwalker
cardScriptsRegistry.register('GVG_019', {
  events: {
    DEATH: (ctx: any) => {
      const controller = ctx.source?.controller;
      const target = ctx.event?.target;
      if (target && (target as any).controller === controller && (target as any).race === 'MURLOC') {
        for (let i = 0; i < 1 && controller?.hand?.length < 10; i++) {
          if (controller?.deck && controller.deck.length > 0) {
            controller.hand.push(controller.deck.shift());
          }
        }
      }
    },
  },
});

// GVG_020 - Neptulon
cardScriptsRegistry.register('GVG_020', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    for (let i = 0; i < 4 && controller?.hand?.length < 10; i++) {
      controller.hand.push({ id: 'RANDOM_MURLOC' } as any);
    }
  },
});

// GVG_022 - Vitality Totem
cardScriptsRegistry.register('GVG_022', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer && controller?.hero) {
        (controller.hero as any).health = Math.min(
          ((controller.hero as any).health || 0) + 4,
          (controller.hero as any).maxHealth || 30
        );
      }
    },
  },
});

// GVG_024 - Junkbot
cardScriptsRegistry.register('GVG_024', {
  events: {
    DEATH: (ctx: any) => {
      const controller = ctx.source?.controller;
      const target = ctx.event?.target;
      if (target && (target as any).controller === controller && (target as any).race === 'MECH') {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
        (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 2;
      }
    },
  },
});

// GVG_036 - Fel Reaver
cardScriptsRegistry.register('GVG_036', {
  events: {
    PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      const opponent = controller?.opponent;
      for (let i = 0; i < 3; i++) {
        if (opponent?.deck && opponent.deck.length > 0) {
          opponent.deck.shift();
        }
      }
    },
  },
});

// GVG_037 - Healing Totem
cardScriptsRegistry.register('GVG_037', {
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

// GVG_038 - Flametongue Totem
cardScriptsRegistry.register('GVG_038', {
  // Adjacent minions +2 Attack - aura effect
});

// GVG_039 - Siltfin Spiritwalker
cardScriptsRegistry.register('GVG_039', {
  events: {
    DEATH: (ctx: any) => {
      const controller = ctx.source?.controller;
      const target = ctx.event?.target;
      if (target && (target as any).controller === controller && (target as any).race === 'MURLOC') {
        if (controller?.deck && controller.deck.length > 0 && controller?.hand?.length < 10) {
          controller.hand.push(controller.deck.shift());
        }
      }
    },
  },
});

// GVG_053 - Whirling Zap-o-matic
cardScriptsRegistry.register('GVG_053', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const targets = opponent ? [opponent.hero, ...(opponent.field || [])] : [];
    if (targets.length > 0) {
      const idx = Math.floor(Math.random() * targets.length);
      (targets[idx] as any).frozen = true;
    }
  },
});

// === Warlock ===

// GVG_014 - Darkbomb
cardScriptsRegistry.register('GVG_014', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
    }
  },
  requirements: { 48: 0 },
});

// GVG_015 - Felguard
cardScriptsRegistry.register('GVG_015', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field?.filter((m: any) => m !== ctx.source) || []),
      ...(opponent?.field || [])
    ];

    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 2;
    }
  },
});

// GVG_017 - Demonheart
cardScriptsRegistry.register('GVG_017', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      const isFriendlyDemon = (ctx.target as any).controller === controller &&
                              (ctx.target as any).race === 'DEMON';

      if (isFriendlyDemon) {
        (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 5;
        (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 5;
      } else {
        (ctx.target as any).health = ((ctx.target as any).health || 0) - 5;
      }
    }
  },
  requirements: { 48: 0 },
});

// GVG_018 - Anima Golem
cardScriptsRegistry.register('GVG_018', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = ctx.source?.controller;
      const hasOtherDemon = controller?.field?.some(
        (m: any) => m !== ctx.source && m.race === 'DEMON'
      );

      if (!hasOtherDemon) {
        (ctx.source as any).destroyed = true;
      }
    },
  },
});

// GVG_019 - Mistress of Pain
cardScriptsRegistry.register('GVG_019', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.source === ctx.source) {
        const damageAmount = ctx.event?.amount || 0;
        const controller = ctx.source?.controller;

        if (controller?.hero && damageAmount > 0) {
          (controller.hero as any).health = Math.min(
            ((controller.hero as any).health || 0) + damageAmount,
            (controller.hero as any).maxHealth || 30
          );
        }
      }
    },
  },
});

// GVG_020 - Voidcaller
cardScriptsRegistry.register('GVG_020', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const demons = controller?.hand?.filter((c: any) => c.race === 'DEMON') || [];

    if (demons.length > 0 && controller?.field?.length < 7) {
      const demon = demons[Math.floor(Math.random() * demons.length)];
      controller.field.push(demon);
      controller.hand = controller.hand.filter((c: any) => c !== demon);
    }
  },
});

// GVG_021 - Mal'Ganis
cardScriptsRegistry.register('GVG_021', {
  // Aura: Your other Demons have +2/+2. Your hero is Immune.
});

// GVG_022 - Demonfire
cardScriptsRegistry.register('GVG_022', {
  play: (ctx: any) => {
    if (ctx.target) {
      const controller = ctx.source?.controller;
      const isFriendlyDemon = (ctx.target as any).controller === controller &&
                              (ctx.target as any).race === 'DEMON';

      if (isFriendlyDemon) {
        (ctx.target as any).atk = ((ctx.target as any).atk || 0) + 2;
        (ctx.target as any).maxHealth = ((ctx.target as any).maxHealth || 0) + 2;
      } else {
        (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// GVG_023 - Sacrificial Pact
cardScriptsRegistry.register('GVG_023', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).race === 'DEMON') {
      (ctx.target as any).destroyed = true;

      const controller = ctx.source?.controller;
      if (controller?.hero) {
        (controller.hero as any).health = Math.min(
          ((controller.hero as any).health || 0) + 5,
          (controller.hero as any).maxHealth || 30
        );
      }
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// === Warrior ===

// GVG_040 - Bouncing Blade
cardScriptsRegistry.register('GVG_040', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || [])
    ];

    let iterations = 0;
    while (allMinions.length > 0 && iterations < 100) {
      const idx = Math.floor(Math.random() * allMinions.length);
      const target = allMinions[idx];

      (target as any).health = ((target as any).health || 0) - 1;

      if ((target as any).health <= 0) {
        break;
      }

      iterations++;
    }
  },
});

// GVG_049 - Crush
cardScriptsRegistry.register('GVG_049', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// GVG_050 - Warbot
cardScriptsRegistry.register('GVG_050', {
  // Enrage: +2 Attack - handled by card definition
});

// GVG_051 - Shieldmaiden
cardScriptsRegistry.register('GVG_051', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 5;
    }
  },
});

// GVG_052 - Scream
cardScriptsRegistry.register('GVG_052', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    for (const minion of opponent?.field || []) {
      (minion as any).health = ((minion as any).health || 0) - 2;
    }
  },
  requirements: { 9: 1 },
});

// GVG_053 - Felfire Potion
cardScriptsRegistry.register('GVG_053', {
  play: (ctx: any) => {
    if (ctx.target) {
      (ctx.target as any).health = ((ctx.target as any).health || 0) - 2;
    }
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = ((controller.hero as any).health || 0) - 1;
    }
  },
  requirements: { 48: 0 },
});

// GVG_108 - Iron Juggernaut
cardScriptsRegistry.register('GVG_108', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (opponent?.deck) {
      const idx = Math.floor(Math.random() * (opponent.deck.length + 1));
      opponent.deck.splice(idx, 0, { id: 'GVG_056t' } as any); // Mine
    }
  },
});

// GVG_056t - Buried Mine
cardScriptsRegistry.register('GVG_056t', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = ((controller.hero as any).health || 0) - 10;
    }
  },
});

// GVG_109 - Siege Engine
cardScriptsRegistry.register('GVG_109', {
  events: {
    DAMAGE: (ctx: any) => {
      const controller = ctx.source?.controller;
      const target = ctx.event?.target;
      if (target === controller?.hero) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
      }
    },
  },
});

// GVG_111 - Axe Flinger
cardScriptsRegistry.register('GVG_111', {
  events: {
    DAMAGE: (ctx: any) => {
      if (ctx.event?.target === ctx.source) {
        const opponent = ctx.source?.controller?.opponent;
        if (opponent?.hero) {
          (opponent.hero as any).health = ((opponent.hero as any).health || 0) - 2;
        }
      }
    },
  },
});

// GVG_112 - Clockwork Giant
cardScriptsRegistry.register('GVG_112', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const cardCount = opponent?.hand?.length || 0;
    (ctx.source as any).cost = Math.max(0, 12 - cardCount);
  },
});

// === Neutral Common ===

// GVG_006 - Mechwarper
cardScriptsRegistry.register('GVG_006', {
  // Your Mechs cost (1) less - aura effect
});

// GVG_013 - Cogmaster
cardScriptsRegistry.register('GVG_013', {
  // Has +2 Attack while you have a Mech - aura effect
});

// GVG_067 - Stonesplinter Trogg
cardScriptsRegistry.register('GVG_067', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      const caster = ctx.event?.source?.controller;

      if (caster === controller?.opponent) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
      }
    },
  },
});

// GVG_068 - Burly Rockjaw Trogg
cardScriptsRegistry.register('GVG_068', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      const caster = ctx.event?.source?.controller;

      if (caster === controller?.opponent) {
        (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 2;
      }
    },
  },
});

// GVG_069 - Antique Healbot
cardScriptsRegistry.register('GVG_069', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hero) {
      (controller.hero as any).health = Math.min(
        ((controller.hero as any).health || 0) + 8,
        (controller.hero as any).maxHealth || 30
      );
    }
  },
});

// GVG_075 - Ship's Cannon
cardScriptsRegistry.register('GVG_075', {
  events: {
    MINION_SUMMON: (ctx: any) => {
      // Deal 2 damage to random enemy when pirate summoned - simplified
    },
  },
});

// GVG_076 - Explosive Sheep
cardScriptsRegistry.register('GVG_076', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const allMinions = [
      ...(controller?.field || []),
      ...(opponent?.field || [])
    ];

    for (const minion of allMinions) {
      (minion as any).health = ((minion as any).health || 0) - 2;
    }
  },
});

// GVG_078 - Mechanical Yeti
cardScriptsRegistry.register('GVG_078', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'SPAREPART' } as any);
    }
    if (opponent?.hand?.length < 10) {
      opponent.hand.push({ id: 'SPAREPART' } as any);
    }
  },
});

// GVG_082 - Clockwork Gnome
cardScriptsRegistry.register('GVG_082', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'SPAREPART' } as any);
    }
  },
});

// GVG_090 - Madder Bomber
cardScriptsRegistry.register('GVG_090', {
  play: (ctx: any) => {
    // Deal 1 damage 6 times randomly - simplified
  },
});

// GVG_096 - Piloted Shredder
cardScriptsRegistry.register('GVG_096', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_2_MINION' } as any);
    }
  },
});

// GVG_102 - Tinkertown Technician
cardScriptsRegistry.register('GVG_102', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const hasMech = controller?.field?.some((m: any) => m.race === 'MECH');

    if (hasMech) {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
      (ctx.source as any).maxHealth = ((ctx.source as any).maxHealth || 0) + 1;

      if (controller?.hand?.length < 10) {
        controller.hand.push({ id: 'SPAREPART' } as any);
      }
    }
  },
});

// GVG_103 - Micro Machine
cardScriptsRegistry.register('GVG_103', {
  events: {
    TURN_END: (ctx: any) => {
      (ctx.source as any).atk = ((ctx.source as any).atk || 0) + 1;
    },
  },
});

// === Neutral Epic ===

// GVG_039 - Stoneskin Gargoyle
cardScriptsRegistry.register('GVG_039', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = ctx.source?.controller;
      if (controller?.isCurrentPlayer) {
        (ctx.source as any).health = (ctx.source as any).maxHealth;
      }
    },
  },
});

// GVG_048 - Bomb Lobber
cardScriptsRegistry.register('GVG_048', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const enemyMinions = opponent?.field || [];

    if (enemyMinions.length > 0) {
      const target = enemyMinions[Math.floor(Math.random() * enemyMinions.length)];
      (target as any).health = ((target as any).health || 0) - 4;
    }
  },
});

// GVG_110 - Piloted Sky Golem
cardScriptsRegistry.register('GVG_110', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_COST_4_MINION' } as any);
    }
  },
});

// === Neutral Legendary ===

// GVG_110 - Dr. Boom
cardScriptsRegistry.register('GVG_110', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;

    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'GVG_110t' } as any);
    }
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'GVG_110t' } as any);
    }
  },
});

// GVG_110t - Boom Bot
cardScriptsRegistry.register('GVG_110t', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;
    const targets: any[] = [];

    if (opponent?.hero) targets.push(opponent.hero);
    if (opponent?.field) targets.push(...opponent.field);

    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const damage = Math.floor(Math.random() * 4) + 1; // 1-4
      (target as any).health = ((target as any).health || 0) - damage;
    }
  },
});

// GVG_111 - Mimiron's Head
cardScriptsRegistry.register('GVG_111', {
  events: {
    TURN_START: (ctx: any) => {
      // Form V-07-TR-0N if 3+ mechs - simplified
    },
  },
});

// GVG_114 - Sneed's Old Shredder
cardScriptsRegistry.register('GVG_114', {
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'RANDOM_LEGENDARY_MINION' } as any);
    }
  },
});

// GVG_115 - Toshley
cardScriptsRegistry.register('GVG_115', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'SPAREPART' } as any);
    }
  },
  deathrattle: (ctx: any) => {
    const controller = ctx.source?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'SPAREPART' } as any);
    }
  },
});

// GVG_116 - Mekgineer Thermaplugg
cardScriptsRegistry.register('GVG_116', {
  events: {
    DEATH: (ctx: any) => {
      // Summon Leper Gnome when enemy dies - simplified
    },
  },
});

// GVG_117 - Gazlowe
cardScriptsRegistry.register('GVG_117', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      // Add random mech when 1-cost spell played - simplified
    },
  },
});

// GVG_118 - Troggzor the Earthinator
cardScriptsRegistry.register('GVG_118', {
  events: {
    SPELL_PLAY: (ctx: any) => {
      const controller = ctx.source?.controller;
      const caster = ctx.event?.source?.controller;

      if (caster === controller?.opponent && controller?.field?.length < 7) {
        controller.field.push({ id: 'GVG_068' } as any); // Burly Rockjaw Trogg
      }
    },
  },
});

// GVG_119 - Blingtron 3000
cardScriptsRegistry.register('GVG_119', {
  play: (ctx: any) => {
    const controller = ctx.source?.controller;
    const opponent = controller?.opponent;

    controller.weapon = { id: 'RANDOM_WEAPON' } as any;
    if (opponent) {
      opponent.weapon = { id: 'RANDOM_WEAPON' } as any;
    }
  },
});

// GVG_120 - Hemet Nesingwary
cardScriptsRegistry.register('GVG_120', {
  play: (ctx: any) => {
    if (ctx.target && (ctx.target as any).race === 'BEAST') {
      (ctx.target as any).destroyed = true;
    }
  },
  requirements: { 49: 0, 367: 20 }, // Target must be beast
});

console.log('[GVG] Registered card scripts');
