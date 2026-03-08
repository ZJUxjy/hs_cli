/**
 * Game Controller
 *
 * Provides a stable API for UI to interact with the game engine.
 * The controller encapsulates game initialization, state reading,
 * and command dispatch.
 */

import { Game } from '../../core/game';
import { Player } from '../../core/player';
import { CardLoader } from '../../cards/loader';
import { serializeGameState } from './serializeGameState';
import type { UIGameState, UICommand, CommandResult } from '../types';
import { Play } from '../../actions/play';
import { Attack } from '../../actions/attack';

export interface GameController {
  /** Get the current game state as a UI snapshot */
  getState(): UIGameState;

  /** Dispatch a UI command to the game engine */
  dispatch(command: UICommand): CommandResult;

  /** Subscribe to state changes */
  subscribe(listener: (state: UIGameState) => void): () => void;

  /** Reset the game with new decks */
  reset(player1Deck?: string[], player2Deck?: string[]): void;

  /** Get the raw game instance (for debugging only) */
  getGame(): Game;
}

interface GameControllerConfig {
  /** Player 1 deck card IDs */
  player1Deck: string[];
  /** Player 2 deck card IDs */
  player2Deck: string[];
  /** Player 1 name */
  player1Name?: string;
  /** Player 2 name */
  player2Name?: string;
  /** Player 1 hero ID */
  player1Hero?: string;
  /** Player 2 hero ID */
  player2Hero?: string;
  /** Random seed */
  seed?: number;
  /** Local player ID (defaults to player 1) */
  localPlayerId?: string;
}

const DEFAULT_DECK = [
  'CS2_168', 'CS2_168', 'CS2_171', 'CS2_171', 'CS1_042', 'CS1_042',
  'CS2_121', 'CS2_121', 'CS2_122', 'CS2_122', 'CS2_124', 'CS2_124',
  'CS2_142', 'CS2_142', 'CS2_141', 'CS2_141', 'CS2_147', 'CS2_147',
  'CS2_131', 'CS2_131', 'CS2_125', 'CS2_125', 'CS2_187', 'CS2_187',
  'CS2_189', 'CS2_189', 'CS2_203', 'CS2_203', 'CS2_119', 'CS2_119',
];

const DEFAULT_HEROES: Record<string, string> = {
  'Player 1': 'HERO_08', // Jaina (Mage)
  'Player 2': 'HERO_01', // Garrosh (Warrior)
};

/**
 * Create a game controller
 */
export function createGameController(config?: Partial<GameControllerConfig>): GameController {
  const player1Deck = config?.player1Deck || DEFAULT_DECK;
  const player2Deck = config?.player2Deck || DEFAULT_DECK;
  const player1Name = config?.player1Name || 'Player 1';
  const player2Name = config?.player2Name || 'Player 2';
  const player1Hero = config?.player1Hero || DEFAULT_HEROES[player1Name] || 'HERO_08';
  const player2Hero = config?.player2Hero || DEFAULT_HEROES[player2Name] || 'HERO_01';
  const seed = config?.seed || Date.now();
  const localPlayerId = config?.localPlayerId || player1Name;

  // Create players
  const player1 = new Player(player1Name, player1Deck);
  const player2 = new Player(player2Name, player2Deck);

  player1.startingHero = player1Hero;
  player2.startingHero = player2Hero;

  // Create game
  let game = new Game({
    players: [player1, player2],
    seed,
  });

  // Subscribers
  const subscribers = new Set<(state: UIGameState) => void>();

  // Notify all subscribers
  const notifySubscribers = () => {
    const state = serializeGameState(game, localPlayerId);
    subscribers.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[GameController] Error in subscriber:', error);
      }
    });
  };

  // Start the game
  game.start();

  /**
   * Dispatch a UI command
   */
  const dispatch = (command: UICommand): CommandResult => {
    try {
      switch (command.type) {
        case 'PLAY_CARD':
          return handlePlayCard(command);

        case 'ATTACK':
          return handleAttack(command);

        case 'END_TURN':
          return handleEndTurn(command);

        case 'CONCEDE':
          return handleConcede(command);

        case 'HERO_POWER':
          return handleHeroPower(command);

        case 'CANCEL_TARGET':
          return handleCancelTarget(command);

        case 'NEW_GAME':
          return handleNewGame(command);

        default:
          return { success: false, error: `Unknown command type: ${(command as any).type}` };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[GameController] Command error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Handle PLAY_CARD command
   */
  const handlePlayCard = (command: { handIndex: number; targetId?: string }): CommandResult => {
    const currentPlayer = game.currentPlayer;
    if (!currentPlayer) {
      return { success: false, error: 'No current player' };
    }

    const card = currentPlayer.hand.at(command.handIndex);
    if (!card) {
      return { success: false, error: `No card at hand index ${command.handIndex}` };
    }

    // Check if card is playable
    if (!card.isPlayable()) {
      return { success: false, error: 'Card is not playable' };
    }

    // Check if card needs a target
    const validTargets = card.getValidTargets();
    const needsTarget = validTargets.length > 0;

    if (needsTarget && !command.targetId) {
      // Return pending target state
      const state = serializeGameState(game, localPlayerId);
      return {
        success: false,
        error: 'Card requires a target',
        state: {
          ...state,
          pendingTarget: {
            sourceCardId: card.id,
            sourceCardUiId: `card_${card.uuid?.slice(0, 8)}_${command.handIndex}`,
            validTargetIds: validTargets.map((t: any) => t.uuid || t.id),
            prompt: `Select a target for ${card.name}`,
          },
        },
      };
    }

    // Find target entity if specified
    let target: any = undefined;
    if (command.targetId) {
      target = findEntityById(command.targetId);
      if (!target) {
        return { success: false, error: `Target not found: ${command.targetId}` };
      }
    }

    // Execute play action
    const playAction = new Play(currentPlayer, card, target);
    game.queueActions(currentPlayer, [playAction]);

    notifySubscribers();
    return { success: true, state: serializeGameState(game, localPlayerId) };
  };

  /**
   * Handle ATTACK command
   */
  const handleAttack = (command: { attackerId: string; defenderId: string }): CommandResult => {
    const attacker = findEntityById(command.attackerId);
    const defender = findEntityById(command.defenderId);

    if (!attacker) {
      return { success: false, error: `Attacker not found: ${command.attackerId}` };
    }
    if (!defender) {
      return { success: false, error: `Defender not found: ${command.defenderId}` };
    }

    const attackAction = new Attack(attacker, defender);
    game.queueActions(attacker, [attackAction]);

    notifySubscribers();
    return { success: true, state: serializeGameState(game, localPlayerId) };
  };

  /**
   * Handle END_TURN command
   */
  const handleEndTurn = (_command: {}): CommandResult => {
    game.endTurn();
    notifySubscribers();
    return { success: true, state: serializeGameState(game, localPlayerId) };
  };

  /**
   * Handle CONCEDE command
   */
  const handleConcede = (_command: {}): CommandResult => {
    const currentPlayer = game.currentPlayer;
    if (currentPlayer) {
      currentPlayer.concede();
    }
    notifySubscribers();
    return { success: true, state: serializeGameState(game, localPlayerId) };
  };

  /**
   * Handle HERO_POWER command
   */
  const handleHeroPower = (command: { targetId?: string }): CommandResult => {
    const currentPlayer = game.currentPlayer;
    if (!currentPlayer) {
      return { success: false, error: 'No current player' };
    }

    // TODO: Implement hero power
    return { success: false, error: 'Hero power not yet implemented' };
  };

  /**
   * Handle CANCEL_TARGET command
   */
  const handleCancelTarget = (_command: {}): CommandResult => {
    notifySubscribers();
    return { success: true, state: serializeGameState(game, localPlayerId) };
  };

  /**
   * Reset the game with new decks (extracted function)
   */
  const doReset = (newPlayer1Deck?: string[], newPlayer2Deck?: string[]) => {
    const p1Deck = newPlayer1Deck || player1Deck;
    const p2Deck = newPlayer2Deck || player2Deck;

    const newPlayer1 = new Player(player1Name, p1Deck);
    const newPlayer2 = new Player(player2Name, p2Deck);

    newPlayer1.startingHero = player1Hero;
    newPlayer2.startingHero = player2Hero;

    game = new Game({
      players: [newPlayer1, newPlayer2],
      seed: Date.now(),
    });

    game.start();
    notifySubscribers();
  };

  /**
   * Handle NEW_GAME command
   */
  const handleNewGame = (command: { player1Deck?: string[]; player2Deck?: string[] }): CommandResult => {
    doReset(command.player1Deck, command.player2Deck);
    return { success: true, state: serializeGameState(game, localPlayerId) };
  };

  /**
   * Find an entity by ID
   */
  const findEntityById = (id: string): any => {
    for (const player of game.players) {
      // Check hero
      if (player.hero && ((player.hero as any).uuid === id || (player.hero as any).id === id)) {
        return player.hero;
      }

      // Check field minions
      for (const minion of player.field) {
        if ((minion as any).uuid === id || (minion as any).id === id) {
          return minion;
        }
      }

      // Check hand cards
      for (const card of player.hand) {
        if ((card as any).uuid === id || (card as any).id === id) {
          return card;
        }
      }
    }

    return undefined;
  };

  // Return the controller interface
  return {
    getState: () => serializeGameState(game, localPlayerId),

    dispatch,

    subscribe: (listener: (state: UIGameState) => void) => {
      subscribers.add(listener);
      // Immediately notify with current state
      listener(serializeGameState(game, localPlayerId));
      // Return unsubscribe function
      return () => {
        subscribers.delete(listener);
      };
    },

    reset: doReset,

    getGame: () => game,
  };
}

export default createGameController;
