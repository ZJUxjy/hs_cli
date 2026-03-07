// uldum - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';

// ULD_157 - Questing Explorer - Battlecry: Draw a card if you control a Quest
cardScriptsRegistry.register('ULD_157', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Check if controller has a quest (quest cards have tag 1042)
    const field = controller?.field || [];
    let hasQuest = false;
    for (const minion of field) {
      if ((minion as any).tags?.['1042']) { // Quest tag
        hasQuest = true;
        break;
      }
    }
    if (hasQuest) {
      const draw = new Draw(controller);
      draw.trigger(ctx.source);
    }
  },
});

// ULD_180 - Sunstruck Henchman - At the start of your turn, this has a 50% chance to fall asleep
cardScriptsRegistry.register('ULD_180', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      if (Math.random() < 0.5) {
        // 50% chance to "fall asleep" - in hearthstone this means it becomes dormant
        // For simplicity, we'll just silence it or destroy it
        const destroy = new Destroy();
        destroy.trigger(ctx.source, ctx.source);
      }
    },
  },
});

// ULD_196 - Neferset Ritualist - Battlecry: Restore adjacent minions to full Health
cardScriptsRegistry.register('ULD_196', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const position = source?.position;

    // Find adjacent minions (position -1 and position +1)
    const leftMinion = field.find((m: any) => m.position === position - 1);
    const rightMinion = field.find((m: any) => m.position === position + 1);

    // Restore adjacent minions to full health
    for (const minion of [leftMinion, rightMinion]) {
      if (minion) {
        const maxHealth = (minion as any).maxHealth || (minion as any).health;
        const currentHealth = (minion as any).health;
        const healAmount = maxHealth - currentHealth;
        if (healAmount > 0) {
          const heal = new Heal(ctx.source, minion, healAmount);
          heal.trigger(ctx.source);
        }
      }
    }
  },
});

// ULD_197 - Quicksand Elemental - Battlecry: Give all enemy minions -2 Attack this turn
cardScriptsRegistry.register('ULD_197', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const enemyField = opponent?.field || [];

    for (const minion of enemyField) {
      const buff = new Buff(ctx.source, minion, { ATK: -2 });
      buff.trigger(ctx.source);
    }
  },
});

// ULD_198 - Conjured Mirage - Taunt. At the start of your turn, shuffle this minion into your deck
cardScriptsRegistry.register('ULD_198', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      const shuffle = new Shuffle('ULD_198');
      shuffle.trigger(ctx.source);
      // Remove from battlefield
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.source);
    },
  },
});

// ULD_208 - Khartut Defender - Taunt, Reborn. Deathrattle: Restore #3 Health to your hero
cardScriptsRegistry.register('ULD_208', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hero = controller?.hero;
    const heal = new Heal(ctx.source, hero, 3);
    heal.trigger(ctx.source);
  },
});

// ULD_214
cardScriptsRegistry.register('ULD_214', {
});

// ULD_215 - Wrapped Golem - Reborn. At the end of your turn, summon a 1/1 Scarab with Taunt
cardScriptsRegistry.register('ULD_215', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const summon = new Summon(ctx.source, 'ULD_215t');
      summon.trigger(ctx.source);
    },
  },
});

// ULD_250 - Infested Goblin - Taunt. Deathrattle: Add two 1/1 Scarabs with Taunt to your hand
cardScriptsRegistry.register('ULD_250', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const give1 = new Give('ULD_215t');
    give1.trigger(ctx.source, controller);
    const give2 = new Give('ULD_215t');
    give2.trigger(ctx.source, controller);
  },
});
