// naxxramas - collectible.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy } from '../../../actions';
import type { Entity } from '../../../core/entity';

// FP1_001 - Zombie Chow
cardScriptsRegistry.register('FP1_001', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const opponent = (source as any).controller?.opponent;
    if (opponent?.hero) {
      const heal = new Heal(source, opponent.hero, 5);
      heal.trigger(source);
    }
  },
});

// FP1_002 - Haunted Creeper
cardScriptsRegistry.register('FP1_002', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const summon1 = new Summon(source, 'FP1_002t');
    summon1.trigger(source);
    const summon2 = new Summon(source, 'FP1_002t');
    summon2.trigger(source);
  },
});

// FP1_003 - Echoing Ooze
cardScriptsRegistry.register('FP1_003', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const summon = new Summon(source, 'FP1_003');
        summon.trigger(source);
      }
    },
  },
});

// FP1_004 - Mad Scientist
cardScriptsRegistry.register('FP1_004', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Add a random secret to hand - simplified
    if (controller?.hand?.length < 10) {
      const give = new Give('RANDOM_SECRET');
      give.trigger(source, controller);
    }
  },
});

// FP1_005 - Shade of Naxxramas
cardScriptsRegistry.register('FP1_005', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const buff = new Buff(source, source, { ATK: 1, HP: 1 });
        buff.trigger(source);
      }
    },
  },
});

// FP1_007 - Nerubian Egg
cardScriptsRegistry.register('FP1_007', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const summon = new Summon(source, 'FP1_007t');
    summon.trigger(source);
  },
});

// FP1_009 - Deathlord
cardScriptsRegistry.register('FP1_009', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Summon random minion from opponent's deck - simplified
    if (opponent?.deck && opponent.deck.length > 0 && controller?.field?.length < 7) {
      const minions = opponent.deck.filter((c: any) => c.type === 'MINION');
      if (minions.length > 0) {
        const idx = Math.floor(Math.random() * minions.length);
        const summon = new Summon(source, minions[idx].id);
        summon.trigger(source);
        opponent.deck.splice(idx, 1);
      }
    }
  },
});

// FP1_011 - Webspinner
cardScriptsRegistry.register('FP1_011', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Add random beast to hand - simplified
    if (controller?.hand?.length < 10) {
      const give = new Give('RANDOM_BEAST');
      give.trigger(source, controller);
    }
  },
});

// FP1_012 - Sludge Belcher
cardScriptsRegistry.register('FP1_012', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const summon = new Summon(source, 'FP1_012t');
    summon.trigger(source);
  },
});

// FP1_013 - Kel'Thuzad
cardScriptsRegistry.register('FP1_013', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer && (controller as any).kelthuzadMinions) {
        // Resummon friendly minions that died - simplified
        const minions = (controller as any).kelthuzadMinions;
        for (const minion of minions) {
          if (controller?.field?.length < 7) {
            const summon = new Summon(source, minion.id);
            summon.trigger(source);
          }
        }
        (controller as any).kelthuzadMinions = [];
      }
    },
  },
});

// FP1_014 - Stalagg
cardScriptsRegistry.register('FP1_014', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = source.controller as any;
    if (controller?.feugenDied && controller?.field?.length < 7) {
      const summon = new Summon(source, 'FP1_014t');
      summon.trigger(source);
    }
    controller.stalaggDied = true;
  },
});

// FP1_015 - Feugen
cardScriptsRegistry.register('FP1_015', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = source.controller as any;
    if (controller?.stalaggDied && controller?.field?.length < 7) {
      const summon = new Summon(source, 'FP1_014t');
      summon.trigger(source);
    }
    controller.feugenDied = true;
  },
});

// FP1_016 - Wailing Soul
cardScriptsRegistry.register('FP1_016', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Silence friendly minions
    for (const minion of controller?.field || []) {
      // Silence is handled by the game
    }
  },
});

// FP1_017
cardScriptsRegistry.register('FP1_017', {
});

// FP1_022 - Voidcaller
cardScriptsRegistry.register('FP1_022', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const demons = controller?.hand?.filter((c: any) => c.race === 'DEMON') || [];
    if (demons.length > 0 && controller?.field?.length < 7) {
      const demon = demons[Math.floor(Math.random() * demons.length)];
      const summon = new Summon(source, demon.id);
      summon.trigger(source);
      controller.hand = controller.hand.filter((c: any) => c !== demon);
    }
  },
});

// FP1_023 - Dark Cultist
cardScriptsRegistry.register('FP1_023', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const friendlyMinions = controller?.field?.filter((m: any) => m !== source) || [];
    if (friendlyMinions.length > 0) {
      const target = friendlyMinions[Math.floor(Math.random() * friendlyMinions.length)];
      const buff = new Buff(source, target, { HP: 3 });
      buff.trigger(source);
    }
  },
});

// FP1_024 - Unstable Ghoul
cardScriptsRegistry.register('FP1_024', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Deal 1 damage to all minions
    for (const minion of [...(controller?.field || []), ...(opponent?.field || [])]) {
      const damage = new Damage(source, minion, 1);
      damage.trigger(source);
    }
  },
});

// FP1_026 - Anub'ar Ambusher
cardScriptsRegistry.register('FP1_026', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const friendlyMinions = controller?.field?.filter((m: any) => m !== source) || [];
    if (friendlyMinions.length > 0 && controller?.hand?.length < 10) {
      const target = friendlyMinions[Math.floor(Math.random() * friendlyMinions.length)];
      // Return to hand - simplified
      controller.hand.push({ ...target });
      controller.field = controller.field.filter((m: any) => m !== target);
    }
  },
});

// FP1_027 - Stoneskin Gargoyle
cardScriptsRegistry.register('FP1_027', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const heal = new Heal(source, source, source.health);
        heal.trigger(source);
      }
    },
  },
});

// FP1_028 - Undertaker
cardScriptsRegistry.register('FP1_028', {
  events: {
    MINION_SUMMON: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (ctx.event?.source?.controller === controller && ctx.event?.card !== source) {
        if ((ctx.event.card as any).deathrattle) {
          const buff = new Buff(source, source, { ATK: 1 });
          buff.trigger(source);
        }
      }
    },
  },
});

// FP1_029 - Dancing Swords
cardScriptsRegistry.register('FP1_029', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Opponent draws a card
    if (opponent?.deck && opponent.deck.length > 0 && opponent?.hand?.length < 10) {
      const draw = new Draw(opponent);
      draw.trigger(source);
    }
  },
});

// FP1_030 - Loatheb
cardScriptsRegistry.register('FP1_030', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const opponent = (source as any).controller?.opponent;
    if (opponent) {
      // Spell cost increase is handled by game
    }
  },
});

// FP1_030e - Loatheb's buff
cardScriptsRegistry.register('FP1_030e', {
});

// FP1_031 - Baron Rivendare
// Your minions trigger their deathrattles twice
cardScriptsRegistry.register('FP1_031', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Mark that deathrattles trigger twice
    (controller as any).deathrattleMultiplier = 2;
  },
});

// FP1_019 - Poison Seeds
cardScriptsRegistry.register('FP1_019', {
  play: (ctx: ActionContext) => {
    // Destroy all minions, summon Treants - handled by game
  },
});

// FP1_025 - Reincarnate
cardScriptsRegistry.register('FP1_025', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      // Destroy and resummon - handled by game
    }
  },
});

// FP1_018 - Duplicate
cardScriptsRegistry.register('FP1_018', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const target = ctx.event?.target;
      // When friendly minion dies, add 2 copies to hand
      if (target && controller?.hand?.length < 9) {
        const give1 = new Give(target.id);
        give1.trigger(source, controller);
        const give2 = new Give(target.id);
        give2.trigger(source, controller);
      }
    },
  },
});

// FP1_020 - Avenge
cardScriptsRegistry.register('FP1_020', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const target = ctx.event?.target;
      // When friendly minion dies, buff another
      if (target && controller?.field?.length > 1) {
        const otherMinions = controller.field.filter((m: any) => m !== source);
        if (otherMinions.length > 0) {
          const buffTarget = otherMinions[Math.floor(Math.random() * otherMinions.length)];
          const buff = new Buff(source, buffTarget, { ATK: 3, HP: 2 });
          buff.trigger(source);
        }
      }
    },
  },
});

// FP1_021 - Death's Bite
cardScriptsRegistry.register('FP1_021', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Deal 1 damage to all minions
    for (const minion of [...(controller?.field || []), ...(opponent?.field || [])]) {
      const damage = new Damage(source, minion, 1);
      damage.trigger(source);
    }
  },
});
