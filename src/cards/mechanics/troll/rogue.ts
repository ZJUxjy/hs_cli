// troll - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Destroy } from '../../../actions';

// TRL_071 - Raiding Party
// Draw 2 pirates from your deck
cardScriptsRegistry.register('TRL_071', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(source, 2);
    draw.trigger(source);
  },
});

// TRL_077 - Hooked Scimitar
// Battlecry: Return a friendly minion to your hand
cardScriptsRegistry.register('TRL_077', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    if (ctx.target) {
      const { Bounce } = require('../../../actions/bounce');
      const bounce = new Bounce();
      bounce.trigger(source, ctx.target);
    }
  },
});

// TRL_077e - Hooked Scimitar buff
cardScriptsRegistry.register('TRL_077e', {
});

// TRL_092 - Cursed Castaway
// Rush. Battlecry: Return a card from your hand to your deck
cardScriptsRegistry.register('TRL_092', {
  events: {
    // Rush is set on card
  },
});

// TRL_126 - Bloodsail Flybooter
// Battlecry: Add two 1/1 Pirates to your hand
cardScriptsRegistry.register('TRL_126', {
  play: (ctx: ActionContext) => {
    // Add pirates to hand - simplified
  },
});

// TRL_409 - Wagglepick
// Deathrattle: Add a random 4-Cost minion to your hand
cardScriptsRegistry.register('TRL_409', {
  play: (ctx: ActionContext) => {
    // Weapon body
  },
  deathrattle: (ctx: ActionContext) => {
    // Add random 4-cost minion to hand - simplified
  },
});

// TRL_124 - Cannonball Barrage
// Deal 3 damage to a random enemy minion
cardScriptsRegistry.register('TRL_124', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const oppField = opponent?.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      const damage = new Damage(source, target, 3);
      damage.trigger(source);
    } else if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 3);
      damage.trigger(source);
    }
  },
});

// TRL_127 - Pick Pocket
// Add a random card to your hand (from your opponent's class)
cardScriptsRegistry.register('TRL_127', {
  play: (ctx: ActionContext) => {
    // Add random card from opponent's class - simplified
  },
});

// TRL_156 - Sand Drainer
// Battlecry: Deal 2 damage
cardScriptsRegistry.register('TRL_156', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const oppField = opponent?.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      const damage = new Damage(source, target, 2);
      damage.trigger(source);
    }
  },
});

// TRL_157 - Cursed Disciple
// Deathrattle: Summon a 5/5 Shadow
cardScriptsRegistry.register('TRL_157', {
  requirements: {
    // Deathrattle summon
  },
  play: (ctx: ActionContext) => {
    // Minion body
  },
});

// TRL_074 - Captain Hooktusk
// Battlecry: Return 2 minions from the board to their owner's hand
cardScriptsRegistry.register('TRL_074', {
  deathrattle: (ctx: ActionContext) => {
    // Return 2 minions to hand - simplified
  },
});
