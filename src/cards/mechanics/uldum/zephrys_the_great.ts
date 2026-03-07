// uldum - zephrys_the_great.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';

// ULD_003 - Tirion Fordring (Legendary)
// Divine Shield. Taunt. Deathrattle: Equip a 5/3 Ashbringer
cardScriptsRegistry.register('ULD_003', {
  play: (ctx: ActionContext) => {
    // Divine Shield and Taunt are intrinsic card abilities
    // This is just a placeholder
  },
  deathrattle: (ctx: ActionContext) => {
    // Equip a 5/3 Ashbringer (weapon)
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    if (controller?.hero) {
      (controller.hero as any).weapon = 'ULD_003w'; // Ashbringer
    }
  },
});

// ULD_429 - Zephrys the Great (Legendary)
// Battlecry: If your deck contains no duplicates, wish for the perfect card
cardScriptsRegistry.register('ULD_429', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const deck = controller?.deck as Entity[];
    // Check if deck has no duplicates (simplified)
    if (deck && deck.length > 0) {
      // This would trigger a discover effect
      (controller as any).zephrysActive = true;
    }
  },
});
