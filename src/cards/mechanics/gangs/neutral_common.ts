// gangs - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';

// CFM_060 - Red Mana Wyrm - Whenever you cast a spell, gain +2 Attack
cardScriptsRegistry.register('CFM_060', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as any;
      if ((source as any).controller === (ctx.source as any).controller) {
        const buff = new Buff(source, source, { ATK: 2 });
        buff.trigger(source);
      }
    },
  },
});

// CFM_060e
cardScriptsRegistry.register('CFM_060e', {
});

// CFM_063 - Blubber Baron - Battlecry: Give a random friendly minion +3/+3
cardScriptsRegistry.register('CFM_063', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    if (field.length > 0) {
      const targets = field.filter((m: any) => m !== ctx.source);
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const buff = new Buff(ctx.source, target, { ATK: 3, HEALTH: 3 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// CFM_039 - Street Trickster - Battlecry: Give your opponent a free card
cardScriptsRegistry.register('CFM_039', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    // Give opponent a card - handled by game
  },
});

// CFM_067 - Hozen Healer - Battlecry: Restore 4 Health
cardScriptsRegistry.register('CFM_067', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const heal = new Heal(ctx.source, target, 4);
      heal.trigger(ctx.source);
    }
  },
});

// CFM_120 - Wind-up Burglebot - Deathrattle: Draw a card
cardScriptsRegistry.register('CFM_120', {
  deathrattle: (ctx: ActionContext) => {
    const draw = new Draw((ctx.source as any).controller);
    draw.trigger(ctx.source);
  },
});

// CFM_619 - Fight Promoter - Battlecry: If you control a Taunt minion, draw 2 cards
cardScriptsRegistry.register('CFM_619', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const hasTaunt = field.some((m: any) => m.taunt);
    if (hasTaunt) {
      const draw1 = new Draw(controller);
      draw1.trigger(ctx.source);
      const draw2 = new Draw(controller);
      draw2.trigger(ctx.source);
    }
  },
});

// CFM_646 - Grimestreet Protector - Deathrattle: Give a random friendly minion Divine Shield
cardScriptsRegistry.register('CFM_646', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const targets = field.filter((m: any) => m !== ctx.source);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const buff = new Buff(ctx.source, target, { divineShield: true });
      buff.trigger(ctx.source);
    }
  },
});

// CFM_647 - Grimy Gadgeteer - Battlecry: Give a random friendly minion +2/+2
cardScriptsRegistry.register('CFM_647', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const targets = field.filter((m: any) => m !== ctx.source);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const buff = new Buff(ctx.source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// CFM_648 - Grimestreet Enforcer - Battlecry: Give all your minions +1/+1
cardScriptsRegistry.register('CFM_648', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// CFM_651 - Naga Corsair - Battlecry: Give your weapon +1 Attack
cardScriptsRegistry.register('CFM_651', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const weapon = controller.weapon;
    if (weapon) {
      const buff = new Buff(source, weapon, { ATK: 1 });
      buff.trigger(source);
    }
  },
});

// CFM_654 - Friendly Bartender - At the end of your turn, restore 1 Health to your hero
cardScriptsRegistry.register('CFM_654', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      if (controller?.hero) {
        const heal = new Heal(source, controller.hero, 1);
        heal.trigger(source);
      }
    },
  },
});

// CFM_646 - Backstreet Leper - Deathrattle: Deal 2 damage to the enemy hero
cardScriptsRegistry.register('CFM_646', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 2);
      damage.trigger(source);
    }
  },
});

// CFM_619 - Kabal Chemist - Battlecry: Add a random potion to your hand
cardScriptsRegistry.register('CFM_619', {
  play: (ctx: ActionContext) => {
    // Add a random potion to hand - handled by game
  },
});

// CFM_655 - Ultra-Zap - Deal 4 damage
cardScriptsRegistry.register('CFM_655', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 4);
      damage.trigger(ctx.source);
    }
  },
});

// CFM_656 -Defias Cleaner - Battlecry: Destroy a minion
cardScriptsRegistry.register('CFM_656', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target as any;
    if (target) {
      target.destroy();
    }
  },
});

// CFM_659 - Felblade - Battlecry: Deal 2 damage
cardScriptsRegistry.register('CFM_659', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// CFM_809 - Tanaris Hogchopper - Battlecry: If your opponent's hand is not empty, gain Charge
cardScriptsRegistry.register('CFM_809', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const oppHand = opponent?.hand || [];
    if (oppHand.length > 0) {
      // Give Charge - handled by game engine
      // Note: simplified implementation
    }
  },
});

// CFM_851 - Daring Reporter - After your opponent draws a card, gain +1/+1
cardScriptsRegistry.register('CFM_851', {
  events: {
    DRAW: (ctx: ActionContext) => {
      const source = ctx.source;
      const controller = (source as any)?.controller;
      const opponent = (controller as any)?.opponent;
      if (ctx.source === opponent) {
        const buff = new Buff(source, source, { ATK: 1, HEALTH: 1 });
        buff.trigger(source);
      }
    },
  },
});

// CFM_853 - Grimestreet Smuggler - Battlecry: Give a random minion in your hand +1/+1
cardScriptsRegistry.register('CFM_853', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
    const minionsInHand = hand.filter((c: any) => c?.type === 'minion');
    if (minionsInHand.length > 0) {
      const target = minionsInHand[Math.floor(Math.random() * minionsInHand.length)];
      const buff = new Buff(source, target, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});
