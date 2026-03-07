// classic - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Bounce, Give, Shuffle, Silence, Freeze } from '../../../actions';
import { Race } from '../../../enums';

// CS2_181 - Injured Blademaster - Battlecry: Deal 4 damage to HIMSELF
cardScriptsRegistry.register('CS2_181', {
  play: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 4);
    damage.trigger(ctx.source);
  },
});

// EX1_001 - Lightwarden - Whenever a character is healed, gain +2 Attack
cardScriptsRegistry.register('EX1_001', {
  events: {
    HEAL: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 1) + 2;
    },
  },
});

// EX1_004 - Young Priestess - At the end of your turn, give another random friendly minion +1 Health
cardScriptsRegistry.register('EX1_004', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const friendlyMinions = (controller.field || []).filter((m: any) => m !== ctx.source);
      if (friendlyMinions.length > 0) {
        const randomIndex = Math.floor(Math.random() * friendlyMinions.length);
        const target = friendlyMinions[randomIndex];
        const { Buff } = require('../../../actions/buff');
        const buff = new Buff('EX1_004e', { HEALTH: 1 });
        buff.trigger(ctx.source, target);
      }
    },
  },
});

// EX1_006 - Alarm-o-Bot - At the start of your turn, swap this minion with a random one in your hand
cardScriptsRegistry.register('EX1_006', {
  events: {
    TURN_START: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const hand = controller.hand || [];
      const friendlyMinions = hand.filter((c: any) => c.type === 'minion');
      if (friendlyMinions.length > 0) {
        const randomIndex = Math.floor(Math.random() * friendlyMinions.length);
        // Swap logic would go here - simplified: just return the minion to hand
      }
    },
  },
});

// EX1_009
cardScriptsRegistry.register('EX1_009', {
});

// EX1_043 - Twilight Drake - Battlecry: Gain +1 Health for each card in your hand
cardScriptsRegistry.register('EX1_043', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const handSize = (controller.hand || []).length;
    const source = ctx.source as any;
    source.health = (source.health || 4) + handSize;
    source.maxHealth = (source.maxHealth || 4) + handSize;
  },
});

// EX1_044 - Questing Adventurer - Whenever you play a card, gain +1/+1
cardScriptsRegistry.register('EX1_044', {
  events: {
    PLAY_CARD: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 2) + 1;
      source.health = (source.health || 2) + 1;
    },
  },
});

// EX1_050 - Elven Archer - Battlecry: Deal 1 damage
cardScriptsRegistry.register('EX1_050', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// EX1_055 - Dalaran Mage - Spell Damage +1
cardScriptsRegistry.register('EX1_055', {
  events: {
    // Passive aura - spell damage handled by game loop
  },
});

// EX1_058 - Jungle Panther - Stealth
cardScriptsRegistry.register('EX1_058', {
  play: (ctx: ActionContext) => {
    // Already has stealth from card data
  },
});

// EX1_059 - Silverback Patriarch - Taunt
cardScriptsRegistry.register('EX1_059', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Already has taunt from card data
  },
});

// EX1_076 - Siltfin Spiritwalker - Battlecry: Give your other minions +1 Attack
cardScriptsRegistry.register('EX1_076', {
});

// EX1_080 - Windfury Harpy - Windfury
cardScriptsRegistry.register('EX1_080', {
  events: {
    // Windfury handled by game
  },
});

// EX1_085 - Shadowstep - Return a friendly minion to your hand. It costs (1) less
cardScriptsRegistry.register('EX1_085', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const bounce = new Bounce(ctx.target);
      bounce.trigger(ctx.source);
    }
  },
});

// EX1_089 - Coldlight Seer - Battlecry: Give other Murlocs +2 Health
cardScriptsRegistry.register('EX1_089', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== ctx.source && (minion as any).race === Race.MURLOC) {
        const buff = new Buff(ctx.source, minion, { HEALTH: 2 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// EX1_093 - Deviate Dreadfang - After you cast a spell, summon a 1/1 Vilefin Scout
cardScriptsRegistry.register('EX1_093', {
  play: (ctx: ActionContext) => {
    // Battlecry: Deal 3 damage
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// EX1_095 - Druid of the Claw - Choose One - Charge or +1 Health and Taunt
cardScriptsRegistry.register('EX1_095', {
  events: {
    // Choose One handled by game
  },
});

// EX1_097 - Murloc Tidecaller - After you summon a Murloc, gain +1 Attack
cardScriptsRegistry.register('EX1_097', {
  deathrattle: (ctx: ActionContext) => {
    // Deathrattle handled by game
  },
});

// EX1_103 - Old Murk-Eye - Charge. Battlecry: Deal 1 damage to each enemy minion
cardScriptsRegistry.register('EX1_103', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const damage = new Damage(ctx.source, minion, 1);
      damage.trigger(ctx.source);
    }
  },
});

// EX1_284 - Faceless Manipulator - Battlecry: Choose a minion to become a copy of
cardScriptsRegistry.register('EX1_284', {
  play: (ctx: ActionContext) => {
    // Copy target minion - handled by game
  },
});

// EX1_509 - Harrison Jones - Battlecry: Draw cards equal to your weapon's Durability
cardScriptsRegistry.register('EX1_509', {
  events: {
    // Weapon draw handled by game
  },
});

// EX1_584 - NO - Destroy a random enemy minion
cardScriptsRegistry.register('EX1_584', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];
    if (enemyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * enemyMinions.length);
      const target = enemyMinions[randomIndex];
      const destroy = new Destroy('EX1_584');
      destroy.trigger(ctx.source);
    }
  },
});

// EX1_597 - Cairne Bloodhoof - Deathrattle: Summon a 4/5 Baine Bloodhoof
cardScriptsRegistry.register('EX1_597', {
  events: {
    // Passive effect
  },
});

// EX1_616 - Nat Pagle - At the start of your turn, you have a 50% chance to draw an extra card
cardScriptsRegistry.register('EX1_616', {
});

// NEW1_019 - Millhouse Manastorm - Battlecry: Give your opponent 2 'Free Spells'
cardScriptsRegistry.register('NEW1_019', {
  events: {
    // Battlecry handled
  },
});

// NEW1_020 - King Mukla - Battlecry: Give your opponent 2 Bananas
cardScriptsRegistry.register('NEW1_020', {
  events: {
    // Battlecry handled
  },
});

// NEW1_025 - Sneed's Old Shredder - Deathrattle: Summon a random legendary minion
cardScriptsRegistry.register('NEW1_025', {
  play: (ctx: ActionContext) => {
    // Deathrattle triggers
  },
});

// NEW1_026 - Tinkmaster Overspark - Battlecry: Transform a random minion into a 5/5 or 1/1
cardScriptsRegistry.register('NEW1_026', {
  events: {
    // Battlecry handled
  },
});

// NEW1_037 - Pint-Sized Summoner - The first minion you play each turn costs (1) less
cardScriptsRegistry.register('NEW1_037', {
  events: {
    // Cost reduction handled by game
  },
});

// NEW1_038 - Sorcerer's Apprentice - Your spells cost (1) less
cardScriptsRegistry.register('NEW1_038', {
  events: {
    // Cost reduction handled by game
  },
});

// EX1_507 - Mogu'Shan Warden - Taunt
cardScriptsRegistry.register('EX1_507', {
});

// NEW1_040 - Fungal Enchanter - Battlecry: Restore 3 Health to each hero
cardScriptsRegistry.register('NEW1_040', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Heal both heroes
    const heal1 = new Heal(ctx.source, controller.hero, 3);
    heal1.trigger(ctx.source);
    const heal2 = new Heal(ctx.source, controller.opponent.hero, 3);
    heal2.trigger(ctx.source);
  },
});

// NEW1_041 - Scatter - Destroy a random enemy minion
cardScriptsRegistry.register('NEW1_041', {
  events: { /* TODO */ },
});
