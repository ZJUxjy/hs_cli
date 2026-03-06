// witchwood - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// GIL_117
cardScriptsRegistry.register('GIL_117', {
  events: {
    // TODO: implement events
  },
});

// GIL_124
cardScriptsRegistry.register('GIL_124', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_581
cardScriptsRegistry.register('GIL_581', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_614 - Sandbinder
cardScriptsRegistry.register('GIL_614', {
  requirements: {
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    // Battlecry: Add a random Beast/Dragon/Murloc card to your hand
    const controller = (ctx.source as any).controller;
    if (controller?.hand?.length < 10) {
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
      controller.hand.push({ id: randomCard } as any);
    }
  },
});

// GIL_616
cardScriptsRegistry.register('GIL_616', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// GIL_616t
cardScriptsRegistry.register('GIL_616t', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// GIL_682
cardScriptsRegistry.register('GIL_682', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_815
cardScriptsRegistry.register('GIL_815', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_819
cardScriptsRegistry.register('GIL_819', {
  events: { /* TODO */ },
});
