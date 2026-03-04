// web/frontend/src/types/card.ts

export type CardType = 'MINION' | 'SPELL' | 'WEAPON';

export interface Card {
  id: string;
  name: string;
  cost: number;
  card_type: CardType;
  description: string;
  hero_class?: string;
  attack?: number;
  health?: number;
  abilities: string[];
  image_url?: string;
}

export interface Minion {
  instance_id: string;
  card_id: string;
  name: string;
  attack: number;
  health: number;
  max_health: number;
  can_attack: boolean;
  abilities: string[];
}
