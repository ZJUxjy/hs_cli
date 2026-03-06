import { CardType } from '../enums';

export const TARGETING_PREREQUISITES: number[] = [
  1,   // REQ_TARGET_TO_PLAY
  19,  // REQ_TARGET_FOR_COMBO
  17,  // REQ_TARGET_IF_AVAILABLE
];

export function isValidTarget(
  source: any,
  target: any,
  requirements?: Record<number, number>
): boolean {
  // Cannot target self
  if (target === source) {
    return false;
  }

  // Check target type specific rules
  if (target.type === CardType.MINION) {
    // Dormant minions cannot be targeted
    if (target.dormant) {
      return false;
    }

    // Dead minions cannot be targeted
    if (target.dead) {
      return false;
    }

    // Stealthed minions cannot be targeted by opponent
    if (target.stealthed && target.controller !== source.controller) {
      return false;
    }

    // Immune minions cannot be targeted by opponent
    if (target.immune && target.controller !== source.controller) {
      return false;
    }
  }

  // Use provided requirements or get from source
  const reqs = requirements || source.requirements;

  // If no requirements provided, allow targeting (default behavior)
  if (!reqs) {
    return true;
  }

  // Check specific requirements
  for (const [reqStr, _param] of Object.entries(reqs)) {
    const reqNum = parseInt(reqStr);

    switch (reqNum) {
      case 1: // REQ_MINION_TARGET
        if (target.type !== CardType.MINION) return false;
        break;
      case 2: // REQ_FRIENDLY_TARGET
        if (target.controller !== source.controller) return false;
        break;
      case 3: // REQ_ENEMY_TARGET
        if (target.controller === source.controller) return false;
        break;
      case 4: // REQ_DAMAGED_TARGET
        if (!target.damage) return false;
        break;
      case 8: // REQ_UNDAMAGED_TARGET
        if (target.damage) return false;
        break;
      case 9: // REQ_HERO_TARGET
        if (target.type !== CardType.HERO) return false;
        break;
      case 27: // REQ_TARGET_TAUNT
        if (!target.taunt) return false;
        break;
    }
  }

  return true;
}
