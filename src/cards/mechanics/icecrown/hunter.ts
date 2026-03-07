// icecrown - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';
import type { Entity } from '../../../core/entity';
import { Race } from '../../../enums';
import { GameTag } from '../../../enums';

// ICC_021 - Explosive Bloatbat - Deathrattle: Deal 2 damage to all enemy minions
cardScriptsRegistry.register('ICC_021', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    const oppField = (opponent as any)?.field || [];
    for (const minion of oppField) {
      const damage = new Damage(source, minion, 2);
      damage.trigger(source);
    }
  },
});

// ICC_415 - Stitched Tracker - Battlecry: Discover a copy of a minion in your deck
cardScriptsRegistry.register('ICC_415', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (!controller) return;
    const deck = (controller as any).deck || [];
    if (deck.length === 0) return;

    // Get a random minion from deck
    const minions = deck.filter((c: any) => (c as any).type === 'minion');
    if (minions.length === 0) return;
    const copy = minions[Math.floor(Math.random() * minions.length)];
    const cardId = (copy as any).id;
    if (cardId) {
      const give = new Give(cardId);
      give.trigger(source, controller);
    }
  },
});

// ICC_825 - Abominable Bowman - Deathrattle: Summon a random friendly Beast that died this game.
cardScriptsRegistry.register('ICC_825', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Get dead beasts this game - would need game state
    const deadBeasts = (controller as any).deadBeasts || [];
    if (deadBeasts.length > 0) {
      const beast = deadBeasts[Math.floor(Math.random() * deadBeasts.length)];
      const cardId = (beast as any).id;
      if (cardId) {
        const summon = new Summon(source, cardId);
        summon.trigger(source);
      }
    }
  },
});

// ICC_828 - Deathstalker Rexxar - Battlecry: Deal 2 damage to all enemy minions
cardScriptsRegistry.register('ICC_828', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = (controller as any).opponent;
    const oppField = (opponent as any)?.field || [];
    for (const minion of oppField) {
      const damage = new Damage(source, minion, 2);
      damage.trigger(source);
    }
  },
});

// ICC_049 - Play Dead - Spell: your weapon is have +2 Attack
cardScriptsRegistry.register('ICC_049', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const target = ctx.target;
    if (target) {
      const controller = (source as any).controller;
      const weapon = (controller as any).weapon;
      if (weapon) {
        const buff = new Buff(source, source, { ATK: (weapon as any).attack || 2, HEALTH: 0 });
        buff.trigger(source);
      }
    }
  },
});
