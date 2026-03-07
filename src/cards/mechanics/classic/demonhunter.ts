// classic - demonhunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// BT_142 - Consume Magic - Silence an enemy minion
cardScriptsRegistry.register('BT_142', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_ENEMY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Silence } = require('../../../actions/silence');
      const silenceAction = new Silence();
      silenceAction.trigger(ctx.source, ctx.target);
    }
  },
});

// BT_323 - Sightless Watcher - Battlecry: Look at 3 cards in your deck. Choose one to keep
cardScriptsRegistry.register('BT_323', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would show choice UI
    console.log('Sightless Watcher: Look at 3 cards in deck');
  },
});

// BT_352 - Satyr Overseer - Battlecry: Deal 2 damage to the hero of the player with the highest Health
cardScriptsRegistry.register('BT_352', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      if (source.zone === 'PLAY') {
        const controller = (ctx.source as any).controller;
        const opponent = controller.opponent;
        const myHealth = (controller.hero as any)?.health || 30;
        const oppHealth = (opponent.hero as any)?.health || 30;
        const target = myHealth >= oppHealth ? opponent.hero : controller.hero;
        if (target) {
          const { Damage } = require('../../../actions/damage');
          const damageAction = new Damage(2);
          damageAction.trigger(ctx.source, target);
        }
      }
    },
  },
});

// BT_495 - Glaivebound Adept - Battlecry: If your hero has 3 or less Health, gain +3 Attack
cardScriptsRegistry.register('BT_495', {
  requirements: {},
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hero = controller.hero;
    if (hero && (hero.health || 30) <= 3) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('BT_495e', { ATK: 3 });
      buffAction.trigger(ctx.source, ctx.source);
    }
  },
});

// BT_035 - Chaos Strike - Give your hero +2 Attack this turn. Draw a card
cardScriptsRegistry.register('BT_035', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hero = controller.hero;
    if (hero) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('BT_035e', { ATK: 2 });
      buffAction.trigger(ctx.source, hero);
    }
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// BT_036 - Coordinated Strike - Summon three 2/2 Illidari with Rush
cardScriptsRegistry.register('BT_036', {
  play: (ctx: ActionContext) => {
    for (let i = 0; i < 3; i++) {
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon('BT_036t');
      summonAction.trigger(ctx.source);
    }
  },
});

// BT_235 - Chaos Nova - Deal 4 damage to all minions
cardScriptsRegistry.register('BT_235', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(4);
      damageAction.trigger(ctx.source, minion);
    }
  },
});

// BT_512 - Inner Demon - Give a friendly minion +8 Attack
cardScriptsRegistry.register('BT_512', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('BT_512e', { ATK: 8 });
      buffAction.trigger(ctx.source, ctx.target);
    }
  },
});

// BT_740 - Soul Cleave - Deal 2 damage to two random enemy minions
cardScriptsRegistry.register('BT_740', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    for (let i = 0; i < 2 && field.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, target);
    }
  },
});
