/**
 * UI State Types
 *
 * These types define the read-only state snapshot that the UI consumes.
 * The UI should never directly depend on engine runtime objects.
 */

/**
 * Card state as seen by the UI
 */
export interface UICardState {
  /** Unique ID for UI rendering */
  uiId: string;
  /** Card ID (e.g., "CS2_168") */
  id: string;
  /** Card name */
  name: string;
  /** Mana cost */
  cost: number;
  /** Card type (minion, spell, weapon, etc.) */
  type: 'minion' | 'spell' | 'weapon' | 'hero' | 'hero_power';
  /** Whether this card can be played */
  playable: boolean;
  /** Attack value (for minions/weapons) */
  attack?: number;
  /** Health value (for minions) */
  health?: number;
  /** Current damage on the entity */
  damage?: number;
  /** Card description/text */
  description?: string;
}

/**
 * Minion state on the battlefield
 */
export interface UIMinionState extends UICardState {
  type: 'minion';
  attack: number;
  health: number;
  maxHealth: number;
  damage: number;
  /** Whether the minion can attack */
  canAttack: boolean;
  /** Whether the minion has taunt */
  taunt?: boolean;
  /** Whether the minion has divine shield */
  divineShield?: boolean;
  /** Whether the minion is frozen */
  frozen?: boolean;
  /** Whether the minion is stealthed */
  stealth?: boolean;
  /** Whether the minion has windfury (can attack twice) */
  windfury?: boolean;
  /** Whether the minion has charge (can attack immediately) */
  charge?: boolean;
  /** Whether the minion has lifesteal (heals when dealing damage) */
  lifesteal?: boolean;
  /** Whether the minion has poisonous (destroys any minion it damages) */
  poisonous?: boolean;
  /** Whether the minion has elusive (can't be targeted by spells/hero powers) */
  elusive?: boolean;
  /** Whether the minion is silenced (text effects disabled) */
  silenced?: boolean;
  /** Whether the minion is sleeping (summoning sickness, can't attack) */
  sleeping?: boolean;
}

/**
 * Hero state
 */
export interface UIHeroState {
  uiId: string;
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  armor: number;
  /** Attack value (from weapon) */
  attack: number;
  /** Whether the hero can attack (e.g., with a weapon) */
  canAttack: boolean;
}

/**
 * Player state as seen by the UI
 */
export interface UIPlayerState {
  /** Player identifier */
  id: string;
  /** Player name */
  name: string;
  /** Hero information */
  hero?: UIHeroState;
  /** Current mana */
  mana: number;
  /** Maximum mana */
  maxMana: number;
  /** Cards in deck count */
  deckCount: number;
  /** Cards in hand */
  hand: UICardState[];
  /** Minions on battlefield */
  field: UIMinionState[];
  /** Whether this player has a weapon equipped */
  hasWeapon: boolean;
  /** Weapon attack if equipped */
  weaponAttack?: number;
}

/**
 * Pending target selection state
 */
export interface UIPendingTarget {
  /** The card that needs a target */
  sourceCardId: string;
  /** Source card UI ID */
  sourceCardUiId: string;
  /** List of valid target UI IDs */
  validTargetIds: string[];
  /** Targeting prompt text */
  prompt?: string;
}

/**
 * Action log entry
 */
export interface UIActionLogEntry {
  /** Timestamp */
  timestamp: number;
  /** Entry type */
  type: 'damage' | 'heal' | 'summon' | 'death' | 'play' | 'draw' | 'turn' | 'attack' | 'other';
  /** Human-readable description */
  message: string;
  /** Source entity UI ID */
  sourceId?: string;
  /** Target entity UI ID */
  targetId?: string;
  /** Amount (for damage/heal) */
  amount?: number;
}

/**
 * Game mode
 */
export type UIGameMode = 'playing' | 'game_over';

/**
 * Complete game state snapshot
 */
export interface UIGameState {
  /** Game mode */
  mode: UIGameMode;
  /** Current turn number */
  turn: number;
  /** Current player ID */
  currentPlayerId: string;
  /** Whether the local player is the current player */
  isLocalPlayerTurn: boolean;
  /** Local player (the one viewing the game) */
  localPlayer: UIPlayerState;
  /** Opponent player */
  opponent: UIPlayerState;
  /** Pending target selection (if any) */
  pendingTarget?: UIPendingTarget;
  /** Action log entries */
  log: UIActionLogEntry[];
  /** Winner ID (if game is over) */
  winnerId?: string;
}
