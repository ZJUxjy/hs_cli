// tgt - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give } from '../../../actions';

// AT_011 - Spawn of Shadows - Inspire: Deal 4 damage to your hero
cardScriptsRegistry.register('AT_011', {
  events: {
    // Inspire: Deal 4 damage to your hero - handled by game
  },
});

// AT_012 - Holy Champion - Inspire: Restore 3 Health to your hero
cardScriptsRegistry.register('AT_012', {
});

// AT_014 - Shadowfiend - Whenever you cast a spell, add a Shadow Word to your hand
cardScriptsRegistry.register('AT_014', {
  events: {
    // Add Shadow Word to hand when spell is cast - handled by game
  },
});

// AT_014e - Shadowfiend buff
cardScriptsRegistry.register('AT_014e', {
  events: {
    // Gains +2/+2 when spell is cast - handled by game
  },
});

// AT_018 - Confessor Paletress - Inspire: Summon a random Legendary minion
cardScriptsRegistry.register('AT_018', {
});

// AT_116 - Power Word: Glory - Choose a minion. Whenever it attacks, restore 4 Health to your hero
cardScriptsRegistry.register('AT_116', {
  play: (ctx: ActionContext) => {
    // Give target +1 Attack and lifesteal - handled by game
  },
});

// AT_013 - Convert - Put a copy of an enemy minion into your hand
cardScriptsRegistry.register('AT_013', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as any;
      const controller = source.controller;
      const cardId = (ctx.target as any).id;
      const giveAction = new Give(cardId);
      giveAction.trigger(source, controller);
    }
  },
});

// AT_013e - Power Word: Glory buff
cardScriptsRegistry.register('AT_013e', {
  events: {
    // Gains +1 Attack - handled by game
  },
});

// AT_015 - Shadow Word: Horror - Destroy all minions with 2 or less Attack
cardScriptsRegistry.register('AT_015', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Destroy all minions with 2 or less Attack - handled by game
  },
});

// AT_016 - Embrace the Shadow - Your healing effects also deal that much damage to the enemy hero
cardScriptsRegistry.register('AT_016', {
  play: (ctx: ActionContext) => {
    // Your healing also damages enemy hero - handled by game
  },
});

// AT_055 - Confessor Paletress - Inspire: Summon a random Legendary minion
cardScriptsRegistry.register('AT_055', {
  play: (ctx: ActionContext) => {
    // Summon random Legendary minion - handled by game
  },
});
