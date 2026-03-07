// gangs - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Heal, Give, Silence, Damage } from '../../../actions';

// CFM_020 - Raza the Chained - Battlecry: Set your Hero Power to 0
cardScriptsRegistry.register('CFM_020', {
  play: (ctx: ActionContext) => {
    // Set hero power cost to 0 - handled by game engine
    // Simplified implementation
  },
});

// CFM_020e
cardScriptsRegistry.register('CFM_020e', {
});

// CFM_605 - Drakonid Operative - Battlecry: If you have a Dragon, Discover a card from opponent's deck
cardScriptsRegistry.register('CFM_605', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const hasDragon = field.some((m: any) => m?.race === 'dragon');
    if (hasDragon) {
      // Discover a card from opponent's deck - simplified
      const opponent = controller?.opponent;
      const deck = opponent?.deck || [];
      if (deck.length > 0) {
        const randomCard = deck[Math.floor(Math.random() * deck.length)];
        const give = new Give(randomCard.id);
        give.trigger(source, controller);
      }
    }
  },
});

// CFM_606 - Mana Geode - After this minion is healed, summon a 2/2 Elemental
cardScriptsRegistry.register('CFM_606', {
  events: {
    HEAL: (ctx: ActionContext) => {
      const source = ctx.source;
      if (ctx.target === source) {
        const { Summon } = require('../../../actions/summon');
        const summon = new Summon(source, 'CFM_606t');
        summon.trigger(source);
      }
    },
  },
});

// CFM_626 - Kabal Talonpriest - Battlecry: Give a friendly minion +3 Health
cardScriptsRegistry.register('CFM_626', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { HEALTH: 3 });
      buff.trigger(source);
    }
  },
});

// CFM_657 - Kabal Songstealer - Battlecry: Silence a minion
cardScriptsRegistry.register('CFM_657', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target;
    if (target) {
      const silence = new Silence(source, target);
      silence.trigger(source);
    }
  },
});

// CFM_603 - Potion of Madness - Battlecry: Take control of an enemy minion with 2 or less Attack until end of turn
cardScriptsRegistry.register('CFM_603', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 2,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;
    if (target) {
      // Steal control - simplified by swapping controllers
      const controller = source?.controller;
      const opponent = controller?.opponent;
      const originalController = target?.controller;
      // Swap control
      if (originalController) {
        originalController.field = originalController.field?.filter((m: any) => m !== target);
      }
      if (controller) {
        controller.field = [...(controller.field || []), target];
        target.controller = controller;
      }
      // Give Charge - handled by game engine
      // Note: simplified implementation
    }
  },
});

// CFM_603e - Potion of Madness buff - At the end of the turn, return to opponent
cardScriptsRegistry.register('CFM_603e', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      const opponent = controller?.opponent;
      if (controller && opponent) {
        // Return minion to opponent
        controller.field = controller.field?.filter((m: any) => m !== source);
        opponent.field = [...(opponent.field || []), source];
        source.controller = opponent;
        // Destroy the minion
        const destroy = new (require('../../../actions/destroy').Destroy)();
        destroy.trigger(source, source);
      }
    },
  },
});

// CFM_604 - Greater Healing Potion - Restore 12 Health
cardScriptsRegistry.register('CFM_604', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target;
    if (target) {
      const heal = new Heal(source, target, 12);
      heal.trigger(source);
    }
  },
});

// CFM_661 - Pint-Size Potion - Battlecry: Give all enemy minions -3 Attack
cardScriptsRegistry.register('CFM_661', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const oppField = opponent?.field || [];
    for (const minion of oppField) {
      const buff = new Buff(source, minion, { ATK: -3 });
      buff.trigger(source);
    }
  },
});

// CFM_662 - Dragonfire Potion - Deal 5 damage to all enemies except Dragons
cardScriptsRegistry.register('CFM_662', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const oppField = opponent?.field || [];
    for (const minion of oppField) {
      if (minion?.race !== 'dragon') {
        const damage = new Damage(source, minion, 5);
        damage.trigger(source);
      }
    }
    // Also damage enemy hero
    const enemyHero = opponent?.hero;
    if (enemyHero) {
      const damage = new Damage(source, enemyHero, 5);
      damage.trigger(source);
    }
  },
});
