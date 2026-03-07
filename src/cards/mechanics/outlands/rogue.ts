// outlands - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, Freeze } from '../../../actions';
import { Race } from '../../../enums';

// BT_188 - Shadow Hunter - Battlecry: Deal 3 damage to a minion
cardScriptsRegistry.register('BT_188', {
  events: {
    // Battlecry handled
  },
});

// BT_702 - Blackjack Stunner - Battlecry: Freeze a minion
cardScriptsRegistry.register('BT_702', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const freezeAction = new Freeze();
      freezeAction.trigger(ctx.source, ctx.target);
    }
  },
});

// BT_703 - Stoneborn General - Deathrattle: Give your hero +3 Attack this game
cardScriptsRegistry.register('BT_703', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const buff = new Buff(ctx.source, controller.hero, { ATK: 3 });
    buff.trigger(ctx.source);
  },
});

// BT_710 - Stowaway - Battlecry: Draw 2 cards
cardScriptsRegistry.register('BT_710', {
  play: (ctx: ActionContext) => {
    const drawAction1 = new Draw(ctx.source);
    drawAction1.trigger(ctx.source);
    const drawAction2 = new Draw(ctx.source);
    drawAction2.trigger(ctx.source);
  },
});

// BT_711 - Shadow Sculptor - Battlecry: If you're holding a Dragon, draw 2 cards
cardScriptsRegistry.register('BT_711', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const hasDragon = hand.some((c: any) => (c as any).race === Race.DRAGON);
    if (hasDragon) {
      const drawAction1 = new Draw(ctx.source);
      drawAction1.trigger(ctx.source);
      const drawAction2 = new Draw(ctx.source);
      drawAction2.trigger(ctx.source);
    }
  },
});

// BT_711e - Shadow Sculptor buff
cardScriptsRegistry.register('BT_711e', {
  events: {
    // Ongoing buff
  },
});

// BT_713 - Akama - Deathrattle: Return to your hand
cardScriptsRegistry.register('BT_713', {
  deathrattle: (ctx: ActionContext) => {
    // Return to hand - handled by game
  },
});

// BT_713t - Shade (token)
cardScriptsRegistry.register('BT_713t', {
});

// BT_042 - Crazed Chemist - Battlecry: Give a friendly minion +4 Attack
cardScriptsRegistry.register('BT_042', {
});

// BT_707 - Shield of Galakrond - Battlecry: Give +1 Attack to all minions in your hand
cardScriptsRegistry.register('BT_707', {
});

// BT_709 - Togwaggle's Scheme - Choose a minion. Shuffle 5 copies into your deck
cardScriptsRegistry.register('BT_709', {
});
