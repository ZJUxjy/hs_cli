// outlands - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, Silence } from '../../../actions';
import { Race } from '../../../enums';

// BT_009 - Brazen Zealot - After you summon a minion, gain +1 Attack
cardScriptsRegistry.register('BT_009', {
});

// BT_019 - Salhet's Pride - Deathrattle: Draw two 1-Attack minions from your deck
cardScriptsRegistry.register('BT_019', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    const oneAttackMinions = deck.filter((c: any) =>
      (c as any).type === 'minion' && (c as any).attack === 1
    );

    for (let i = 0; i < 2 && oneAttackMinions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * oneAttackMinions.length);
      const card = oneAttackMinions[randomIndex];
      const giveAction = new Give(card.id);
      giveAction.trigger(ctx.source, controller);
    }
  },
});

// BT_019t - Pridemate (token from Salhet's Pride)
cardScriptsRegistry.register('BT_019t', {
  play: (ctx: ActionContext) => {
    // 1/1 minion
  },
});

// BT_020 - Hand of A'dal - Give a minion +2/+2. Draw a card
cardScriptsRegistry.register('BT_020', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
    const drawAction = new Draw(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// BT_020e - Hand of A'dal buff
cardScriptsRegistry.register('BT_020e', {
});

// BT_026 - Shotbot - Reborn
cardScriptsRegistry.register('BT_026', {
  play: (ctx: ActionContext) => {
    // 2/1 Reborn mech
  },
});

// BT_026e - Shotbot buff
cardScriptsRegistry.register('BT_026e', {
});

// BT_334 - Argent Braggart - Battlecry: Gain +1 Attack for each friendly minion
cardScriptsRegistry.register('BT_334', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const buffAmount = field.length;
    if (buffAmount > 0) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: buffAmount });
      buff.trigger(ctx.source);
    }
  },
});

// BT_011 - Lady Liadrin - Battlecry: Add a copy of each spell in your hand to your hand
cardScriptsRegistry.register('BT_011', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    for (const card of hand) {
      if ((card as any).type === 'spell') {
        const giveAction = new Give(card.id);
        giveAction.trigger(ctx.source, controller);
      }
    }
  },
});

// BT_011e - Liadrin's buff
cardScriptsRegistry.register('BT_011e', {
});

// BT_024 - Murgur Murgurgle - Divine Shield. Deathrattle: Summon a 1/1 Murgle
cardScriptsRegistry.register('BT_024', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Divine Shield is handled by game
  },
});

// BT_025 - Commencement - Summon a minion from your deck. Give it Taunt
cardScriptsRegistry.register('BT_025', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    const minions = deck.filter((c: any) => (c as any).type === 'minion');
    if (minions.length > 0) {
      const randomIndex = Math.floor(Math.random() * minions.length);
      const minion = minions[randomIndex];
      const summonAction = new Summon(ctx.source, minion.id);
      summonAction.trigger(ctx.source);

      // Give Taunt to the summoned minion
      const field = controller.field || [];
      if (field.length > 0) {
        const summonedMinion = field[field.length - 1];
        (summonedMinion as any).taunt = true;
      }
    }
  },
});

// BT_025e - Commencement buff
cardScriptsRegistry.register('BT_025e', {
  deathrattle: (ctx: ActionContext) => {
    // Return to hand
  },
});

// BT_292 - Blessing of Authority - Give a minion +8/+8
cardScriptsRegistry.register('BT_292', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 8, HEALTH: 8 });
      buff.trigger(ctx.source);
    }
  },
});

// BT_018 - High Exarch Yrel - Battlecry: Gain 3 Armor. Your other minions have 'Can't be targeted by spells or Hero Powers'
cardScriptsRegistry.register('BT_018', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // End of turn effect
    },
  },
});
