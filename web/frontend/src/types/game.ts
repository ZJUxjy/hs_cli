// web/frontend/src/types/game.ts

import { Card, Minion } from './card';

export interface PlayerState {
  name: string;
  hero_class: string;
  health: number;
  armor: number;
  mana: number;
  max_mana: number;
  hand: Card[];
  board: Minion[];
  deck_size: number;
}

export interface GameState {
  game_id: string;
  turn: number;
  current_player: string;
  player1: PlayerState;
  player2: PlayerState;
  is_game_over: boolean;
  winner?: string;
}

export interface Action {
  action_type: 'play_card' | 'attack' | 'end_turn';
  card_index?: number;
  attacker_id?: string;
  target_id?: string;
}
