// icecrown - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Summon, Draw, Heal } from '../../../actions';

// ICC_047 - Fatespinner
// Choose a damage type: Deal 3 damage to all minions (Fire) or Restore 3 health to all minions (Nature)
cardScriptsRegistry.register('ICC_047', {
});

// ICC_047a - Fatespinner (Fire)
cardScriptsRegistry.register('ICC_047a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const field = controller?.field || [];
    const oppField = opponent?.field || [];
    const allMinions = [...field, ...oppField];
    for (const minion of allMinions) {
      const damage = new Damage(source, minion, 3);
      damage.trigger(source);
    }
  },
});

// ICC_047b - Fatespinner (Nature)
cardScriptsRegistry.register('ICC_047b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    for (const minion of field) {
      const heal = new Heal(source, minion, 3);
      heal.trigger(source);
    }
  },
});

// ICC_047t - Fatespinner Token
cardScriptsRegistry.register('ICC_047t', {
});

// ICC_047t2 - Fatespinner Token with Deathrattle
cardScriptsRegistry.register('ICC_047t2', {
  play: (ctx: ActionContext) => {
    // Minion body
  },
  deathrattle: (ctx: ActionContext) => {
    // Deal 3 damage to all minions - simplified
  },
});

// ICC_051 - Hadronox
// Deathrattle: Summon your Taunt minions that died this game
cardScriptsRegistry.register('ICC_051', {
});

// ICC_051a - Hadronox (Taunt)
cardScriptsRegistry.register('ICC_051a', {
  play: (ctx: ActionContext) => {
    // Summon taunt minions from deck
  },
});

// ICC_051b - Hadronox (Attack)
cardScriptsRegistry.register('ICC_051b', {
  play: (ctx: ActionContext) => {
    // Summon taunt minions from deck
  },
});

// ICC_807 - Druid of the Swarm
// Choose One - Transform into a 2/2 with Stealth or a 2/2 with Taunt
cardScriptsRegistry.register('ICC_807', {
  play: (ctx: ActionContext) => {
    // Transform based on choice
  },
});

// ICC_808 - Webweave
// Return a random enemy minion to its owner's hand
cardScriptsRegistry.register('ICC_808', {
  events: {
    // Return random enemy minion to hand - simplified
  },
});

// ICC_835 - Nerubian Unraveler
// Deathrattle: Each player shuffles a copy of this into their deck
cardScriptsRegistry.register('ICC_835', {
  deathrattle: (ctx: ActionContext) => {
    // Shuffle copy into both decks - simplified
  },
});

// ICC_050 - Strongshell Skardak
// Battlecry: Give your Taunt minions +2/+2
cardScriptsRegistry.register('ICC_050', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    for (const minion of field) {
      const buff = new Buff(source, minion, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// ICC_054 - Obsidian Statue
// Taunt. Deathrattle: Destroy a random enemy minion
cardScriptsRegistry.register('ICC_054', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const oppField = opponent?.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      const { Destroy } = require('../../../actions/destroy');
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
});

// ICC_079 - Gloom Stag
// Battlecry: If you have 2 other Beasts, give your minions +2/+2
cardScriptsRegistry.register('ICC_079', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Check if you have 2 other beasts - simplified
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    let beastCount = 0;
    for (const minion of field) {
      if ((minion as any).race === 'BEAST') {
        beastCount++;
      }
    }
    if (beastCount >= 2) {
      for (const minion of field) {
        const buff = new Buff(source, minion, { ATK: 2, HEALTH: 2 });
        buff.trigger(source);
      }
    }
  },
});

// ICC_085 - J الاكليل
cardScriptsRegistry.register('ICC_085', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Destroy a random enemy minion
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const oppField = opponent?.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      const { Destroy } = require('../../../actions/destroy');
      const destroy = new Destroy();
      destroy.trigger(source, target);
    }
  },
});

// ICC_832 - Malorne
// Deathrattle: Shuffle into your deck
cardScriptsRegistry.register('ICC_832', {
  play: (ctx: ActionContext) => {
    // Minion body - deathrattle handled by game
  },
});

// ICC_832a - Deathrattle: Summon a 5/5
cardScriptsRegistry.register('ICC_832a', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'ICC_832t');
    summon.trigger(ctx.source);
  },
});

// ICC_832b - Deathrattle: Restore 7 Health
cardScriptsRegistry.register('ICC_832b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hero = controller?.hero;
    if (hero) {
      const heal = new Heal(source, hero, 7);
      heal.trigger(source);
    }
  },
});

// ICC_832p - Dream
cardScriptsRegistry.register('ICC_832p', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// ICC_832pa - Dream (Return)
cardScriptsRegistry.register('ICC_832pa', {
});

// ICC_832pb - Dream (Draw)
cardScriptsRegistry.register('ICC_832pb', {
});
