// web/frontend/src/types/deck.ts

export interface Deck {
  id: string;
  name: string;
  hero_class: string;
  cards: string[];
  created_at: string;
  updated_at: string;
}

export interface DeckCreate {
  name: string;
  hero_class: string;
  cards: string[];
}
