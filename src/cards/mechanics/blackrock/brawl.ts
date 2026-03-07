// blackrock - brawl.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy, Shuffle } from '../../../actions';
import type { Entity } from '../../../core/entity';

// TBA01_5
cardScriptsRegistry.register('TBA01_5', {
});

// TBA01_5e
cardScriptsRegistry.register('TBA01_5e', {
});

// TBA01_6
cardScriptsRegistry.register('TBA01_6', {
});

// BRMC_84
cardScriptsRegistry.register('BRMC_84', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMC_84t');
      summon.trigger(source);
    }
  },
});

// BRMC_85
cardScriptsRegistry.register('BRMC_85', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMC_85t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'BRMC_85t');
      summon2.trigger(source);
    }
  },
});

// BRMC_86
cardScriptsRegistry.register('BRMC_86', {
});

// BRMC_87
cardScriptsRegistry.register('BRMC_87', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMC_87t');
      summon.trigger(source);
    }
  },
});

// BRMC_88
cardScriptsRegistry.register('BRMC_88', {
});

// BRMC_91
cardScriptsRegistry.register('BRMC_91', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, source, { ATK: 2 });
      buff.trigger(source);
    }
  },
});

// BRMC_92
cardScriptsRegistry.register('BRMC_92', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 2);
      damage.trigger(source);
    }
  },
});

// BRMC_95
cardScriptsRegistry.register('BRMC_95', {
});

// BRMC_96
cardScriptsRegistry.register('BRMC_96', {
});

// BRMC_97
cardScriptsRegistry.register('BRMC_97', {
});

// BRMC_97e
cardScriptsRegistry.register('BRMC_97e', {
});

// BRMC_98
cardScriptsRegistry.register('BRMC_98', {
});

// BRMC_99
cardScriptsRegistry.register('BRMC_99', {
});

// BRMC_83
cardScriptsRegistry.register('BRMC_83', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 5);
      damage.trigger(source);
    }
  },
});

// BRMC_93
cardScriptsRegistry.register('BRMC_93', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMC_93t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'BRMC_93t');
      summon2.trigger(source);
      const summon3 = new Summon(source, 'BRMC_93t');
      summon3.trigger(source);
    }
  },
});

// BRMC_95h
cardScriptsRegistry.register('BRMC_95h', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'BRMC_95t');
      summon.trigger(source);
    }
  },
});

// BRMC_95he
cardScriptsRegistry.register('BRMC_95he', {
});

// BRMC_100
cardScriptsRegistry.register('BRMC_100', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 2);
      damage.trigger(source);
    }
  },
});

// BRMC_100e
cardScriptsRegistry.register('BRMC_100e', {
});

// BRMC_94
cardScriptsRegistry.register('BRMC_94', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 2);
      damage.trigger(source);
    }
  },
});
