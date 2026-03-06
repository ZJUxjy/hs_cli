import type { Entity } from '../core/entity';
import type { Game } from '../core/game';
import { Attr } from './lazynum';

export type SelectorFn = (source: Entity, game: Game) => Entity[];

export const SELF: SelectorFn = (source) => [source];

export const ALL_MINIONS: SelectorFn = (_source, game) => {
  const gameAny = game as any;
  if (!gameAny.player1 || !gameAny.player2) return [];
  return [
    ...(gameAny.player1.field || []),
    ...(gameAny.player2.field || [])
  ] as Entity[];
};

export const FRIENDLY_MINIONS: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.field || []) as Entity[];
};

export const ENEMY_MINIONS: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.opponent?.field || []) as Entity[];
};

export const FRIENDLY_HAND: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.hand || []) as Entity[];
};

export const ENEMY_HAND: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.opponent?.hand || []) as Entity[];
};

export const FRIENDLY_DECK: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.deck || []) as Entity[];
};

export const ENEMY_DECK: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.opponent?.deck || []) as Entity[];
};

export const FRIENDLY_CHARACTERS: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.characters || []) as Entity[];
};

export const ENEMY_CHARACTERS: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.opponent?.characters || []) as Entity[];
};

// Filter selectors
export const DAMAGED: SelectorFn = (source, game) => {
  const minions = ALL_MINIONS(source, game);
  return minions.filter((e) => (e as any).damage > 0) as Entity[];
};

export const TAUNT: SelectorFn = (source, game) => {
  const minions = ALL_MINIONS(source, game);
  return minions.filter((e) => (e as any).taunt === true) as Entity[];
};

export const STEALTH: SelectorFn = (source, game) => {
  const minions = ALL_MINIONS(source, game);
  return minions.filter((e) => (e as any).stealthed === true) as Entity[];
};

export const DIVINE_SHIELD: SelectorFn = (source, game) => {
  const minions = ALL_MINIONS(source, game);
  return minions.filter((e) => (e as any).divineShield === true) as Entity[];
};

export const FROZEN: SelectorFn = (source, game) => {
  const minions = ALL_MINIONS(source, game);
  return minions.filter((e) => (e as any).frozen === true) as Entity[];
};

// Player selectors
export const CONTROLLER: SelectorFn = (source) => {
  return [(source as any).controller].filter(Boolean) as Entity[];
};

export const OPPONENT: SelectorFn = (source) => {
  const controller = (source as any).controller;
  return [controller?.opponent].filter(Boolean) as Entity[];
};

export const FRIENDLY_HERO: SelectorFn = (source) => {
  const controller = (source as any).controller;
  return [controller?.hero].filter(Boolean) as Entity[];
};

export const ENEMY_HERO: SelectorFn = (source) => {
  const controller = (source as any).controller;
  return [controller?.opponent?.hero].filter(Boolean) as Entity[];
};

// Secret selectors
export const FRIENDLY_SECRETS: SelectorFn = (source) => {
  const controller = (source as any).controller;
  return (controller?.secrets || []) as Entity[];
};

export const OPPONENT_SECRETS: SelectorFn = (source) => {
  const controller = (source as any).controller;
  return (controller?.opponent?.secrets || []) as Entity[];
};

// Random selectors
export const RANDOM_ENEMY_CHARACTER: SelectorFn = (source) => {
  const controller = (source as any).controller;
  const opponent = controller?.opponent;
  const targets: Entity[] = [];

  if (opponent?.hero) targets.push(opponent.hero);
  if (opponent?.field) targets.push(...opponent.field);

  if (targets.length === 0) return [];
  const idx = Math.floor(Math.random() * targets.length);
  return [targets[idx]];
};

export const RANDOM_FRIENDLY_MINION: SelectorFn = (source) => {
  const controller = (source as any).controller;
  const minions = controller?.field || [];

  if (minions.length === 0) return [];
  const idx = Math.floor(Math.random() * minions.length);
  return [minions[idx]];
};

export const RANDOM_ENEMY_MINION: SelectorFn = (source) => {
  const controller = (source as any).controller;
  const opponent = controller?.opponent;
  const minions = opponent?.field || [];

  if (minions.length === 0) return [];
  const idx = Math.floor(Math.random() * minions.length);
  return [minions[idx]];
};

// TARGET - current target (used in card scripts)
export const TARGET: SelectorFn = (source) => {
  return [(source as any)._target].filter(Boolean) as Entity[];
};

// TARGET_ADJACENT - adjacent minions
export const TARGET_ADJACENT: SelectorFn = (_source) => {
  // Would be calculated based on position
  return [];
};

// SPELL selector
export const SPELL: SelectorFn = (_source) => {
  // Spells don't stay on board, this is for aura targeting
  return [];
};

// MINION selector
export const MINION: SelectorFn = (source, game) => {
  return ALL_MINIONS(source, game);
};

// SECRET selector
export const SECRET: SelectorFn = (source) => {
  const controller = (source as any).controller;
  return (controller?.secrets || []) as Entity[];
};

// Selector class for composition
export class Selector {
  static where(predicate: (entity: Entity) => boolean): SelectorFn {
    return (source, game) => {
      const entities = ALL_MINIONS(source, game);
      return entities.filter(predicate);
    };
  }

  static random(count: number): SelectorFn {
    return (source, game) => {
      const entities = ALL_MINIONS(source, game);
      const gameAny = game as any;
      return gameAny.random?.sample(entities, count) || entities.slice(0, count);
    };
  }

  static limit(count: number): SelectorFn {
    return (source, game) => {
      const entities = ALL_MINIONS(source, game);
      return entities.slice(0, count);
    };
  }
}

// Lazy value helpers for ATK and HEALTH
export const ATK = (selector: SelectorFn) => new Attr(selector, 'attack');
export const HEALTH = (selector: SelectorFn) => new Attr(selector, 'health');

// Buff parameter helper
export interface BuffParams {
  ATK?: number;
  HEALTH?: number;
  taunt?: boolean;
  divineShield?: boolean;
  stealth?: boolean;
  frozen?: boolean;
  // Add other buff tags as needed
}

export function buff(atk: number = 0, health: number = 0, options: BuffParams = {}): BuffParams {
  const params: BuffParams = {};
  if (atk !== 0) params.ATK = atk;
  if (health !== 0) params.HEALTH = health;
  if (options.taunt) params.taunt = true;
  if (options.divineShield) params.divineShield = true;
  if (options.stealth) params.stealth = true;
  if (options.frozen) params.frozen = true;
  return params;
}
