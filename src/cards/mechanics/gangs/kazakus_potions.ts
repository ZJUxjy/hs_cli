// gangs - kazakus_potions.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Heal, Draw, Give, Destroy, Shuffle, Freeze } from '../../../actions';
import type { Entity } from '../../../core/entity';

// CFM_621t2
cardScriptsRegistry.register('CFM_621t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 3);
      damage.trigger(source);
    }
  },
});

// CFM_621t3
cardScriptsRegistry.register('CFM_621t3', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'CFM_621t');
      summon.trigger(source);
    }
  },
});

// CFM_621t4
cardScriptsRegistry.register('CFM_621t4', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 5);
      heal.trigger(source);
    }
  },
});

// CFM_621t5
cardScriptsRegistry.register('CFM_621t5', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 5;
    }
  },
});

// CFM_621t6
cardScriptsRegistry.register('CFM_621t6', {
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

// CFM_621t8
cardScriptsRegistry.register('CFM_621t8', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'CFM_621t7');
      summon.trigger(source);
    }
  },
});

// CFM_621t9
cardScriptsRegistry.register('CFM_621t9', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const freeze = new Freeze();
      (freeze as any).trigger(source, target);
    }
  },
});

// CFM_621t10
cardScriptsRegistry.register('CFM_621t10', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 3 });
      buff.trigger(source);
    }
  },
});

// CFM_621t16
cardScriptsRegistry.register('CFM_621t16', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 4);
      damage.trigger(source);
    }
  },
});

// CFM_621t17
cardScriptsRegistry.register('CFM_621t17', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'CFM_621t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'CFM_621t');
      summon2.trigger(source);
    }
  },
});

// CFM_621t18
cardScriptsRegistry.register('CFM_621t18', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 8);
      heal.trigger(source);
    }
  },
});

// CFM_621t19
cardScriptsRegistry.register('CFM_621t19', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 8;
    }
  },
});

// CFM_621t20
cardScriptsRegistry.register('CFM_621t20', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 8);
      damage.trigger(source);
    }
  },
});

// CFM_621t21
cardScriptsRegistry.register('CFM_621t21', {
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

// CFM_621t22
cardScriptsRegistry.register('CFM_621t22', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'CFM_621t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'CFM_621t');
      summon2.trigger(source);
      const summon3 = new Summon(source, 'CFM_621t');
      summon3.trigger(source);
    }
  },
});

// CFM_621t23
cardScriptsRegistry.register('CFM_621t23', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 10);
      heal.trigger(source);
    }
  },
});

// CFM_621t24
cardScriptsRegistry.register('CFM_621t24', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 10;
    }
  },
});

// CFM_621t25
cardScriptsRegistry.register('CFM_621t25', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
});

// CFM_621t26
cardScriptsRegistry.register('CFM_621t26', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'CFM_621t7');
      summon.trigger(source);
      const summon2 = new Summon(source, 'CFM_621t7');
      summon2.trigger(source);
    }
  },
});

// CFM_621t27
cardScriptsRegistry.register('CFM_621t27', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const freeze = new Freeze();
      (freeze as any).trigger(source, target);
    }
  },
});

// CFM_621t28
cardScriptsRegistry.register('CFM_621t28', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 4 });
      buff.trigger(source);
    }
  },
});

// CFM_621t29
cardScriptsRegistry.register('CFM_621t29', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 3, HEALTH: 3 });
      buff.trigger(source);
    }
  },
});

// CFM_621t30
cardScriptsRegistry.register('CFM_621t30', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 10);
      damage.trigger(source);
    }
  },
});

// CFM_621t31
cardScriptsRegistry.register('CFM_621t31', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = controller?.deck || [];
    if (deck.length > 0) {
      const draw = new Draw(source);
      draw.trigger(source);
    }
  },
});

// CFM_621t32
cardScriptsRegistry.register('CFM_621t32', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.field?.length < 7) {
      const summon = new Summon(source, 'CFM_621t');
      summon.trigger(source);
      const summon2 = new Summon(source, 'CFM_621t');
      summon2.trigger(source);
      const summon3 = new Summon(source, 'CFM_621t');
      summon3.trigger(source);
      const summon4 = new Summon(source, 'CFM_621t');
      summon4.trigger(source);
    }
  },
});

// CFM_621t33
cardScriptsRegistry.register('CFM_621t33', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 5 });
      buff.trigger(source);
    }
  },
});

// CFM_621t37
cardScriptsRegistry.register('CFM_621t37', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 3);
      heal.trigger(source);
    }
  },
});

// CFM_621t38
cardScriptsRegistry.register('CFM_621t38', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 4;
    }
  },
});

// CFM_621t39
cardScriptsRegistry.register('CFM_621t39', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const damage = new Damage(source, target, 2);
      damage.trigger(source);
    }
  },
});
