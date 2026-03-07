// debug - all.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Give, Destroy, Shuffle, Freeze, GainArmor, Silence, Bounce } from '../../../actions';

// XXX_001 - [c]DEBUG/Spell_All
// Deal 10 damage
cardScriptsRegistry.register('XXX_001', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 10);
      damage.trigger(ctx.source);
    }
  },
});

// XXX_002 - [c]DEBUG/Spell_Damage_5_Target
// Deal 5 damage
cardScriptsRegistry.register('XXX_002', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 5);
      damage.trigger(ctx.source);
    }
  },
});

// XXX_003 - [c]DEBUG/Spell_Damage_8_Target
// Deal 8 damage
cardScriptsRegistry.register('XXX_003', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 8);
      damage.trigger(ctx.source);
    }
  },
});

// XXX_004 - [c]DEBUG/Spell_Damage_Random
// Deal 2 damage to a random enemy
cardScriptsRegistry.register('XXX_004', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    if (field.length > 0) {
      const randomTarget = field[Math.floor(Math.random() * field.length)];
      const damage = new Damage(ctx.source, randomTarget, 2);
      damage.trigger(ctx.source);
    }
  },
});

// XXX_005 - [c]DEBUG/Spell_Heal_Target
// Restore 10 health
cardScriptsRegistry.register('XXX_005', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const heal = new Heal(ctx.source, target, 10);
      heal.trigger(ctx.source);
    }
  },
});

// XXX_006 - [c]DEBUG/Spell_Draw_3_Cards
// Draw 3 cards
cardScriptsRegistry.register('XXX_006', {
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 3);
    draw.trigger(ctx.source);
  },
});

// XXX_007 - [c]DEBUG/Spell_Summon_Random_5
// Summon 5 random minions
cardScriptsRegistry.register('XXX_007', {
  play: (ctx: ActionContext) => {
    for (let i = 0; i < 5; i++) {
      const summon = new Summon(ctx.source, 'CS2_101');
      summon.trigger(ctx.source);
    }
  },
});

// XXX_008 - [c]DEBUG/Spell_Giant_Skeleton
// Summon a 8/8 Skeleton
cardScriptsRegistry.register('XXX_008', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'CS2_101');
    summon.trigger(ctx.source);
  },
});

// XXX_009 - [c]DEBUG/Armor_10_Gain
// Gain 10 armor
cardScriptsRegistry.register('XXX_009', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const armorGain = new GainArmor(ctx.source, controller.hero, 10);
    armorGain.trigger(ctx.source);
  },
});

// XXX_009e
cardScriptsRegistry.register('XXX_009e', {
});

// XXX_010 - [c]DEBUG/Spell_Mana_10
// Gain 10 Mana Crystals
cardScriptsRegistry.register('XXX_010', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if ((controller as any).maxMana !== undefined) {
      (controller as any).maxMana += 10;
    }
  },
});

// XXX_011 - [c]DEBUG/Spell_Mana_5
// Gain 5 Mana Crystals
cardScriptsRegistry.register('XXX_011', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if ((controller as any).maxMana !== undefined) {
      (controller as any).maxMana += 5;
    }
  },
});

// XXX_012 - [c]DEBUG/Spell_Mana_Empty
// Empty Mana Crystals
cardScriptsRegistry.register('XXX_012', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    (controller as any).mana = 0;
  },
});

// XXX_013 - [c]DEBUG/Spell_Fatigue
// Fatigue
cardScriptsRegistry.register('XXX_013', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Trigger fatigue damage
    const fatigue = (controller as any).fatigue || 0;
    (controller as any).fatigue = fatigue + 1;
    const damage = new Damage(ctx.source, controller.hero, (controller as any).fatigue);
    damage.trigger(ctx.source);
  },
});

// XXX_014 - [c]DEBUG/Spell_Destroy_All_Minions
// Destroy all minions
cardScriptsRegistry.register('XXX_014', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Destroy all friendly minions
    const field = controller.field || [];
    for (const minion of [...field]) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, minion);
    }
    // Destroy all enemy minions
    const oppField = opponent.field || [];
    for (const minion of [...oppField]) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, minion);
    }
  },
});

// XXX_015
cardScriptsRegistry.register('XXX_015', {
});

// XXX_016 - [c]DEBUG/Minion_Attack_1
// Set minion attack to 1
cardScriptsRegistry.register('XXX_016', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      (target as any).attack = 1;
    }
  },
});

// XXX_017 - [c]DEBUG/Minion_Health_1
// Set minion health to 1
cardScriptsRegistry.register('XXX_017', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      (target as any).maxHealth = 1;
      (target as any).damage = 0;
    }
  },
});

// XXX_018 - [c]DEBUG/Spell_Freeze_Target
// Freeze target
cardScriptsRegistry.register('XXX_018', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const freeze = new Freeze();
      freeze.trigger(ctx.source, target);
    }
  },
});

// XXX_019 - [c]DEBUG/Spell_Taunt
// Give Taunt
cardScriptsRegistry.register('XXX_019', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { taunt: true });
      buff.trigger(ctx.source);
    }
  },
});

// XXX_020 - [c]DEBUG/Spell_Buff_Attack_5
// Give +5 Attack
cardScriptsRegistry.register('XXX_020', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { ATK: 5 });
      buff.trigger(ctx.source);
    }
  },
});

// XXX_021 - [c]DEBUG/Spell_Buff_Health_5
// Give +5 Health
cardScriptsRegistry.register('XXX_021', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { HEALTH: 5 });
      buff.trigger(ctx.source);
    }
  },
});

// XXX_022 - [c]DEBUG/Spell_Buff_5_5
// Give +5/+5
cardScriptsRegistry.register('XXX_022', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { ATK: 5, HEALTH: 5 });
      buff.trigger(ctx.source);
    }
  },
});

// XXX_022e
cardScriptsRegistry.register('XXX_022e', {
});

// XXX_023 - [c]DEBUG/Spell_Divine_Shield
// Give Divine Shield
cardScriptsRegistry.register('XXX_023', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { divineShield: true });
      buff.trigger(ctx.source);
    }
  },
});

// XXX_024
cardScriptsRegistry.register('XXX_024', {
  events: {
    // Debug/placeholder card - no implementation needed
  },
});

// XXX_025
cardScriptsRegistry.register('XXX_025', {
});

// XXX_026
cardScriptsRegistry.register('XXX_026', {
});

// XXX_027
cardScriptsRegistry.register('XXX_027', {
});

// XXX_029 - Bounce a minion
cardScriptsRegistry.register('XXX_029', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const bounce = new Bounce();
      bounce.trigger(ctx.source, target);
    }
  },
});

// XXX_030 - Draw a card
cardScriptsRegistry.register('XXX_030', {
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// XXX_039 - Deal 3 damage
cardScriptsRegistry.register('XXX_039', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// XXX_041 - Summon a 3/3
cardScriptsRegistry.register('XXX_041', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'CS2_101');
    summon.trigger(ctx.source);
  },
});

// XXX_042 - Give +1/+1 to all minions
cardScriptsRegistry.register('XXX_042', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Buff all friendly minions
    const field = controller.field || [];
    for (const minion of field) {
      const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
    // Buff all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// XXX_043 - Restore 5 health
cardScriptsRegistry.register('XXX_043', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const heal = new Heal(ctx.source, target, 5);
      heal.trigger(ctx.source);
    }
  },
});

// XXX_044 - Destroy a minion
cardScriptsRegistry.register('XXX_044', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, target);
    }
  },
});

// XXX_045 - Freeze a minion
cardScriptsRegistry.register('XXX_045', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const freeze = new Freeze();
      freeze.trigger(ctx.source, target);
    }
  },
});

// XXX_046 - Silence a minion
cardScriptsRegistry.register('XXX_046', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const silence = new Silence(ctx.source, target);
      silence.trigger(ctx.source);
    }
  },
});

// XXX_047 - Shuffle a card into deck
cardScriptsRegistry.register('XXX_047', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Shuffle a generic card into deck
    const shuffle = new Shuffle('CS2_101');
    shuffle.trigger(ctx.source);
  },
});

// XXX_048 - Discard random cards
cardScriptsRegistry.register('XXX_048', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    if (hand.length > 0) {
      // Discard a random card (simplified - just remove one)
      hand.pop();
    }
  },
});

// XXX_049
cardScriptsRegistry.register('XXX_049', {
});

// XXX_050 - Gain 5 mana crystals
cardScriptsRegistry.register('XXX_050', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if ((controller as any).maxMana !== undefined) {
      (controller as any).maxMana += 5;
    }
  },
});

// XXX_051 - Draw 2 cards
cardScriptsRegistry.register('XXX_051', {
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 2);
    draw.trigger(ctx.source);
  },
});

// XXX_052 - Summon 2 minions
cardScriptsRegistry.register('XXX_052', {
  play: (ctx: ActionContext) => {
    for (let i = 0; i < 2; i++) {
      const summon = new Summon(ctx.source, 'CS2_101');
      summon.trigger(ctx.source);
    }
  },
});

// XXX_053 - Deal 4 damage to all minions
cardScriptsRegistry.register('XXX_053', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all friendly minions
    const field = controller.field || [];
    for (const minion of field) {
      const damage = new Damage(ctx.source, minion, 4);
      damage.trigger(ctx.source);
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 4);
      damage.trigger(ctx.source);
    }
  },
});

// XXX_054
cardScriptsRegistry.register('XXX_054', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hero = controller?.hero;
    if (hero) {
      const damage = new Damage(ctx.source, hero, 2);
      damage.trigger(ctx.source);
    }
  },
});

// XXX_055
cardScriptsRegistry.register('XXX_055', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hero = controller?.hero;
    if (hero) {
      const heal = new Heal(ctx.source, hero, 10);
      heal.trigger(ctx.source);
    }
  },
});

// XXX_056
cardScriptsRegistry.register('XXX_056', {
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 5);
    draw.trigger(ctx.source);
  },
});

// XXX_057
cardScriptsRegistry.register('XXX_057', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'CS2_101');
    summon.trigger(ctx.source);
    const summon2 = new Summon(ctx.source, 'CS2_101');
    summon2.trigger(ctx.source);
    const summon3 = new Summon(ctx.source, 'CS2_101');
    summon3.trigger(ctx.source);
  },
});

// XXX_058
cardScriptsRegistry.register('XXX_058', {
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { ATK: 3, HEALTH: 3 });
      buff.trigger(ctx.source);
    }
  },
});

// XXX_058e
cardScriptsRegistry.register('XXX_058e', {
});

// XXX_059
cardScriptsRegistry.register('XXX_059', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    if (field.length > 0) {
      const randomTarget = field[Math.floor(Math.random() * field.length)];
      const damage = new Damage(ctx.source, randomTarget, 5);
      damage.trigger(ctx.source);
    }
  },
});

// XXX_060
cardScriptsRegistry.register('XXX_060', {
  events: {
    AFTER_MINION_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 1) + 1;
    },
  },
});

// XXX_061
cardScriptsRegistry.register('XXX_061', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 2) + 2;
    },
  },
});

// XXX_062
cardScriptsRegistry.register('XXX_062', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const enemyField = controller.opponent?.field || [];
      for (const minion of enemyField) {
        const damage = new Damage(ctx.source, minion, 1);
        damage.trigger(ctx.source);
      }
    },
  },
});

// XXX_063 - Gain 8 armor
cardScriptsRegistry.register('XXX_063', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const armorGain = new GainArmor(ctx.source, controller.hero, 8);
    armorGain.trigger(ctx.source);
  },
});

// XXX_065 - Summon Ragnaros (8/8)
cardScriptsRegistry.register('XXX_065', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'CS2_101');
    summon.trigger(ctx.source);
  },
});

// XXX_094
cardScriptsRegistry.register('XXX_094', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    (controller as any).maxMana = 10;
    (controller as any).mana = 10;
  },
});

// XXX_095
cardScriptsRegistry.register('XXX_095', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hero = controller?.hero;
    if (hero) {
      const heal = new Heal(ctx.source, hero, 30);
      heal.trigger(ctx.source);
    }
  },
});

// XXX_096
cardScriptsRegistry.register('XXX_096', {
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 3);
    draw.trigger(ctx.source);
  },
});

// XXX_097 - Destroy all minions
cardScriptsRegistry.register('XXX_097', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Destroy all friendly minions
    const field = [...(controller.field || [])];
    for (const minion of field) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, minion);
    }
    // Destroy all enemy minions
    const oppField = [...(opponent.field || [])];
    for (const minion of oppField) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, minion);
    }
  },
});

// XXX_098 - Fill board with minions
cardScriptsRegistry.register('XXX_098', {
  play: (ctx: ActionContext) => {
    for (let i = 0; i < 7; i++) {
      const summon = new Summon(ctx.source, 'CS2_101');
      summon.trigger(ctx.source);
    }
  },
});

// XXX_099
cardScriptsRegistry.register('XXX_099', {
});

// XXX_999_Crash
cardScriptsRegistry.register('XXX_999_Crash', {
});
