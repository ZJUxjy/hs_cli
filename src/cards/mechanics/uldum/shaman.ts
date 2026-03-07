// uldum - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give, Shuffle, Silence, Freeze } from '../../../actions';
import { Race } from '../../../enums';

// ULD_158 - Sandstorm Elemental - Deal 4 damage to all enemy minions
cardScriptsRegistry.register('ULD_158', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const damage = new Damage(ctx.source, minion, 4);
      damage.trigger(ctx.source);
    }
  },
});

// ULD_169 - Bloodlust - Give your minions +5 Attack this turn
cardScriptsRegistry.register('ULD_169', {
});

// ULD_170 - Totem Reflector - Summon a copy of each friendly Totem
cardScriptsRegistry.register('ULD_170', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const totems = field.filter((m: any) => (m as any).race === Race.TOTEM);
    for (const totem of totems) {
      const summonAction = new Summon(ctx.source, totem.id);
      summonAction.trigger(ctx.source);
    }
  },
});

// ULD_173 - Lightning Bloom - Gain 2 Mana Crystals this turn only. Overload: (2)
cardScriptsRegistry.register('ULD_173', {
});

// ULD_276 - Earthquake - Deal 5 damage to all minions. Deal 1 damage to all heroes
cardScriptsRegistry.register('ULD_276', {
  events: {
    // Damage all
  },
});

// ULD_171 - Witch's Brew - Restore 4 Health. Shuffle 3 copies into your deck
cardScriptsRegistry.register('ULD_171', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const heal = new Heal(ctx.source, ctx.target, 4);
      heal.trigger(ctx.source);
    }
    // Shuffle copies into deck
    for (let i = 0; i < 3; i++) {
      const shuffleAction = new Shuffle('ULD_171');
      shuffleAction.trigger(ctx.source);
    }
  },
});

// ULD_172 - Mutate - Transform a minion into a random minion with the same Cost
cardScriptsRegistry.register('ULD_172', {
  play: (ctx: ActionContext) => {
    // Transform handled by game
  },
});

// ULD_181 - Plague of Murlocs - Transform all minions into Murlocs
cardScriptsRegistry.register('ULD_181', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Transform all minions to murlocs - simplified
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      // Would need morph action
    }
  },
});

// ULD_291 - Prophet Velen - Double the healing done to your hero
cardScriptsRegistry.register('ULD_291', {
});

// ULD_291p - Lesser Heal (Hero Power)
cardScriptsRegistry.register('ULD_291p', {
});

// ULD_291pe - Blessed
cardScriptsRegistry.register('ULD_291pe', {
});

// ULD_413 - Siamat - Battlecry: Gain 2 of Taunt, Divine Shield, or Windfury
cardScriptsRegistry.register('ULD_413', {
  play: (ctx: ActionContext) => {
    // Gain 2 of the mentioned keywords - simplified
  },
});
