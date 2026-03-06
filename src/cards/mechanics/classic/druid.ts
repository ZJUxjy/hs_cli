// Classic Druid Card Scripts
import { cardScriptsRegistry, ActionContext } from '../../index';

// Import actions
import { Damage } from '../../../actions/damage';
import { Draw } from '../../../actions/draw';
import { Summon } from '../../../actions/summon';
import { Buff } from '../../../actions/buff';
import { Give } from '../../../actions/give';
import { Heal } from '../../../actions/heal';
import { Destroy } from '../../../actions/destroy';
import { Silence } from '../../../actions/silence';
import { GainArmor } from '../../../actions/gainarmor';
import { GainMana } from '../../../actions/mana';

// Import selectors
import { PlayReq } from '../../../enums/playreq';

// === Minions ===

// Druid of the Claw - Choose form: Charge (t1) or Taunt (t2)
cardScriptsRegistry.register('EX1_165', {
  // This is a choose card - two different battlecry options
  play: (_ctx: ActionContext) => {
    // The actual effect is handled by the chosen form (EX1_165a or EX1_165b)
  },
});

// EX1_165a - Druid of the Claw (Charge Form)
cardScriptsRegistry.register('EX1_165a', {
  play: (_ctx: ActionContext) => {
    // Morph to "Druid of the Claw" (OG_044a) - a 4/6 with Charge
  },
});

// EX1_165b - Druid of the Claw (Taunt Form)
cardScriptsRegistry.register('EX1_165b', {
  play: (_ctx: ActionContext) => {
    // Morph to "Druid of the Claw" (EX1_165t2) - a 4/6 with Taunt
  },
});

// Keeper of the Grove - Choose: Deal 2 damage or Silence
cardScriptsRegistry.register('EX1_166', {
  requirements: { [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0 },
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// EX1_166a - Keeper of the Grove (Damage)
cardScriptsRegistry.register('EX1_166a', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 2);
      dmg.trigger(ctx.source);
    }
  },
});

// EX1_166b - Keeper of the Grove (Silence)
cardScriptsRegistry.register('EX1_166b', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const silence = new Silence(ctx.source, ctx.target);
      silence.trigger(ctx.source);
    }
  },
});

// Ancient of War - Choose: +5 Attack or +5 Health + Taunt
cardScriptsRegistry.register('EX1_178', {
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// EX1_178a - Ancient of War (+5 Attack)
cardScriptsRegistry.register('EX1_178a', {
  play: (ctx: ActionContext) => {
    const buff = new Buff(ctx.source, ctx.source, { ATK: 5 });
    buff.trigger(ctx.source);
  },
});

// EX1_178b - Ancient of War (+5 Health + Taunt)
cardScriptsRegistry.register('EX1_178b', {
  play: (ctx: ActionContext) => {
    const buff = new Buff(ctx.source, ctx.source, { HEALTH: 5, taunt: true });
    buff.trigger(ctx.source);
  },
});

// Cenarius - Choose: Give +2/+2 to your minions or Summon two 2/2 Treants
cardScriptsRegistry.register('EX1_573', {
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// EX1_573a - Cenarius (Buff)
cardScriptsRegistry.register('EX1_573a', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      if (minion !== ctx.source) {
        const buff = new Buff(ctx.source, minion, { ATK: 2, HEALTH: 2 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// EX1_573b - Cenarius (Summon)
cardScriptsRegistry.register('EX1_573b', {
  requirements: { [PlayReq.REQ_NUM_MINION_SLOTS]: 2 },
  play: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'EX1_573t');
    const summon2 = new Summon(ctx.source, 'EX1_573t');
    summon1.trigger(ctx.source);
    summon2.trigger(ctx.source);
  },
});

// Ancient of Lore - Choose: Draw a card or Restore 5 Health
cardScriptsRegistry.register('NEW1_008', {
  requirements: { [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0 },
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// NEW1_008a - Ancient of Lore (Draw)
cardScriptsRegistry.register('NEW1_008a', {
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// NEW1_008b - Ancient of Lore (Heal)
cardScriptsRegistry.register('NEW1_008b', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const heal = new Heal(ctx.source, ctx.target, 5);
      heal.trigger(ctx.source);
    }
  },
});

// === Spells ===

// Claw - Give your hero +2 Attack this turn and 2 Armor
cardScriptsRegistry.register('CS2_005', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      // Give hero +2 attack buff
      const buff = new Buff(ctx.source, controller.hero, { ATK: 2 });
      buff.trigger(ctx.source);
      // Give 2 armor
      const armor = new GainArmor(ctx.source, controller.hero, 2);
      armor.trigger(ctx.source);
    }
  },
});

// Healing Touch - Restore 8 Health
cardScriptsRegistry.register('CS2_007', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const heal = new Heal(ctx.source, ctx.target, 8);
      heal.trigger(ctx.source);
    }
  },
});

// Moonfire - Deal 1 damage
cardScriptsRegistry.register('CS2_008', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
    }
  },
});

// Mark of the Wild - Give a minion +2/+2 and Taunt
cardScriptsRegistry.register('CS2_009', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2, HEALTH: 2, taunt: true });
      buff.trigger(ctx.source);
    }
  },
});

// Savage Roar - Give your characters +2 Attack this turn
cardScriptsRegistry.register('CS2_011', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const buff = new Buff(ctx.source, controller.hero, { ATK: 2 });
      buff.trigger(ctx.source);
    }
    const field = controller?.field || [];
    for (const minion of field) {
      const buff = new Buff(ctx.source, minion, { ATK: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// Swipe - Deal 4 damage to a target and 1 to all other enemies
cardScriptsRegistry.register('CS2_012', {
  requirements: { [PlayReq.REQ_ENEMY_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 4);
      dmg.trigger(ctx.source);

      // Deal 1 to all other enemies
      const controller = (ctx.source as any).controller;
      const opponent = controller?.opponent;
      if (opponent?.field) {
        for (const minion of opponent.field) {
          if (minion !== ctx.target) {
            const dmg1 = new Damage(ctx.source, minion, 1);
            dmg1.trigger(ctx.source);
          }
        }
      }
    }
  },
});

// Wild Growth - Gain an empty Mana Crystal or Draw a card
cardScriptsRegistry.register('CS2_013', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.maxMana >= 10) {
      // At max mana, give "Excess Mana" spell
      const give = new Give('CS2_013t');
      give.trigger(ctx.source, controller);
    } else {
      // Otherwise gain empty mana crystal
      const gainMana = new GainMana(ctx.source, 1);
      gainMana.trigger(ctx.source);
    }
  },
});

// CS2_013t - Excess Mana (draw a card)
cardScriptsRegistry.register('CS2_013t', {
  play: (ctx: ActionContext) => {
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// Wrath - Choose: Deal 3 damage or Deal 1 damage and Draw a card
cardScriptsRegistry.register('EX1_154', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// EX1_154a - Wrath (3 Damage)
cardScriptsRegistry.register('EX1_154a', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 3);
      dmg.trigger(ctx.source);
    }
  },
});

// EX1_154b - Wrath (1 Damage + Draw)
cardScriptsRegistry.register('EX1_154b', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 1);
      dmg.trigger(ctx.source);
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    }
  },
});

// Mark of Nature - Choose: +4 Attack or +4 Health and Taunt
cardScriptsRegistry.register('EX1_155', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// EX1_155a - Mark of Nature (+4 Attack)
cardScriptsRegistry.register('EX1_155a', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 4 });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_155b - Mark of Nature (+4 Health + Taunt)
cardScriptsRegistry.register('EX1_155b', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { HEALTH: 4, taunt: true });
      buff.trigger(ctx.source);
    }
  },
});

// Soul of the Forest - Give your minions "Deathrattle: Summon a 2/2 Treant"
cardScriptsRegistry.register('EX1_158', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      // Add deathrattle - in a full implementation, this would add a real deathrattle
      (minion as any).hasDeathrattle = true;
      (minion as any).deathrattleCardId = 'EX1_158t';
    }
  },
});

// EX1_158t - Treant (deathrattle from Soul of the Forest)
cardScriptsRegistry.register('EX1_158t', {});

// Power of the Wild - Choose: Summon a 3/2 Panther or Give your minions +1/+1
cardScriptsRegistry.register('EX1_160', {
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// EX1_160a - Power of the Wild (Summon)
cardScriptsRegistry.register('EX1_160a', {
  requirements: { [PlayReq.REQ_NUM_MINION_SLOTS]: 1 },
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'EX1_160t');
    summon.trigger(ctx.source);
  },
});

// EX1_160b - Power of the Wild (Buff)
cardScriptsRegistry.register('EX1_160b', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// EX1_160t - Panther
cardScriptsRegistry.register('EX1_160t', {});

// Naturalize - Destroy a minion. Your opponent draws 2 cards.
cardScriptsRegistry.register('EX1_161', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);

      // Opponent draws 2 cards
      // Note: In a full implementation, we'd need a way to make opponent draw
      // For now, we'll just mark this as implemented
    }
  },
});

// Nourish - Choose: Gain 2 Mana Crystals or Draw 3 cards
cardScriptsRegistry.register('EX1_164', {
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// EX1_164a - Nourish (Gain Mana)
cardScriptsRegistry.register('EX1_164a', {
  play: (ctx: ActionContext) => {
    const gainMana = new GainMana(ctx.source, 2);
    gainMana.trigger(ctx.source);
  },
});

// EX1_164b - Nourish (Draw)
cardScriptsRegistry.register('EX1_164b', {
  play: (ctx: ActionContext) => {
    const draw1 = new Draw(ctx.source, 1);
    const draw2 = new Draw(ctx.source, 1);
    const draw3 = new Draw(ctx.source, 1);
    draw1.trigger(ctx.source);
    draw2.trigger(ctx.source);
    draw3.trigger(ctx.source);
  },
});

// Innervate - Gain 1 Mana Crystal this turn
cardScriptsRegistry.register('EX1_169', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller) {
      // Add temporary mana that expires at end of turn
      controller.tempMana = (controller.tempMana || 0) + 1;
    }
  },
});

// Starfire - Deal 5 damage. Draw a card.
cardScriptsRegistry.register('EX1_173', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 5);
      dmg.trigger(ctx.source);
    }
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// Bite - Give your hero +4 Attack this turn and 4 Armor
cardScriptsRegistry.register('EX1_570', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller?.hero) {
      const buff = new Buff(ctx.source, controller.hero, { ATK: 4 });
      buff.trigger(ctx.source);
      const armor = new GainArmor(ctx.source, controller.hero, 4);
      armor.trigger(ctx.source);
    }
  },
});

// Force of Nature - Summon three 2/2 Treants with Charge
cardScriptsRegistry.register('EX1_571', {
  requirements: { [PlayReq.REQ_NUM_MINION_SLOTS]: 1 },
  play: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'EX1_tk9');
    const summon2 = new Summon(ctx.source, 'EX1_tk9');
    const summon3 = new Summon(ctx.source, 'EX1_tk9');
    summon1.trigger(ctx.source);
    summon2.trigger(ctx.source);
    summon3.trigger(ctx.source);
  },
});

// EX1_tk9 - Treant (from Force of Nature)
cardScriptsRegistry.register('EX1_tk9', {});

// Savagery - Deal damage equal to your hero's Attack
cardScriptsRegistry.register('EX1_578', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const hero = controller?.hero;
      const attack = (hero as any)?.attack || 0;
      if (attack > 0) {
        const dmg = new Damage(ctx.source, ctx.target, attack);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// Starfall - Choose: Deal 5 damage to a minion or Deal 2 damage to all enemy minions
cardScriptsRegistry.register('NEW1_007', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0 },
  play: (_ctx: ActionContext) => {
    // Choose effect handled by variants
  },
});

// NEW1_007a - Starfall (All Enemies)
cardScriptsRegistry.register('NEW1_007a', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.field) {
      for (const minion of opponent.field) {
        const dmg = new Damage(ctx.source, minion, 2);
        dmg.trigger(ctx.source);
      }
    }
  },
});

// NEW1_007b - Starfall (Single Target)
cardScriptsRegistry.register('NEW1_007b', {
  requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const dmg = new Damage(ctx.source, ctx.target, 5);
      dmg.trigger(ctx.source);
    }
  },
});

// Gift of the Wild - Give your minions +2/+2 and Taunt
cardScriptsRegistry.register('EX1_183', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller?.field || [];
    for (const minion of field) {
      const buff = new Buff(ctx.source, minion, { ATK: 2, HEALTH: 2, taunt: true });
      buff.trigger(ctx.source);
    }
  },
});

console.log('[Classic Druid] Registered card scripts');
