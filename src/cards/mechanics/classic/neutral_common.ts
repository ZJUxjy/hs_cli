// classic - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw } from '../../../actions';
import { Entity } from '../../../core/entity';

// CS2_122 Boulderfist Ogre - No special ability
cardScriptsRegistry.register('CS2_122', {
});

// CS2_222 Frostwolf Grunt - Taunt
cardScriptsRegistry.register('CS2_222', {
});

// CS2_226 Ironforge Rifleman - Battlecry: Deal 1 damage
cardScriptsRegistry.register('CS2_226', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// EX1_011 Voodoo Doctor - Battlecry: Restore 2 Health
cardScriptsRegistry.register('EX1_011', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(2);
      heal.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_015 Sunfury Protector - Battlecry: Give adjacent minions Taunt
cardScriptsRegistry.register('EX1_015', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller.field || [];
    const position = (source as any).position;
    // Give taunt to adjacent minions
    if (field[position - 1]) {
      (field[position - 1] as any).taunt = true;
    }
    if (field[position + 1]) {
      (field[position + 1] as any).taunt = true;
    }
  },
});

// EX1_082 Ancient of Lore - Choose one - Restore 5 Health or Draw a card
cardScriptsRegistry.register('EX1_082', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would show a choice
    // For simplicity, we just restore 5 health
    if (ctx.target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(5);
      heal.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_102 Demonic Presence - At the end of your turn, draw a card
cardScriptsRegistry.register('EX1_102', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const drawAction = new Draw(ctx.source);
      drawAction.trigger(ctx.source);
    },
  },
});

// EX1_162
cardScriptsRegistry.register('EX1_162', {
});

// EX1_399 Gnomish Inventor - Battlecry: Draw a card
cardScriptsRegistry.register('EX1_399', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// EX1_508
cardScriptsRegistry.register('EX1_508', {
});

// EX1_593 Elven Archer - Battlecry: Deal 1 damage
cardScriptsRegistry.register('EX1_593', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// EX1_595 Cube - At the end of your turn, draw a card
cardScriptsRegistry.register('EX1_595', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const drawAction = new Draw(ctx.source);
      drawAction.trigger(ctx.source);
    },
  },
});

// CS2_117 Hellfire - Deal 3 damage to ALL characters
cardScriptsRegistry.register('CS2_117', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Damage all minions on both fields
    const myField = controller.field || [];
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of myField) {
      const damage = new Damage(source, minion, 3);
      damage.trigger(source);
    }
    for (const minion of oppField) {
      const damage = new Damage(source, minion, 3);
      damage.trigger(source);
    }
    // Damage both heroes
    if (controller.hero) {
      const damage = new Damage(source, controller.hero, 3);
      damage.trigger(source);
    }
    if (opponent.hero) {
      const damage = new Damage(source, opponent.hero, 3);
      damage.trigger(source);
    }
  },
});

// CS2_141 Fire Elemental - Battlecry: Deal 3 damage
cardScriptsRegistry.register('CS2_141', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// CS2_146 Oasis Snapjaw - No special ability
cardScriptsRegistry.register('CS2_146', {
});

// CS2_147 Ravaging Ghoul - Battlecry: Deal 1 damage to all enemy minions
cardScriptsRegistry.register('CS2_147', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    for (const minion of field) {
      const damage = new Damage(source, minion, 1);
      damage.trigger(source);
    }
  },
});

// CS2_150 Bloodfen Raptor - No special ability
cardScriptsRegistry.register('CS2_150', {
});

// CS2_151 Bluegill Warrior - Charge
cardScriptsRegistry.register('CS2_151', {
  play: (ctx: ActionContext) => {
    // Charge is set in card definition
  },
});

// CS2_189 Stonetusk Boar - Charge
cardScriptsRegistry.register('CS2_189', {
});

// CS2_188 Earthen Ring Farseer - Battlecry: Restore 3 Health
cardScriptsRegistry.register('CS2_188', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(3);
      heal.trigger(ctx.source, ctx.target);
    }
  },
});

// CS2_196 Fen Creeper - Taunt
cardScriptsRegistry.register('CS2_196', {
});

// CS2_203 Shadow Word: Pain - Destroy a minion with 3 or less Attack
cardScriptsRegistry.register('CS2_203', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 3,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
    }
  },
});

// CS2_221
cardScriptsRegistry.register('CS2_221', {
});

// CS2_227
cardScriptsRegistry.register('CS2_227', {
});

// DS1_055 Raptor - No special ability
cardScriptsRegistry.register('DS1_055', {
});

// EX1_007 Acolyte of Pain - After a minion dies, draw a card
cardScriptsRegistry.register('EX1_007', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const drawAction = new Draw(ctx.source);
      drawAction.trigger(ctx.source);
    },
  },
});

// EX1_019 Shattered Sun Cleric - Battlecry: Give a friendly minion +1/+1
cardScriptsRegistry.register('EX1_019', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_025 Dire Wolf Alpha - No special ability
cardScriptsRegistry.register('EX1_025', {
});

// EX1_029
cardScriptsRegistry.register('EX1_029', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// EX1_046
cardScriptsRegistry.register('EX1_046', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_048
cardScriptsRegistry.register('EX1_048', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_049
cardScriptsRegistry.register('EX1_049', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_057
cardScriptsRegistry.register('EX1_057', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_066
cardScriptsRegistry.register('EX1_066', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_096
cardScriptsRegistry.register('EX1_096', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// EX1_283
cardScriptsRegistry.register('EX1_283', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_390
cardScriptsRegistry.register('EX1_390', {
});

// EX1_393
cardScriptsRegistry.register('EX1_393', {
});

// EX1_412
cardScriptsRegistry.register('EX1_412', {
});

// EX1_506
cardScriptsRegistry.register('EX1_506', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_556
cardScriptsRegistry.register('EX1_556', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// EX1_583
cardScriptsRegistry.register('EX1_583', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// NEW1_018
cardScriptsRegistry.register('NEW1_018', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// NEW1_022
cardScriptsRegistry.register('NEW1_022', {
});

// tt_004
cardScriptsRegistry.register('tt_004', {
  events: { /* TODO */ },
});
