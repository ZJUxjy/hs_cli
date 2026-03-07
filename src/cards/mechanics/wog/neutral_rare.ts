// wog - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon, Heal } from '../../../actions';

// OG_162 - Bloodmagus - Battlecry: Deal 3 damage to your hero
cardScriptsRegistry.register('OG_162', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    if (controller?.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(source, controller.hero, 3);
      damage.trigger(source);
    }
  },
});

// OG_255 - Saronite Chain Gang - Taunt. Battlecry: Summon a copy
cardScriptsRegistry.register('OG_255', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Summon a copy of this minion
    const summonAction = new Summon(source, source.cardId);
    summonAction.trigger(source);
  },
});

// OG_034
cardScriptsRegistry.register('OG_034', {
});

// OG_339 - Corrupted Seer - Battlecry: Deal 2 damage to all non-Dragon minions
cardScriptsRegistry.register('OG_339', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    // Deal 2 damage to all non-Dragon minions
    const myField = controller.field || [];
    const oppField = opponent?.field || [];
    for (const minion of [...myField, ...oppField]) {
      if ((minion as any).race !== 'DRAGON') {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
  },
});

// OG_147 - Infested Tauren - Deathrattle: Summon a 2/2 Slime
cardScriptsRegistry.register('OG_147', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summonAction = new Summon(source, 'OG_147t');
    summonAction.trigger(source);
  },
});

// OG_161 - Bloodsail Raider - Battlecry: Gain Attack equal to your weapon's Attack
cardScriptsRegistry.register('OG_161', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const weapon = controller?.weapon;
    if (weapon) {
      const weaponAttack = (weapon as any).attack || 0;
      const buff = new Buff(source, source, { ATK: weaponAttack });
      buff.trigger(source);
    }
  },
});

// OG_254 - Bladed Lady - Battlecry: If you have a weapon equipped, gain +1/+1 and Taunt
cardScriptsRegistry.register('OG_254', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    if (controller?.weapon) {
      const buff = new Buff(source, source, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// OG_320 - Rattling Rascal - Battlecry: Summon a 5/5 Skeleton
cardScriptsRegistry.register('OG_320', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summonAction = new Summon(source, 'OG_320t');
    summonAction.trigger(source);
  },
});

// OG_322
cardScriptsRegistry.register('OG_322', {
});
