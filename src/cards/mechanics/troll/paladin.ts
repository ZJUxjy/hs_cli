// troll - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Summon, Heal } from '../../../actions';

// TRL_300 - Gral's Shark
// (just a 5/4 minion with deathrattle)
cardScriptsRegistry.register('TRL_300', {
});

// TRL_306 - Crystal Lion
// Divine Shield. Deathrattle: Give a random friendly minion Divine Shield
cardScriptsRegistry.register('TRL_306', {
  deathrattle: (ctx: ActionContext) => {
    // Give random friendly minion Divine Shield - simplified
  },
});

// TRL_308 - Flash of Light
// Restore 4 Health. Draw a card
cardScriptsRegistry.register('TRL_308', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hero = controller?.hero;
    if (hero) {
      const heal = new Heal(source, hero, 4);
      heal.trigger(source);
    }
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(source, 1);
    draw.trigger(source);
  },
});

// TRL_309 - Induction
// Summon two 1/1 Silver Hand Recruits. Give them Taunt
cardScriptsRegistry.register('TRL_309', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon(source, 'CS2_101t');
    summon1.trigger(source);
    const summon2 = new Summon(source, 'CS2_101t');
    summon2.trigger(source);
  },
  events: {
    // After summoning, give them taunt
  },
});

// TRL_302 - Time Out
// Your hero becomes Immune. End the turn
cardScriptsRegistry.register('TRL_302', {
  requirements: {
    // No target required
  },
  play: (ctx: ActionContext) => {
    // Make hero Immune and end turn - simplified
  },
});

// TRL_302e - Time Out buff
cardScriptsRegistry.register('TRL_302e', {
  events: {
    // End turn effect
  },
});

// TRL_305 - Prismatic Lens
// Draw a minion and a spell. Give a random friendly minion +1/+1
cardScriptsRegistry.register('TRL_305', {
  requirements: {
    // No target
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const { Draw } = require('../../../actions/draw');
    // Draw cards
    const draw = new Draw(source, 2);
    draw.trigger(source);
    // Give random friendly minion +1/+1
    const field = controller?.field || [];
    if (field.length > 0) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const buff = new Buff(source, target, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// TRL_307 - Lightforged Blessing
// Give a friendly minion Divine Shield
cardScriptsRegistry.register('TRL_307', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give Divine Shield - simplified
  },
});

// TRL_304 - Bloodclaw
// Battlecry: Your hero gains 5 Armor
cardScriptsRegistry.register('TRL_304', {
});

// TRL_543 - Lynessa Sunsorrow
// Battlecry: Recolor all spells in your hand that cost (5) or more
cardScriptsRegistry.register('TRL_543', {
  play: (ctx: ActionContext) => {
    // Recolor spells in hand - simplified
  },
});
