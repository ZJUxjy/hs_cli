// web/frontend/src/api/cards.ts

import { apiGet } from './client';
import { Card } from '../types/card';

export async function fetchCards(filters?: {
  hero_class?: string;
  cost?: number;
  card_type?: string;
  name?: string;
}): Promise<Card[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet<Card[]>(`/cards${query}`);
}

export async function fetchCard(cardId: string): Promise<Card> {
  return apiGet<Card>(`/cards/${cardId}`);
}
