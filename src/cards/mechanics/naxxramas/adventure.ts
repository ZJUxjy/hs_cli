// naxxramas - adventure.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy } from '../../../actions';
import type { Entity } from '../../../core/entity';

// NAX1_04 - Skitter
cardScriptsRegistry.register('NAX1_04', {
  requirements: {
    [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'NAX1_03');
      summon.trigger(source);
    }
  },
});

// NAX1h_04
cardScriptsRegistry.register('NAX1h_04', {
});

// NAX2_03
cardScriptsRegistry.register('NAX2_03', {
});

// NAX2_03H
cardScriptsRegistry.register('NAX2_03H', {
});

// NAX2_05
cardScriptsRegistry.register('NAX2_05', {
});

// NAX2_05H
cardScriptsRegistry.register('NAX2_05H', {
});

// NAX3_02 - Web Wrap
cardScriptsRegistry.register('NAX3_02', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX3_02H
cardScriptsRegistry.register('NAX3_02H', {
});

// NAX4_04 - Necrotic Aura
cardScriptsRegistry.register('NAX4_04', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const opponent = (source as any).controller?.opponent;
      if (opponent?.hero) {
        const damage = new Damage(source, opponent.hero, 3);
        damage.trigger(source);
      }
    },
  },
});

// NAX4_04H - Necrotic Aura (Heroic)
cardScriptsRegistry.register('NAX4_04H', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const opponent = (source as any).controller?.opponent;
      if (opponent?.hero) {
        const damage = new Damage(source, opponent.hero, 5);
        damage.trigger(source);
      }
    },
  },
});

// NAX5_02 - Unbalancing Strike
cardScriptsRegistry.register('NAX5_02', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX5_02H - Unbalancing Strike (Heroic)
cardScriptsRegistry.register('NAX5_02H', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX6_02
cardScriptsRegistry.register('NAX6_02', {
});

// NAX6_02H
cardScriptsRegistry.register('NAX6_02H', {
});

// NAX7_03 - Frost Breath
cardScriptsRegistry.register('NAX7_03', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX7_03H - Frost Breath (Heroic)
cardScriptsRegistry.register('NAX7_03H', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX8_02
cardScriptsRegistry.register('NAX8_02', {
});

// NAX8_02H
cardScriptsRegistry.register('NAX8_02H', {
});

// NAX9_06
cardScriptsRegistry.register('NAX9_06', {
});

// NAX10_03 - Mind Control
cardScriptsRegistry.register('NAX10_03', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX10_03H - Mind Control (Heroic)
cardScriptsRegistry.register('NAX10_03H', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX11_02
cardScriptsRegistry.register('NAX11_02', {
});

// NAX11_02H
cardScriptsRegistry.register('NAX11_02H', {
});

// NAX12_02 - Frostbolt
cardScriptsRegistry.register('NAX12_02', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX12_02H - Frostbolt (Heroic)
cardScriptsRegistry.register('NAX12_02H', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX12_02e
cardScriptsRegistry.register('NAX12_02e', {
});

// NAX13_02
cardScriptsRegistry.register('NAX13_02', {
});

// NAX14_02
cardScriptsRegistry.register('NAX14_02', {
});

// NAX15_02
cardScriptsRegistry.register('NAX15_02', {
});

// NAX15_02H
cardScriptsRegistry.register('NAX15_02H', {
});

// NAX15_04
cardScriptsRegistry.register('NAX15_04', {
});

// NAX15_04a - Spectral Steed
cardScriptsRegistry.register('NAX15_04a', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const heal = new Heal(source, source, 3);
        heal.trigger(source);
      }
    },
  },
});

// NAX15_04H
cardScriptsRegistry.register('NAX15_04H', {
});

// FP1_006 - Spectral Knight
cardScriptsRegistry.register('FP1_006', {
});

// NAX8_03 - Necromancer
cardScriptsRegistry.register('NAX8_03', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'NAX8_03t');
      summon.trigger(source);
    }
  },
});

// NAX8_03t - Necromancer's Shade
cardScriptsRegistry.register('NAX8_03t', {
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

// NAX8_04 - Skeleton
cardScriptsRegistry.register('NAX8_04', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'NAX8_04t');
      summon.trigger(source);
    }
  },
});

// NAX8_04t - Skeletal Smith
cardScriptsRegistry.register('NAX8_04t', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const buff = new Buff(source, source, { ATK: 1 });
        buff.trigger(source);
      }
    },
  },
});

// NAX8_05 - Bone Construct
cardScriptsRegistry.register('NAX8_05', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'NAX8_05t');
      summon.trigger(source);
    }
  },
});

// NAX8_05t - Bone Wraith
cardScriptsRegistry.register('NAX8_05t', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const heal = new Heal(source, source, 2);
        heal.trigger(source);
      }
    },
  },
});

// NAX9_02
cardScriptsRegistry.register('NAX9_02', {
});

// NAX9_02H
cardScriptsRegistry.register('NAX9_02H', {
});

// NAX9_03
cardScriptsRegistry.register('NAX9_03', {
});

// NAX9_03H
cardScriptsRegistry.register('NAX9_03H', {
});

// NAX9_04
cardScriptsRegistry.register('NAX9_04', {
});

// NAX9_04H
cardScriptsRegistry.register('NAX9_04H', {
});

// NAX14_03
cardScriptsRegistry.register('NAX14_03', {
});

// NAXM_001 - Gahz'rilla
cardScriptsRegistry.register('NAXM_001', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'NAXM_001');
      summon.trigger(source);
    }
  },
});

// NAXM_002 - Maexxna
cardScriptsRegistry.register('NAXM_002', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'NAXM_002');
      summon.trigger(source);
    }
  },
});

// NAX1_05 - Spawn of Naxxramas
cardScriptsRegistry.register('NAX1_05', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'NAX1_03');
      summon.trigger(source);
      const summon2 = new Summon(source, 'NAX1_03');
      summon2.trigger(source);
    }
  },
});

// NAX3_03 - Polarity
cardScriptsRegistry.register('NAX3_03', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX4_05 - Hateful Strike
cardScriptsRegistry.register('NAX4_05', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const destroy = new Destroy(target);
      destroy.trigger(source);
    }
  },
});

// NAX5_03 - Wrath Strike
cardScriptsRegistry.register('NAX5_03', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 5);
      damage.trigger(source);
    }
  },
});

// NAX6_03 - Necromancy
cardScriptsRegistry.register('NAX6_03', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX6_03t - Skeletal Army
cardScriptsRegistry.register('NAX6_03t', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'NAX6_03t');
      summon.trigger(source);
    }
  },
});

// NAX6_04 - Consume
cardScriptsRegistry.register('NAX6_04', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, source, { ATK: 2, HP: 2 });
      buff.trigger(source);
      const destroy = new Destroy(target);
      destroy.trigger(source);
    }
  },
});

// NAX7_05 - Icestorm
cardScriptsRegistry.register('NAX7_05', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    // Freeze all enemy minions - handled by game
  },
});

// NAX9_07 - Chains
cardScriptsRegistry.register('NAX9_07', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Freeze target - handled by game
  },
});

// NAX11_04 - Whirlwind
cardScriptsRegistry.register('NAX11_04', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// NAX12_04 - Frost Nova
cardScriptsRegistry.register('NAX12_04', {
  play: (ctx: ActionContext) => {
    // Freeze all enemy minions - handled by game
  },
});

// NAX13_03 - Poison Cloud
cardScriptsRegistry.register('NAX13_03', {
  play: (ctx: ActionContext) => {
    // Deal 1 damage to all minions - handled by game
  },
});

// NAX14_04 - Doomsday
cardScriptsRegistry.register('NAX14_04', {
  play: (ctx: ActionContext) => {
    // Summon 7 minions - handled by game
  },
});

// NAX7_04
cardScriptsRegistry.register('NAX7_04', {
});

// NAX7_04H
cardScriptsRegistry.register('NAX7_04H', {
});

// NAX9_05
cardScriptsRegistry.register('NAX9_05', {
});

// NAX9_05H
cardScriptsRegistry.register('NAX9_05H', {
});

// NAX10_02 - Rivendare
cardScriptsRegistry.register('NAX10_02', {
  deathrattle: (ctx: ActionContext) => {
    // Double deathrattle - handled by game
  },
});

// NAX10_02H - Rivendare (Heroic)
cardScriptsRegistry.register('NAX10_02H', {
  deathrattle: (ctx: ActionContext) => {
    // Double deathrattle - handled by game
  },
});

// NAX12_03 - Frozen Champion
cardScriptsRegistry.register('NAX12_03', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const buff = new Buff(source, source, { ATK: 1 });
        buff.trigger(source);
      }
    },
  },
});

// NAX12_03H - Frozen Champion (Heroic)
cardScriptsRegistry.register('NAX12_03H', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      if (controller?.isCurrentPlayer) {
        const buff = new Buff(source, source, { ATK: 2 });
        buff.trigger(source);
      }
    },
  },
});
