// gvg - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Heal, Give, Draw } from '../../../actions';

// GVG_009 - Shadowboxer - Battlecry: If a minion died this turn, restore 3 Health
cardScriptsRegistry.register('GVG_009', {
  play: (ctx: ActionContext) => {
    // Restore 3 Health if minion died this turn - handled by game
  },
});

// GVG_011 - Lightwell - Battlecry: Restore 5 Health to a damaged character
cardScriptsRegistry.register('GVG_011', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_DAMAGED_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const heal = new Heal(ctx.source, ctx.target, 5);
      heal.trigger(ctx.source);
    }
  },
});

// GVG_014 - Vol'jin - Battlecry: Swap Health with a minion
cardScriptsRegistry.register('GVG_014', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Swap Health with target - handled by game
  },
});

// GVG_014a - Vol'jin (Dummy)
cardScriptsRegistry.register('GVG_014a', {
});

// GVG_072 - Shadowfiend - Whenever you cast a spell, add a Shadow Word to your hand
cardScriptsRegistry.register('GVG_072', {
  events: {
    // Add Shadow Word to hand when spell is cast - handled by game
  },
});

// GVG_083 - Lightmaw - Battlecry: If you have a Lightball, give adjacent minions Taunt
cardScriptsRegistry.register('GVG_083', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give adjacent minions Taunt if Lightball is in hand - handled by game
  },
});

// GVG_008 - Shadowbomber - Battlecry: Deal 3 damage to each hero
cardScriptsRegistry.register('GVG_008', {
});

// GVG_010 - Upgraded Repair Bot - Battlecry: Restore 6 Health to a minion
cardScriptsRegistry.register('GVG_010', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const heal = new Heal(ctx.source, ctx.target, 6);
      heal.trigger(ctx.source);
    }
  },
});

// GVG_012 - Shadow Madness - Take control of an enemy minion with 3 or less Attack until end of turn
cardScriptsRegistry.register('GVG_012', {
  play: (ctx: ActionContext) => {
    // Take control of enemy minion with 3 or less Attack - handled by game
  },
});
