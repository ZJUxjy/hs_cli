// troll - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Heal, Draw } from '../../../actions';

// TRL_131 - Sand Drudge
// Battlecry: Summon two 1/1 Scarabs
cardScriptsRegistry.register('TRL_131', {
  events: {
    // This is a minion - battlecry handled by play
  },
});

// TRL_259 - Regenerate
// Restore 3 Health
cardScriptsRegistry.register('TRL_259', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hero = controller?.hero;
    if (hero) {
      const heal = new Heal(source, hero, 3);
      heal.trigger(source);
    }
  },
});

// TRL_260 - Mass Dispel
// Silence all enemy minions. Draw a card
cardScriptsRegistry.register('TRL_260', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const oppField = opponent?.field || [];
    const { Silence } = require('../../../actions/silence');
    for (const minion of oppField) {
      const silence = new Silence();
      silence.trigger(source, minion);
    }
    const draw = new Draw(source, 1);
    draw.trigger(source);
  },
});

// TRL_408 - Sand Bishop
// Taunt. Restore 2 Health to your hero at the end of your turn
cardScriptsRegistry.register('TRL_408', {
});

// TRL_501 - Unpowered Steambot
// Taunt. Deathrattle: Give your other minions +2/+2
cardScriptsRegistry.register('TRL_501', {
  play: (ctx: ActionContext) => {
    // Minion body
  },
});

// TRL_502 - Unpowered Steambot buff
cardScriptsRegistry.register('TRL_502', {
  events: {
    // End of turn buff
  },
});

// TRL_502e - Unpowered Steambot enchantment
cardScriptsRegistry.register('TRL_502e', {
  events: {
    // End of turn effect
  },
});

// TRL_097 - Wisp
// (just a 1/1 minion)
cardScriptsRegistry.register('TRL_097', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Just a 1/1 minion
  },
});

// TRL_128 - Sadgar
// (minion)
cardScriptsRegistry.register('TRL_128', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Minion body
  },
});

// TRL_258 - Sir Finley Mrrgl
// Battlecry: Discover a new Hero Power
cardScriptsRegistry.register('TRL_258', {
  requirements: {
    // Discover a hero power
  },
});

// TRL_500 -Whirlwind
// Deal 1 damage to ALL minions
cardScriptsRegistry.register('TRL_500', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const field = controller?.field || [];
    const oppField = opponent?.field || [];

    const allMinions = [...field, ...oppField];
    for (const minion of allMinions) {
      const damage = new Damage(source, minion, 1);
      damage.trigger(source);
    }
  },
});
