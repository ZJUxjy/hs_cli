import type { Entity } from '../core/entity';
import { EventListener, EventListenerAt } from './eventlistener';
import { BlockType } from '../enums';

export { EventListener, EventListenerAt } from './eventlistener';

/**
 * Minimal Game interface to avoid circular dependency
 */
interface GameLike {
  actionStart(type: BlockType, source: Entity, index: number, target?: Entity): void;
  actionEnd(type: BlockType, source: Entity): void;
  entities: Iterable<unknown>;
  hands: Iterable<unknown>;
  decks: Iterable<unknown>;
}

/**
 * Base Action class that supports event broadcasting and matching.
 * Refactored to match Python fireplace's Action class.
 */
export class Action {
  /** Constructor arguments */
  protected _args: unknown[] = [];

  /** Keyword arguments */
  protected _kwargs: Record<string, unknown> = {};

  /** Callback actions to execute after this action */
  public callback: Action[] = [];

  /** Number of times to execute this action */
  public times: number = 1;

  /** Queued broadcasts to resolve */
  public eventQueue: [Entity, unknown[]][] = [];

  constructor(...args: unknown[]) {
    this._args = args;
  }

  /**
   * Create an ON event listener for this action.
   * @param actions - Callback actions to execute when this action triggers
   * @returns New EventListener with ON timing
   */
  on(...actions: Action[]): EventListener {
    return new EventListener(this, actions, EventListenerAt.ON);
  }

  /**
   * Create an AFTER event listener for this action.
   * @param actions - Callback actions to execute after this action completes
   * @returns New EventListener with AFTER timing
   */
  after(...actions: Action[]): EventListener {
    return new EventListener(this, actions, EventListenerAt.AFTER);
  }

  /**
   * Create a copy of this action with additional callbacks.
   * @param actions - Callback actions to add
   * @returns New Action instance with callbacks
   */
  then(...actions: Action[]): Action {
    const copy = this._copy();
    copy.callback = actions;
    return copy;
  }

  /**
   * Trigger this action.
   * Gets arguments via getArgs(), calls do() for each execution, and returns results.
   * Subclasses can override this method for custom behavior (backward compatibility).
   * @param source - The entity triggering this action
   * @returns Array of results from each execution
   */
  trigger(source: Entity): unknown[] {
    const args = this.getArgs(source);
    const results: unknown[] = [];

    for (let i = 0; i < this.times; i++) {
      const result = this.do(source, ...args);
      results.push(result);
    }

    return results;
  }

  /**
   * Get the arguments for this action.
   * Subclasses can override this to provide the arguments for do().
   * Default implementation returns the stored _args.
   * @param _source - The source entity
   * @returns Array of arguments
   */
  getArgs(_source: Entity): unknown[] {
    return this._args;
  }

  /**
   * Execute this action.
   * Subclasses can override this to perform the actual action.
   * Default implementation returns undefined.
   * @param _source - The source entity
   * @param _args - Arguments for the action
   * @returns Result of the action (can be void)
   */
  do(_source: Entity, ..._args: unknown[]): unknown {
    return undefined;
  }

  /**
   * Check if this action matches the given arguments.
   * Compares stored _args against provided args, handling Selectors and callables.
   * @param entity - The entity to check against
   * @param source - The source entity
   * @param args - Arguments to match against
   * @returns true if this action matches the arguments
   */
  matches(entity: Entity, source: Entity, args: unknown[]): boolean {
    if (this._args.length !== args.length) {
      return false;
    }

    for (let i = 0; i < this._args.length; i++) {
      const expected = this._args[i];
      const actual = args[i];

      // Handle Selector matching (objects with eval method)
      if (expected !== null && typeof expected === 'object' && 'eval' in expected) {
        const selector = expected as { eval: (source: Entity) => unknown[] };
        const selectorResults = selector.eval(source);
        if (!selectorResults.includes(actual)) {
          return false;
        }
        continue;
      }

      // Handle callable matching (functions)
      if (typeof expected === 'function') {
        const computed = expected(source);
        if (computed !== actual) {
          return false;
        }
        continue;
      }

      // Direct comparison
      if (expected !== actual) {
        return false;
      }
    }

    return true;
  }

  /**
   * Broadcast this action to all entities in the game.
   * Iterates through game.entities, game.hands, and game.decks,
   * calling broadcastSingle for each.
   * @param source - The source entity broadcasting the action
   * @param at - When to trigger (ON or AFTER)
   * @param args - Additional arguments to pass
   */
  broadcast(source: Entity, at: EventListenerAt, ...args: unknown[]): void {
    const game = (source as unknown as { game?: GameLike }).game;
    if (!game) {
      return;
    }

    game.actionStart(BlockType.TRIGGER, source, -1, undefined);

    // Iterate through all entities
    for (const obj of game.entities) {
      this.broadcastSingle(obj as unknown as Entity, at, source, ...args);
    }

    // Iterate through hands
    for (const obj of game.hands) {
      this.broadcastSingle(obj as unknown as Entity, at, source, ...args);
    }

    // Iterate through decks
    for (const obj of game.decks) {
      this.broadcastSingle(obj as unknown as Entity, at, source, ...args);
    }

    game.actionEnd(BlockType.TRIGGER, source);
  }

  /**
   * Broadcast this action to a single entity.
   * Checks if the entity has events that match this action and triggers them.
   * @param obj - The entity to broadcast to
   * @param at - When to trigger (ON or AFTER)
   * @param source - The source entity
   * @param args - Additional arguments
   */
  protected broadcastSingle(obj: Entity, at: EventListenerAt, source: Entity, ...args: unknown[]): void {
    const entityAny = obj as unknown as {
      events?: Array<{ actions: unknown[]; once?: boolean }>;
      triggerEvent?: (source: Entity, event: { actions: unknown[]; once?: boolean }, args: unknown[]) => unknown[];
    };

    if (!entityAny.events || !entityAny.triggerEvent) {
      return;
    }

    for (const event of entityAny.events) {
      if (!event.actions) {
        continue;
      }

      for (const action of event.actions) {
        // Check if action is an EventListener
        if (action instanceof EventListener) {
          if (action.at === at && action.trigger === this) {
            // Check if the action matches
            if (this.matches(obj, source, args)) {
              entityAny.triggerEvent(source, event, args);
            }
          }
        }
      }
    }
  }

  /**
   * Queue a broadcast for later resolution.
   * @param obj - The entity to queue the broadcast for
   * @param args - Arguments for the broadcast
   */
  queueBroadcast(obj: Entity, args: unknown[]): void {
    this.eventQueue.push([obj, args]);
  }

  /**
   * Resolve all queued broadcasts.
   * Processes each queued broadcast and clears the queue.
   */
  resolveBroadcasts(): void {
    for (const [obj, args] of this.eventQueue) {
      // Process each queued broadcast
      // The actual implementation would depend on how broadcasts are resolved
      // For now, we just process them
      this.broadcastSingle(obj, EventListenerAt.ON, obj, ...args);
    }
    this.eventQueue = [];
  }

  /**
   * Create a copy of this action.
   * Subclasses should override this to properly copy their specific properties.
   * @returns A new Action instance with copied properties
   */
  protected _copy(): Action {
    // Create a new instance of the same class
    const copy = Object.create(Object.getPrototypeOf(this));

    // Copy all properties
    copy._args = [...this._args];
    copy._kwargs = { ...this._kwargs };
    copy.callback = [...this.callback];
    copy.times = this.times;
    copy.eventQueue = [...this.eventQueue];

    return copy;
  }
}

/**
 * ActionArg class for representing action arguments that can be evaluated.
 */
export class ActionArg {
  public index: number = 0;
  public name: string = '';
  public owner: unknown = null;

  evaluate(_source: Entity): unknown {
    return null;
  }
}
