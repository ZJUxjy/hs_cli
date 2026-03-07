// witchwood - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// GIL_634 - Bellringer Sentry - Battlecry and Deathrattle: Put a Secret from your deck into the battlefield.
cardScriptsRegistry.register('GIL_634', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];

    // Find a secret in deck
    const secret = deck.find((c: any) => c.type === 'SPELL' && c.secret);
    if (secret) {
      // Put secret into battlefield - simplified
    }
  },
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];

    // Find a secret in deck
    const secret = deck.find((c: any) => c.type === 'SPELL' && c.secret);
    if (secret) {
      // Put secret into battlefield - simplified
    }
  },
});

// GIL_635 - Cathedral Gargoyle - Battlecry: If you're holding a Dragon, gain Taunt and Divine Shield.
cardScriptsRegistry.register('GIL_635', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];

    // Check if holding a Dragon
    const hasDragon = hand.some((card: any) => card.race === 'DRAGON');
    if (hasDragon) {
      source.taunt = true;
      source.divineShield = true;
    }
  },
});

// GIL_685
cardScriptsRegistry.register('GIL_685', {
});

// GIL_694 - Prince Liam - Battlecry: Transform all 1-Cost cards in your deck into Legendary minions.
cardScriptsRegistry.register('GIL_694', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const deck = controller.deck || [];

    // Transform all 1-cost cards into legendary minions - simplified
    // In full implementation, would transform cards
  },
});

// GIL_817 - Ghost Chaser - Battlecry: Restore 3 Health to your hero
cardScriptsRegistry.register('GIL_817', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const opponent = controller.opponent;
      const enemyField = opponent.field || [];
      const deathrattleMinions = enemyField.filter((m: any) => m.deathrattle);
      if (deathrattleMinions.length > 0) {
        const heal = new Heal(source, controller.hero, 3);
        heal.trigger(source);
      }
    },
  },
});

// GIL_145 - Sound the Bells! - Echo. Give a minion +1/+2.
cardScriptsRegistry.register('GIL_145', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;

    // Give +1/+2
    const { Buff } = require('../../../actions/buff');
    const buff = new Buff(source, 'GIL_145e');
    buff.setTag('ATK', 1);
    buff.setTag('HEALTH', 2);
    buff.apply(target);
  },
});

// GIL_203 - Rebuke - Enemy spells cost (5) more next turn.
cardScriptsRegistry.register('GIL_203', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;

    // Enemy spells cost (5) more next turn - simplified
    // In full implementation, would apply aura
  },
});

// GIL_203e
cardScriptsRegistry.register('GIL_203e', {
});

// GIL_903
cardScriptsRegistry.register('GIL_903', {
});

// GIL_596 - Paragon of Light - While this minion has 3 or more Attack, it has Lifesteal
cardScriptsRegistry.register('GIL_596', {
});
