// troll - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Summon, Heal, Destroy } from '../../../actions';

// TRL_247 - High Priestess Jeklik
// Taunt. Battlecry: Give your other Demons +1 Attack
cardScriptsRegistry.register('TRL_247', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const { Buff } = require('../../../actions/buff');
    for (const minion of field) {
      if (minion !== source) {
        const buff = new Buff(source, minion, { ATK: 1 });
        buff.trigger(source);
      }
    }
  },
});

// TRL_251 - Toki, Time-Tinker
// Battlecry: Add a random Future card to your hand
cardScriptsRegistry.register('TRL_251', {
  events: {
    // Add random future card - simplified
  },
});

// TRL_252 - Aranasi Broodmother
// Taunt. Restore 4 Health to your hero when drawn
cardScriptsRegistry.register('TRL_252', {
});

// TRL_253 - Plague of Flames
// Destroy all your minions. Deal their damage to the enemy hero
cardScriptsRegistry.register('TRL_253', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const opponent = controller?.opponent;
    let totalDamage = 0;

    // Destroy all friendly minions and sum their attack
    for (const minion of [...field]) {
      totalDamage += (minion as any).atk || 0;
      const destroy = new Destroy();
      destroy.trigger(source, minion);
    }

    // Deal total damage to enemy hero
    if (opponent?.hero && totalDamage > 0) {
      const damage = new Damage(source, opponent.hero, totalDamage);
      damage.trigger(source);
    }
  },
});

// TRL_257 - Lord Jaraxxus
// Battlecry: Equip a 3/8 Blood Fury
cardScriptsRegistry.register('TRL_257', {
  events: {
    // Battlecry: equip weapon
  },
});

// TRL_551 - Blood Portal
// Draw a minion. Give it a Deathrattle: Summon a random Demon
cardScriptsRegistry.register('TRL_551', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(source, 1);
    draw.trigger(source);
    // Give deathrattle - simplified
  },
});

// TRL_245 - Shudderwraith
// Battlecry: Deal 3 damage
cardScriptsRegistry.register('TRL_245', {
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

// TRL_246 - Void Analyst
// Battlecry: Draw a card if you hold a Demon
cardScriptsRegistry.register('TRL_246', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    // Check if you control a Demon
    let hasDemon = false;
    for (const minion of field) {
      if ((minion as any).race === 'DEMON') {
        hasDemon = true;
        break;
      }
    }
    if (hasDemon) {
      const { Draw } = require('../../../actions/draw');
      const draw = new Draw(source, 1);
      draw.trigger(source);
    }
  },
});

// TRL_249 - Eater of Secrets
// Battlecry: Destroy all enemy Secrets
cardScriptsRegistry.register('TRL_249', {
  requirements: {
    // Destroy secrets
  },
  play: (ctx: ActionContext) => {
    // Destroy all enemy secrets - simplified
  },
});

// TRL_555 - Nether Breath
// Deal 2 damage. If you're holding a Dragon, deal 4 damage and restore 2 Health
cardScriptsRegistry.register('TRL_555', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
    // Check if holding a Dragon
    const hasDragon = false;
    // Simplified - just do 2 damage
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const damage = new Damage(source, opponent.hero, 2);
      damage.trigger(source);
    }
  },
});
