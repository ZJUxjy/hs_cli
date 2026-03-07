// uldum - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';

// ULD_195 - Barrage (Quest: Deal 5 damage to your hero)
cardScriptsRegistry.register('ULD_195', {
  play: (ctx: ActionContext) => {
    // Quest warrior - mark as active
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    (controller as any).barrageQuestActive = true;
  },
  events: {
    DAMAGE: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Check if hero took 5 damage
      if ((controller as any).barrageQuestActive && event?.target === controller?.hero) {
        // Quest complete - draw a card (simplified reward)
        const { Draw } = require('../../../actions/draw');
        const drawAction = new Draw(ctx.source, 1);
        drawAction.trigger(source);
      }
    },
  },
});

// ULD_253 - Execute (Deal 5 damage to a damaged minion)
cardScriptsRegistry.register('ULD_253', {
  requirements: {
    [PlayReq.REQ_DAMAGED_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(5);
      damageAction.trigger(ctx.source, target);
    }
  },
});

// ULD_258 - Armagedillo: Taunt. At the end of your turn, give all Taunt minions in your hand +2/+2.
cardScriptsRegistry.register('ULD_258', {
  events: {
    TURN_END: (ctx: any) => {
      const controller = (ctx.source as any)?.controller;
      if (!controller?.hand) return;

      for (const card of controller.hand) {
        if ((card as any).taunt) {
          (card as any).attack = ((card as any).attack || 0) + 2;
          (card as any).health = ((card as any).health || 0) + 2;
        }
      }
    },
  },
});

// ULD_709 - Armored Goon: Whenever your hero attacks, gain 5 Armor.
cardScriptsRegistry.register('ULD_709', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.source === (ctx.source as any)?.controller?.hero) {
        const controller = (ctx.source as any)?.controller;
        if (controller?.hero) {
          controller.hero.armor = (controller.hero.armor || 0) + 5;
        }
      }
    },
  },
});

// ULD_720 - Bloodsworn Mercenary: Battlecry: Choose a damaged friendly minion. Summon a copy of it.
cardScriptsRegistry.register('ULD_720', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
    [PlayReq.REQ_DAMAGED_TARGET]: 1,
    [PlayReq.REQ_MINION_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    const controller = (ctx.source as any)?.controller;
    if (!target || !controller) return;

    if (controller.field?.length < 7) {
      controller.field.push({
        id: (target as any).id,
        attack: (target as any).attack,
        health: (target as any).health,
      } as any);
    }
  },
});

// ULD_256 - Into the Fray: Give all Taunt minions in your hand +2/+2.
cardScriptsRegistry.register('ULD_256', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller?.hand) return;

    for (const card of controller.hand) {
      if ((card as any).taunt) {
        (card as any).attack = ((card as any).attack || 0) + 2;
        (card as any).health = ((card as any).health || 0) + 2;
      }
    }
  },
});

// ULD_707 - Plague of Wrath: Destroy all damaged minions.
cardScriptsRegistry.register('ULD_707', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;

    const opponent = controller.opponent;
    if (!opponent?.field) return;

    // Destroy all damaged minions on both sides
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      if ((minion as any).damage > 0) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// ULD_711 - Hack the System: Quest: Attack 5 times with your hero. Reward: Anraphet's Core.
cardScriptsRegistry.register('ULD_711', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller) {
      (controller as any).hackTheSystemQuestActive = true;
      (controller as any).hackTheSystemAttacks = 0;
    }
  },
  events: {
    ATTACK: (ctx: any) => {
      const controller = (ctx.source as any)?.controller;
      if ((controller as any)?.hackTheSystemQuestActive &&
          ctx.event?.source === controller?.hero) {
        (controller as any).hackTheSystemAttacks = ((controller as any).hackTheSystemAttacks || 0) + 1;

        if ((controller as any).hackTheSystemAttacks >= 5) {
          // Quest complete - add reward to hand
          if (controller?.hand?.length < 10) {
            controller.hand.push({ id: 'ULD_711p3' } as any);
          }
          (controller as any).hackTheSystemQuestActive = false;
        }
      }
    },
  },
});

// ULD_711p3 - Anraphet's Core: Summon a 4/3 Golem. After your hero attacks, refresh this.
cardScriptsRegistry.register('ULD_711p3', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;

    // Summon 4/3 Golem
    controller.field?.push({ id: 'ULD_711t', attack: 4, health: 3 } as any);

    // Mark as refreshable after hero attacks
    (controller as any).anraphetsCoreRefresh = true;
  },
  events: {
    ATTACK: (ctx: any) => {
      const controller = (ctx.source as any)?.controller;
      if ((controller as any)?.anraphetsCoreRefresh &&
          ctx.event?.source === controller?.hero) {
        // Refresh - add back to hand
        if (controller?.hand?.length < 10) {
          controller.hand.push({ id: 'ULD_711p3' } as any);
        }
        (controller as any).anraphetsCoreRefresh = false;
      }
    },
  },
});

// ULD_708 - Livewire Lance: After your hero attacks, add a Lackey to your hand.
cardScriptsRegistry.register('ULD_708', {
  events: {
    ATTACK: (ctx: any) => {
      const controller = (ctx.source as any)?.controller;
      if (ctx.event?.source === controller?.hero) {
        // Add a random Lackey to hand
        const lackeys = ['LOOT_541t', 'LOOT_542t', 'LOOT_543t', 'LOOT_544t', 'LOOT_545t', 'LOOT_547t', 'CFM_321t'];
        const randomLackey = lackeys[Math.floor(Math.random() * lackeys.length)];
        if (controller?.hand?.length < 10) {
          controller.hand.push({ id: randomLackey } as any);
        }
      }
    },
  },
});
