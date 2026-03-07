// gvg - spare_parts.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Heal, Give, Draw } from '../../../actions';

// PART_001 - Armor Plating - Give a minion +1 Health
cardScriptsRegistry.register('PART_001', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as any;
      const buff = new Buff(source, ctx.target, { HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// PART_002 - Time Rewinder - Return a friendly minion to your hand
cardScriptsRegistry.register('PART_002', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as any;
      const controller = source.controller;
      const cardId = ctx.target.id;
      const giveAction = new Give(cardId);
      giveAction.trigger(source, controller);
    }
  },
});

// PART_003 - Rusty Horn - Give a minion Taunt
cardScriptsRegistry.register('PART_003', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).taunt = true;
    }
  },
});

// PART_004 - Finicky Cloakfield - Give a minion Stealth until your next turn
cardScriptsRegistry.register('PART_004', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).stealth = true;
    }
  },
});

// PART_004e - Cloakfield
cardScriptsRegistry.register('PART_004e', {
  events: {
    // Stealth until next turn - handled by game
  },
});

// PART_005 - Reverse Damage - Prevent the next 1 damage dealt to a character
cardScriptsRegistry.register('PART_005', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Prevent next 1 damage - handled by game
  },
});

// PART_006 - Shielded Minibot - Give a minion +2 Attack
cardScriptsRegistry.register('PART_006', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as any;
      const buff = new Buff(source, ctx.target, { ATK: 2 });
      buff.trigger(source);
    }
  },
});

// PART_007 - Unknown - (Unused)
cardScriptsRegistry.register('PART_007', {
  play: (ctx: ActionContext) => {
    // Unused spare part
  },
});
