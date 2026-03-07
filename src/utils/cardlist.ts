import { Random } from './random';

export class CardList<T = unknown> {
  private items: T[] = [];

  constructor(initial?: T[]) {
    if (initial) {
      this.items = [...initial];
    }
  }

  get length(): number {
    return this.items.length;
  }

  push(...items: T[]): number {
    return this.items.push(...items);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  splice(start: number, deleteCount: number = this.items.length, ...items: T[]): T[] {
    return this.items.splice(start, deleteCount, ...items);
  }

  indexOf(item: T): number {
    return this.items.indexOf(item);
  }

  filter(predicate: (value: T, index: number) => boolean): CardList<T> {
    const result = new CardList<T>();
    this.items.forEach((item, index) => {
      if (predicate(item, index)) {
        result.push(item);
      }
    });
    return result;
  }

  includes(item: T): boolean {
    return this.items.includes(item);
  }

  some(predicate: (value: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  contains(predicate: (item: T) => boolean): boolean {
    return this.some(predicate);
  }

  shuffle(random: Random): void {
    random.shuffle(this.items);
  }

  draw(): T | undefined {
    return this.items.pop();
  }

  drawCount(count: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < count && this.items.length > 0; i++) {
      const card = this.items.pop();
      if (card !== undefined) result.push(card);
    }
    return result;
  }

  first(): T | undefined {
    return this.items[0];
  }

  last(): T | undefined {
    return this.items[this.items.length - 1];
  }

  at(index: number): T | undefined {
    return this.items[index];
  }

  toArray(): T[] {
    return [...this.items];
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  sort(compareFn?: (a: T, b: T) => number): void {
    this.items.sort(compareFn);
  }

  forEach(callback: (value: T, index: number) => void): void {
    this.items.forEach(callback);
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  map<U>(callback: (value: T, index: number) => U): U[] {
    return this.items.map(callback);
  }

  reduce<U>(callback: (accumulator: U, value: T, index: number) => U, initialValue: U): U {
    return this.items.reduce(callback, initialValue);
  }
}
