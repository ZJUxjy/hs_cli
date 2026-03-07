// gvg - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Give, Draw, Summon } from '../../../actions';

// GVG_023 - Tinker's Sharpsword - Your minions have +3 Attack
cardScriptsRegistry.register('GVG_023', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      const buff = new Buff(source, minion, { ATK: 3 });
      buff.trigger(source);
    }
  },
});

// GVG_025 - Gallywix - Your opponent's spells cost (1) more. Gain 1 mana crystal when they cost 6+
cardScriptsRegistry.register('GVG_025', {
  events: {
    // Opponent's spells cost (1) more - handled by game
  },
});

// GVG_027 - Goblin Auto-Barber - Battlecry: Give your weapon +1 Attack
cardScriptsRegistry.register('GVG_027', {
  events: {
    // Give your weapon +1 Attack - handled by game
  },
});

// GVG_028 - Trade Prince Gallywix - Your opponent's spells cost (1) more. Gain 1 mana crystal when they cost 6+
cardScriptsRegistry.register('GVG_028', {
  events: {
    // Opponent's spells cost (1) more - handled by game
  },
});

// GVG_028t - Gallywix's Hoard - Summon 2 1/1 Khadgar's Servants
cardScriptsRegistry.register('GVG_028t', {
  play: (ctx: ActionContext) => {
    // Summon 2 1/1 Khadgar's Servants - handled by game
  },
});

// GVG_088 - Shadow Sensei - Battlecry: Give a Stealth minion +2/+2
cardScriptsRegistry.register('GVG_088', {
  events: {
    // Give Stealth minion +2/+2 - handled by game
  },
});

// GVG_022 - Ogre Ninja - Battlecry: Deal 1 damage to a random enemy minion
cardScriptsRegistry.register('GVG_022', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    if (field.length > 0) {
      const target = field[Math.floor(Math.random() * field.length)];
      const damage = new Damage(source, target, 1);
      damage.trigger(source);
    }
  },
});

// GVG_047 - Shudderwraith - Battlecry: Deal 1 damage to all other minions
cardScriptsRegistry.register('GVG_047', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 1);
        damage.trigger(source);
      }
    }
  },
});

// GVG_024 - Anodized Robo Cub - Taunt. Choose One - +1 Attack; or +1 Health
cardScriptsRegistry.register('GVG_024', {
});
