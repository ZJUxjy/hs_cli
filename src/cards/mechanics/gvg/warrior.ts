// gvg - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Give, Draw, Summon } from '../../../actions';

// GVG_051 - Shieldmaiden - Battlecry: Equip a 5/2 Shield
cardScriptsRegistry.register('GVG_051', {
});

// GVG_053 - Crush - Destroy a minion. If you have a weapon, deal its damage to your hero
cardScriptsRegistry.register('GVG_053', {
  play: (ctx: ActionContext) => {
    // Destroy target minion - handled by game
  },
});

// GVG_055 - Shielded Minibot - Battlecry: Give a damaged minion +3 Attack
cardScriptsRegistry.register('GVG_055', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_DAMAGED_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as any;
      const buff = new Buff(source, ctx.target, { ATK: 3 });
      buff.trigger(source);
    }
  },
});

// GVG_056 - Obsidian Destroyer - Choose One - Summon 1/1 Spawn; or 3/3 Destroyer
cardScriptsRegistry.register('GVG_056', {
  play: (ctx: ActionContext) => {
    // Choose One - handled by game
  },
});

// GVG_056t - Obsidian Destroyer (3/3)
cardScriptsRegistry.register('GVG_056t', {
  play: (ctx: ActionContext) => {
    // Summon 3/3 Destroyer - handled by game
  },
});

// GVG_086 - Iron Juggernaut - Battlecry: Shuffle a 'Mine!' into your opponent's deck
cardScriptsRegistry.register('GVG_086', {
  events: {
    // Shuffle 'Mine!' into opponent's deck - handled by game
  },
});

// GVG_050 - Battle Rage - Draw a card for each damaged friendly character
cardScriptsRegistry.register('GVG_050', {
  requirements: {
    // No target needed
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const hero = controller.hero;
    let damagedCount = 0;
    if ((hero as any).health < (hero as any).maxHealth) damagedCount++;
    for (const minion of field) {
      if ((minion as any).health < (minion as any).maxHealth) damagedCount++;
    }
    for (let i = 0; i < damagedCount; i++) {
      const drawAction = new Draw();
      drawAction.trigger(source, controller);
    }
  },
});

// GVG_052 - Gorehowl - Battlecry: Gain +1 Attack. Lose 1 Attack when dealing damage
cardScriptsRegistry.register('GVG_052', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Gain +1 Attack - handled by game
  },
});

// GVG_054 - Ragnaros the Firelord - Can't attack. At the end of your turn, deal 8 damage to a random enemy
cardScriptsRegistry.register('GVG_054', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const opponent = controller.opponent;
      const target = Math.random() > 0.5 ? opponent.hero : (opponent.field || [])[Math.floor(Math.random() * (opponent.field?.length || 1))];
      if (target) {
        const damage = new Damage(source, target, 8);
        damage.trigger(source);
      }
    },
  },
});
