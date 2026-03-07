// gangs - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give, Freeze } from '../../../actions';

// CFM_066 - Potion of Polymorph - Secret: After your opponent plays a minion, transform it into a 1/1 Sheep
cardScriptsRegistry.register('CFM_066', {
  play: (ctx: ActionContext) => {
    // Secret effect - handled by game
  },
});

// CFM_660 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('CFM_660', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
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

// CFM_671 - Kazakus - Battlecry: Make a Legendary minion
cardScriptsRegistry.register('CFM_671', {
  play: (ctx: ActionContext) => {
    // Make a potion - handled by game
  },
});

// CFM_687 - Cryomancer - Battlecry: Gain +2/+2 if your hero has 5 or more Armor
cardScriptsRegistry.register('CFM_687', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const armor = controller.hero?.armor || 0;
    if (armor >= 5) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// CFM_687e - Cryomancer Enchantment
cardScriptsRegistry.register('CFM_687e', {
});

// CFM_760 - Jinyu Waterspeaker - Battlecry: Restore 6 Health
cardScriptsRegistry.register('CFM_760', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(6);
      heal.trigger(ctx.source, ctx.target);
    }
  },
});

// CFM_021 - Frostbolt - Deal 3 damage and Freeze
cardScriptsRegistry.register('CFM_021', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
      (ctx.target as any).frozen = true;
    }
  },
});

// CFM_065 - Volcanic Potion - Deal 2 damage to all minions
cardScriptsRegistry.register('CFM_065', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
  },
});

// CFM_620 - Reno Jackson - Battlecry: If your deck has no duplicates, fully heal your hero
cardScriptsRegistry.register('CFM_620', {
  play: (ctx: ActionContext) => {
    // Check for no duplicates - would need game state
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

// CFM_623 - Kazakus - Make a 1, 5, or 10 cost potion
cardScriptsRegistry.register('CFM_623', {
  play: (ctx: ActionContext) => {
    // Make a potion - handled by game
  },
});
