// uldum - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, Silence, Freeze } from '../../../actions';
import { Race } from '../../../enums';

// ULD_262 - Sandhoof Water Bearer - At the end of your turn, restore 5 Health to each hero
cardScriptsRegistry.register('ULD_262', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const heal1 = new Heal(ctx.source, controller.hero, 5);
      heal1.trigger(ctx.source);
      const heal2 = new Heal(ctx.source, controller.opponent.hero, 5);
      heal2.trigger(ctx.source);
    },
  },
});

// ULD_262e - Sandhoof buff
cardScriptsRegistry.register('ULD_262e', {
});

// ULD_266 - Golden Spitfire - Deathrattle: Summon a 3/3 Spitfire
cardScriptsRegistry.register('ULD_266', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'ULD_266t');
    summon.trigger(ctx.source);
  },
});

// ULD_268 - Emberwake - After you cast a spell, deal 1 damage to a random enemy
cardScriptsRegistry.register('ULD_268', {
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

// ULD_269 - Grandmummy - Battlecry: Give a friendly minion +1/+1. Deathrattle: Resurrect it
cardScriptsRegistry.register('ULD_269', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// ULD_270 - Psychopomp - Battlecry: Summon a random friendly minion that died this game
cardScriptsRegistry.register('ULD_270', {
  events: {
    // Resurrect a friendly minion
  },
});

// ULD_265 - Plague of Death - Silence all minions
cardScriptsRegistry.register('ULD_265', {
  requirements: {
    [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const silenceAction = new Silence(ctx.source, minion);
      silenceAction.trigger(ctx.source);
    }
    const myMinions = controller.field || [];
    for (const minion of myMinions) {
      const silenceAction = new Silence(ctx.source, minion);
      silenceAction.trigger(ctx.source);
    }
  },
});

// ULD_272 - Wretched Reclaimer - Battlecry: Destroy a friendly minion. Restore its Health to your hero
cardScriptsRegistry.register('ULD_272', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const friendlyMinions = field.filter((m: any) => m !== ctx.source);
    if (friendlyMinions.length > 0) {
      const target = friendlyMinions[0];
      const maxHealth = (target as any).maxHealth || 1;
      const currentHealth = (target as any).health || 1;
      const healAmount = maxHealth - currentHealth;

      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, target);

      if (healAmount > 0) {
        const heal = new Heal(ctx.source, controller.hero, healAmount);
        heal.trigger(ctx.source);
      }
    }
  },
});

// ULD_714 - Battery Pack - Summon two 3/3 Mechanical Whelps
cardScriptsRegistry.register('ULD_714', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    for (let i = 0; i < 2; i++) {
      const summonAction = new Summon(ctx.source, 'ULD_714t');
      summonAction.trigger(ctx.source);
    }
  },
});

// ULD_718 - Headcrack - Deal 2 damage. Return this to your hand next turn
cardScriptsRegistry.register('ULD_718', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// ULD_724 - High Priest Amet - Your minions with Taunt have +2 Health
cardScriptsRegistry.register('ULD_724', {
});

// ULD_724p - Empowered (Hero Power)
cardScriptsRegistry.register('ULD_724p', {
});
