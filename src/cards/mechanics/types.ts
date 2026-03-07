// Card mechanism types and interfaces
import type { Entity } from '../../core/entity';
import type { Player } from '../../core/player';

// Extended player type for card scripts with common properties
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ScriptPlayer extends Player {
  isCurrentPlayer?: boolean;
  playedCards?: string[];
}

// Extended entity type for card scripts with common properties
export interface ScriptEntity extends Entity {
  controller?: ScriptPlayer;
  id: string;
}

// Card to be added to hand/field
export interface CardReference {
  id: string;
}

// Event types that can trigger card effects
export type EventType =
  | 'DAMAGE'
  | 'DEATH'
  | 'PLAY'
  | 'TURN_START'
  | 'TURN_END'
  | 'DRAW'
  | 'DISCARD'
  | 'ATTACK'
  | 'AFTER_ATTACK'
  | 'AFTER_MINION_PLAY'
  | 'SECRET_REVEALED'
  | 'SPELL_PLAY'
  | 'MINION_SUMMON'
  | 'HERO_POWER'
  | 'PLAY_CARD'
  | 'DRAW_CARD'
  | 'HEAL'
  | 'INSPIRE'
  | 'PLAY_SPELL'
  | 'FREEZE'
  | 'SILENCE'
  | 'BOARD_DAMAGE'
  | 'SUMMON'
  | 'SPELL'
  | 'ARMOR_GAIN'
  | 'FRENZY'
  | 'HONORABLE_KILL'
  | 'MAGNETIZE'
  | 'AWAKEN'
  | 'DORMANT';

// Action context - passed to script functions
export interface ActionContext {
  source: Entity;
  target?: Entity;
  game: any;
  event?: CardGameEvent;
}

// Card game event
export interface CardGameEvent {
  type: EventType;
  source?: Entity;
  target?: Entity;
  value?: number;
  card?: Entity;
  turnPlayer?: Player;
  player?: Player;
}

// Script function type
export type ScriptFunction = (context: ActionContext) => unknown;

// Card script definition
export interface CardScript {
  // Called when card is played (battlecry)
  play?: ScriptFunction;
  // Called when minion dies
  deathrattle?: ScriptFunction;
  // Called when damage is dealt to this entity
  onDamage?: ScriptFunction;
  // Event listeners - map event type to handler
  events?: Partial<Record<EventType, ScriptFunction>>;
  // Aura effect - applied each turn
  update?: ScriptFunction;
  // Combo - only active if played after another card
  combo?: ScriptFunction;
  // Inspire - when hero power is used
  inspire?: ScriptFunction;
  // Frenzy - when this minion takes damage and survives
  frenzy?: ScriptFunction;
  // Honorable Kill - when this minion exactly kills a target
  honorableKill?: ScriptFunction;
  // Overload
  overload?: number;
  // Choose one - choices for choice cards
  choose?: string[];
  // Targeting requirements
  requirements?: Record<string, number>;
  // Magnetic - can merge with Mech minions
  magnetic?: boolean;
  // Dormant - starts dormant with awaken condition
  dormant?: {
    turns?: number;
    event?: EventType;
    onAwaken?: ScriptFunction;
  };
  // Additional properties
  [key: string]: unknown;
}

// Pre-defined buff IDs
export const BUFFS = {
  // Example buffs
  WINDFURY: 'DS1_184e',
  TAUNT: 'CS2_101e',
  DIVINE_SHIELD: 'CS2_086e',
  LIFESTEAL: 'ICC_467e',
  POISONOUS: 'ICC_468e',
  FROZEN: 'CS2_031e',
} as const;
