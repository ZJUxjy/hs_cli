import type { CardScript, ActionContext } from './types';
import { EventListener, EventListenerAt } from '../../actions/eventlistener';
import type { Action } from '../../actions/base';
import type { Entity } from '../../core/entity';

/**
 * Adapter to convert legacy card scripts to new EventListener-based system
 */
export function adaptLegacyScript(cardId: string, script: CardScript): CardScript {
  const adapted: CardScript = { ...script };

  // Convert legacy events map to EventListeners
  if (script.events) {
    // Keep events for backward compatibility
    // In the future, these could be converted to EventListeners
    adapted.events = script.events;
  }

  return adapted;
}

/**
 * Create EventListener from legacy event handler
 */
export function createEventListenerFromLegacy(
  eventType: string,
  handler: (ctx: ActionContext) => void,
  triggerAction: Action
): EventListener {
  // Create a wrapper action that calls the legacy handler
  const wrapperAction: Action = {
    trigger: (source: Entity, target?: Entity) => {
      const ctx: ActionContext = {
        source,
        target,
        game: (source as any).game,
        event: { type: eventType as any },
      };
      handler(ctx);
      return [];
    },
    getArgs: () => [],
    do: () => {},
  } as any;

  return new EventListener(triggerAction, [wrapperAction], EventListenerAt.ON);
}
