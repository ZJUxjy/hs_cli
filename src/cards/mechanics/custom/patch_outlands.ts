// custom - patch_outlands.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// CS2_004_Puzzle - Puzzle (likely a debug/test card)
cardScriptsRegistry.register('CS2_004_Puzzle', {
  play: (ctx: ActionContext) => {
    // Debug/test card - no implementation needed
  },
});
