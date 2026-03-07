// gangs - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Summon, Damage, Give, Shuffle } from '../../../actions';
import type { Entity } from '../../../core/entity';

import { CardType, Race } from '../../../enums';

import { CardLoader } from '../../../cards/loader';

import { Minion } from '../../../core/card';

// Helper function to get a random Beast card ID
function getRandomBeastCardId(): string {
  const beastCards = CardLoader.filter({
    type: CardType.MINION,
    race: Race.BEAST,
  });
  if (beastCards.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * beastCards.length);
  return beastCards[randomIndex].id;
}

// CFM_315 - Smuggler's Crate - Give a random Beast in your hand +2/+2
cardScriptsRegistry.register('CFM_315', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const beastCardId = getRandomBeastCardId();
    if (beastCardId) {
      const giveAction = new Give(beastCardId);
      giveAction.trigger(ctx.source, controller);
      // Apply +2/+2 buff to hand (would need hand tracking)
    }
  },
});

// CFM_316 - Rat Pack - Deathrattle: Summon 1/1 Rats equal to this minion's Attack
cardScriptsRegistry.register('CFM_316', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const attack = (source as any).attack || 2;
    const ratCount = Math.max(1, attack);
    // Summon that many 1/1 Rats
    for (let i = 0; i < ratCount; i++) {
      const summon = new Summon(source, 'CFM_316t'); // Rat token
      summon.trigger(source);
    }
  },
});

// CFM_333 - Knuckles - After this attacks a minion, it also hits the enemy hero
cardScriptsRegistry.register('CFM_333', {
  events: {
    AFTER_ATTACK: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.target && (event.target as any).health !== undefined) {
        // Also damage the enemy hero
        const source = ctx.source as Entity;
        const controller = (source as any).controller;
        const opponent = controller?.opponent;
        if (opponent?.hero) {
          const damage = new Damage(source, opponent.hero, (source as any).attack || 3);
          damage.trigger(source);
        }
      }
    },
  },
});

// CFM_335 - Hidden Cache - Secret: After your opponent plays a minion, give a random minion in your hand +2/+2
cardScriptsRegistry.register('CFM_335', {
  play: (ctx: ActionContext) => {
    // Secret effect - handled by game
  },
  events: {
    AFTER_MINION_PLAY: (ctx: ActionContext) => {
      const event = ctx.event;
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const opponent = controller?.opponent;
      // Check if opponent played the minion
      if (event?.source && (event.source as any).controller === opponent) {
        // Give a random minion in hand +2/+2
        const hand = controller?.hand as Entity[] || [];
        const minions = hand.filter((c: any) => c.type === CardType.MINION);
        if (minions.length > 0) {
          const target = minions[Math.floor(Math.random() * minions.length)];
          const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
          buff.trigger(source);
        }
      }
    },
  },
});

// CFM_336 - Shaky Zipgunner - Deathrattle: Give a random minion in your hand +2/+2
cardScriptsRegistry.register('CFM_336', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const hand = controller?.hand as Entity[] || [];
    const minions = hand.filter((c: any) => c.type === CardType.MINION);
    if (minions.length > 0) {
      const target = minions[Math.floor(Math.random() * minions.length)];
      const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// CFM_338 - Dispatch Kodo - Battlecry: Deal damage equal to this minion's Attack
cardScriptsRegistry.register('CFM_338', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as Entity;
      const attack = (source as any).attack || 2;
      const damage = new Damage(source, ctx.target, attack);
      damage.trigger(source);
    }
  },
});

// CFM_026 - Alleycat - Battlecry: Summon a 1/1 Cat
cardScriptsRegistry.register('CFM_026', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const summon = new Summon(source, 'CFM_026t'); // 1/1 Cat token
    summon.trigger(source);
  },
});

// CFM_334 - Trogg Beastrager - Battlecry: Give a random Beast in your hand +1/+1
cardScriptsRegistry.register('CFM_334', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const beastCardId = getRandomBeastCardId();
    if (beastCardId) {
      const giveAction = new Give(beastCardId);
      giveAction.trigger(ctx.source, controller);
      // Apply +1/+1 buff to hand
    }
  },
});

// CFM_337 - Piranha Launcher - After your hero attacks, summon a 1/1 Piranha
cardScriptsRegistry.register('CFM_337', {
  events: {
    AFTER_ATTACK: (ctx: ActionContext) => {
      const event = ctx.event;
      const source = ctx.source as Entity;
      // Check if this weapon's hero attacked
      if (event?.source === source) {
        const summon = new Summon(source, 'CFM_337t'); // Piranha token
        summon.trigger(source);
      }
    },
  },
});
