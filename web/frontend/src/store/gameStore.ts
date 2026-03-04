// web/frontend/src/store/gameStore.ts

import { create } from 'zustand';
import { GameState, Action } from '../types/game';
import { startGame, executeAction } from '../api/game';

interface GameStore {
  // State
  gameId: string | null;
  gameState: GameState | null;
  selectedCard: number | null;
  selectedMinion: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  startNewGame: (deck1Id: string, deck2Id: string) => Promise<void>;
  playCard: (cardIndex: number, targetId?: string) => Promise<void>;
  attack: (attackerId: string, targetId: string) => Promise<void>;
  endTurn: () => Promise<void>;
  selectCard: (index: number | null) => void;
  selectMinion: (id: string | null) => void;
  setGameState: (state: GameState) => void;
  clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameId: null,
  gameState: null,
  selectedCard: null,
  selectedMinion: null,
  isLoading: false,
  error: null,

  // Actions
  startNewGame: async (deck1Id: string, deck2Id: string) => {
    set({ isLoading: true, error: null });
    try {
      const state = await startGame(deck1Id, deck2Id);
      set({
        gameId: state.game_id,
        gameState: state,
        isLoading: false,
        selectedCard: null,
        selectedMinion: null,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  playCard: async (cardIndex: number, targetId?: string) => {
    const { gameId } = get();
    if (!gameId) return;

    set({ isLoading: true, error: null });
    try {
      const action: Action = {
        action_type: 'play_card',
        card_index: cardIndex,
        target_id: targetId,
      };
      const state = await executeAction(gameId, action);
      set({ gameState: state, isLoading: false, selectedCard: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  attack: async (attackerId: string, targetId: string) => {
    const { gameId } = get();
    if (!gameId) return;

    set({ isLoading: true, error: null });
    try {
      const action: Action = {
        action_type: 'attack',
        attacker_id: attackerId,
        target_id: targetId,
      };
      const state = await executeAction(gameId, action);
      set({ gameState: state, isLoading: false, selectedMinion: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  endTurn: async () => {
    const { gameId } = get();
    if (!gameId) return;

    set({ isLoading: true, error: null });
    try {
      const action: Action = { action_type: 'end_turn' };
      const state = await executeAction(gameId, action);
      set({ gameState: state, isLoading: false, selectedCard: null, selectedMinion: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectCard: (index: number | null) => set({ selectedCard: index }),
  selectMinion: (id: string | null) => set({ selectedMinion: id }),
  setGameState: (state: GameState) => set({ gameState: state }),
  clearError: () => set({ error: null }),
}));
