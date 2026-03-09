/**
 * Serialize Game State
 *
 * Converts the engine's Game object into a read-only UI state snapshot.
 * This is the only way the UI should consume game state.
 */

import type { Game } from '../../core/game';
import type { Player } from '../../core/player';
import type { Card, Minion, PlayableCard } from '../../core/card';
import type {
  UIGameState,
  UIPlayerState,
  UICardState,
  UIMinionState,
  UIHeroState,
  UIActionLogEntry,
} from '../types/ui-state';
import { CardType, PlayState } from '../../enums';

/**
 * Generate a unique UI ID for an entity
 */
function generateUiId(entity: unknown, prefix: string = 'entity'): string {
  const e = entity as any;
  // Use uuid if available, otherwise use a combination of id and index
  if (e.uuid) return `${prefix}_${e.uuid.slice(0, 8)}`;
  if (e.id) return `${prefix}_${e.id}_${Date.now()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Serialize a card to UI state
 */
function serializeCard(card: Card | PlayableCard, index: number): UICardState {
  const cardAny = card as any;

  const type = mapCardType(cardAny.type);

  const uiCard: UICardState = {
    uiId: generateUiId(card, 'card') + `_${index}`,
    id: cardAny.id || 'unknown',
    name: cardAny.name || 'Unknown Card',
    cost: cardAny.cost ?? 0,
    type,
    playable: cardAny.isPlayable?.() ?? false,
  };

  // Add minion/weapon specific properties
  if (type === 'minion' || type === 'weapon') {
    uiCard.attack = cardAny.attack ?? cardAny._attack ?? 0;
    uiCard.health = cardAny.health ?? cardAny._maxHealth;
    uiCard.damage = cardAny.damage ?? 0;
  }

  // Add description if available
  if (cardAny.description) {
    uiCard.description = cardAny.description;
  }

  return uiCard;
}

/**
 * Serialize a minion on the battlefield
 */
function serializeMinion(minion: Minion, index: number): UIMinionState {
  const minionAny = minion as any;

  const uiMinion: UIMinionState = {
    uiId: generateUiId(minion, 'minion') + `_${index}`,
    id: minionAny.id || 'unknown',
    name: minionAny.name || 'Unknown Minion',
    cost: minionAny.cost ?? 0,
    type: 'minion',
    playable: false, // Minions on field are not playable
    attack: minionAny.attack ?? 0,
    health: (minionAny.maxHealth ?? 0) - (minionAny.damage ?? 0),
    maxHealth: minionAny.maxHealth ?? 0,
    damage: minionAny.damage ?? 0,
    canAttack: canMinionAttack(minionAny),
    taunt: minionAny.taunt ?? false,
    divineShield: minionAny.divineShield ?? false,
    frozen: minionAny.frozen ?? false,
    stealth: minionAny.stealth ?? false,
  };

  // Add description if available
  if (minionAny.description) {
    uiMinion.description = minionAny.description;
  }

  return uiMinion;
}

/**
 * Check if a minion can attack
 */
function canMinionAttack(minion: any): boolean {
  // Can't attack if sleeping (just summoned)
  if (minion.sleeping) return false;
  // Can't attack if frozen
  if (minion.frozen) return false;
  // Can't attack if attack is 0
  if ((minion.attack ?? 0) <= 0) return false;
  // Can't attack if already attacked this turn (unless Windfury)
  const maxAttacks = minion.windfury ? 2 : 1;
  if ((minion.attacksThisTurn ?? 0) >= maxAttacks) return false;
  // Can attack if has charge or has been in play for a turn
  return minion.charge || (minion.turnsInPlay ?? 0) >= 1;
}

/**
 * Serialize a hero
 */
function serializeHero(hero: any, player?: any): UIHeroState {
  const weapon = player?.weapon;
  const attack = weapon?.attack ?? 0;
  const hasWeapon = weapon != null;
  // Hero can attack if has weapon and weapon has durability
  const canAttack = hasWeapon && (weapon?.durability ?? 0) > 0;

  // Hero has a health getter that returns 30 - damage
  // Use hero.health directly as it's already the current health
  const currentHealth = hero.health ?? 30;
  const maxHealth = 30; // Heroes always have 30 max health
  const damage = hero.damage ?? 0;

  return {
    uiId: generateUiId(hero, 'hero'),
    id: hero.id || 'unknown',
    name: hero.name || 'Hero',
    health: currentHealth,
    maxHealth: maxHealth,
    damage: damage,
    armor: hero.armor ?? 0,
    attack,
    canAttack,
  };
}

/**
 * Serialize a player
 */
function serializePlayer(player: Player, isLocal: boolean): UIPlayerState {
  const playerAny = player as any;

  // Serialize hand cards
  const hand = (playerAny.hand || []).map((card: Card, index: number) =>
    serializeCard(card, index)
  );

  // Serialize field minions
  const field = (playerAny.field || []).map((minion: Minion, index: number) =>
    serializeMinion(minion, index)
  );

  // Serialize hero if available
  const hero = playerAny.hero ? serializeHero(playerAny.hero) : undefined;

  return {
    id: playerAny.name || 'Player',
    name: playerAny.name || 'Player',
    hero,
    mana: playerAny.mana ?? 0,
    maxMana: playerAny.maxMana ?? 0,
    deckCount: (playerAny.deck || []).length,
    hand,
    field,
    hasWeapon: playerAny.weapon != null,
    weaponAttack: playerAny.weapon?.attack,
  };
}

/**
 * Map CardType enum to UI card type string
 */
function mapCardType(type: CardType): UICardState['type'] {
  switch (type) {
    case CardType.MINION:
      return 'minion';
    case CardType.SPELL:
      return 'spell';
    case CardType.WEAPON:
      return 'weapon';
    case CardType.HERO:
      return 'hero';
    case CardType.HERO_POWER:
      return 'hero_power';
    default:
      return 'minion'; // Default fallback
  }
}

/**
 * Get action log entries from game
 * TODO: Implement proper action logging in game engine
 */
function getActionLog(_game: Game): UIActionLogEntry[] {
  // For now, return empty array
  // In future, this should read from game.actionLog or similar
  return [];
}

/**
 * Serialize the complete game state for UI consumption
 *
 * @param game - The game instance to serialize
 * @param localPlayerId - Optional ID of the local player (defaults to first player)
 * @returns A read-only UI state snapshot
 */
export function serializeGameState(
  game: Game,
  localPlayerId?: string
): UIGameState {
  const gameAny = game as any;

  // Determine local and opponent players
  const player1 = gameAny.player1;
  const player2 = gameAny.player2;

  if (!player1 || !player2) {
    throw new Error('Game must have two players');
  }

  // Determine which player is local
  let localPlayer: Player;
  let opponent: Player;

  if (localPlayerId === player2.name) {
    localPlayer = player2;
    opponent = player1;
  } else {
    localPlayer = player1;
    opponent = player2;
  }

  const currentPlayerId = gameAny.currentPlayer?.name || player1.name;
  const isLocalPlayerTurn = currentPlayerId === localPlayer.name;

  console.log(`[Serialize] currentPlayerId: ${currentPlayerId}, localPlayer.name: ${localPlayer.name}, isLocalPlayerTurn: ${isLocalPlayerTurn}`);

  // Determine game mode
  const mode = gameAny.ended ? 'game_over' : 'playing';

  return {
    mode,
    turn: gameAny.turn ?? 1,
    currentPlayerId,
    isLocalPlayerTurn,
    localPlayer: serializePlayer(localPlayer, true),
    opponent: serializePlayer(opponent, false),
    log: getActionLog(game),
    // winnerId will be added when mode is game_over
    winnerId: mode === 'game_over' ? getWinnerId(gameAny) : undefined,
  };
}

/**
 * Get the winner's ID from a completed game
 */
function getWinnerId(gameAny: any): string | undefined {
  for (const player of gameAny.players || []) {
    if (player.playstate === PlayState.WON) {
      return player.name;
    }
  }

  return undefined;
}

export default serializeGameState;
