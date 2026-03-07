// Event manager for game event system
// Based on fireplace's event handling

import { GameEvent, EventPayload, EventHandler, EventListenerConfig } from './eventtypes';
import type { Entity } from '../core/entity';
import type { Game } from '../core/game';

/**
 * Registered event listener
 */
interface RegisteredListener extends EventListenerConfig {
  id: number;
  entity: Entity;
}

/**
 * EventManager - manages event listeners and broadcasting
 */
export class EventManager {
  private listeners: Map<GameEvent, RegisteredListener[]> = new Map();
  private listenerId = 0;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Register an event listener
   */
  on(entity: Entity, config: EventListenerConfig): number {
    const id = ++this.listenerId;
    const listener: RegisteredListener = {
      ...config,
      id,
      entity,
      priority: config.priority ?? 50,
    };

    const eventListeners = this.listeners.get(config.event) || [];
    eventListeners.push(listener);
    // Sort by priority (higher priority first)
    eventListeners.sort((a, b) => (b.priority || 50) - (a.priority || 50));
    this.listeners.set(config.event, eventListeners);

    return id;
  }

  /**
   * Register a one-time event listener
   */
  once(entity: Entity, config: EventListenerConfig): number {
    return this.on(entity, { ...config, once: true });
  }

  /**
   * Remove an event listener by ID
   */
  off(listenerId: number): boolean {
    for (const [event, listeners] of this.listeners) {
      const idx = listeners.findIndex(l => l.id === listenerId);
      if (idx !== -1) {
        listeners.splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Remove all listeners for an entity
   */
  offAll(entity: Entity): void {
    for (const [event, listeners] of this.listeners) {
      const filtered = listeners.filter(l => l.entity !== entity);
      this.listeners.set(event, filtered);
    }
  }

  /**
   * Broadcast an event to all listeners
   */
  broadcast(event: GameEvent, payload: Partial<EventPayload> = {}): any[] {
    const fullPayload: EventPayload = {
      event,
      ...payload,
    };

    const results: any[] = [];
    const listeners = this.listeners.get(event) || [];
    const toRemove: number[] = [];

    for (const listener of listeners) {
      // Check condition if provided
      if (listener.condition && !listener.condition(fullPayload)) {
        continue;
      }

      try {
        const result = listener.handler(fullPayload);
        if (result) {
          results.push(...(Array.isArray(result) ? result : [result]));
        }
      } catch (error) {
        console.error(`[EventManager] Error in listener for ${event}:`, error);
      }

      // Mark for removal if once
      if (listener.once) {
        toRemove.push(listener.id);
      }
    }

    // Remove one-time listeners
    for (const id of toRemove) {
      this.off(id);
    }

    return results;
  }

  /**
   * Trigger an event (alias for broadcast)
   */
  trigger(event: GameEvent, payload: Partial<EventPayload> = {}): any[] {
    return this.broadcast(event, payload);
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners(event: GameEvent): boolean {
    const listeners = this.listeners.get(event);
    return !!listeners && listeners.length > 0;
  }

  /**
   * Get count of listeners for an event
   */
  listenerCount(event: GameEvent): number {
    const listeners = this.listeners.get(event);
    return listeners?.length || 0;
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
    this.listenerId = 0;
  }

  /**
   * Register standard game events helper
   */
  registerEntityEvents(entity: Entity, events: Partial<Record<GameEvent, EventHandler>>): void {
    for (const [event, handler] of Object.entries(events)) {
      if (typeof handler === 'function') {
        this.on(entity, {
          event: event as GameEvent,
          handler,
        });
      }
    }
  }
}

/**
 * Mixin for entities that support events
 */
export interface Eventful {
  eventManager?: EventManager;
  on(event: GameEvent, handler: EventHandler, condition?: (payload: EventPayload) => boolean): number;
  once(event: GameEvent, handler: EventHandler, condition?: (payload: EventPayload) => boolean): number;
  off(listenerId: number): boolean;
}

/**
 * Helper function to add event support to an entity
 */
export function addEventSupport(entity: any, game: Game): void {
  if (!entity._eventManager) {
    entity._eventManager = new EventManager(game);
  }

  entity.on = (event: GameEvent, handler: EventHandler, condition?: (payload: EventPayload) => boolean): number => {
    return entity._eventManager.on(entity, { event, handler, condition });
  };

  entity.once = (event: GameEvent, handler: EventHandler, condition?: (payload: EventPayload) => boolean): number => {
    return entity._eventManager.once(entity, { event, handler, condition });
  };

  entity.off = (listenerId: number): boolean => {
    return entity._eventManager.off(listenerId);
  };

  entity.triggerEvent = (event: GameEvent, payload: Partial<EventPayload> = {}): any[] => {
    return game.trigger(event, { source: entity, ...payload });
  };
}
