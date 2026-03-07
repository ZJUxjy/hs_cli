// outlands - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, Silence, Freeze } from '../../../actions';
import { Race } from '../../../enums';

// BT_201 - Scrapyard Collie - Deathrattle: Summon a 1/1 Frenzy Dog
cardScriptsRegistry.register('BT_201', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_201t');
    summon.trigger(ctx.source);
  },
});

// BT_202 - Shimmering Nightmare - Deathrattle: Summon a 3/3 Nightmare
cardScriptsRegistry.register('BT_202', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_202t');
    summon.trigger(ctx.source);
  },
});

// BT_210 - Wild Bloodstinger - Deathrattle: Summon a 6/6 Cleavedrake with Taunt
cardScriptsRegistry.register('BT_210', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_210t');
    summon.trigger(ctx.source);
  },
});

// BT_210t - Cleavedrake (token)
cardScriptsRegistry.register('BT_210t', {
  play: (ctx: ActionContext) => {
    // 6/6 Taunt
  },
});

// BT_211 - Dinotamer Brann - Battlecry: If your deck has no duplicates, summon King Krush
cardScriptsRegistry.register('BT_211', {
});

// BT_212 - Augmented Porcupine - Deathrattle: Deal 6 damage randomly split among all enemies
cardScriptsRegistry.register('BT_212', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 6 damage randomly split - simplified
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const targets = [...(opponent.field || [])];
    if (opponent.hero) targets.push(opponent.hero);

    for (let i = 0; i < 6 && targets.length > 0; i++) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const damage = new Damage(ctx.source, target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// BT_214 - Nagrand Skyclaw - Battlecry: Deal 3 damage
cardScriptsRegistry.register('BT_214', {
  play: (ctx: ActionContext) => {
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

// BT_163 - Defend the Dwarven District - Quest: Use your Hero Power 3 times
cardScriptsRegistry.register('BT_163', {
  play: (ctx: ActionContext) => {
    // Quest reward - summon 4 3/3 Dwarven Soldiers
    for (let i = 0; i < 4; i++) {
      const summonAction = new Summon(ctx.source, 'BT_163t');
      summonAction.trigger(ctx.source);
    }
  },
});

// BT_203 - Monstrous Parrot - Battlecry: Deal 3 damage to a random enemy minion
cardScriptsRegistry.register('BT_203', {
});

// BT_203e - Monstrous buff
cardScriptsRegistry.register('BT_203e', {
});

// BT_205 - Chopper - Battlecry: Deal 2 damage
cardScriptsRegistry.register('BT_205', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// BT_213 - Teron Gorefiend - Deathrattle: Summon a 3/3 Shade
cardScriptsRegistry.register('BT_213', {
  play: (ctx: ActionContext) => {
    // Battlecry: Destroy a friendly minion
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const friendlyMinions = field.filter((m: any) => m !== ctx.source);
    if (friendlyMinions.length > 0) {
      const target = friendlyMinions[0];
      const destroy = new Destroy();
      destroy.trigger(ctx.source, target);
    }
  },
});
