// classic - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CS2_181 - Injured Blademaster - Battlecry: Deal 4 damage to HIMSELF
cardScriptsRegistry.register('CS2_181', {
  play: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 4);
    damage.trigger(ctx.source);
  },
});

// EX1_001 - Lightwarden - Whenever a character is healed, gain +2 Attack
cardScriptsRegistry.register('EX1_001', {
  events: {
    HEAL: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 1) + 2;
    },
  },
});

// EX1_004 - Young Priestess - At the end of your turn, give another random friendly minion +1 Health
cardScriptsRegistry.register('EX1_004', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const friendlyMinions = (controller.field || []).filter((m: any) => m !== ctx.source);
      if (friendlyMinions.length > 0) {
        const randomIndex = Math.floor(Math.random() * friendlyMinions.length);
        const target = friendlyMinions[randomIndex];
        const { Buff } = require('../../../actions/buff');
        const buff = new Buff('EX1_004e', { HEALTH: 1 });
        buff.trigger(ctx.source, target);
      }
    },
  },
});

// EX1_006 - Alarm-o-Bot - At the start of your turn, swap this minion with a random one in your hand
cardScriptsRegistry.register('EX1_006', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const hand = controller.hand || [];
      const friendlyMinions = hand.filter((c: any) => c.type === 'minion');
      if (friendlyMinions.length > 0) {
        const randomIndex = Math.floor(Math.random() * friendlyMinions.length);
        // Swap logic would go here - simplified: just return the minion to hand
      }
    },
  },
});

// EX1_009
cardScriptsRegistry.register('EX1_009', {
});

// EX1_043 - Twilight Drake - Battlecry: Gain +1 Health for each card in your hand
cardScriptsRegistry.register('EX1_043', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const handSize = (controller.hand || []).length;
    const source = ctx.source as any;
    source.health = (source.health || 4) + handSize;
    source.maxHealth = (source.maxHealth || 4) + handSize;
  },
});

// EX1_044 - Questing Adventurer - Whenever you play a card, gain +1/+1
cardScriptsRegistry.register('EX1_044', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 2) + 1;
      source.health = (source.health || 2) + 1;
    },
  },
});

// EX1_050
cardScriptsRegistry.register('EX1_050', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_055
cardScriptsRegistry.register('EX1_055', {
  events: {
    // TODO: implement events
  },
});

// EX1_058
cardScriptsRegistry.register('EX1_058', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_059
cardScriptsRegistry.register('EX1_059', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_076
cardScriptsRegistry.register('EX1_076', {
});

// EX1_080
cardScriptsRegistry.register('EX1_080', {
  events: {
    // TODO: implement events
  },
});

// EX1_085
cardScriptsRegistry.register('EX1_085', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_089
cardScriptsRegistry.register('EX1_089', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_093
cardScriptsRegistry.register('EX1_093', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_095
cardScriptsRegistry.register('EX1_095', {
  events: {
    // TODO: implement events
  },
});

// EX1_097
cardScriptsRegistry.register('EX1_097', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// EX1_103
cardScriptsRegistry.register('EX1_103', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_284
cardScriptsRegistry.register('EX1_284', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_509
cardScriptsRegistry.register('EX1_509', {
  events: {
    // TODO: implement events
  },
});

// EX1_584
cardScriptsRegistry.register('EX1_584', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_597
cardScriptsRegistry.register('EX1_597', {
  events: {
    // TODO: implement events
  },
});

// EX1_616
cardScriptsRegistry.register('EX1_616', {
});

// NEW1_019
cardScriptsRegistry.register('NEW1_019', {
  events: {
    // TODO: implement events
  },
});

// NEW1_020
cardScriptsRegistry.register('NEW1_020', {
  events: {
    // TODO: implement events
  },
});

// NEW1_025
cardScriptsRegistry.register('NEW1_025', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// NEW1_026
cardScriptsRegistry.register('NEW1_026', {
  events: {
    // TODO: implement events
  },
});

// NEW1_037
cardScriptsRegistry.register('NEW1_037', {
  events: {
    // TODO: implement events
  },
});

// NEW1_041
cardScriptsRegistry.register('NEW1_041', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_186
cardScriptsRegistry.register('EX1_186', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_187
cardScriptsRegistry.register('EX1_187', {
  events: { /* TODO */ },
});
