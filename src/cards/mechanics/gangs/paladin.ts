// gangs - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw } from '../../../actions';

// CFM_062 - Grimestreet Protector - Battlecry: Give adjacent minions Divine Shield
cardScriptsRegistry.register('CFM_062', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = (controller as any)?.field || [];
    const idx = field.indexOf(source);
    // Give Divine Shield to adjacent minions
    if (idx > 0) {
      const leftMinion = field[idx - 1];
      const buff = new Buff(source, leftMinion, { divineShield: true });
      buff.trigger(source);
    }
    if (idx < field.length - 1) {
      const rightMinion = field[idx + 1];
      const buff = new Buff(source, rightMinion, { divineShield: true });
      buff.trigger(source);
    }
  },
});

// CFM_639 - Grimestreet Enforcer - At the end of your turn, give all minions in your hand +1/+1
cardScriptsRegistry.register('CFM_639', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      const hand = controller?.hand || [];
      const minionsInHand = hand.filter((c: any) => c?.type === 'minion');
      for (const minion of minionsInHand) {
        const buff = new Buff(source, minion, { ATK: 1, HEALTH: 1 });
        buff.trigger(source);
      }
    },
  },
});

// CFM_650 - Grimscale Chum - Battlecry: Give all Murlocs in your hand +1/+1
cardScriptsRegistry.register('CFM_650', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
    const murlocsInHand = hand.filter((c: any) => c?.race === 'murloc');
    for (const murloc of murlocsInHand) {
      const buff = new Buff(source, murloc, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// CFM_753 - Grimestreet Outfitter - Battlecry: Give all minions in your hand +1/+1
cardScriptsRegistry.register('CFM_753', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
    const minionsInHand = hand.filter((c: any) => c?.type === 'minion');
    for (const minion of minionsInHand) {
      const buff = new Buff(source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// CFM_759 - Meanstreet Marshal - Deathrattle: If this minion has 2 or more Attack, draw a card
cardScriptsRegistry.register('CFM_759', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const atk = source?.atk || source?.attack || 0;
    if (atk >= 2) {
      const draw = new Draw((source as any).controller);
      draw.trigger(source);
    }
  },
});

// CFM_305 - Smuggler's Run - Battlecry: Give all minions in your hand +1/+1
cardScriptsRegistry.register('CFM_305', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
    const minionsInHand = hand.filter((c: any) => c?.type === 'minion');
    for (const minion of minionsInHand) {
      const buff = new Buff(source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// CFM_800
cardScriptsRegistry.register('CFM_800', {
});

// CFM_905 - Small-Time Recruits - Battlecry: Draw three 1-Cost minions from your deck
cardScriptsRegistry.register('CFM_905', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const deck = controller?.deck || [];
    // Find 1-cost minions in deck
    const oneCostMinions = deck.filter((c: any) => c?.type === 'minion' && (c?.cost === 1 || c?.mana === 1));
    for (let i = 0; i < 3 && i < oneCostMinions.length; i++) {
      const draw = new Draw(controller);
      draw.trigger(source);
    }
  },
});
