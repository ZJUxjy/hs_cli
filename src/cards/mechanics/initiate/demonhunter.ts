// initiate - demonhunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// BT_351 - Battlefiend
// After your hero attacks, gain +1 Attack
cardScriptsRegistry.register('BT_351', {
  events: {
    ATTACK: (ctx: any) => {
      if (ctx.event?.source === (ctx.source as any)?.controller?.hero) {
        (ctx.source as any).attack += 1;
      }
    },
  },
});

// BT_355 - Wrathscale Naga
// After a friendly minion dies, deal 3 damage to a random enemy
cardScriptsRegistry.register('BT_355', {
  events: {
    DEATH: (ctx: any) => {
      if (ctx.event?.minion?.controller === (ctx.source as any)?.controller) {
        const opponent = (ctx.source as any)?.controller?.opponent;
        if (opponent) {
          const targets: any[] = [];
          if (opponent.hero) targets.push(opponent.hero);
          if (opponent.field?.length > 0) targets.push(...opponent.field);

          if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            (target as any).health = ((target as any).health || 0) - 3;
          }
        }
      }
    },
  },
});

// BT_407 - Ur'zul Horror
// Deathrattle: Add a 2/1 Lost Soul to your hand
cardScriptsRegistry.register('BT_407', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'BT_407t' } as any);
    }
  },
});

// BT_416 - Raging Felscreamer
// Battlecry: The next Demon you play costs (2) less
cardScriptsRegistry.register('BT_416', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller) {
      if (!controller.nextDemonCostReduction) {
        controller.nextDemonCostReduction = 0;
      }
      controller.nextDemonCostReduction += 2;
    }
  },
});

// BT_416e - Felscreamer buff
cardScriptsRegistry.register('BT_416e', {
});

// BT_481 - Nethrandamus
// Battlecry: Summon two random minions that cost (X). X scales with friendly minions that died this game
cardScriptsRegistry.register('BT_481', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller as any;
    if (!controller) return;

    // Simplified: just summon two random 2-cost minions
    // In real implementation, would track friendly minions that died
    const cost = 2;
    for (let i = 0; i < 2 && (controller.field?.length || 0) < 7; i++) {
      // Random minion placeholder
      const randomMinions = ['CS2_101', 'CS2_106', 'CS2_118', 'CS2_120', 'CS2_124'];
      const randomId = randomMinions[Math.floor(Math.random() * randomMinions.length)];
      controller.field?.push({ id: randomId } as any);
    }
  },
});

// Hand - Summon 6 1/1 Illidari with Rush
cardScriptsRegistry.register('Hand', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;
    for (let i = 0; i < 6 && (controller.field?.length || 0) < 7; i++) {
      controller.field?.push({ id: 'BT_173t', attack: 1, health: 1, rush: true } as any);
    }
  },
  events: {
    // Placeholder for event handling
  },
});

// BT_487 - Flamereaper
// Also damages the hero
cardScriptsRegistry.register('BT_487', {
  events: {
    // Simplified implementation
  },
});

// BT_510 - Abyssal Summoner
// Battlecry: Summon a Demon with Taunt and stats equal to your deck's demon count
cardScriptsRegistry.register('BT_510', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    const demonCount = controller?.deck?.filter((c: any) => c.race === 'DEMON').length || 1;

    if (controller?.field?.length < 7) {
      controller.field.push({ id: 'BT_510t', attack: demonCount, health: demonCount } as any);
    }
  },
});

// BT_814
cardScriptsRegistry.register('BT_814', {
});

// BT_937 - Altruis the Outcast: After you play a card, deal 1 damage to all enemies.
cardScriptsRegistry.register('BT_937', {
  events: {
    PLAY_CARD: (ctx: any) => {
      const controller = (ctx.source as any)?.controller;
      const opponent = controller?.opponent;
      if (!opponent) return;

      // Deal 1 damage to opponent hero
      if (opponent.hero) {
        const { Damage } = require('../../../actions/damage');
        const damageAction = new Damage(1);
        damageAction.trigger(ctx.source, opponent.hero);
      }

      // Deal 1 damage to all opponent minions
      for (const minion of opponent.field || []) {
        const { Damage } = require('../../../actions/damage');
        const damageAction = new Damage(1);
        damageAction.trigger(ctx.source, minion);
      }
    },
  },
});

// BT_173 - Command the Illidari: Summon six 1/1 Illidari with Rush
cardScriptsRegistry.register('BT_173', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;
    for (let i = 0; i < 6 && (controller.field?.length || 0) < 7; i++) {
      controller.field?.push({ id: 'BT_173t', attack: 1, health: 1, rush: true } as any);
    }
  },
});

// BT_175 - Twin Slice: Give your hero +2 Attack this turn. Add 'Second Slice' to your hand.
cardScriptsRegistry.register('BT_175', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller?.hero) {
      controller.hero.attack = (controller.hero.attack || 0) + 2;
    }
    // Add Second Slice to hand
    if (controller?.hand?.length < 10) {
      controller.hand.push({ id: 'BT_175t' } as any);
    }
  },
});

// BT_175t - Second Slice: Give your hero +2 Attack this turn.
cardScriptsRegistry.register('BT_175t', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller?.hero) {
      controller.hero.attack = (controller.hero.attack || 0) + 2;
    }
  },
});

// BT_354 - Blade Dance: Deal damage equal to your hero's Attack to 3 random enemy minions.
cardScriptsRegistry.register('BT_354', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_ENEMY_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    const opponent = controller?.opponent;
    if (!opponent?.field?.length) return;

    const heroAttack = controller?.hero?.attack || 0;
    const targets = [...opponent.field].sort(() => Math.random() - 0.5).slice(0, 3);

    for (const target of targets) {
      if (target) {
        const { Damage } = require('../../../actions/damage');
        const damageAction = new Damage(heroAttack);
        damageAction.trigger(ctx.source, target);
      }
    }
  },
});

// BT_427 - Feast of Souls: Draw a card for each friendly minion that died this turn.
cardScriptsRegistry.register('BT_427', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;

    const deathCount = (controller.friendlyMinionsDiedThisTurn || 0);
    for (let i = 0; i < deathCount; i++) {
      const { Draw } = require('../../../actions/draw');
      const drawAction = new Draw(ctx.source, 1);
      drawAction.trigger(ctx.source);
    }
  },
});

// BT_488 - Soul Split: Choose a friendly Demon. Summon a copy of it.
cardScriptsRegistry.register('BT_488', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
    [PlayReq.REQ_MINION_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    const controller = (ctx.source as any)?.controller;
    if (!target || !controller) return;

    // Check if target is a Demon
    if ((target as any).race === 'DEMON' && controller.field?.length < 7) {
      controller.field.push({
        id: (target as any).id,
        attack: (target as any).attack,
        health: (target as any).health,
      } as any);
    }
  },
});

// BT_490 - Consume Magic: Silence a minion. Outcast: Draw a card.
cardScriptsRegistry.register('BT_490', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_ENEMY_TARGET]: 1,
    [PlayReq.REQ_MINION_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    const controller = (ctx.source as any)?.controller;
    if (!target) return;

    // Silence the target
    (target as any).silenced = true;
    (target as any).enchantments = [];

    // Check for Outcast (leftmost or rightmost card in hand)
    const hand = controller?.hand || [];
    const isOutcast = hand.length > 0 && (hand[0] === ctx.source || hand[hand.length - 1] === ctx.source);

    if (isOutcast) {
      const { Draw } = require('../../../actions/draw');
      const drawAction = new Draw(ctx.source, 1);
      drawAction.trigger(ctx.source);
    }
  },
});

// BT_752 - Blur: Your hero can't take damage this turn.
cardScriptsRegistry.register('BT_752', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (controller) {
      controller.heroImmune = true;
    }
  },
});

// BT_753 - Mana Burn: Your opponent has 2 fewer Mana Crystals next turn.
cardScriptsRegistry.register('BT_753', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    const opponent = controller?.opponent;
    if (opponent) {
      opponent.manaBurned = 2;
    }
  },
});

// BT_753e - Mana Burned: Start with 2 fewer Mana Crystals this turn.
cardScriptsRegistry.register('BT_753e', {
  events: {
    TURN_START: (ctx: any) => {
      const controller = (ctx.source as any)?.controller;
      if (controller) {
        controller.maxMana = Math.max(0, (controller.maxMana || 10) - 2);
      }
    },
  },
});

// BT_801
cardScriptsRegistry.register('BT_801', {
});

// Hand - another card with the same name
cardScriptsRegistry.register('Hand', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;
    for (let i = 0; i < 6 && (controller.field?.length || 0) < 7; i++) {
      controller.field?.push({ id: 'BT_173t', attack: 1, health: 1, rush: true } as any);
    }
  },
});

// BT_271 - Flamereaper: Also damages the minions adjacent to the target.
cardScriptsRegistry.register('BT_271', {
  events: {
    DAMAGE: (ctx: any) => {
      const target = ctx.event?.target;
      if (!target) return;

      const controller = (ctx.source as any)?.controller;
      const field = controller?.opponent?.field || [];
      const targetIndex = field.indexOf(target);

      if (targetIndex === -1) return;

      // Get adjacent minions
      const adjacentTargets = [];
      if (targetIndex > 0) adjacentTargets.push(field[targetIndex - 1]);
      if (targetIndex < field.length - 1) adjacentTargets.push(field[targetIndex + 1]);

      const damage = ctx.event?.amount || 0;
      for (const adjacent of adjacentTargets) {
        if (adjacent) {
          const { Damage } = require('../../../actions/damage');
          const damageAction = new Damage(damage);
          damageAction.trigger(ctx.source, adjacent);
        }
      }
    },
  },
});

// BT_922 - Umberwing: Battlecry: Summon two 1/1 Felwings.
cardScriptsRegistry.register('BT_922', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any)?.controller;
    if (!controller) return;
    for (let i = 0; i < 2 && (controller.field?.length || 0) < 7; i++) {
      controller.field?.push({ id: 'BT_922t', attack: 1, health: 1 } as any);
    }
  },
});
