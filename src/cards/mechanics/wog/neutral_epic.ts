// wog - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon } from '../../../actions';

// OG_173 - Nerubian Prophet - At the start of your turn, reduce this card's cost by (1)
cardScriptsRegistry.register('OG_173', {
  events: {
  },
});

// OG_200 - Shudderwraith - Enrage: +2 Attack
cardScriptsRegistry.register('OG_200', {
  events: {
  },
});

// OG_200e
cardScriptsRegistry.register('OG_200e', {
});

// OG_271 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('OG_271', {
  events: {
  },
});

// OG_271e
cardScriptsRegistry.register('OG_271e', {
});

// OG_272 - Scaled Nightmare - At the end of your turn, double this minion's Attack
cardScriptsRegistry.register('OG_272', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_290 - Shudderwraith - Taunt. Deathrattle: Deal 2 damage to all other minions
cardScriptsRegistry.register('OG_290', {
  events: {
  },
});

// OG_337 - Corrupted Hogger - Taunt. At the end of your turn, summon a 2/2 Gnoll
cardScriptsRegistry.register('OG_337', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summonAction = new Summon(source, 'OG_337t');
    summonAction.trigger(source);
  },
});

// OG_102 - Shadow Word: Horror - Destroy all minions with 2 or less Attack
cardScriptsRegistry.register('OG_102', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      if ((minion as any).attack <= 2) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// OG_102e
cardScriptsRegistry.register('OG_102e', {
});

// OG_174 - Possessed Lackey - Deathrattle: Recruit a Demon
cardScriptsRegistry.register('OG_174', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// OG_174e
cardScriptsRegistry.register('OG_174e', {
});

// OG_321 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('OG_321', {
  events: {
  },
});
