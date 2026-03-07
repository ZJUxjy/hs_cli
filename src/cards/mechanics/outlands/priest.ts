// outlands - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, Silence } from '../../../actions';
import { Race } from '../../../enums';

// BT_197 - Reliquary of Souls - Deathrattle: Put a copy of this minion into your deck
cardScriptsRegistry.register('BT_197', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const source = ctx.source as any;
    const cardId = source.cardId || source.id || 'BT_197';
    const shuffleAction = new Shuffle(cardId);
    shuffleAction.trigger(ctx.source);
  },
});

// BT_197t - Soul
cardScriptsRegistry.register('BT_197t', {
});

// BT_254 - Enthralling Observer - Battlecry: Choose a friendly minion. It attacks a random enemy
cardScriptsRegistry.register('BT_254', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      // Choose a friendly minion to attack
    },
  },
});

// BT_256 - Dark Prophecy - Discover a minion. Remove top 3 cards of your deck
cardScriptsRegistry.register('BT_256', {
  events: {
    // Discover a minion
  },
});

// BT_258 - Katy Kazan - Your minions have Stealth
cardScriptsRegistry.register('BT_258', {
});

// BT_262 - Lightmaw Nether Drake - Battlecry: If you're holding a Dragon, gain +3 Attack and Taunt
cardScriptsRegistry.register('BT_262', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const hasDragon = hand.some((c: any) => (c as any).race === Race.DRAGON);

    if (hasDragon) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 3 });
      buff.trigger(ctx.source);
      (ctx.source as any).taunt = true;
    }
  },
});

// BT_341 - Mindflayer Kaahrj - Battlecry: Choose a friendly minion. It attacks a random enemy
cardScriptsRegistry.register('BT_341', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      // Choose a friendly minion to attack
    },
  },
});

// BT_198 - Clever Disguise - Add 2 random minions to your hand
cardScriptsRegistry.register('BT_198', {
});

// BT_252 - Dragonmaw Overseer - Battlecry: Give other friendly minions +2 Attack
cardScriptsRegistry.register('BT_252', {
  requirements: {
    [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== ctx.source) {
        const buff = new Buff(ctx.source, minion, { ATK: 2 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// BT_253 - Sethekk Veilweaver - After you cast a spell on a minion, add a random Priest spell to your hand
cardScriptsRegistry.register('BT_253', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // The effect is triggered by casting spells on minions
  },
});

// BT_257 - Shadow Word: Death - Destroy a minion with 5 or more Attack
cardScriptsRegistry.register('BT_257', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, ctx.target);
    }
  },
});
