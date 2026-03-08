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
import { MAGE_DECK, WARRIOR_DECK, HEROES } from './decks';
import { DEMO_CARDS, CARD_NAMES } from '../../cards/demoCards';
import { I18n } from '../../i18n';
import { GameRules } from '../../core/rules';

// Track if cards are loaded
let cardsLoaded = false;

/**
 * Initialize card loader - must be called before creating games
 * Uses demo cards for fast loading
 */
export function initializeCardLoader(_xmlContent?: string): void {
  if (cardsLoaded) {
    console.log('[CardLoader] Already initialized');
    return;
  }

  console.log('[CardLoader] Starting initialization...');

  try {
    // Set up I18n first
    I18n.setLocale('enUS');

    // Create locale data with card names
    const localeData = {
      locale: 'enUS' as const,
      cardNames: { ...CARD_NAMES },
      cardDescriptions: {} as Record<string, string>,
      gameTexts: {} as Record<string, string>,
      errorMessages: {} as Record<string, string>,
      logMessages: {} as Record<string, string>,
    };

    I18n.loadLocale(localeData);
    console.log(`[CardLoader] I18n loaded with ${Object.keys(CARD_NAMES).length} card names`);

    // Load demo cards into CardLoader
    console.log('[CardLoader] Loading demo cards...');
    CardLoader.registerAll(DEMO_CARDS);

    // Verify cards are loaded
    const testCard = CardLoader.get('CS2_168');
    console.log(`[CardLoader] Test card CS2_168:`, testCard ? `FOUND (${testCard.type})` : 'NOT FOUND');

    cardsLoaded = true;
    console.log(`[CardLoader] Initialization complete`);
  } catch (error) {
    console.error('[CardLoader] Failed to load cards:', error);
  }
}

/**
 * Check if cards are loaded
 */
export function areCardsLoaded(): boolean {
  return cardsLoaded;
}

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

const DEFAULT_DECK = MAGE_DECK;
const DEFAULT_P2_DECK = WARRIOR_DECK;

const DEFAULT_HEROES: Record<string, string> = {
  'Jaina': HEROES.MAGE,
  'Garrosh': HEROES.WARRIOR,
};

/**
 * Create a game controller
 */
export function createGameController(config?: Partial<GameControllerConfig>): GameController {
  const player1Deck = config?.player1Deck || DEFAULT_DECK;
  const player2Deck = config?.player2Deck || DEFAULT_P2_DECK;
  const player1Name = config?.player1Name || 'Jaina';
  const player2Name = config?.player2Name || 'Garrosh';
  const player1Hero = config?.player1Hero || DEFAULT_HEROES[player1Name] || HEROES.MAGE;
  const player2Hero = config?.player2Hero || DEFAULT_HEROES[player2Name] || HEROES.WARRIOR;
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

  // Pending target state (for targeting UI)
  let pendingTargetState: UIPendingTarget | undefined = undefined;

  // Notify all subscribers
  const notifySubscribers = () => {
    const state = serializeGameState(game, localPlayerId);
    // Include pending target if set
    const fullState = {
      ...state,
      pendingTarget: pendingTargetState,
    };
    subscribers.forEach(listener => {
      try {
        listener(fullState);
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
    console.log(`[GameController] Dispatch received: ${command.type}`);
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
    console.log(`[GameController] handlePlayCard called - handIndex: ${command.handIndex}`);
    const currentPlayer = game.currentPlayer;
    console.log(`[GameController] currentPlayer: ${currentPlayer?.name}, localPlayerId: ${localPlayerId}`);

    if (!currentPlayer) {
      return { success: false, error: 'No current player' };
    }

    const handArray = (currentPlayer.hand as any).toArray ? (currentPlayer.hand as any).toArray() : Array.from(currentPlayer.hand as any);
    console.log(`[GameController] Hand size: ${handArray.length}`);

    const card = handArray[command.handIndex];
    if (!card) {
      return { success: false, error: `No card at hand index ${command.handIndex}` };
    }

    console.log(`[GameController] Card: ${card.name}, cost: ${card.cost}, zone: ${card.zone}`);
    console.log(`[GameController] Player mana: ${currentPlayer.mana}/${currentPlayer.maxMana}`);

    // Check if card is playable
    const isPlayable = card.isPlayable();
    console.log(`[GameController] isPlayable: ${isPlayable}`);

    if (!isPlayable) {
      return { success: false, error: 'Card is not playable' };
    }

    // Check if card REQUIRES a target (has targeting requirements like REQ_TARGET_TO_PLAY)
    const requirements = (card as any).requirements as Record<number, number> | undefined;
    const hasTargetingRequirement = requirements && (
      requirements[1] !== undefined ||  // REQ_TARGET_TO_PLAY = 1
      requirements[22] !== undefined || // REQ_TARGET_IF_AVAILABLE = 22
      requirements[67] !== undefined    // REQ_TARGET_FOR_COMBO = 67
    );

    if (hasTargetingRequirement && !command.targetId) {
      // Get valid targets for targeting UI
      const validTargets = card.getValidTargets();

      if (validTargets.length === 0) {
        // Card requires target but none available - still allow playing (game will handle it)
        console.log(`[GameController] Card requires target but none available`);
      } else {
        // Use short UUID prefix for matching (UI IDs are like "hero_abc123" or "minion_abc123_0")
        const validTargetUuids = validTargets.map((t: any) => (t.uuid || t.id)?.slice(0, 8));

        // Set pending target state and notify subscribers
        pendingTargetState = {
          sourceCardId: card.id,
          sourceCardUiId: `card_${card.uuid?.slice(0, 8)}_${command.handIndex}`,
          validTargetIds: validTargetUuids,
          prompt: `Select a target for ${card.name}`,
        };
        notifySubscribers();
        return {
          success: false,
          error: 'Card requires a target',
        };
      }
    }

    // Clear pending target state
    pendingTargetState = undefined;

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

    // Process deaths after playing card (in case of damage effects)
    game.processDeaths();
    game.checkForEndGame();

    notifySubscribers();
    return { success: true, state: serializeGameState(game, localPlayerId) };
  };

  /**
   * Handle ATTACK command - uses centralized game rules
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

    // Validate attack using centralized rules
    const validation = GameRules.canAttack(attacker, defender, game);
    if (!validation.valid) {
      console.log(`[GameController] Attack validation failed: ${validation.reason}`);
      return { success: false, error: validation.reason || 'Invalid attack' };
    }

    try {
      const attackAction = new Attack(attacker, defender);
      game.queueActions(attacker, [attackAction]);

      // Process deaths after attack
      game.processDeaths();

      // Check for game end
      game.checkForEndGame();

      notifySubscribers();
      return { success: true, state: serializeGameState(game, localPlayerId) };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error(`[GameController] Attack error:`, error);
      return { success: false, error };
    }
  };

  /**
   * Handle END_TURN command
   */
  const handleEndTurn = (_command: {}): CommandResult => {
    console.log(`[GameController] handleEndTurn called`);
    console.log(`[GameController] Current player before endTurn: ${game.currentPlayer?.name}`);
    console.log(`[GameController] localPlayerId: ${localPlayerId}`);

    game.endTurn();
    notifySubscribers();

    // If it's now opponent's turn, run AI after a delay
    const current = game.currentPlayer;
    console.log(`[GameController] Current player after endTurn: ${current?.name}`);

    if (current && current.name !== localPlayerId) {
      console.log(`[AI] Scheduling AI for ${current.name} in 1500ms`);
      setTimeout(() => {
        console.log(`[AI] Timeout fired, running AI...`);
        runOpponentAI();
      }, 1500);
    } else {
      console.log(`[AI] Not scheduling AI - current: ${current?.name}, local: ${localPlayerId}`);
    }

    return { success: true, state: serializeGameState(game, localPlayerId) };
  };

  /**
   * Simple AI for opponent - plays cards and attacks
   */
  const runOpponentAI = () => {
    const opponent = game.currentPlayer;
    if (!opponent || opponent.name === localPlayerId) {
      console.log(`[AI] Not opponent's turn, skipping`);
      return;
    }

    console.log(`[AI] ${opponent.name}'s turn - thinking...`);
    console.log(`[AI] Hand size: ${opponent.hand.length}, Field size: ${opponent.field.length}`);

    let actionCount = 0;
    const maxActions = 5; // Prevent infinite loops

    const doNextAction = () => {
      if (actionCount >= maxActions) {
        console.log(`[AI] Max actions reached, ending turn`);
        game.endTurn();
        notifySubscribers();
        return;
      }

      if (game.currentPlayer?.name !== opponent.name) {
        console.log(`[AI] Turn changed, stopping AI`);
        return;
      }

      // Try to play a card from hand
      const handArray = (opponent.hand as any).toArray ? (opponent.hand as any).toArray() : Array.from(opponent.hand as any);
      for (let i = 0; i < handArray.length; i++) {
        const card = handArray[i];
        if (card && typeof card.isPlayable === 'function' && card.isPlayable()) {
          console.log(`[AI] Playing card: ${card.name || card.id}`);
          try {
            const playAction = new Play(opponent, card, undefined);
            game.queueActions(opponent, [playAction]);
            actionCount++;
            notifySubscribers();
            setTimeout(doNextAction, 1000);
            return;
          } catch (e) {
            console.error(`[AI] Error playing card:`, e);
          }
        }
      }

      // Try to attack with minions - using centralized rules
      const fieldArray = (opponent.field as any).toArray ? (opponent.field as any).toArray() : Array.from(opponent.field as any);
      const localPlayerObj = game.players.find((p: any) => p.name === localPlayerId);
      const targetHero = localPlayerObj?.hero;

      for (const minion of fieldArray) {
        // Use centralized rules for attack validation
        const validation = GameRules.canAttack(minion, targetHero, game);
        if (validation.valid) {
          console.log(`[AI] Attacking hero with: ${(minion as any).name || (minion as any).id}`);
          try {
            const attackAction = new Attack(minion as any, targetHero);
            game.queueActions(minion as any, [attackAction]);
            game.processDeaths();
            game.checkForEndGame();
            actionCount++;
            notifySubscribers();
            setTimeout(doNextAction, 1000);
            return;
          } catch (e) {
            console.error(`[AI] Error attacking:`, e);
          }
        }
      }

      // Nothing else to do
      console.log(`[AI] No more actions, ending turn`);
      game.endTurn();
      notifySubscribers();
    };

    setTimeout(doNextAction, 500);
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
    // Clear pending target state
    pendingTargetState = undefined;
    notifySubscribers();
    return { success: true };
  };

  /**
   * Reset the game with new decks (extracted function)
   */
  const doReset = (newPlayer1Deck?: string[], newPlayer2Deck?: string[]) => {
    const p1Deck = newPlayer1Deck || DEFAULT_DECK;
    const p2Deck = newPlayer2Deck || DEFAULT_P2_DECK;

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
   * Find an entity by ID (supports full uuid, short uuid, or uiId format)
   */
  const findEntityById = (id: string): any => {
    // Extract short UUID if id is in uiId format (e.g., "hero_abc123" or "minion_abc123_0")
    const shortUuid = id.includes('_') ? id.split('_')[1] : id;

    for (const player of game.players) {
      // Check hero
      const heroUuid = (player.hero as any)?.uuid;
      const heroId = (player.hero as any)?.id;
      if (player.hero && (heroUuid === id || heroId === id || heroUuid?.startsWith(shortUuid))) {
        return player.hero;
      }

      // Check field minions
      for (const minion of player.field) {
        const minionUuid = (minion as any).uuid;
        const minionId = (minion as any).id;
        if (minionUuid === id || minionId === id || minionUuid?.startsWith(shortUuid)) {
          return minion;
        }
      }

      // Check hand cards
      for (const card of player.hand) {
        const cardUuid = (card as any).uuid;
        const cardId = (card as any).id;
        if (cardUuid === id || cardId === id || cardUuid?.startsWith(shortUuid)) {
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
