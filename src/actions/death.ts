import { Action, EventListenerAt } from './base';
import { Entity } from '../core/entity';
import { Zone, CardType, BlockType } from '../enums';
import type { Game } from '../core/game';
import type { Card } from '../core/card';

/**
 * Death Action - Process death of entities with ON/AFTER broadcast timing
 *
 * ON timing: Triggers deathrattles
 * AFTER timing: Handles reborn, on-death triggers
 */
export class Death extends Action {
  private _trigger: boolean = false;

  constructor(private entities: Entity[]) {
    super();
  }

  getArgs(_source: Entity): Entity[] {
    return this.entities;
  }

  protected broadcastSingle(obj: Entity, at: EventListenerAt, source: Entity, ...args: unknown[]): void {
    const target = args[0] as Entity;
    if (!target) return;

    const targetAny = target as any;
    const objAny = obj as any;

    // Only trigger once per entity per timing
    // Check playCounter to ensure proper ordering (entities that entered play later trigger first)
    const objPlayCounter = objAny?.playCounter ?? 0;
    const targetPlayCounter = targetAny?.playCounter ?? 0;

    if (!this._trigger && objPlayCounter > targetPlayCounter) {
      this._trigger = true;

      // At ON timing: trigger deathrattle
      if (at === EventListenerAt.ON) {
        const hasDeathrattle = targetAny.hasDeathrattle;
        if (hasDeathrattle && !targetAny.silenced) {
          const deathrattles = targetAny.deathrattles || [];
          for (const deathrattle of deathrattles) {
            // Queue deathrattle actions
            const game = targetAny.game as Game;
            if (game) {
              game.queueActions(target, [deathrattle]);
            }
          }
        }
      }

      // At AFTER timing: handle reborn
      if (at === EventListenerAt.AFTER) {
        const isMinion = targetAny.type === CardType.MINION;
        const reborn = targetAny.reborn;
        if (isMinion && reborn) {
          // Queue summon reborn copy
          const game = targetAny.game as Game;
          if (game) {
            // Import Summon dynamically to avoid circular dependency
            const { SetTag } = require('./extended');
            // Create a copy of the minion with 1 health and reborn cleared
            const cardDef = targetAny.data;
            if (cardDef) {
              const { createCard } = require('../core/card');
              const copy = createCard(cardDef);
              (copy as any).controller = targetAny.controller;
              (copy as any).damage = (copy as any).maxHealth - 1; // Set to 1 health remaining
              (copy as any).reborn = false;

              // Queue summon action
              game.queueActions(target, [new SetTag(copy, 'rebornSummoned', true)]);
              // Note: Actual summon would happen via a summon action queued here
              console.log(`[Death] ${targetAny.id} reborn triggered - would summon 1/1 copy`);
            }
          }
        }
      }
    }

    // Call parent broadcastSingle for event listener handling
    const entityAny = obj as unknown as {
      events?: Array<{ actions: unknown[]; once?: boolean }>;
      triggerEvent?: (source: Entity, event: { actions: unknown[]; once?: boolean }, args: unknown[]) => unknown[];
    };

    if (!entityAny || !entityAny.events || !entityAny.triggerEvent) {
      return;
    }

    for (const event of entityAny.events) {
      if (!event.actions) {
        continue;
      }

      for (const action of event.actions) {
        // Check if action is an EventListener
        const { EventListener } = require('./eventlistener');
        if (action instanceof EventListener) {
          const listener = action as InstanceType<typeof EventListener>;
          if (listener.at === at && listener.trigger === this) {
            // Check if the action matches
            if (this.matches(obj, source, args)) {
              entityAny.triggerEvent(source, event, args);
            }
          }
        }
      }
    }
  }

  do(source: Entity, ...args: unknown[]): void {
    const game = (source as any).game as Game;
    const entities = args as Entity[];

    if (!entities || !Array.isArray(entities)) {
      return;
    }

    // First pass: Move entities to graveyard and broadcast ON
    for (const entity of entities) {
      const entityAny = entity as any;
      // Mark entity as dead (in case it came from damage >= maxHealth check)
      entityAny.dead = true;

      // Store position before moving (for deathrattle positioning)
      if (entityAny.zone === Zone.PLAY) {
        entityAny._deadPosition = entityAny.zonePosition !== undefined ? entityAny.zonePosition - 1 : 0;
      }

      // Move to graveyard
      entityAny.zone = Zone.GRAVEYARD;

      // Remove from field if it's a minion
      const controller = entityAny.controller;
      if (controller && controller.field) {
        const idx = controller.field.indexOf(entity as unknown as Card);
        if (idx !== -1) {
          controller.field.splice(idx, 1);
          controller.graveyard.push(entity as unknown as Card);
          console.log(`[Death] ${entityAny.name || entityAny.id} died and moved to graveyard`);
        }
      }

      // Also check if it's a hero
      if (entityAny.type === CardType.HERO) {
        console.log(`[Death] Hero ${entityAny.name || entityAny.id} died!`);
        // Mark player as losing
        if (controller) {
          controller.playstate = 3; // PlayState.LOSING
          // Remove hero reference to prevent infinite death processing
          controller.hero = null as any;
        }
      }

      // Notify manager
      if ((source as any).manager?.gameAction) {
        (source as any).manager.gameAction(this, source, entity);
      }

      // Broadcast ON timing
      this._trigger = false;
      this.broadcast(source, EventListenerAt.ON, entity);
    }

    // Second pass: Broadcast AFTER timing
    for (const entity of entities) {
      this._trigger = false;
      this.broadcast(source, EventListenerAt.AFTER, entity);
    }
  }

  /**
   * Broadcast this action to all entities in the game.
   * Overrides base broadcast to handle death-specific timing.
   */
  broadcast(source: Entity, at: EventListenerAt, ...args: unknown[]): void {
    const game = (source as unknown as { game?: { entities: Iterable<unknown>; hands: Iterable<unknown>; decks: Iterable<unknown>; actionStart: (type: BlockType, source: Entity, index: number, target?: Entity) => void; actionEnd: (type: BlockType, source: Entity) => void; } }).game;
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
}

/**
 * Deaths Action - Trigger death processing in the game
 */
export class Deaths extends Action {
  getArgs(_source: Entity): [] {
    return [];
  }

  do(source: Entity): void {
    const game = (source as any).game as Game;
    game.processDeaths();
  }
}
