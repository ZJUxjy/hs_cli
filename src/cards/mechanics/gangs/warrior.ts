// gangs - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Summon } from '../../../actions';

// CFM_643 - Hobart Grapplehammer - Battlecry: Give a random friendly minion +5 Attack
cardScriptsRegistry.register('CFM_643', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const targets = field.filter((m: any) => m !== source);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const buff = new Buff(source, target, { ATK: 5 });
      buff.trigger(source);
    }
  },
});

// CFM_754 - Obsidian Shield - At the end of your turn, give a random friendly minion +2 Attack
cardScriptsRegistry.register('CFM_754', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const field = controller.field || [];
      if (field.length > 0) {
        const target = field[Math.floor(Math.random() * field.length)];
        const buff = new Buff(source, target, { ATK: 2 });
        buff.trigger(source);
      }
    },
  },
});

// CFM_755 - Public Defender - Taunt
cardScriptsRegistry.register('CFM_755', {
});

// CFM_756 - N'Zoth's First Mate - Battlecry: Equip a 1/1 weapon
cardScriptsRegistry.register('CFM_756', {
});

// CFM_716 - Sleep with the Fishes - Deal 6 damage split among all minions
cardScriptsRegistry.register('CFM_716', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const enemyField = opponent.field || [];

    // Deal 6 damage split among all enemy minions
    const damagePerMinion = Math.floor(6 / Math.max(1, enemyField.length));
    for (const minion of enemyField) {
      const damage = new Damage(source, minion, damagePerMinion);
      damage.trigger(source);
    }
  },
});

// CFM_752 - Grimy Gadgeteer - Battlecry: Give a random friendly minion +2/+2
cardScriptsRegistry.register('CFM_752', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const targets = field.filter((m: any) => m !== source);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// CFM_940 - Bladed Gauntlet - Your weapon has +2 Attack
cardScriptsRegistry.register('CFM_940', {
});

// CFM_631 - Brass Whelp - Battlecry: Give a random friendly Dragon +2 Health
cardScriptsRegistry.register('CFM_631', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const field = controller.field || [];
      const dragons = field.filter((m: any) => m.race === 'DRAGON');
      if (dragons.length > 0) {
        const target = dragons[Math.floor(Math.random() * dragons.length)];
        const buff = new Buff(source, target, { HEALTH: 2 });
        buff.trigger(source);
      }
    },
  },
});
