// Predefined card scripts for common effects
// Usage: const Fireball = new DamageSpell(TARGET, 6);

import { Action } from '../actions/base';
import { Damage, Heal, Draw, Summon, Destroy, Silence, Give, Bounce } from '../actions';
import { Hit, DiscardRandom, Battlecry, Deathrattle, Freeze } from '../actions/extended';
import {
  SELF, TARGET, ALL_MINIONS, FRIENDLY_MINIONS, ENEMY_MINIONS,
  Selector
} from './selector';
import { IF, FOR } from './conditions';

// ============== Damage Spells ==============

/**
 * Single target damage spell
 * Example: Fireball - Deal 6 damage to a target
 */
export function DamageSpell(target: Selector, amount: number): (source: any) => Action {
  return (source: any) => FOR(target, (t) => new Hit(source, t as any, amount));
}

/**
 * AOE damage spell
 * Example: Flamestrike - Deal 5 damage to all enemy minions
 */
export function AoeDamage(target: Selector, amount: number): (source: any) => Action {
  return (source: any) => FOR(target, (t) => new Hit(source, t as any, amount));
}

// ============== Healing Spells ==============

/**
 * Single target heal
 * Example: Healing Touch - Restore 8 health
 */
export function HealSpell(target: Selector, amount: number): (source: any) => Action {
  return (source: any) => FOR(target, (t) => new Heal(source, t as any, amount));
}

/**
 * AOE heal
 * Example: Circle of Healing - Restore 4 health to all minions
 */
export function AoeHeal(target: Selector, amount: number): (source: any) => Action {
  return (source: any) => FOR(target, (t) => new Heal(source, t as any, amount));
}

// ============== Minion Spells ==============

/**
 * Summon minions
 * Example: Animal Companion - Summon a random Beast
 */
export function SummonMinion(cardId: string): Action {
  return new Give(cardId);
}

/**
 * Destroy target minion
 * Example: Assassinate - Destroy an enemy minion
 */
export function DestroyMinion(target: Selector = ALL_MINIONS): (source: any) => Action {
  return (source: any) => FOR(target, () => new Destroy());
}

/**
 * Silence target minion
 * Example: Silence - Silence a minion
 */
export function SilenceMinion(target: Selector = ALL_MINIONS): (source: any) => Action {
  return (source: any) => FOR(target, (t) => new Silence(source, t as any));
}

/**
 * Return minion to hand
 * Example: Youthful Brewmaster - Return a friendly minion to your hand
 */
export function BounceMinion(target: Selector = FRIENDLY_MINIONS): (source: any) => Action {
  return (source: any) => FOR(target, () => new Bounce());
}

/**
 * Freeze target
 * Example: Frostbolt - Deal 3 damage and Freeze the target
 */
export function FreezeTarget(target: Selector = ALL_MINIONS): (source: any) => Action {
  return (source: any) => FOR(target, (t) => new Freeze(t as any) as any);
}

// ============== Card Draw ==============

/**
 * Draw cards
 * Example: Arcane Intellect - Draw 2 cards
 */
export function DrawCards(count: number): (source: any) => Action {
  return (source: any) => new Draw(source, count);
}

// ============== Discard ==============

/**
 * Discard random cards
 * Example: Doomguard - Charge. Battlecry: Discard two random cards.
 */
export function DiscardRandomCards(count: number): (source: any) => Action {
  return (source: any) => new DiscardRandom(source, count);
}

// ============== Weapon ==============

/**
 * Equip weapon
 * Example: Fiery War Axe - Equip a 3/2 weapon
 */
export function EquipWeapon(cardId: string): Action {
  return new Give(cardId);
}

// ============== Battlecry/Deathrattle Wrappers ==============

/**
 * Create a battlecry effect
 */
export function BattlecryEffect(card: any, ...actions: Action[]): Battlecry {
  return new Battlecry(card, actions);
}

/**
 * Create a deathrattle effect
 */
export function DeathrattleEffect(card: any, ...actions: Action[]): Deathrattle {
  return new Deathrattle(card, actions);
}

// ============== Combined Effects ==============

/**
 * Damage and freeze (Frostbolt style)
 */
export function DamageAndFreeze(target: Selector, damage: number): (source: any) => any {
  return (source: any) => FOR(target, (t) => [
    new Hit(source, t as any, damage),
    new Freeze(t as any)
  ]);
}

// ============== Example Card Definitions (as functions) ==============

/**
 * Example: Fireball - Deal 6 damage to a target
 */
export function Fireball(source: any): Action {
  return DamageSpell(TARGET, 6)(source);
}

/**
 * Example: Flamestrike - Deal 5 damage to all enemy minions
 */
export function Flamestrike(source: any): Action {
  return AoeDamage(ENEMY_MINIONS, 5)(source);
}

/**
 * Example: Arcane Intellect - Draw 2 cards
 */
export function ArcaneIntellect(source: any): Action {
  return DrawCards(2)(source);
}

/**
 * Example: Assassinate - Destroy an enemy minion
 */
export function Assassinate(source: any): Action {
  return DestroyMinion(ENEMY_MINIONS)(source);
}

/**
 * Example: Healing Touch - Restore 8 health
 */
export function HealingTouch(source: any): Action {
  return HealSpell(TARGET, 8)(source);
}

/**
 * Example: Circle of Healing - Restore 4 health to all minions
 */
export function CircleOfHealing(source: any): Action {
  return AoeHeal(ALL_MINIONS, 4)(source);
}

/**
 * Example: Frostbolt - Deal 3 damage and Freeze the target
 */
export function Frostbolt(source: any): Action {
  return DamageAndFreeze(TARGET, 3)(source);
}
