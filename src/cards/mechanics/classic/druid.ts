// classic - druid.py
import { cardScriptsRegistry, ActionContext, Actions } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// EX1_165 - Druid of the Claw
cardScriptsRegistry.register('EX1_165', {
  choose: ['EX1_165a', 'EX1_165b'],
});

// EX1_165a - Cat Form (WOTOG)
cardScriptsRegistry.register('EX1_165a', {
  play: (ctx: ActionContext) => {
    // Transform into 7/6 cat with Charge
    const { Morph } = require('../../../actions/morph');
    const morphAction = new Morph('EX1_165t1');
    morphAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_165b - Bear Form (WOTOG)
cardScriptsRegistry.register('EX1_165b', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Transform into 4/9 bear with Taunt
    const { Morph } = require('../../../actions/morph');
    const morphAction = new Morph('EX1_165t2');
    morphAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_166 - Druid of the Flame
cardScriptsRegistry.register('EX1_166', {
  choose: ['EX1_166a', 'EX1_166b'],
});

// EX1_166a - Fire Form (WOTOG)
cardScriptsRegistry.register('EX1_166a', {
  play: (ctx: ActionContext) => {
    // Transform into 7/6 flame
    const { Morph } = require('../../../actions/morph');
    const morphAction = new Morph('EX1_166t');
    morphAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_166b - Flame (WOTOG)
cardScriptsRegistry.register('EX1_166b', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Transform into 7/6 flame
    const { Morph } = require('../../../actions/morph');
    const morphAction = new Morph('EX1_166t');
    morphAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_178 - Mark of Nature
cardScriptsRegistry.register('EX1_178', {
  choose: ['EX1_178a', 'EX1_178b'],
});

// EX1_178a - Fury Tiger's (+4 Attack)
cardScriptsRegistry.register('EX1_178a', {
  play: (ctx: ActionContext) => {
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_178e', { ATK: 4 });
    buffAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_178b - Strengthen (WOTOG) (+4 Health)
cardScriptsRegistry.register('EX1_178b', {
  play: (ctx: ActionContext) => {
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_178e2', { HEALTH: 4 });
    buffAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_573 - Ancient of Lore
cardScriptsRegistry.register('EX1_573', {
  choose: ['EX1_573a', 'EX1_573b'],
});

// EX1_573a - Ancient of War (WOTOG)
cardScriptsRegistry.register('EX1_573a', {
  play: (ctx: ActionContext) => {
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_573ae', { HEALTH: 5, ATK: 5 });
    buffAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_573b - Ancient of War (WOTOG)
cardScriptsRegistry.register('EX1_573b', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_573be', { HEALTH: 5 });
    buffAction.trigger(ctx.source, ctx.source);
    // Restore 5 Health to target
    const { Heal } = require('../../../actions/heal');
    const healAction = new Heal(5);
    healAction.trigger(ctx.source, ctx.target!);
  },
});

// NEW1_008 - Ironbark Protector
cardScriptsRegistry.register('NEW1_008', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('NEW1_008e', { HEALTH: 2 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// NEW1_008a - Ironbark (WOTOG)
cardScriptsRegistry.register('NEW1_008a', {
  play: (ctx: ActionContext) => {
    // Grant Taunt to target
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('CS2_101e', { TAUNT: 1 });
    buffAction.trigger(ctx.source, ctx.source);
  },
});

// NEW1_008b - Ironbark (WOTOG)
cardScriptsRegistry.register('NEW1_008b', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Grant Taunt to target
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('CS2_101e', { TAUNT: 1 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_005 - Claw
cardScriptsRegistry.register('CS2_005', {
  play: (ctx: ActionContext) => {
    // Gain 2 Armor
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 2;
    }
    // Deal 2 damage to the enemy hero
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(2);
    const opponent = controller.opponent;
    damageAction.trigger(ctx.source, opponent.hero);
  },
});

// CS2_007 - Healing Touch
cardScriptsRegistry.register('CS2_007', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Restore 8 Health to target
    const { Heal } = require('../../../actions/heal');
    const healAction = new Heal(8);
    healAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_008 - Moonfire
cardScriptsRegistry.register('CS2_008', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage to target
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(2);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_009 - Mark of the Wild
cardScriptsRegistry.register('CS2_009', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give Taunt and +2/+3 to target minion
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('CS2_009e', { ATK: 2, HEALTH: 3, TAUNT: 1 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_011 - Savagery
cardScriptsRegistry.register('CS2_011', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal damage equal to Attack to target
    const target = ctx.target as any;
    const attack = target.attack || 0;
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(attack);
    damageAction.trigger(ctx.source, target);
  },
});

// CS2_012 - Swipe
cardScriptsRegistry.register('CS2_012', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage to enemy hero, 1 damage to all other enemies
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Deal 4 damage to enemy hero
    const { Damage } = require('../../../actions/damage');
    const damage4 = new Damage(4);
    damage4.trigger(ctx.source, opponent.hero);

    // Deal 1 damage to enemy minions
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const damage1 = new Damage(1);
      damage1.trigger(ctx.source, minion);
    }
  },
});

// CS2_013 - Starfire
cardScriptsRegistry.register('CS2_013', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 5 damage to target
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(5);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_013t - Doom (WOTOG)
cardScriptsRegistry.register('CS2_013t', {
  play: (ctx: ActionContext) => {
    // Destroy target
    (ctx.source as any).destroyed = true;
  },
});

// EX1_154 - Soul of the Forest
cardScriptsRegistry.register('EX1_154', {
  choose: ['EX1_154a', 'EX1_154b'],
});

// EX1_154a - Web (WOTOG)
cardScriptsRegistry.register('EX1_154a', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target Taunt
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('CS2_101e', { TAUNT: 1 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_154b - Claw (WOTOG)
cardScriptsRegistry.register('EX1_154b', {
  play: (ctx: ActionContext) => {
    // Gain +2 Attack this turn
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_154be', { ATK: 2 });
    buffAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_155 - Power of the Wild
cardScriptsRegistry.register('EX1_155', {
  choose: ['EX1_155a', 'EX1_155b'],
});

// EX1_155a - Summon a Panther (WOTOG)
cardScriptsRegistry.register('EX1_155a', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target +2/+1
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_155ae', { ATK: 2, HEALTH: 1 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_155b - Leader (WOTOG)
cardScriptsRegistry.register('EX1_155b', {
  play: (ctx: ActionContext) => {
    // Give your other minions +2/+1
    const controller = (ctx.source as any).controller;
    const friendlyMinions = (controller.field || []).filter((m: any) => m !== ctx.source);
    for (const minion of friendlyMinions) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('EX1_155be', { ATK: 2, HEALTH: 1 });
      buffAction.trigger(ctx.source, minion);
    }
  },
});

// EX1_158 - Soul of the Forest
cardScriptsRegistry.register('EX1_158', {
  play: (ctx: ActionContext) => {
    // Give your minions "Deathrattle: Summon a 2/2 Sapling"
    const controller = (ctx.source as any).controller;
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('EX1_158e');
      buffAction.trigger(ctx.source, minion);
    }
  },
});

// EX1_158e - Soul of the Forest Enchantment
cardScriptsRegistry.register('EX1_158e', {
  deathrattle: (ctx: ActionContext) => {
    // Summon a 2/2 Sapling
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('EX1_158t');
    summonAction.trigger(ctx.source);
  },
});

// EX1_160 - Force of Nature
cardScriptsRegistry.register('EX1_160', {
  choose: ['EX1_160a', 'EX1_160b'],
});

// EX1_160a - Rooted (WOTOG)
cardScriptsRegistry.register('EX1_160a', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target +5/+5
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_160ae', { ATK: 5, HEALTH: 5 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_160b - Uproot (WOTOG)
cardScriptsRegistry.register('EX1_160b', {
  play: (ctx: ActionContext) => {
    // Gain +5 Attack
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_160be', { ATK: 5 });
    buffAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_161 - Keeper of the Grove
cardScriptsRegistry.register('EX1_161', {
  choose: ['EX1_161a', 'EX1_161b'],
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// EX1_161a - Moonfire (WOTOG)
cardScriptsRegistry.register('EX1_161a', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(2);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_161b - Dispel (WOTOG)
cardScriptsRegistry.register('EX1_161b', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Silence target minion
    const target = ctx.target as any;
    target.silenced = true;
    target.buffs = [];
  },
});

// EX1_164 - Innervate
cardScriptsRegistry.register('EX1_164', {
  play: (ctx: ActionContext) => {
    // Gain 1 Mana Crystal this turn only
    const controller = (ctx.source as any).controller;
    controller.mana = (controller.mana || 0) + 1;
    controller.tempMana = (controller.tempMana || 0) + 1;
  },
});

// EX1_164a - Lightning (WOTOG)
cardScriptsRegistry.register('EX1_164a', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(2);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_164b - Lightning (WOTOG)
cardScriptsRegistry.register('EX1_164b', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(2);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_169 - Force of Nature
cardScriptsRegistry.register('EX1_169', {
  play: (ctx: ActionContext) => {
    // Summon two 2/2 Treants
    const { Summon } = require('../../../actions/summon');
    const summonAction1 = new Summon('EX1_169t');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon('EX1_169t');
    summonAction2.trigger(ctx.source);
  },
});

// EX1_173 - Starfall
cardScriptsRegistry.register('EX1_173', {
  choose: ['EX1_173a', 'EX1_173b'],
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// EX1_173a - New Moon (WOTOG)
cardScriptsRegistry.register('EX1_173a', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 5 damage to a minion
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(5);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_173b - Full Moon (WOTOG)
cardScriptsRegistry.register('EX1_173b', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage to all enemy minions
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, minion);
    }
  },
});

// EX1_570 - Bite
cardScriptsRegistry.register('EX1_570', {
  play: (ctx: ActionContext) => {
    // Gain 4 Armor
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 4;
    }
    // Gain 4 Attack this turn
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_570e', { ATK: 4 });
    buffAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_571 - Force of Nature
cardScriptsRegistry.register('EX1_571', {
  requirements: {
    [PlayReq.REQ_MINION_CAP]: 0,
  },
  play: (ctx: ActionContext) => {
    // Summon 2/2 Treants with Taunt
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('EX1_571t');
    summonAction.trigger(ctx.source);
  },
});

// EX1_578 - Druid of the Swarm
cardScriptsRegistry.register('EX1_578', {
  choose: ['EX1_578a', 'EX1_578b'],
});

// EX1_578a - Spider Form (WOTOG)
cardScriptsRegistry.register('EX1_578a', {
  play: (ctx: ActionContext) => {
    // Transform into 2/3 spider
    const { Morph } = require('../../../actions/morph');
    const morphAction = new Morph('EX1_578t');
    morphAction.trigger(ctx.source, ctx.source);
  },
});

// EX1_578b - Swarm (WOTOG)
cardScriptsRegistry.register('EX1_578b', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Transform target into 1/1 spider
    const { Morph } = require('../../../actions/morph');
    const morphAction = new Morph('EX1_578t2');
    morphAction.trigger(ctx.source, ctx.target!);
  },
});

// NEW1_007 - Ancient of War
cardScriptsRegistry.register('NEW1_007', {
  choose: ['NEW1_007a', 'NEW1_007b'],
});

// NEW1_007a - Rooted (WOTOG)
cardScriptsRegistry.register('NEW1_007a', {
  play: (ctx: ActionContext) => {
    // Gain +5 Health and Taunt
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('NEW1_007ae', { HEALTH: 5, TAUNT: 1 });
    buffAction.trigger(ctx.source, ctx.source);
  },
});

// NEW1_007b - Uprooted (WOTOG)
cardScriptsRegistry.register('NEW1_007b', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Transform into 5/4 with Rush
    const { Morph } = require('../../../actions/morph');
    const morphAction = new Morph('NEW1_007t');
    morphAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_183 - Ironbark Protector
cardScriptsRegistry.register('EX1_183', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target minion +2/+8 and Taunt
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_183e', { ATK: 2, HEALTH: 8, TAUNT: 1 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});
