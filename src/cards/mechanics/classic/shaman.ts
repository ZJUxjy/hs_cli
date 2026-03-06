// Classic Shaman Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';
import { Heal } from '../../../actions/heal';
import { Morph } from '../../../actions/morph';
import { Silence } from '../../../actions/silence';
import { Freeze } from '../../../actions/freeze';

// Import selectors
import { PlayReq } from '../../../enums/playreq';

// === Minions ===

// Fire Elemental - Battlecry: Deal 3 damage
cardScriptsRegistry.register('CS2_042', {
  requirements: { [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 3);
      dmg.trigger(ctx.source);
    }
  },
});

// Unbound Elemental - After you play an Overload card, gain +1/+1
cardScriptsRegistry.register('EX1_258', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      // Would check for overload
    },
  },
});

// EX1_258e - Unbound Elemental buff
cardScriptsRegistry.register('EX1_258e', {});

// Flametongue Totem - Adjacent minions have +2 Attack
cardScriptsRegistry.register('EX1_565', {});

// EX1_565o - Flametongue buff
cardScriptsRegistry.register('EX1_565o', {});

// Mana Tide Totem - At the end of your turn, draw a card
cardScriptsRegistry.register('EX1_575', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    },
  },
});

// Windspeaker - Battlecry: Give a friendly minion Windfury
cardScriptsRegistry.register('EX1_587', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).windfury = true;
    }
  },
});

// === Spells ===

// Frost Shock - Deal 1 damage and Freeze
cardScriptsRegistry.register('CS2_037', {
  requirements: { [PlayReq.REQ_ENEMY_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
      const freeze = new Freeze();
      freeze.trigger(ctx.source, ctx.target);
    }
  },
});

// Ancestral Spirit - Give a minion "Deathrattle: Resummon this minion"
cardScriptsRegistry.register('CS2_038', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).hasDeathrattle = true;
    }
  },
});

// CS2_038e - Ancestral Spirit buff
cardScriptsRegistry.register('CS2_038e', {});

// Windfury - Give a minion Windfury
cardScriptsRegistry.register('CS2_039', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).windfury = true;
    }
  },
});

// Ancestral Healing - Restore a minion to full health and give it Taunt
cardScriptsRegistry.register('CS2_041', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const heal = new Heal(ctx.source, ctx.target, target.maxHealth || target.health);
      heal.trigger(ctx.source);
      const buff = new Buff(ctx.source, ctx.target, { taunt: true });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_041e - Ancestral Healing buff
cardScriptsRegistry.register('CS2_041e', {});

// Rockbiter Weapon - Give a friendly minion +3 Attack this turn
cardScriptsRegistry.register('CS2_045', {
  requirements: { [PlayReq.REQ_FRIENDLY_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_045e - Rockbiter Weapon buff
cardScriptsRegistry.register('CS2_045e', {});

// Bloodlust - Give your minions +3 Attack this turn
cardScriptsRegistry.register('CS2_046', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      const buff = new Buff(ctx.source, minion, { ATK: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// CS2_046e - Bloodlust buff
cardScriptsRegistry.register('CS2_046e', {});

// Far Sight - Draw a card and reduce its cost by 3
cardScriptsRegistry.register('CS2_053', {
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
    // Would reduce cost
  },
});

// CS2_053e - Far Sight buff
cardScriptsRegistry.register('CS2_053e', {});

// Lightning Bolt - Deal 3 damage
cardScriptsRegistry.register('EX1_238', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 3);
      dmg.trigger(ctx.source);
    }
  },
});

// Lava Burst - Deal 5 damage
cardScriptsRegistry.register('EX1_241', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 5);
      dmg.trigger(ctx.source);
    }
  },
});

// Totemic Might - Give your totems +2 Health
cardScriptsRegistry.register('EX1_244', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      if ((minion as any).race === 'totem') {
        const buff = new Buff(ctx.source, minion, { HEALTH: 2 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// EX1_244e - Totemic Might buff
cardScriptsRegistry.register('EX1_244e', {});

// Hex - Transform a minion into a 0/1 Frog with Taunt
cardScriptsRegistry.register('EX1_246', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const morph = new Morph('hexfrog');
      morph.trigger(ctx.source, ctx.target);
    }
  },
});

// Feral Spirit - Summon two 2/1 Spirit Wolves with Taunt
cardScriptsRegistry.register('EX1_248', {
  requirements: { [PlayReq.REQ_NUM_MINION_SLOTS]: 1 },
  play: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'EX1_tk11');
    const summon2 = new Summon(ctx.source, 'EX1_tk11');
    summon1.trigger(ctx.source);
    summon2.trigger(ctx.source);
  },
});

// EX1_tk11 - Spirit Wolf
cardScriptsRegistry.register('EX1_tk11', {});

// Forked Lightning - Deal 2 damage to two random enemy minions
cardScriptsRegistry.register('EX1_251', {
  requirements: { [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1 },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    const field = opponent?.field || [];
    if (field.length > 0) {
      const shuffled = [...field].sort(() => Math.random() - 0.5);
      const targets = shuffled.slice(0, 2);
      for (const target of targets) {
        const dmg = new Damage(ctx.source, target, 2);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Earth Shock - Silence a minion and deal 1 damage
cardScriptsRegistry.register('EX1_245', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const silence = new Silence(ctx.source, ctx.target);
      silence.trigger(ctx.source);
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
    }
  },
});

// Lightning Storm - Deal 2-3 damage to all enemy minions
cardScriptsRegistry.register('EX1_259', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.field) {
      const damage = Math.floor(Math.random() * 2) + 2; // 2 or 3
      for (const minion of opponent.field) {
        const dmg = new Damage(ctx.source, minion, damage);
        dmg.trigger(ctx.source);
      }
    }
  },
});

console.log('[Classic Shaman] Registered card scripts');
