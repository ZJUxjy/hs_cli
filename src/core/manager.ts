export class Manager {
  protected data: Map<string | number, unknown> = new Map();

  constructor(protected owner: { manager: Manager }) {
    // owner can be any entity with a manager
  }

  get(key: string | number): unknown {
    return this.data.get(key);
  }

  set(key: string | number, value: unknown): void {
    this.data.set(key, value);
  }

  has(key: string | number): boolean {
    return this.data.has(key);
  }

  delete(key: string | number): boolean {
    return this.data.delete(key);
  }

  increment(key: string | number, amount: number = 1): number {
    const current = (this.get(key) as number) || 0;
    this.set(key, current + amount);
    return current + amount;
  }

  decrement(key: string | number, amount: number = 1): number {
    return this.increment(key, -amount);
  }
}
