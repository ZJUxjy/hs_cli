// icecrown - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Heal } from '../../../actions';

// ICC_210 - Shadow Ascendant - Whenever you heal a minion, give it +2 Attack
cardScriptsRegistry.register('ICC_210', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      // Check if damage was healed - would need more complex logic
    },
  },
});

// ICC_214 - Obsidian Statue - Deathrattle: Summon a 3/3 copy
cardScriptsRegistry.register('ICC_214', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const cardId = source.id;
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(cardId);
    summonAction.trigger(ctx.source);
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

// ICC_207 - Crypt Keeper - Battlecry: Shuffle 3蜜獾 into your deck
cardScriptsRegistry.register('ICC_207', {
  play: (ctx: ActionContext) => {
    const { Shuffle } = require('../../../actions/shuffle');
    const shuffleAction = new Shuffle('ICC_207t');
    shuffleAction.trigger(ctx.source);
    shuffleAction.trigger(ctx.source);
    shuffleAction.trigger(ctx.source);
  },
});

// ICC_213 - Eternal Servitude - Discover a friendly minion that died this game. Summon it
cardScriptsRegistry.register('ICC_213', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Discover and summon - placeholder
  },
});

// ICC_235 - Obsidian Statue - Taunt. Deathrattle: Summon a 3/3 copy
cardScriptsRegistry.register('ICC_235', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('ICC_235t');
    summonAction.trigger(ctx.source);
  },
});

// ICC_235e - Stone Wall Enchantment
cardScriptsRegistry.register('ICC_235e', {
});

// ICC_802 - Spawn of Shadows - Inspire: Deal 4 damage to each hero
cardScriptsRegistry.register('ICC_802', {
  inspire: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage both heroes
    if (controller.hero) {
      const damage = new Damage(ctx.source, controller.hero, 4);
      damage.trigger(ctx.source);
    }
    if (opponent.hero) {
      const damage = new Damage(ctx.source, opponent.hero, 4);
      damage.trigger(ctx.source);
    }
  },
});

// ICC_849 - Mind Control - Take control of an enemy minion
cardScriptsRegistry.register('ICC_849', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_ENEMY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      // Remove from opponent's field
      const oppField = opponent.field || [];
      const index = oppField.indexOf(target);
      if (index > -1) {
        oppField.splice(index, 1);
      }
      // Add to controller's field
      if (!controller.field) controller.field = [];
      controller.field.push(target);
      target.controller = controller;
    }
  },
});

// ICC_849e - Mind Control Enchantment
cardScriptsRegistry.register('ICC_849e', {
});

// ICC_830 - Shadowreaper Anduin - Battlecry: Destroy all enemy minions with 5 or more Attack
cardScriptsRegistry.register('ICC_830', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const attack = minion.attack || 0;
      if (attack >= 5) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// ICC_830p - Void Form (Hero Power)
cardScriptsRegistry.register('ICC_830p', {
});

// ICC_839 - Shadowreaper Anduin (Death Knight)
cardScriptsRegistry.register('ICC_839', {
  play: (ctx: ActionContext) => {
    // Battlecry: Destroy all enemy minions with 5 or more Attack
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const attack = minion.attack || 0;
      if (attack >= 5) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// ICC_308 - Psychic Scream - Shuffle all minions into your opponent's deck
cardScriptsRegistry.register('ICC_308', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];
    // Shuffle all minions to opponent's deck
    for (const minion of [...myField, ...oppField]) {
      const cardId = (minion as any).id;
      minion.zone = 'DECK';
    }
  },
});

// ICC_317 - Eternal Elite - Battlecry: Give a friendly minion +4/+4
cardScriptsRegistry.register('ICC_317', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 4, HEALTH: 4 });
      buff.trigger(ctx.source);
    }
  },
});
