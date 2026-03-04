// web/frontend/src/api/game.ts

import { apiGet, apiPost } from './client';
import { GameState, Action } from '../types/game';

export async function startGame(deck1Id: string, deck2Id: string): Promise<GameState> {
  return apiPost<GameState>('/game/start', {
    deck1_id: deck1Id,
    deck2_id: deck2Id,
  });
}

export async function executeAction(gameId: string, action: Action): Promise<GameState> {
  return apiPost<GameState>(`/game/${gameId}/action`, action);
}

export async function getValidActions(gameId: string): Promise<{ actions: unknown[] }> {
  return apiGet<{ actions: unknown[] }>(`/game/${gameId}/valid-actions`);
}
