/**
 * UI Command Types
 *
 * Commands that the UI can dispatch to the game engine.
 * The UI should never directly modify engine state - only dispatch commands.
 */

/**
 * Play a card from hand
 */
export interface PlayCardCommand {
  type: 'PLAY_CARD';
  /** Index of the card in hand */
  handIndex: number;
  /** Target entity UI ID (required if card needs a target) */
  targetId?: string;
}

/**
 * Attack with a minion or hero
 */
export interface AttackCommand {
  type: 'ATTACK';
  /** Attacker entity UI ID (minion or hero) */
  attackerId: string;
  /** Defender entity UI ID (minion or hero) */
  defenderId: string;
}

/**
 * End the current turn
 */
export interface EndTurnCommand {
  type: 'END_TURN';
}

/**
 * Concede the game
 */
export interface ConcedeCommand {
  type: 'CONCEDE';
}

/**
 * Use hero power
 */
export interface HeroPowerCommand {
  type: 'HERO_POWER';
  /** Target entity UI ID (if hero power needs a target) */
  targetId?: string;
}

/**
 * Cancel pending target selection
 */
export interface CancelTargetCommand {
  type: 'CANCEL_TARGET';
}

/**
 * Start a new game
 */
export interface NewGameCommand {
  type: 'NEW_GAME';
  /** Optional deck IDs for player 1 */
  player1Deck?: string[];
  /** Optional deck IDs for player 2 */
  player2Deck?: string[];
}

/**
 * Union type of all UI commands
 */
export type UICommand =
  | PlayCardCommand
  | AttackCommand
  | EndTurnCommand
  | ConcedeCommand
  | HeroPowerCommand
  | CancelTargetCommand
  | NewGameCommand;

/**
 * Command result
 */
export interface CommandResult {
  /** Whether the command was successful */
  success: boolean;
  /** Error message if unsuccessful */
  error?: string;
  /** New game state after command */
  state?: import('./ui-state').UIGameState;
}
