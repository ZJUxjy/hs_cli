// uldum - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, Silence, Freeze } from '../../../actions';
import { Race } from '../../../enums';

// ULD_151 - Ramkahen Wildtamer - Battlecry: Copy a random Beast in your hand
cardScriptsRegistry.register('ULD_151', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const beasts = hand.filter((c: any) => (c as any).race === Race.BEAST);
    if (beasts.length > 0) {
      const randomIndex = Math.floor(Math.random() * beasts.length);
      const beast = beasts[randomIndex];
      const giveAction = new Give(beast.id);
      giveAction.trigger(ctx.source, controller);
    }
  },
});

// ULD_154 - Diversify - Add 3 random Secrets to your hand
cardScriptsRegistry.register('ULD_154', {
  play: (ctx: ActionContext) => {
    // Add 3 random secrets - simplified
  },
});

// ULD_156 - Swarm of Locusts - Deal 1 damage to all enemy minions
cardScriptsRegistry.register('ULD_156', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const damage = new Damage(ctx.source, minion, 1);
      damage.trigger(ctx.source);
    }
  },
});

// ULD_212 - Pack Mule - After you draw a card, gain +2 Attack
cardScriptsRegistry.register('ULD_212', {
  play: (ctx: ActionContext) => {
    // Battlecry: Deal 3 damage
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const targets = [...(opponent.field || [])];
    if (opponent.hero) targets.push(opponent.hero);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const damage = new Damage(ctx.source, target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// ULD_410 - Hyena Alpha - Battlecry: If you control a Beast, give +2/+2
cardScriptsRegistry.register('ULD_410', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const hasBeast = field.some((m: any) => (m as any).race === Race.BEAST);

    if (hasBeast) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// ULD_410e - Hyena Alpha buff
cardScriptsRegistry.register('ULD_410e', {
  events: {
    // Periodically buffs
  },
});

// ULD_152 - Dwarven Sharpshooter - Your Hero Power can target Minions
cardScriptsRegistry.register('ULD_152', {
});

// ULD_155 - Rapid Fire - Deal 1 damage twice
cardScriptsRegistry.register('ULD_155', {
});

// ULD_155p - Quick Shot (Hero Power)
cardScriptsRegistry.register('ULD_155p', {
});

// ULD_429 - Scarlet Webweaver - Battlecry: Choose a friendly minion. It gains Poisonous
cardScriptsRegistry.register('ULD_429', {
  play: (ctx: ActionContext) => {
    // Choose a friendly minion - handled by game
  },
});

// ULD_713 - Unseal the Vault - Quest: Take 10 damage on your minions
cardScriptsRegistry.register('ULD_713', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Quest reward - Summon 3 3/3 Scarabs with Taunt
    for (let i = 0; i < 3; i++) {
      const summonAction = new Summon(ctx.source, 'ULD_713t');
      summonAction.trigger(ctx.source);
    }
  },
});

// ULD_430 - Bloodseeker - Your minions have +2 Attack
cardScriptsRegistry.register('ULD_430', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Give +2 Attack to all friendly minions at end of turn
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      for (const minion of field) {
        const buff = new Buff(ctx.source, minion, { ATK: 2 });
        buff.trigger(ctx.source);
      }
    },
  },
});
