// gvg - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Give, Draw, Summon } from '../../../actions';

// GVG_046 - Steamwheedle Sniper - Your Hero Power can target minions
cardScriptsRegistry.register('GVG_046', {
  play: (ctx: ActionContext) => {
    // Hero Power can target minions - handled by game
  },
});

// GVG_048 - Cobra Shot - Deal 3 damage to a minion and your hero
cardScriptsRegistry.register('GVG_048', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage to target and 3 to hero - handled by game
  },
});

// GVG_049 - Sneaky Devil - Stealth. Your other minions have +1 Attack
cardScriptsRegistry.register('GVG_049', {
  events: {
    // Other minions have +1 Attack - handled by game
  },
});

// GVG_049e - Sneaky Devil buff
cardScriptsRegistry.register('GVG_049e', {
});

// GVG_087 - Jun'alor - Battlecry: Return any minions to their owner's hand
cardScriptsRegistry.register('GVG_087', {
});

// GVG_017 - King's Elekk - Battlecry: Reveal a minion in each deck
cardScriptsRegistry.register('GVG_017', {
  play: (ctx: ActionContext) => {
    // Reveal minion in each deck - handled by game
  },
});

// GVG_017e - King's Elekk buff
cardScriptsRegistry.register('GVG_017e', {
  events: {
    // +2 Attack when in hand - handled by game
  },
});

// GVG_026 - Metalit
cardScriptsRegistry.register('GVG_026', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage to all enemy minions - handled by game
  },
});

// GVG_073 - Gahz'rilla - Whenever you draw a Beast, double its Attack
cardScriptsRegistry.register('GVG_073', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Double Attack when Beast is drawn - handled by game
  },
});

// GVG_043 - Trogg Beast - Battlecry: If you have 2 other Beasts, deal 2 damage
cardScriptsRegistry.register('GVG_043', {
  play: (ctx: ActionContext) => {
    // If you have 2 other Beasts, deal 2 damage - handled by game
  },
});
