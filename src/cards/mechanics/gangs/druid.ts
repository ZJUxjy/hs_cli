// gangs - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Shuffle, Buff, Draw, Give, GainArmor, Morph } from '../../../actions';
import type { Entity } from '../../../core/entity';

// CFM_308 - Jade Idol - Choose One - Summon a Jade Golem; or Shuffle 3 copies of this card into your deck
cardScriptsRegistry.register('CFM_308', {
  play: (ctx: ActionContext) => {
    // Choose One handled by game - this is the default action (summon golem)
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Get jade golem count and summon appropriate golem
    const jadeGolemCard = `CFM_712t${Math.min(((controller as any).jadeGolemCount || 0) + 1, 10)}`;
    const summon = new Summon(source, jadeGolemCard);
    summon.trigger(source);
    ((controller as any).jadeGolemCount = ((controller as any).jadeGolemCount || 0) + 1);
  },
});

// CFM_308a - Jade Idol (Summon option)
cardScriptsRegistry.register('CFM_308a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const jadeGolemCard = `CFM_712t${Math.min(((controller as any).jadeGolemCount || 0) + 1, 10)}`;
    const summon = new Summon(source, jadeGolemCard);
    summon.trigger(source);
    ((controller as any).jadeGolemCount = ((controller as any).jadeGolemCount || 0) + 1);
  },
});

// CFM_308b - Jade Idol (Shuffle option)
cardScriptsRegistry.register('CFM_308b', {
  play: (ctx: ActionContext) => {
    // Shuffle 3 copies into deck
    const shuffle1 = new Shuffle('CFM_308');
    shuffle1.trigger(ctx.source);
    const shuffle2 = new Shuffle('CFM_308');
    shuffle2.trigger(ctx.source);
    const shuffle3 = new Shuffle('CFM_308');
    shuffle3.trigger(ctx.source);
  },
});

// CFM_617 - Mark of the Lotus - Give your minions +1/+1
cardScriptsRegistry.register('CFM_617', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field as Entity[] || [];
    for (const minion of field) {
      const buff = new Buff(source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// CFM_816 - Celestial Dreamer - Battlecry: If you control a minion with 5 or more Attack, gain +2/+2
cardScriptsRegistry.register('CFM_816', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field as Entity[] || [];
    const hasBigMinion = field.some((m: any) => m !== source && (m.attack || 0) >= 5);
    if (hasBigMinion) {
      const buff = new Buff(source, source, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// CFM_602b - Jade Blossom - Summon a Jade Golem. Gain an empty Mana Crystal
cardScriptsRegistry.register('CFM_602b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Summon jade golem
    const jadeGolemCard = `CFM_712t${Math.min(((controller as any).jadeGolemCount || 0) + 1, 10)}`;
    const summon = new Summon(source, jadeGolemCard);
    summon.trigger(source);
    ((controller as any).jadeGolemCount = ((controller as any).jadeGolemCount || 0) + 1);
    // Gain empty mana crystal
    (controller as any).maxMana = Math.min(10, ((controller as any).maxMana || 0) + 1);
  },
});

// CFM_614 - Pilfered Power - Gain an empty Mana Crystal for each friendly minion
cardScriptsRegistry.register('CFM_614', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field as Entity[] || [];
    const minionCount = field.length;
    for (let i = 0; i < minionCount; i++) {
      (controller as any).maxMana = Math.min(10, ((controller as any).maxMana || 0) + 1);
    }
  },
});

// CFM_616 - Lunar Visions - Draw 2 cards. Minions drawn cost (2) less
cardScriptsRegistry.register('CFM_616', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Draw 2 cards
    const draw1 = new Draw(controller);
    draw1.trigger(source);
    const draw2 = new Draw(controller);
    draw2.trigger(source);
    // Cost reduction handled by game
  },
});

// CFM_811 - Jade Behemoth - Taunt. Battlecry: Summon a Jade Golem
cardScriptsRegistry.register('CFM_811', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const jadeGolemCard = `CFM_712t${Math.min(((controller as any).jadeGolemCount || 0) + 1, 10)}`;
    const summon = new Summon(source, jadeGolemCard);
    summon.trigger(source);
    ((controller as any).jadeGolemCount = ((controller as any).jadeGolemCount || 0) + 1);
  },
});

// CFM_811e - Jade Behemoth enchantment
cardScriptsRegistry.register('CFM_811e', {
  events: {
    // Enchantment effect handled by game
  },
});
