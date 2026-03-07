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

// Hand
cardScriptsRegistry.register('Hand', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
  events: {
    // TODO: implement events
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

// BT_937
cardScriptsRegistry.register('BT_937', {
  events: {
    // TODO: implement events
  },
});

// BT_173
cardScriptsRegistry.register('BT_173', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_175
cardScriptsRegistry.register('BT_175', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_175t
cardScriptsRegistry.register('BT_175t', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_354
cardScriptsRegistry.register('BT_354', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_427
cardScriptsRegistry.register('BT_427', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_488
cardScriptsRegistry.register('BT_488', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_490
cardScriptsRegistry.register('BT_490', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_752
cardScriptsRegistry.register('BT_752', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_753
cardScriptsRegistry.register('BT_753', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_753e
cardScriptsRegistry.register('BT_753e', {
  events: {
    // TODO: implement events
  },
});

// BT_801
cardScriptsRegistry.register('BT_801', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_271
cardScriptsRegistry.register('BT_271', {
  events: {
    // TODO: implement events
  },
});

// BT_922
cardScriptsRegistry.register('BT_922', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
