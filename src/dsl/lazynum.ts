import type { Entity } from '../core/entity';
import type { Game } from '../core/game';
import { evaluateSelector } from './selector';
import type { SelectorLike } from './selector';

export abstract class LazyValue<T> {
  abstract evaluate(source: Entity, game: Game): T;
}

export class Count extends LazyValue<number> {
  constructor(private selector: SelectorLike) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    return evaluateSelector(this.selector, source, game).length;
  }
}

export class Attr extends LazyValue<number> {
  constructor(
    private selector: SelectorLike,
    private attr: string
  ) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    const entities = evaluateSelector(this.selector, source, game);
    return entities.reduce((sum: number, e: Entity) => sum + ((e as any)[this.attr] || 0), 0);
  }
}

export class SelfAttr extends LazyValue<number> {
  constructor(private attr: string) {
    super();
  }

  evaluate(source: Entity, _game: Game): number {
    return (source as any)[this.attr] || 0;
  }
}

export class Const<T> extends LazyValue<T> {
  constructor(private value: T) {
    super();
  }

  evaluate(_source: Entity, _game: Game): T {
    return this.value;
  }
}

export class Joust extends LazyValue<number> {
  constructor(
    private selector1: SelectorLike,
    private selector2: SelectorLike
  ) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    const entities1 = evaluateSelector(this.selector1, source, game);
    const entities2 = evaluateSelector(this.selector2, source, game);
    const gameAny = game as any;
    const random = gameAny.random;

    if (!entities1.length || !entities2.length) return 0;

    const e1 = random?.choice(entities1) || entities1[0];
    const e2 = random?.choice(entities2) || entities2[0];

    return ((e1 as any).attack || 0) > ((e2 as any).attack || 0) ? 1 : 0;
  }
}

export class Sum extends LazyValue<number> {
  constructor(
    private values: LazyValue<number>[]
  ) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    return this.values.reduce((sum, v) => sum + v.evaluate(source, game), 0);
  }
}

export class Minus extends LazyValue<number> {
  constructor(
    private left: LazyValue<number>,
    private right: LazyValue<number>
  ) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    return this.left.evaluate(source, game) - this.right.evaluate(source, game);
  }
}

export class Multiply extends LazyValue<number> {
  constructor(
    private left: LazyValue<number>,
    private right: LazyValue<number>
  ) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    return this.left.evaluate(source, game) * this.right.evaluate(source, game);
  }
}
