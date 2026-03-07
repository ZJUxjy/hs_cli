// troll - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Summon, Give, Freeze } from '../../../actions';

// TRL_311 - Sir Finley Mrrgl - Battlecry: Discover a new Hero Power
cardScriptsRegistry.register('TRL_311', {
  play: (ctx: ActionContext) => {
    // Discover hero power - handled by game
  },
});

// TRL_315 - Reno Jackson - Battlecry: If your deck has no duplicates, fully heal your hero
cardScriptsRegistry.register('TRL_315', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      const maxHealth = controller.hero.maxHealth || 30;
      const currentHealth = controller.hero.health || 30;
      const missingHealth = maxHealth - currentHealth;
      if (missingHealth > 0) {
        const { Heal } = require('../../../actions/heal');
        const heal = new Heal(missingHealth);
        heal.trigger(ctx.source, controller.hero);
      }
    }
  },
});

// TRL_316t - Murloc Tinyfin - No special
cardScriptsRegistry.register('TRL_316t', {
});

// TRL_318 - Saronite Taskmaster - Battlecry: Give a friendly minion "Deathrattle: Summon a 1/1 Skeleton"
cardScriptsRegistry.register('TRL_318', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.deathrattle = (ctx: ActionContext) => {
        const { Summon } = require('../../../actions/summon');
        const summonAction = new Summon('CS2_lk1');
        summonAction.trigger(ctx.source);
      };
    }
  },
});

// TRL_319 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('TRL_319', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all other friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(ctx.source, minion, 2);
        damage.trigger(ctx.source);
      }
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 2);
      damage.trigger(ctx.source);
    }
  },
});

// TRL_319e - Shudderwraith Enchantment
cardScriptsRegistry.register('TRL_319e', {
});

// TRL_390 - Ice Fishing - Draw 2 Murlocs
cardScriptsRegistry.register('TRL_390', {
  play: (ctx: ActionContext) => {
    // Draw 2 random murlocs - simplified to regular draw
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// TRL_390e - Ice Fishing Enchantment
cardScriptsRegistry.register('TRL_390e', {
});

// TRL_310 - Frost Lich Jaina - Battlecry: Summon a 3/6 Water Elemental
cardScriptsRegistry.register('TRL_310', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('ICC_823t');
    summonAction.trigger(ctx.source);
  },
});

// TRL_310e - Frost Lich Enchantment
cardScriptsRegistry.register('TRL_310e', {
});

// TRL_313 - Murloc Tidecaller - At the end of your turn, give another friendly Murloc +1/+1
cardScriptsRegistry.register('TRL_313', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      let foundMurloc = false;
      for (const minion of field) {
        if (minion !== ctx.source && (minion as any).race === 'MURLOC') {
          const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
          buff.trigger(ctx.source);
          foundMurloc = true;
          break;
        }
      }
    },
  },
});

// TRL_317 - Vryghoul - Deathrattle: If you have a Shadow, summon a 4/4
cardScriptsRegistry.register('TRL_317', {
  deathrattle: (ctx: ActionContext) => {
    // Check for shadow - would need game state
  },
});

// TRL_400 - Whirlwind Tempest - Windfury
cardScriptsRegistry.register('TRL_400', {
});
