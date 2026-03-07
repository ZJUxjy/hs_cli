// boomsday - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Heal, Buff, Summon, Damage } from '../../../actions';

// BOT_216 - Giggling Inventor
// Battlecry: Summon two 2/3 Amalgams with Taunt
cardScriptsRegistry.register('BOT_216', {
  play: (ctx: ActionContext) => {
    const summonAction1 = new Summon(ctx.source, 'BOT_216t');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon(ctx.source, 'BOT_216t');
    summonAction2.trigger(ctx.source);
  },
});

// BOT_258 - Test Subject
// Deathrattle: Return any spells you played on this minion to your hand
cardScriptsRegistry.register('BOT_258', {
  deathrattle: (ctx: ActionContext) => {
    // Return spells to hand - handled by game
  },
  events: {
    // Return spells to hand - handled by game
  },
});

// BOT_258e
cardScriptsRegistry.register('BOT_258e', {
});

// BOT_509 - Reckless Experimenter
// Deathrattle: Draw a minion from your deck
cardScriptsRegistry.register('BOT_509', {
  deathrattle: (ctx: ActionContext) => {
    // Draw a minion from deck - handled by game
  },
});

// BOT_558 - Zerek's Cloning Gallery
// Deathrattle: Summon a 1/1 copy of each minion in your deck
cardScriptsRegistry.register('BOT_558', {
  events: {
    // Summon copies - handled by game
  },
});

// BOT_558e
cardScriptsRegistry.register('BOT_558e', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// BOT_566 - Lady in White
// Battlecry: Cast "For each minion in your deck, give +1/+1"
cardScriptsRegistry.register('BOT_566', {
  events: {
    // Handled by game
  },
});

// BOT_566e
cardScriptsRegistry.register('BOT_566e', {
  events: {
    // Handled by game
  },
});

// BOT_219 - Extra Arms
// Battlecry: Give a minion +2/+2. Give it +2/+2 more
cardScriptsRegistry.register('BOT_219', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (!ctx.target) return;
    const source = ctx.source;
    const target = ctx.target;
    const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
    buff.trigger(source);
  },
});

// BOT_219t - More Arms!
cardScriptsRegistry.register('BOT_219t', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Give +2/+2 more - handled by game
  },
});

// BOT_435 - The Bot
// Battlecry: Restore 3 Health to your hero
cardScriptsRegistry.register('BOT_435', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    if (!controller?.hero) return;

    const heal = new Heal(source, controller.hero, 3);
    heal.trigger(source);
  },
});

// BOT_517 - Coffin Crasher
// Deathrattle: Summon a random Deathrattle minion from your hand
cardScriptsRegistry.register('BOT_517', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Summon random deathrattle minion - handled by game
  },
});

// BOT_529 - Obsidian Statue
// Taunt. Deathrattle: Deal 3 damage to all minions
cardScriptsRegistry.register('BOT_529', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Taunt - handled by game
  },
});

// BOT_529e
cardScriptsRegistry.register('BOT_529e', {
});

// BOT_567 - Reckless Experimenter
// Deathrattle: Draw a minion from your deck
cardScriptsRegistry.register('BOT_567', {
  play: (ctx: ActionContext) => {
    // Deathrattle - handled by game
  },
});

// BOT_567e
cardScriptsRegistry.register('BOT_567e', {
});
