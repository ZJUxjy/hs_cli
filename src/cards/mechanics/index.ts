// Card scripts registry and executor
import type { Entity } from '../../core/entity';
import { CardScript, ActionContext, EventType } from './types';

// Entity with card ID
interface CardEntity extends Entity {
  id: string;
}

class CardScriptsRegistry {
  private scripts: Map<string, CardScript> = new Map();

  /**
   * Register a card script
   */
  register(cardId: string, script: CardScript): void {
    this.scripts.set(cardId, script);
  }

  /**
   * Get script for a card
   */
  get(cardId: string): CardScript | undefined {
    return this.scripts.get(cardId);
  }

  /**
   * Check if card has a script
   */
  has(cardId: string): boolean {
    return this.scripts.has(cardId);
  }

  /**
   * Get all registered card IDs
   */
  getAllCardIds(): string[] {
    return Array.from(this.scripts.keys());
  }

  /**
   * Clear all scripts
   */
  clear(): void {
    this.scripts.clear();
  }
}

export const cardScriptsRegistry = new CardScriptsRegistry();

// Execute a card's play (battlecry) effect
export function executePlay(card: CardEntity, target?: Entity): unknown[] {
  const script = cardScriptsRegistry.get(card.id);
  const playFn = script?.play;
  if (!playFn) return [];

  const context: ActionContext = {
    source: card,
    target,
    game: (card as any).game,
  };

  try {
    const result = playFn(context);
    return result !== undefined ? [result] : [];
  } catch (error) {
    console.error(`Error executing play for ${card.id}:`, error);
    return [];
  }
}

// Execute deathrattle
export function executeDeathrattle(card: CardEntity): unknown[] {
  const script = cardScriptsRegistry.get(card.id);
  const deathrattleFn = script?.deathrattle;
  if (!deathrattleFn) return [];

  const context: ActionContext = {
    source: card,
    game: (card as any).game,
  };

  try {
    const result = deathrattleFn(context);
    return result !== undefined ? [result] : [];
  } catch (error) {
    console.error(`Error executing deathrattle for ${card.id}:`, error);
    return [];
  }
}

// Register event listener
export function registerEvents(card: CardEntity): void {
  const script = cardScriptsRegistry.get(card.id);
  if (!script?.events) return;

  const game = (card as any).game;
  if (!game) return;

  const events = script.events;
  for (const [eventType, handler] of Object.entries(events) as [EventType, any][]) {
    // Register handler for this event type
    if (!game.eventListeners) {
      game.eventListeners = new Map();
    }
    if (!game.eventListeners.has(eventType)) {
      game.eventListeners.set(eventType, []);
    }
    game.eventListeners.get(eventType)!.push({
      card,
      handler: (event: any) => {
        const context: ActionContext = {
          source: card,
          target: event.target,
          game,
          event,
        };
        try {
          handler(context);
        } catch (error) {
          console.error(`Error in event ${eventType} for ${card.id}:`, error);
        }
      },
    });
  }
}

// Trigger an event for all registered listeners
export function triggerEvent(game: any, eventType: EventType, event: any): void {
  const listeners = game.eventListeners?.get(eventType);
  if (!listeners) return;

  for (const listener of listeners) {
    try {
      listener.handler(event);
    } catch (error) {
      console.error(`Error triggering event ${eventType}:`, error);
    }
  }
}

// Export types
export * from './types';
export * from './actions';
