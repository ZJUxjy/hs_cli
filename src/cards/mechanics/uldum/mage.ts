// uldum - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give, Freeze } from '../../../actions';

// ULD_236 - Arcane Flakmage - After you play a spell, deal 2 damage to your hero
cardScriptsRegistry.register('ULD_236', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      if (controller.hero) {
        const damage = new Damage(ctx.source, controller.hero, 2);
        damage.trigger(ctx.source);
      }
    },
  },
});

// ULD_238 - Ancient Mysteries - Draw 2 secrets from your deck
cardScriptsRegistry.register('ULD_238', {
  play: (ctx: ActionContext) => {
    // Draw 2 random secrets - simplified to regular draw
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// ULD_240 - Dune Sculptor - After you cast a spell, add a random Elemental to your hand
cardScriptsRegistry.register('ULD_240', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      // Add random elemental - placeholder
    },
  },
});

// ULD_293 - Flame Ward - Secret: When a friendly minion is attacked, deal 3 damage to all enemies
cardScriptsRegistry.register('ULD_293', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 3);
      damage.trigger(ctx.source);
    }
  },
});

// ULD_329 - Reno Jackson - Battlecry: If your deck has no duplicates, fully heal your hero
cardScriptsRegistry.register('ULD_329', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      const maxHealth = controller.hero.maxHealth || 30;
      const currentHealth = controller.hero.health || 30;
      const missingHealth = maxHealth - currentHealth;
      if (missingHealth > 0) {
        const { Heal } = require('../../../actions/heal');
        const heal = new Heal(missingHealth);
        heal.trigger(ctx.source, controller.hero);
      }
    }
  },
});

// ULD_435 - Puzzle Box of Yogg-Saron - Cast a random spell 10 times
cardScriptsRegistry.register('ULD_435', {
  play: (ctx: ActionContext) => {
    // Cast random spells 10 times - handled by game
  },
});

// ULD_435e - Puzzle Box Enchantment
cardScriptsRegistry.register('ULD_435e', {
});

// ULD_216 - Cloud Prince - Battlecry: Deal 3 damage
cardScriptsRegistry.register('ULD_216', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// ULD_239 - Reno Jackson - Battlecry: If your deck has no duplicates, fully heal your hero
cardScriptsRegistry.register('ULD_239', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      const maxHealth = controller.hero.maxHealth || 30;
      const currentHealth = controller.hero.health || 30;
      const missingHealth = maxHealth - currentHealth;
      if (missingHealth > 0) {
        const { Heal } = require('../../../actions/heal');
        const heal = new Heal(missingHealth);
        heal.trigger(ctx.source, controller.hero);
      }
    }
  },
});

// ULD_433 - Sir Finley Mrrgl - Battlecry: Discover a new Hero Power
cardScriptsRegistry.register('ULD_433', {
});

// ULD_433p - Hero Power
cardScriptsRegistry.register('ULD_433p', {
});

// ULD_433e - Finley's Adventure Buff
cardScriptsRegistry.register('ULD_433e', {
});

// ULD_726 - Tropical Fish - Battlecry: Deal 3 damage
cardScriptsRegistry.register('ULD_726', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// ULD_726e - Tropical Fish Enchantment
cardScriptsRegistry.register('ULD_726e', {
});
