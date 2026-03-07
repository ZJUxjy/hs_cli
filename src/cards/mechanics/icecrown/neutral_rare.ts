// icecrown - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Give, Buff, Damage, Draw, Destroy } from '../../../actions';
import { Entity } from '../../../core/entity';
import { Race } from '../../../enums';
import { GameTag } from '../../../enums';

// ICC_018 - Phantom Freebooter - Battlecry: Gain stats equal to your weapon's.
cardScriptsRegistry.register('ICC_018', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const weapon = controller.weapon;
    if (weapon) {
      const weaponAttack = (weapon as any).attack || 0;
      const weaponDurability = (weapon as any).durability || 0;
      const buff = new Buff(ctx.source, ctx.source, { ATK: weaponAttack, HEALTH: weaponDurability });
      buff.trigger(ctx.source);
    }
  },
});

// ICC_027 - Bone Drake - Deathrattle: Add a random Dragon to your hand.
cardScriptsRegistry.register('ICC_027', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Add a random Dragon to hand - placeholder for random dragon
    const give = new Give('ICC_027t');
    give.trigger(source, controller);
  },
});

// ICC_099 - Ticking Abomination - Deathrattle: Deal 5 damage to your minions.
cardScriptsRegistry.register('ICC_099', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const myField = controller.field || [];
    for (const minion of myField) {
      const damage = new Damage(ctx.source, minion, 5);
      damage.trigger(ctx.source);
    }
  },
});

// ICC_257 - Corpse Raiser - Battlecry: Give a friendly minion "Deathrattle: Resummon this minion."
cardScriptsRegistry.register('ICC_257', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as Entity;
      const cardId = (ctx.target as any).id;
      // Add deathrattle to resummon
      (ctx.target as any).deathrattle = (ctx2: ActionContext) => {
        const summon = new Summon(ctx2.source, cardId);
        summon.trigger(ctx2.source);
      };
    }
  },
});

// ICC_257e - Corpse Raiser enchantment
cardScriptsRegistry.register('ICC_257e', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const cardId = (source as any).id;
    const summon = new Summon(ctx.source, cardId);
    summon.trigger(ctx.source);
  },
});

// ICC_466 - Saronite Chain Gang - Taunt. Battlecry: Summon a copy of this minion.
cardScriptsRegistry.register('ICC_466', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'ICC_466');
    summon.trigger(ctx.source);
  },
});

// ICC_700 - Happy Ghoul - When your hero is healed, this card's cost becomes 0.
cardScriptsRegistry.register('ICC_700', {
  events: {
    HEAL: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const hero = (controller as any)?.hero;
      // Check if hero was healed
      if (ctx.event?.target === hero) {
        // Set cost to 0 - simplified implementation
        (source as any).cost = 0;
      }
    },
  },
});

// ICC_700e - Grim Necromancer buff
cardScriptsRegistry.register('ICC_700e', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      // Give controller +1 attack
      const buff = new Buff(ctx.source, controller.hero, { ATK: 1 });
      buff.trigger(ctx.source);
    },
  },
});

// ICC_702 - Shallow Gravedigger - Deathrattle: Add a random Deathrattle minion to your hand
cardScriptsRegistry.register('ICC_702', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Add random Deathrattle minion - placeholder for deathrattle minion
    const give = new Give('ICC_702t');
    give.trigger(source, controller);
  },
});

// ICC_902 - Mindbreaker - Hero Powers are disabled.
cardScriptsRegistry.register('ICC_902', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = (controller as any)?.opponent;
    // Disable hero powers - simplified implementation
    if ((controller as any)?.heroPower) {
      (controller as any).heroPower.disabled = true;
    }
    if (opponent?.heroPower) {
      opponent.heroPower.disabled = true;
    }
  },
});

// ICC_911 - Cobalt Scalekin - At the end of your turn, discard your hand, Deal 1 damage to each player.
cardScriptsRegistry.register('ICC_911', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      // Deal 1 damage to each player's hero
      const damage1 = new Damage(ctx.source, controller.hero, 1);
      damage1.trigger(ctx.source);
      const damage2 = new Damage(ctx.source, opponent.hero, 1);
      damage2.trigger(ctx.source);
    },
  },
});
