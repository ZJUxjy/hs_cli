export interface CardDefinition {
  id: string;
  type: number;
  cardClass: number;
  cost: number;
  rarity?: number;
  set?: number;
  collectible?: boolean;
  attack?: number;
  health?: number;
  race?: number;
  durability?: number;
  requirements?: Record<string, number>;
  scripts?: Record<string, unknown>;
  names?: Record<string, string>;
  descriptions?: Record<string, string>;
}
