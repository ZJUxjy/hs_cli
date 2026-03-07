// Adapt mechanism for Hearthstone (10 options, choose 1)

import { Action } from '../actions/base';
import type { Entity } from '../core/entity';
import type { Minion } from '../core/card';

/**
 * Adapt options
 */
export enum AdaptOption {
  FLAMING_CLAWS = 'FLAMING_CLAWS',     // +3 Attack
  ROCKY_CARAPACE = 'ROCKY_CARAPACE',   // +3 Health
  POISONOUS = 'POISONOUS',             // Poisonous
  LIVING_SPORES = 'LIVING_SPORES',     // Deathrattle: Summon two 1/1 Plants
  CRACKLING_SHIELD = 'CRACKLING_SHIELD', // Divine Shield
  VOLCANIC_MIGHT = 'VOLCANIC_MIGHT',   // +1/+1
  FLAMING_HEART = 'FLAMING_HEART',     // +3 Attack (alternate name for consistency)
  WIND_BLESSING = 'WIND_BLESSING',     // Windfury
  SWAMP_STRENGTH = 'SWAMP_STRENGTH',   // +3 Health (alternate name)
  MASSIVE = 'MASSIVE',                 // Taunt
}

/**
 * Adapt effect data
 */
export interface AdaptEffect {
  id: AdaptOption;
  name: string;
  description: string;
  apply: (minion: Minion) => void;
}

/**
 * Standard adapt effects
 */
export const ADAPT_EFFECTS: Record<AdaptOption, AdaptEffect> = {
  [AdaptOption.FLAMING_CLAWS]: {
    id: AdaptOption.FLAMING_CLAWS,
    name: 'Flaming Claws',
    description: '+3 Attack',
    apply: (minion) => {
      (minion as any)._attack = (minion as any)._attack + 3;
    }
  },
  [AdaptOption.ROCKY_CARAPACE]: {
    id: AdaptOption.ROCKY_CARAPACE,
    name: 'Rocky Carapace',
    description: '+3 Health',
    apply: (minion) => {
      (minion as any)._maxHealth = (minion as any)._maxHealth + 3;
    }
  },
  [AdaptOption.POISONOUS]: {
    id: AdaptOption.POISONOUS,
    name: 'Poison Spit',
    description: 'Poisonous',
    apply: (minion) => {
      (minion as any).poisonous = true;
    }
  },
  [AdaptOption.LIVING_SPORES]: {
    id: AdaptOption.LIVING_SPORES,
    name: 'Living Spores',
    description: 'Deathrattle: Summon two 1/1 Plants',
    apply: (minion) => {
      // Add deathrattle to summon 1/1 plants
      const existingDr = (minion as any).scripts?.deathrattle;
      (minion as any).deathrattle = () => {
        if (existingDr) existingDr(minion);
        // Summon 1/1 plants logic would go here
        console.log('[Adapt] Living Spores deathrattle triggered');
      };
    }
  },
  [AdaptOption.CRACKLING_SHIELD]: {
    id: AdaptOption.CRACKLING_SHIELD,
    name: 'Crackling Shield',
    description: 'Divine Shield',
    apply: (minion) => {
      (minion as any).divineShield = true;
    }
  },
  [AdaptOption.VOLCANIC_MIGHT]: {
    id: AdaptOption.VOLCANIC_MIGHT,
    name: 'Volcanic Might',
    description: '+1/+1',
    apply: (minion) => {
      (minion as any)._attack = (minion as any)._attack + 1;
      (minion as any)._maxHealth = (minion as any)._maxHealth + 1;
    }
  },
  [AdaptOption.FLAMING_HEART]: {
    id: AdaptOption.FLAMING_HEART,
    name: 'Flaming Heart',
    description: '+3 Attack',
    apply: (minion) => {
      (minion as any)._attack = (minion as any)._attack + 3;
    }
  },
  [AdaptOption.WIND_BLESSING]: {
    id: AdaptOption.WIND_BLESSING,
    name: 'Lightning Speed',
    description: 'Windfury',
    apply: (minion) => {
      (minion as any).windfury = true;
    }
  },
  [AdaptOption.SWAMP_STRENGTH]: {
    id: AdaptOption.SWAMP_STRENGTH,
    name: 'Swamp Strength',
    description: '+3 Health',
    apply: (minion) => {
      (minion as any)._maxHealth = (minion as any)._maxHealth + 3;
    }
  },
  [AdaptOption.MASSIVE]: {
    id: AdaptOption.MASSIVE,
    name: 'Massive',
    description: 'Taunt',
    apply: (minion) => {
      (minion as any).taunt = true;
    }
  }
};

/**
 * Adapt action
 */
export class Adapt extends Action {
  private options: AdaptOption[];

  constructor(excludeOptions: AdaptOption[] = []) {
    super();
    // Get all options except excluded ones
    const allOptions = Object.values(AdaptOption);
    this.options = allOptions.filter(o => !excludeOptions.includes(o));
  }

  trigger(_source: Entity, target: Entity): unknown[] {
    const minion = target as Minion;

    // Randomly select 3 options
    const shuffled = [...this.options].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    console.log(`[Adapt] Choose one for ${minion.id}:`);
    choices.forEach((opt, i) => {
      const effect = ADAPT_EFFECTS[opt];
      console.log(`  ${i + 1}. ${effect.name}: ${effect.description}`);
    });

    // In a real implementation, player would choose
    // For now, auto-select first option
    const selected = choices[0];
    this.applyAdapt(minion, selected);

    return [selected];
  }

  /**
   * Apply the selected adapt option
   */
  applyAdapt(minion: Minion, option: AdaptOption): void {
    const effect = ADAPT_EFFECTS[option];
    if (effect) {
      effect.apply(minion);
      console.log(`[Adapt] Applied ${effect.name} to ${minion.id}`);
    }
  }
}

/**
 * Helper function to create Adapt action
 */
export function AdaptMinion(excludeOptions?: AdaptOption[]): Adapt {
  return new Adapt(excludeOptions);
}
