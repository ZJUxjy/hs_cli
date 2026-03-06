import type { CardDefinition } from './types';

export class CardRegistry {
  private static cards: Map<string, CardDefinition> = new Map();
  private static bySet: Map<number, CardDefinition[]> = new Map();

  static register(definition: CardDefinition): void {
    this.cards.set(definition.id, definition);
    if (definition.set) {
      const setCards = this.bySet.get(definition.set) || [];
      setCards.push(definition);
      this.bySet.set(definition.set, setCards);
    }
  }

  static registerAll(definitions: CardDefinition[]): void {
    for (const def of definitions) {
      this.register(def);
    }
  }

  static get(id: string): CardDefinition | undefined {
    return this.cards.get(id);
  }

  static has(id: string): boolean {
    return this.cards.has(id);
  }

  static getBySet(cardSet: number): CardDefinition[] {
    return this.bySet.get(cardSet) || [];
  }

  static getAll(): CardDefinition[] {
    return Array.from(this.cards.values());
  }

  static clear(): void {
    this.cards.clear();
    this.bySet.clear();
  }
}
