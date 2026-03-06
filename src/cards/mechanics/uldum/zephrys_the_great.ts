// uldum - zephrys_the_great.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// ULD_003 - Tirion Fordring (Legendary)
// Divine Shield. Taunt. Deathrattle: Equip a 5/3 Ashbringer
cardScriptsRegistry.register('ULD_003', {
  play: (ctx: ActionContext) => {
    // Divine Shield. Taunt. Deathrattle: Equip a 5/3 Ashbringer
  },
  deathrattle: (ctx: ActionContext) => {
    // Equip a 5/3 Ashbringer
  },
});
