// icecrown - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle } from '../../../actions';
import { Entity } from '../../../core/entity';

// ICC_068 Frozen Clone - After your opponent plays a minion, copy it
cardScriptsRegistry.register('ICC_068', {
  events: {
    PLAY: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.source) {
        const source = event.source as Entity;
        const controller = (source as any).controller;
        const currentPlayer = (ctx.source as any).controller;
        // If it's opponent's minion, add copy to hand
        if (controller === currentPlayer.opponent) {
          const cardId = (source as any).id;
          const giveAction = new Give(cardId);
          giveAction.trigger(ctx.source, currentPlayer);
        }
      }
    },
  },
});

// ICC_069 Doomed Apprentice - Battlecry: Your opponent's spells cost (1) more
cardScriptsRegistry.register('ICC_069', {
  play: (ctx: ActionContext) => {
    // Would need aura implementation for spell cost increase
  },
});

// ICC_083 Coldwraith - Battlecry: If an enemy is Frozen, draw a card
cardScriptsRegistry.register('ICC_083', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    // Check if any enemy minion is frozen
    for (const minion of field) {
      if ((minion as any).frozen) {
        const drawAction = new Draw(ctx.source);
        drawAction.trigger(ctx.source);
        break;
      }
    }
  },
});

// ICC_252 Glacial Shard - Battlecry: Freeze an enemy
cardScriptsRegistry.register('ICC_252', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).frozen = true;
    }
  },
});

// ICC_838 Simulacrum - Copy your lowest Cost minion
cardScriptsRegistry.register('ICC_838', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller.field || [];
    if (field.length === 0) return;
    // Find lowest cost minion
    let lowestCost = Infinity;
    let lowestMinion = null;
    for (const minion of field) {
      const cost = (minion as any).cost || 0;
      if (cost < lowestCost) {
        lowestCost = cost;
        lowestMinion = minion;
      }
    }
    if (lowestMinion) {
      const cardId = (lowestMinion as any).id;
      const giveAction = new Give(cardId);
      giveAction.trigger(ctx.source, controller);
    }
  },
});

// ICC_838t - The crypt lord token
cardScriptsRegistry.register('ICC_838t', {
});

// ICC_082 Ice Walker - Your Hero Power also Freezes
cardScriptsRegistry.register('ICC_082', {
});

// ICC_086 Sindragosa - Battlecry: Freeze random enemy Minions
cardScriptsRegistry.register('ICC_086', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    // Freeze 2 random enemy minions
    const targets = [...field].sort(() => Math.random() - 0.5).slice(0, 2);
    for (const target of targets) {
      (target as any).frozen = true;
    }
  },
});

// ICC_823 Frost Lich Jaina - Battlecry: Summon a 3/6 Water Elemental
cardScriptsRegistry.register('ICC_823', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('ICC_823t');
    summon.trigger(ctx.source);
  },
});

// ICC_836 Frostbolt Volley - Deal 3 damage to 3 random enemy minions
cardScriptsRegistry.register('ICC_836', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    if (field.length === 0) return;
    // Deal 3 damage to 3 random enemy minions
    const targets = [...field].sort(() => Math.random() - 0.5).slice(0, 3);
    for (const target of targets) {
      const damage = new Damage(source, target, 3);
      damage.trigger(source);
    }
  },
});

// ICC_836p
cardScriptsRegistry.register('ICC_836p', {
});

// ICC_833 - Frost Lich Jaina - Hero Card
cardScriptsRegistry.register('ICC_833', {
  play: (ctx: ActionContext) => {
    // Hero card - would need special handling
    // Battlecry: Summon a 3/6 Water Elemental
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('ICC_823t');
    summon.trigger(ctx.source);
  },
});

// ICC_833h - Frost Lich Jaina (Hero Power)
cardScriptsRegistry.register('ICC_833h', {
});

// ICC_833t - Water Elemental
cardScriptsRegistry.register('ICC_833t', {
});

// ICC_833e - Lethal Enchantment
cardScriptsRegistry.register('ICC_833e', {
});

// ICC_314 - Anomalus - Battlecry: Deal 6 damage to all minions
cardScriptsRegistry.register('ICC_314', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      const damage = new Damage(ctx.source, minion, 6);
      damage.trigger(ctx.source);
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 6);
      damage.trigger(ctx.source);
    }
  },
});

// ICC_215 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('ICC_215', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all other friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(ctx.source, minion, 2);
        damage.trigger(ctx.source);
      }
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
  },
});
