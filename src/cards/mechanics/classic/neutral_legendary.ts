// classic - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Summon, Shuffle, Give, Heal } from '../../../actions';

// EX1_002 - Lord of the Arena - Battlecry: Give other friendly minions +1/+1
cardScriptsRegistry.register('EX1_002', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== ctx.source) {
        const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// EX1_012 - Onyxia - Deathrattle: Summon 2/4/6 1/1 Whelps
cardScriptsRegistry.register('EX1_012', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const level = controller.secrets?.length || 1;
    for (let i = 0; i < level * 2; i++) {
      const summon = new Summon(ctx.source, 'EX1_012t');
      summon.trigger(ctx.source);
    }
  },
});

// EX1_014 - Timber Wolf - Battlecry: Give your other Beasts +1/+1
cardScriptsRegistry.register('EX1_014', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== ctx.source && minion.race === 'Beast') {
        const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// EX1_014t - Timber Wolf - base card, no special effect
cardScriptsRegistry.register('EX1_014t', {});

// EX1_016 - King Krush - Charge (handled by game)
cardScriptsRegistry.register('EX1_016', {
  play: (ctx: ActionContext) => {
    // Charge is handled by game
  },
});

// EX1_062
cardScriptsRegistry.register('EX1_062', {
});

// EX1_083 - Loot Hoarder - Deathrattle: Draw a card
cardScriptsRegistry.register('EX1_083', {
  deathrattle: (ctx: ActionContext) => {
    const draw = new Draw((ctx.source as any).controller);
    draw.trigger(ctx.source);
  },
});

// EX1_100 - Silver Vanguard - Deathrattle: Discover a minion
cardScriptsRegistry.register('EX1_100', {
  deathrattle: (ctx: ActionContext) => {
    // Discover a minion - handled by game
  },
});

// EX1_110 - Cairne Bloodhoof - Taunt. Deathrattle: Summon Baine Bloodhoof (5/5)
cardScriptsRegistry.register('EX1_110', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    // Baine Bloodhoof card ID
    const summonAction = new Summon('EX1_110t');
    summonAction.trigger(ctx.source);
  },
});

// EX1_112 - Mountain Fire - Battlecry: Deal 3 damage
cardScriptsRegistry.register('EX1_112', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const damage = new Damage(ctx.source, opponent.hero, 3);
    damage.trigger(ctx.source);
  },
});

// Mekka1 - Fencing Coach - Battlecry: The next secret you play costs (3) less
cardScriptsRegistry.register('Mekka1', {
  play: (ctx: ActionContext) => {
    // Handled by game - next secret costs 3 less
  },
});

// Mekka2 - Junkbot - Deathrattle: Give +2/+2 to your Mechs
cardScriptsRegistry.register('Mekka2', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion.race === 'Mech') {
        const buff = new Buff(ctx.source, minion, { ATK: 2, HEALTH: 2 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// Mekka3 - Shudderwraith - Battlecry: Deal 3 damage
cardScriptsRegistry.register('Mekka3', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const damage = new Damage(ctx.source, opponent.hero, 3);
    damage.trigger(ctx.source);
  },
});

// Mekka4 - 闲置的消防员 - 奥秘：在你的回合结束时，使所有其他随从获得+1/+1
cardScriptsRegistry.register('Mekka4', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      for (const minion of field) {
        if (minion !== ctx.source) {
          const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
          buff.trigger(ctx.source);
        }
      }
    },
  },
});

// EX1_116 - Leeroy Jenkins - Battlecry: Summon two 1/1 Whelps
cardScriptsRegistry.register('EX1_116', {
  play: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'EX1_116t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon(ctx.source, 'EX1_116t');
    summon2.trigger(ctx.source);
  },
});

// EX1_249 - Acidic Swamp Ooze - Battlecry: Destroy enemy weapon
cardScriptsRegistry.register('EX1_249', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const weapon = (opponent as any).weapon;
    if (weapon) {
      weapon.destroy();
    }
  },
});

// EX1_298 - Spellbreaker - Battlecry: Silence a minion
cardScriptsRegistry.register('EX1_298', {
  play: (ctx: ActionContext) => {
    // Handled by game - target a minion to silence
  },
});

// EX1_557 - Nozdormu - At the end of your turn, take an extra turn
cardScriptsRegistry.register('EX1_557', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Extra turn is handled by game
    },
  },
});

// EX1_558 - Hakkar, the Soulflayer - Battlecry: Shuffle Corrupted Blood into both decks
cardScriptsRegistry.register('EX1_558', {
  play: (ctx: ActionContext) => {
    const shuffle1 = new Shuffle('EX1_534');
    shuffle1.trigger(ctx.source);
    const shuffle2 = new Shuffle('EX1_534');
    shuffle2.trigger(ctx.source);
  },
});

// EX1_560
cardScriptsRegistry.register('EX1_560', {
});

// EX1_561 - Earthen Ring Noble - Battlecry: Restore 3 Health
cardScriptsRegistry.register('EX1_561', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const heal = new Heal(ctx.source, target, 3);
      heal.trigger(ctx.source);
    }
  },
});

// EX1_561e - Earthen Ring Noble buff
cardScriptsRegistry.register('EX1_561e', {
});

// EX1_562 - Princess Huhuran - Deathrattle: Trigger a friendly minion's deathrattle
cardScriptsRegistry.register('EX1_562', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game - targets a friendly minion to trigger its deathrattle
  },
});

// EX1_572 - Vitality Totem - At the end of your turn, restore 3 Health to your hero
cardScriptsRegistry.register('EX1_572', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const heal = new Heal(ctx.source, controller.hero, 3);
      heal.trigger(ctx.source);
    },
  },
});

// DREAM_02 - Nightmare - Give a minion +5/+5 and return it to owner's hand
cardScriptsRegistry.register('DREAM_02', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { ATK: 5, HEALTH: 5 });
      buff.trigger(ctx.source);
      // Return to hand is handled by game
    }
  },
});

// DREAM_04 - Sleep - Return a minion to its owner's hand
cardScriptsRegistry.register('DREAM_04', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Return to hand is handled by game
  },
});

// DREAM_05 - Awaken - Deal 3 damage. If this kills a minion, summon a 5/5 Spirit
cardScriptsRegistry.register('DREAM_05', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// DREAM_05e - Awaken buff
cardScriptsRegistry.register('DREAM_05e', {});

// EX1_577 - Deathwing - Battlecry: Destroy all other minions
cardScriptsRegistry.register('EX1_577', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const controllerField = controller.field || [];
    const opponentField = opponent.field || [];
    for (const minion of [...controllerField, ...opponentField]) {
      minion.destroy();
    }
  },
});

// EX1_614 - Malygos - Battlecry: Gain +5 Spell Damage
cardScriptsRegistry.register('EX1_614', {
  play: (ctx: ActionContext) => {
    (ctx.source as any).spellDamage = 5;
  },
});

// NEW1_024 - Hungry Crab - Battlecry: Destroy a Murloc, gain +2/+2
cardScriptsRegistry.register('NEW1_024', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target as any;
    if (target && target.race === 'Murloc') {
      target.destroy();
      const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// NEW1_029 - Captain's Parrot - Deathrattle: Summon a random Pirate from your deck
cardScriptsRegistry.register('NEW1_029', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game - summon random pirate from deck
  },
});

// NEW1_029t - Parrot - no special effect
cardScriptsRegistry.register('NEW1_029t', {});

// NEW1_030 - Sudden Genesis - Battlecry: Summon a copy of this minion
cardScriptsRegistry.register('NEW1_030', {
  play: (ctx: ActionContext) => {
    // Handled by game - summon copy
  },
});

// NEW1_038 - Southsea Deckhand - Deathrattle: Draw a card
cardScriptsRegistry.register('NEW1_038', {
  deathrattle: (ctx: ActionContext) => {
    const draw = new Draw((ctx.source as any).controller);
    draw.trigger(ctx.source);
  },
});

// NEW1_040 - Patches the Pirate - Battlecry: If you have a pirate, give it Charge
cardScriptsRegistry.register('NEW1_040', {
  play: (ctx: ActionContext) => {
    // Handled by game - give Charge if you have a pirate in hand
  },
});

// PRO_001 - Brawl - Secret: At the end of your turn, choose a random minion to fight
cardScriptsRegistry.register('PRO_001', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Handled by game - choose random minion to fight
    },
  },
});

// PRO_001a - Brawl option 1
cardScriptsRegistry.register('PRO_001a', {});

// PRO_001b - Brawl option 2
cardScriptsRegistry.register('PRO_001b', {});

// PRO_001c - Brawl option 3
cardScriptsRegistry.register('PRO_001c', {});

// EX1_189 - Stonetusk Boar - Charge (handled by game)
cardScriptsRegistry.register('EX1_189', {
  play: (ctx: ActionContext) => {
    // Charge is handled by game
  },
});

// EX1_190 - Gruul - At the end of your turn, gain +1/+1
cardScriptsRegistry.register('EX1_190', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    },
  },
});
