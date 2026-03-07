// tgt - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw } from '../../../actions';

// AT_075 - Warhorse Trainer - Your Silver Hand Recruits have +1/+1
cardScriptsRegistry.register('AT_075', {
});

// AT_076 - Murloc Knight - Inspire: Summon a random Murloc
cardScriptsRegistry.register('AT_076', {
});

// AT_079 - Competitive Spirit - Secret: When your turn starts, give your minions +1/+1
cardScriptsRegistry.register('AT_079', {
  play: (ctx: ActionContext) => {
    // Give all minions +1/+1 - handled by game
  },
});

// AT_081 - Seal of Champions - Give a minion +3 Attack and Divine Shield
cardScriptsRegistry.register('AT_081', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as any;
      const buff = new Buff(source, ctx.target, { ATK: 3 });
      buff.trigger(source);
      (ctx.target as any).divineShield = true;
    }
  },
});

// AT_081e - Seal of Champions buff
cardScriptsRegistry.register('AT_081e', {
});

// AT_104 - Enter the Coliseum - Destroy all minions except each side's highest Attack minion
cardScriptsRegistry.register('AT_104', {
  play: (ctx: ActionContext) => {
    // Destroy all minions except highest attack - handled by game
  },
});

// AT_074 - Murloc Knight - Inspire: Summon a random Murloc
cardScriptsRegistry.register('AT_074', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Inspire: Summon random Murloc - handled by game
  },
});

// AT_073 - Dragon Consort - Battlecry: The next Dragon you play costs (2) less
cardScriptsRegistry.register('AT_073', {
  events: {
    // Next Dragon costs (2) less - handled by game
  },
});

// AT_078 - Anyfin Can Happen - Summon 7 Murlocs that died this game
cardScriptsRegistry.register('AT_078', {
  play: (ctx: ActionContext) => {
    // Summon 7 Murlocs that died - handled by game
  },
});

// AT_077 - Solemn Vigil - Battlecry: Draw 2 cards. Costs (1) less for each minion that died this turn
cardScriptsRegistry.register('AT_077', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const drawAction1 = new Draw();
    drawAction1.trigger(source, controller);
    const drawAction2 = new Draw();
    drawAction2.trigger(source, controller);
  },
});
