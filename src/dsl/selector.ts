// Selector DSL for fireplace
// Based on fireplace's dsl/selector.py

import { Entity } from '../core/entity';
import type { Game } from '../core/game';
import type { Player } from '../core/player';
import { CardType } from '../enums';

/**
 * CallableSelector interface - allows selectors to be called directly
 * This matches Python fireplace where Selectors can be called directly
 */
export interface CallableSelector extends Selector {
  (entities: Entity[], source: Entity): Entity[];
}

/**
 * Selector function type - for simple function-based selectors
 * @deprecated Use CallableSelector instead
 */
export type SelectorFn = (source: Entity, game: Game) => Entity[];
export type SelectorLike = Selector | SelectorFn;

/**
 * Evaluation context for selectors
 */
export interface SelectorContext {
  game: Game;
  source: Entity;
}

function toContext(source: Entity, game: Game): SelectorContext {
  return { game, source };
}

/**
 * makeCallable - wraps a Selector to make it callable
 * Both SELF.eval(entities, source) and SELF(entities, source) should work
 * This matches Python fireplace where Selectors can be called directly
 */
export function makeCallable(selector: Selector): CallableSelector {
  const callable = function(entities: Entity[], source: Entity): Entity[] {
    return selector.eval({ game: (source as any).game, source });
  } as CallableSelector;

  // Copy all methods from selector
  Object.setPrototypeOf(callable, Selector.prototype);
  callable.eval = selector.eval.bind(selector);

  return callable;
}

/**
 * evaluateSelector - evaluates a Selector or SelectorFn
 * @deprecated Use selector.eval() or callable selector directly
 */
export function evaluateSelector(selector: SelectorLike, source: Entity, game: Game): Entity[] {
  if (typeof selector === 'function') {
    // Handle old-style function selectors (source, game) => Entity[]
    return selector(source, game);
  }
  return selector.eval(toContext(source, game));
}

/**
 * Base Selector class
 */
export abstract class Selector {
  abstract eval(context: SelectorContext): Entity[];

  or(other: Selector): CallableSelector {
    return makeCallable(new OrSelector(this, other));
  }

  and(other: Selector): CallableSelector {
    return makeCallable(new AndSelector(this, other));
  }

  exclude(other: Selector): CallableSelector {
    return makeCallable(new ExcludeSelector(this, other));
  }

  filter(predicate: (entity: Entity) => boolean): CallableSelector {
    return makeCallable(new FilterSelector(this, predicate));
  }

  random(count: number = 1): CallableSelector {
    return makeCallable(new RandomSelector(this, count));
  }

  first(count: number = 1): CallableSelector {
    return makeCallable(new FirstSelector(this, count));
  }
}

// Helper functions
function getController(entity: Entity, game?: Game): Player | undefined {
  const explicitController = (entity as any).controller || (entity as any).getController?.();
  if (explicitController) {
    return explicitController;
  }

  if ((entity as any).type === CardType.PLAYER) {
    return entity as unknown as Player;
  }

  if (!game) {
    return undefined;
  }

  for (const player of game.players) {
    if (
      player === entity ||
      player.hero === entity ||
      player.heroPower === entity ||
      player.weapon === entity ||
      player.field.includes(entity as any) ||
      player.hand.includes(entity as any) ||
      player.deck.includes(entity as any) ||
      player.secrets.includes(entity as any) ||
      player.graveyard.includes(entity as any)
    ) {
      return player;
    }
  }

  return undefined;
}

function isMinion(entity: Entity): boolean {
  return (entity as any).type === CardType.MINION;
}

function isHero(entity: Entity): boolean {
  return (entity as any).type === CardType.HERO;
}

// SELF selector
export class SelfSelector extends Selector {
  eval(context: SelectorContext): Entity[] {
    return [context.source];
  }
}

// TARGET selector
export class TargetSelector extends Selector {
  eval(context: SelectorContext): Entity[] {
    const target = (context.source as any).target;
    return target ? [target] : [];
  }
}

// OWNER selector
export class OwnerSelector extends Selector {
  eval(context: SelectorContext): Entity[] {
    const controller = getController(context.source);
    return controller ? [controller] : [];
  }
}

// ALL_ENTITIES selector
export class AllEntitiesSelector extends Selector {
  eval(context: SelectorContext): Entity[] {
    return context.game.entities.toArray() as Entity[];
  }
}

// FRIENDLY selector
export class FriendlySelector extends Selector {
  constructor(private inner?: Selector) {
    super();
  }

  eval(context: SelectorContext): Entity[] {
    const controller = getController(context.source, context.game);
    if (!controller) return [];
    const candidates = this.inner ? this.inner.eval(context) : context.game.entities.toArray() as Entity[];
    return candidates.filter(e => getController(e, context.game) === controller);
  }
}

// ENEMY selector
export class EnemySelector extends Selector {
  constructor(private inner?: Selector) {
    super();
  }

  eval(context: SelectorContext): Entity[] {
    const controller = getController(context.source, context.game);
    if (!controller || !controller.opponent) return [];
    const candidates = this.inner ? this.inner.eval(context) : context.game.entities.toArray() as Entity[];
    return candidates.filter(e => getController(e, context.game) === controller.opponent);
  }
}

// FIELD selector
export class FieldSelector extends Selector {
  eval(context: SelectorContext): Entity[] {
    const result: Entity[] = [];
    for (const player of context.game.players) {
      result.push(...player.field.toArray() as Entity[]);
    }
    return result;
  }
}

// MINIONS selector
export class MinionsSelector extends Selector {
  eval(context: SelectorContext): Entity[] {
    return (context.game.board.toArray() as Entity[]).filter(isMinion);
  }
}

// HEROES selector
export class HeroesSelector extends Selector {
  eval(context: SelectorContext): Entity[] {
    const result: Entity[] = [];
    for (const player of context.game.players) {
      if (player.hero) result.push(player.hero);
    }
    return result;
  }
}

// CHARACTERS selector
export class CharactersSelector extends Selector {
  eval(context: SelectorContext): Entity[] {
    return context.game.characters.toArray() as Entity[];
  }
}

// Filter selector
export class FilterSelector extends Selector {
  constructor(private inner: Selector, private predicate: (entity: Entity) => boolean) {
    super();
  }
  eval(context: SelectorContext): Entity[] {
    return this.inner.eval(context).filter(this.predicate);
  }
}

// Random selector
export class RandomSelector extends Selector {
  constructor(private inner: Selector, private count: number) {
    super();
  }
  eval(context: SelectorContext): Entity[] {
    const candidates = this.inner.eval(context);
    if (candidates.length <= this.count) return candidates;
    const shuffled = context.game.random.sample(candidates, candidates.length);
    return shuffled.slice(0, this.count);
  }
}

// First selector
export class FirstSelector extends Selector {
  constructor(private inner: Selector, private count: number) {
    super();
  }
  eval(context: SelectorContext): Entity[] {
    return this.inner.eval(context).slice(0, this.count);
  }
}

// Or selector
export class OrSelector extends Selector {
  constructor(private left: Selector, private right: Selector) {
    super();
  }
  eval(context: SelectorContext): Entity[] {
    const leftResult = this.left.eval(context);
    const rightResult = this.right.eval(context);
    const seen = new Set<Entity>();
    const result: Entity[] = [];
    for (const e of leftResult) {
      if (!seen.has(e)) { seen.add(e); result.push(e); }
    }
    for (const e of rightResult) {
      if (!seen.has(e)) { seen.add(e); result.push(e); }
    }
    return result;
  }
}

// And selector
export class AndSelector extends Selector {
  constructor(private left: Selector, private right: Selector) {
    super();
  }
  eval(context: SelectorContext): Entity[] {
    const leftResult = this.left.eval(context);
    const rightResult = this.right.eval(context);
    return leftResult.filter(e => rightResult.includes(e));
  }
}

// Exclude selector
export class ExcludeSelector extends Selector {
  constructor(private left: Selector, private right: Selector) {
    super();
  }
  eval(context: SelectorContext): Entity[] {
    const leftResult = this.left.eval(context);
    const rightResult = this.right.eval(context);
    return leftResult.filter(e => !rightResult.includes(e));
  }
}

// Condition predicates
export function isDamaged(entity: Entity): boolean {
  return (entity as any).damage > 0;
}

export function isFrozen(entity: Entity): boolean {
  return (entity as any).frozen === true;
}

export function hasDivineShield(entity: Entity): boolean {
  return (entity as any).divineShield === true;
}

export function hasTaunt(entity: Entity): boolean {
  return (entity as any).taunt === true;
}

// Predefined selectors
export const SELF = makeCallable(new SelfSelector());
export const TARGET = makeCallable(new TargetSelector());
export const OWNER = makeCallable(new OwnerSelector());
export const ALL_ENTITIES = makeCallable(new AllEntitiesSelector());
export const ALL_MINIONS = makeCallable(new MinionsSelector());
export const ALL_HEROES = makeCallable(new HeroesSelector());
export const ALL_CHARACTERS = makeCallable(new CharactersSelector());
export const FIELD = makeCallable(new FieldSelector());
export const FRIENDLY = makeCallable(new FriendlySelector());
export const ENEMY = makeCallable(new EnemySelector());
export const FRIENDLY_MINIONS = makeCallable(new FriendlySelector(ALL_MINIONS));
export const ENEMY_MINIONS = makeCallable(new EnemySelector(ALL_MINIONS));
export const FRIENDLY_HERO = makeCallable(new FriendlySelector(ALL_HEROES));
export const ENEMY_HERO = makeCallable(new EnemySelector(ALL_HEROES));
export const FRIENDLY_CHARACTERS = makeCallable(new FriendlySelector(ALL_CHARACTERS));
export const ENEMY_CHARACTERS = makeCallable(new EnemySelector(ALL_CHARACTERS));
export const DAMAGED_MINIONS = ALL_MINIONS.filter(isDamaged);
export const FROZEN_MINIONS = ALL_MINIONS.filter(isFrozen);
export const MINIONS_WITH_TAUNT = ALL_MINIONS.filter(hasTaunt);
export const MINIONS_WITH_DIVINE_SHIELD = ALL_MINIONS.filter(hasDivineShield);
export const TAUNT = MINIONS_WITH_TAUNT;

// Helper functions
export function RANDOM(selector: Selector): Selector {
  return selector.random(1);
}

export function ALL(selector: Selector): Selector {
  return selector;
}
