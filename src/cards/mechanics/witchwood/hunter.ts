// witchwood - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import type { ScriptEntity, CardReference } from '../types';
import { PlayReq } from '../../../enums/playreq';

// GIL_128
cardScriptsRegistry.register('GIL_128', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_587 - Morgl the Oracle (Legendary Murloc)
cardScriptsRegistry.register('GIL_587', {
  play: (ctx: ActionContext) => {
    // Battlecry: Add a random Murloc/Beast/Dragon card to your hand
    const source = ctx.source as ScriptEntity;
    const controller = source.controller;
    if (controller && controller.hand && controller.hand.length < 10) {
      // Pool of Murloc, Beast, and Dragon cards
      const cards = [
        // Murlocs
        'CS2_168', 'CS2_169', 'CS2_170', 'EX1_129', 'EX1_506', 'EX1_508',
        'NEW1_009', 'NEW1_017', 'tt_010', 'CFM_310', 'CFM_311', 'CFM_312',
        'GIL_507', 'GIL_503', 'GIL_504', 'GIL_505', 'GIL_506', 'GIL_508',
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
      ];
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      const cardRef: CardReference = { id: randomCard };
      controller.hand.push(cardRef as any);
    }
  },
});

// GIL_128e
cardScriptsRegistry.register('GIL_128e', {
});

// GIL_200
cardScriptsRegistry.register('GIL_200', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// GIL_200t
cardScriptsRegistry.register('GIL_200t', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// GIL_200e
cardScriptsRegistry.register('GIL_200e', {
});

// GIL_607
cardScriptsRegistry.register('GIL_607', {
  events: {
    // TODO: implement events
  },
});

// GIL_650
cardScriptsRegistry.register('GIL_650', {
});

// GIL_905
cardScriptsRegistry.register('GIL_905', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_518
cardScriptsRegistry.register('GIL_518', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
});

// GIL_577
cardScriptsRegistry.register('GIL_577', {
});

// GIL_828
cardScriptsRegistry.register('GIL_828', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
