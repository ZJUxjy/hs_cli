// Extended actions for complex card mechanics
// Based on fireplace's actions

import { Action } from './base';
import type { Entity } from '../core/entity';
import { Card, Minion } from '../core/card';
import type { Player } from '../core/player';
import { Zone } from '../enums';

/**
 * Hit - Deals damage with combat flag (for combat damage tracking)
 */
export class Hit extends Action {
  constructor(
    public source: Entity,
    public target: Entity,
    public amount: number,
    public isCombat: boolean = false
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const target = this.target;
    let amount = this.amount;

    // Get actual damage after modifications
    amount = source.getDamage(amount, target as any);

    // Apply damage
    const currentDamage = (target as any).damage || 0;
    (target as any).damage = currentDamage + amount;

    // Track damage sources for the current turn (for Vengeful Visage, etc.)
    if (amount > 0) {
      const targetAny = target as any;
      if (!targetAny.damageSourcesThisTurn) {
        targetAny.damageSourcesThisTurn = [];
      }
      targetAny.damageSourcesThisTurn.push({ source, amount, isCombat: this.isCombat });
    }

    return [amount];
  }
}

/**
 * Discard - Discard cards from hand
 */
export class Discard extends Action {
  constructor(
    public cards: Card | Card[]
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const cards = Array.isArray(this.cards) ? this.cards : [this.cards];
    const discarded: Card[] = [];

    for (const card of cards) {
      const cardAny = card as any;
      const controller = cardAny.controller;

      if (cardAny.zone === Zone.HAND) {
        // Move to graveyard
        cardAny.zone = Zone.GRAVEYARD;
        controller?.graveyard?.push(card);

        // Remove from hand
        const hand = controller?.hand;
        if (hand) {
          const idx = hand.indexOf(card as unknown as Minion);
          if (idx !== -1) hand.splice(idx, 1);
        }

        discarded.push(card);
        console.log(`[Discard] ${card.id} was discarded`);

        // Trigger discard events
        if (controller) {
          (controller as any).cardsDiscardedThisTurn = ((controller as any).cardsDiscardedThisTurn || 0) + 1;
        }
      }
    }

    return discarded;
  }
}

/**
 * DiscardRandom - Discard random cards from hand
 */
export class DiscardRandom extends Action {
  constructor(
    public player: Player,
    public count: number = 1
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const hand = (this.player as any).hand;
    if (!hand || hand.length === 0) return [];

    const game = (this.player as any).game;
    const toDiscard = Math.min(this.count, hand.length);
    const discarded: Card[] = [];

    for (let i = 0; i < toDiscard; i++) {
      const randomCard = game?.random?.choice(hand.toArray());
      if (randomCard) {
        const discardAction = new Discard(randomCard as unknown as Card);
        const result = discardAction.trigger(_source);
        discarded.push(...result as Card[]);
      }
    }

    return discarded;
  }
}

/**
 * Battlecry - Wrapper for battlecry actions
 */
export class Battlecry extends Action {
  constructor(
    public card: Card,
    public actions: unknown[],
    public target?: Entity
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    console.log(`[Battlecry] ${(this.card as any).id} battlecry triggering`);

    const results: unknown[] = [];

    // Execute all battlecry actions
    for (const action of this.actions) {
      if (action instanceof Action) {
        results.push(...action.trigger(source, this.target));
      }
    }

    // Mark battlecry as completed
    (this.card as any).battlecryTriggered = true;

    return results;
  }
}

/**
 * Deathrattle - Wrapper for deathrattle actions
 */
export class Deathrattle extends Action {
  constructor(
    public card: Card,
    public actions: unknown[]
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    console.log(`[Deathrattle] ${(this.card as any).id} deathrattle triggering`);

    // Check if silenced - silenced minions don't trigger deathrattles
    if ((this.card as any).silenced) {
      console.log(`[Deathrattle] ${(this.card as any).id} is silenced, deathrattle cancelled`);
      return [];
    }

    const results: unknown[] = [];

    // Execute all deathrattle actions
    for (const action of this.actions) {
      if (action instanceof Action) {
        results.push(...action.trigger(source));
      }
    }

    return results;
  }
}

/**
 * SetTag - Set a tag/property on an entity
 */
export class SetTag extends Action {
  constructor(
    public target: Entity,
    public tag: string,
    public value: unknown
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    (this.target as any)[this.tag] = this.value;
    return [this.value];
  }
}

/**
 * UnsetTag - Remove/unset a tag from an entity
 */
export class UnsetTag extends Action {
  constructor(
    public target: Entity,
    public tag: string
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    delete (this.target as any)[this.tag];
    return [];
  }
}

/**
 * Reveal - Reveal a card to one or more players
 */
export class Reveal extends Action {
  constructor(
    public card: Card,
    public player?: Player // If undefined, reveal to all players
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const cardAny = this.card as any;
    cardAny.revealed = true;

    if (this.player) {
      console.log(`[Reveal] ${cardAny.id} revealed to ${this.player.name}`);
    } else {
      console.log(`[Reveal] ${cardAny.id} revealed to all players`);
    }

    return [this.card];
  }
}

/**
 * Hide - Hide a previously revealed card
 */
export class Hide extends Action {
  constructor(
    public card: Card
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    (this.card as any).revealed = false;
    return [this.card];
  }
}

/**
 * SpendMana - Spend mana from a player
 */
export class SpendMana extends Action {
  constructor(
    public player: Player,
    public amount: number
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const playerAny = this.player as any;
    const actualSpend = Math.min(this.amount, playerAny.mana);
    playerAny.mana -= actualSpend;
    return [actualSpend];
  }
}

/**
 * GainManaCrystal - Add a mana crystal (empty or filled)
 */
export class GainManaCrystal extends Action {
  constructor(
    public player: Player,
    public amount: number = 1,
    public empty: boolean = false
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const playerAny = this.player as any;
    playerAny.maxMana = Math.min(10, playerAny.maxMana + this.amount);

    if (!this.empty) {
      playerAny.mana = Math.min(10, playerAny.mana + this.amount);
    }

    return [this.amount];
  }
}

/**
 * Overload - Lock mana crystals for next turn
 */
export class Overload extends Action {
  constructor(
    public player: Player,
    public amount: number
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    (this.player as any).overloaded += this.amount;
    return [this.amount];
  }
}

/**
 * Copy - Copy a card (to hand, deck, etc.)
 */
export class Copy extends Action {
  constructor(
    public card: Card,
    public destination: 'hand' | 'deck' | 'field' = 'hand',
    public player?: Player
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const targetPlayer = this.player || (source as any).controller;
    if (!targetPlayer) return [];

    // Create a copy of the card
    const cardDef = (this.card as any).data;
    if (!cardDef) return [];

    const copy = new (this.card.constructor as any)(cardDef);

    // Set controller
    (copy as any).controller = targetPlayer;

    // Add to destination
    switch (this.destination) {
      case 'hand':
        (copy as any).zone = Zone.HAND;
        (targetPlayer as any).hand.push(copy);
        break;
      case 'deck':
        (copy as any).zone = Zone.DECK;
        (targetPlayer as any).deck.push(copy);
        break;
      case 'field':
        // For field, we need to use Summon action instead
        const { Summon } = require('./summon');
        return [new Summon(targetPlayer, copy)];
    }

    console.log(`[Copy] Copied ${(this.card as any).id} to ${this.destination}`);
    return [copy];
  }
}

/**
 * Transform - Transform a minion into another (keeps damage but changes stats)
 */
export class Transform extends Action {
  constructor(
    public target: Minion,
    public newCardId: string
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const { CardLoader } = require('../cards/loader');
    const cardDef = CardLoader.get(this.newCardId);

    if (!cardDef) {
      console.warn(`[Transform] Card ${this.newCardId} not found`);
      return [];
    }

    const targetAny = this.target as any;
    const oldId = targetAny.id;
    const oldDamage = targetAny.damage;

    // Update card definition
    targetAny.data = cardDef;
    targetAny.id = cardDef.id;

    // Reset stats but keep damage
    targetAny._attack = cardDef.attack || 0;
    targetAny._maxHealth = cardDef.health || 0;
    targetAny.damage = oldDamage;

    // Clear buffs (transform removes buffs)
    targetAny.clearBuffs?.();

    console.log(`[Transform] ${oldId} transformed into ${this.newCardId}`);

    return [this.target];
  }
}

/**
 * SwapAttackHealth - Swap attack and health (like Crazed Alchemist)
 */
export class SwapAttackHealth extends Action {
  constructor(
    public target: Minion
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const targetAny = this.target as any;
    const currentAttack = targetAny.attack;
    const currentHealth = targetAny.health;

    // Swap base stats
    const oldAttack = targetAny._attack;
    const oldMaxHealth = targetAny._maxHealth;

    targetAny._attack = oldMaxHealth;
    targetAny._maxHealth = oldAttack;

    // Adjust damage to maintain same health percentage or keep absolute
    // In Hearthstone, damage stays the same, so health might become negative (dies)
    // Actually in HS, damage resets when swapping
    targetAny.damage = 0;

    console.log(`[Swap] ${targetAny.id} swapped attack/health: ${oldAttack}/${oldMaxHealth} -> ${currentHealth}/${currentAttack}`);

    return [this.target];
  }
}

/**
 * Freeze - Freeze a target (already exists but adding for completeness)
 */
export class Freeze extends Action {
  constructor(
    public target: Entity
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    (this.target as any).frozen = true;
    console.log(`[Freeze] ${(this.target as any).id} is frozen`);
    return [this.target];
  }
}

/**
 * Equip - Equip a weapon
 */
export class Equip extends Action {
  constructor(
    public player: Player,
    public weapon: Card
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const playerAny = this.player as any;

    // Destroy existing weapon if any
    if (playerAny.weapon) {
      const { Destroy } = require('./destroy');
      new Destroy().trigger(_source, playerAny.weapon);
    }

    // Equip new weapon
    playerAny.weapon = this.weapon;
    (this.weapon as any).zone = Zone.PLAY;

    console.log(`[Equip] ${(this.weapon as any).id} equipped`);

    return [this.weapon];
  }
}

/**
 * DestroyWeapon - Destroy the equipped weapon
 */
export class DestroyWeapon extends Action {
  constructor(
    public player: Player
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const playerAny = this.player as any;
    const weapon = playerAny.weapon;

    if (weapon) {
      playerAny.weapon = null;
      (weapon as any).zone = Zone.GRAVEYARD;
      (weapon as any).destroyed = true;
      console.log(`[DestroyWeapon] Weapon destroyed for ${this.player.name}`);
      return [weapon];
    }

    return [];
  }
}

/**
 * DrawUntil - Draw cards until a condition is met
 */
export class DrawUntil extends Action {
  constructor(
    public player: Player,
    public count: number,
    public condition: (card: Card) => boolean
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const drawn: Card[] = [];
    const deck = (this.player as any).deck;

    while (drawn.length < this.count && deck.length > 0) {
      const { Draw } = require('./draw');
      const drawAction = new Draw(this.player, 1);
      const result = drawAction.trigger(source);

      if (result && result.length > 0) {
        const card = result[0] as Card;
        drawn.push(card);

        // Check condition - if met, stop drawing
        if (this.condition(card)) {
          break;
        }
      } else {
        break; // No more cards to draw
      }
    }

    return drawn;
  }
}

/**
 * ForcePlay - Force a card to be played (for effects like Yogg-Saron)
 */
export class ForcePlay extends Action {
  constructor(
    public card: Card,
    public target?: Entity
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const cardAny = this.card as any;
    const controller = cardAny.controller;

    console.log(`[ForcePlay] Playing ${cardAny.id}`);

    // Remove from hand
    if (cardAny.zone === Zone.HAND) {
      const hand = controller?.hand;
      const idx = hand?.indexOf(this.card as unknown as Minion);
      if (idx !== -1) hand?.splice(idx, 1);
    }

    // Execute play action
    const { Play } = require('./play');
    return [new Play(this.card, this.target)];
  }
}
