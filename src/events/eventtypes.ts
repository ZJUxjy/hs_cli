// Event types for the game event system
// Based on fireplace's events

/**
 * Game event types
 */
export enum GameEvent {
  // Turn events
  TURN_BEGIN = 'TURN_BEGIN',
  TURN_END = 'TURN_END',
  OWN_TURN_BEGIN = 'OWN_TURN_BEGIN',
  OWN_TURN_END = 'OWN_TURN_END',

  // Card play events
  PLAY = 'PLAY',
  AFTER_PLAY = 'AFTER_PLAY',
  PLAY_CARD = 'PLAY_CARD',
  AFTER_PLAY_CARD = 'AFTER_PLAY_CARD',

  // Summon events
  SUMMON = 'SUMMON',
  AFTER_SUMMON = 'AFTER_SUMMON',
  MINION_SUMMON = 'MINION_SUMMON',
  AFTER_MINION_SUMMON = 'AFTER_MINION_SUMMON',

  // Attack events
  ATTACK = 'ATTACK',
  AFTER_ATTACK = 'AFTER_ATTACK',
  ATTACKING = 'ATTACKING',
  DEFENDING = 'DEFENDING',

  // Damage events
  DAMAGE = 'DAMAGE',
  AFTER_DAMAGE = 'AFTER_DAMAGE',
  PREDAMAGE = 'PREDAMAGE',

  // Heal events
  HEAL = 'HEAL',
  AFTER_HEAL = 'AFTER_HEAL',

  // Death events
  DEATH = 'DEATH',
  AFTER_DEATH = 'AFTER_DEATH',
  KILL = 'KILL',
  AFTER_KILL = 'AFTER_KILL',

  // Spell events
  CAST_SPELL = 'CAST_SPELL',
  AFTER_CAST_SPELL = 'AFTER_CAST_SPELL',

  // Draw events
  DRAW = 'DRAW',
  AFTER_DRAW = 'AFTER_DRAW',

  // Damage dealing/receiving
  DEAL_DAMAGE = 'DEAL_DAMAGE',
  AFTER_DEAL_DAMAGE = 'AFTER_DEAL_DAMAGE',
  TAKE_DAMAGE = 'TAKE_DAMAGE',
  AFTER_TAKE_DAMAGE = 'AFTER_TAKE_DAMAGE',

  // Character events
  DAMAGE_GET = 'DAMAGE_GET',
  HEAL_GET = 'HEAL_GET',
  ARMOR_GET = 'ARMOR_GET',
  ATTACK_GET = 'ATTACK_GET',
  HEALTH_GET = 'HEALTH_GET',

  // Buff events
  BUFF_APPLY = 'BUFF_APPLY',
  BUFF_REMOVE = 'BUFF_REMOVE',

  // Secret events
  SECRET_REVEAL = 'SECRET_REVEAL',
  SECRET_TRIGGER = 'SECRET_TRIGGER',

  // Weapon events
  EQUIP_WEAPON = 'EQUIP_WEAPON',
  DESTROY_WEAPON = 'DESTROY_WEAPON',

  // Hero power events
  HERO_POWER = 'HERO_POWER',
  AFTER_HERO_POWER = 'AFTER_HERO_POWER',

  // Minion state events
  SILENCE = 'SILENCE',
  FREEZE = 'FREEZE',
  STEALTH = 'STEALTH',
  TAUNT = 'TAUNT',
  DIVINE_SHIELD = 'DIVINE_SHIELD',
  WINDFURY = 'WINDFURY',
  POISONOUS = 'POISONOUS',
  LIFESTEAL = 'LIFESTEAL',

  // Zone events
  ZONE_CHANGE = 'ZONE_CHANGE',
  DRAW_GET = 'DRAW_GET',
  DISCARD = 'DISCARD',
  SHUFFLE = 'SHUFFLE',

  // Misc
  IDLE = 'IDLE',
  BOARD_POSITION = 'BOARD_POSITION',
}

/**
 * Event payload structure
 */
export interface EventPayload {
  event: GameEvent;
  source?: any;
  target?: any;
  amount?: number;
  card?: any;
  player?: any;
  [key: string]: any;
}

/**
 * Event handler function type
 */
export type EventHandler = (payload: EventPayload) => void | any[] | Promise<void | any[]>;

/**
 * Event listener configuration
 */
export interface EventListenerConfig {
  event: GameEvent;
  handler: EventHandler;
  once?: boolean;
  priority?: number;
  condition?: (payload: EventPayload) => boolean;
}
