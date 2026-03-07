// witchwood - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import type { ScriptEntity, CardReference } from '../types';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy, Bounce } from '../../../actions';

// GIL_117 - Furious Ettin - Taunt. Battlecry: Deal 5 damage to the enemy hero
cardScriptsRegistry.register('GIL_117', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const opponent = controller.opponent;
      const damage = new Damage(source, opponent.hero, 2);
      damage.trigger(source);
    },
  },
});

// GIL_124 - Shudderwraith - Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('GIL_124', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source) {
        const { executeDeathrattle } = require('../../index');
        executeDeathrattle(minion);
      }
    }
  },
});

// GIL_581 - Sandbinder - Battlecry: Add a random Beast/Dragon/Murloc card to your hand
cardScriptsRegistry.register('GIL_581', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    if (hand.length < 10) {
      // Add a random Beast/Dragon/Murloc card to your hand (handled by game)
    }
  },
});

// GIL_614 - Sandbinder
cardScriptsRegistry.register('GIL_614', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    // Battlecry: Add a random Beast/Dragon/Murloc card to your hand
    const source = ctx.source as ScriptEntity;
    const controller = source.controller;
    if (controller && controller.hand && controller.hand.length < 10) {
      const cards = [
        // Beasts
        'CS2_101', 'CS2_102', 'CS2_103', 'CS2_104', 'CS2_105', 'DS1_066',
        'DS1_070', 'DS1_175', 'DS1_184', 'EX1_531', 'EX1_539', 'EX1_543',
        'EX1_544', 'EX1_545', 'EX1_549', 'EX1_550', 'EX1_551', 'EX1_554',
        'EX1_555', 'FP1_011', 'FP1_012', 'FP1_013', 'FP1_014', 'FP1_015',
        'FP1_016', 'FP1_017', 'FP1_018', 'FP1_019', 'FP1_020', 'FP1_021',
        'FP1_022', 'FP1_023', 'FP1_024', 'FP1_025', 'GIL_200', 'GIL_201',
        'GIL_202', 'GIL_203', 'GIL_204', 'GIL_205', 'GIL_206', 'GIL_207',
        'GIL_208', 'GIL_209', 'GIL_210', 'GIL_211', 'GIL_212', 'GIL_213',
        // Dragons
        'DRG_001', 'DRG_002', 'DRG_003', 'DRG_006', 'DRG_007', 'DRG_008',
        'DRG_009', 'DRG_010', 'DRG_012', 'DRG_013', 'DRG_014', 'DRG_015',
        'DRG_016', 'DRG_017', 'DRG_019', 'DRG_020', 'DRG_021', 'DRG_022',
        // Murlocs
        'CS2_168', 'CS2_169', 'CS2_170', 'EX1_129', 'EX1_506', 'EX1_508',
        'NEW1_009', 'NEW1_017', 'tt_010', 'CFM_310', 'CFM_311', 'CFM_312',
        'GIL_507', 'GIL_503', 'GIL_504', 'GIL_505', 'GIL_506', 'GIL_508',
      ];
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      const cardRef: CardReference = { id: randomCard };
      controller.hand.push(cardRef as any);
    }
  },
});

// GIL_616 - Corrupted Healbot - Deathrattle: Restore 8 Health to your hero
cardScriptsRegistry.register('GIL_616', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const heal = new Heal(source, controller.hero, 8);
    heal.trigger(source);
  },
});

// GIL_616t - Corrupted Healbot (Heroic)
cardScriptsRegistry.register('GIL_616t', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const heal = new Heal(source, controller.hero, 8);
    heal.trigger(source);
  },
});

// GIL_682 - Totem Inspector - Battlecry: Add a random Totem to your hand
cardScriptsRegistry.register('GIL_682', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    if (hand.length < 10) {
      // Add a random Totem to your hand (handled by game)
    }
  },
});

// GIL_815 - Nightscale Matriarch - Battlecry: If your opponent has 4 or more minions, restore 4 Health
cardScriptsRegistry.register('GIL_815', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    if (oppField.length >= 4) {
      const heal = new Heal(source, controller.hero, 4);
      heal.trigger(source);
    }
  },
});

// GIL_819 - Rotten Applebaum - Deathrattle: Restore 4 Health to your hero
cardScriptsRegistry.register('GIL_819', {
});
