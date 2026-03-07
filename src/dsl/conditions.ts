// Conditional and loop constructs for card scripts
// Based on fireplace's conditional system

import { Action } from '../actions/base';
import type { Entity } from '../core/entity';
import type { Game } from '../core/game';
import type { Player } from '../core/player';
import { Card } from '../core/card';
import type { Selector, SelectorContext } from './selector';

/**
 * Condition function type
 */
export type ConditionFn = (source: Entity, game: Game) => boolean;

/**
 * IF - Conditional action
 */
export class IfAction extends Action {
  constructor(
    private condition: ConditionFn | Selector,
    private thenActions: Action | Action[],
    private elseActions?: Action | Action[]
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const game = (source as any).game as Game;
    let conditionMet: boolean;

    if (typeof this.condition === 'function') {
      conditionMet = this.condition(source, game);
    } else {
      // It's a selector - check if it returns any entities
      const context: SelectorContext = { game, source };
      conditionMet = this.condition.eval(context).length > 0;
    }

    const results: unknown[] = [];

    if (conditionMet) {
      const actions = Array.isArray(this.thenActions) ? this.thenActions : [this.thenActions];
      for (const action of actions) {
        results.push(...action.trigger(source));
      }
    } else if (this.elseActions) {
      const actions = Array.isArray(this.elseActions) ? this.elseActions : [this.elseActions];
      for (const action of actions) {
        results.push(...action.trigger(source));
      }
    }

    return results;
  }
}

/**
 * FOR - Loop action over selector results
 */
export class ForAction extends Action {
  constructor(
    private selector: Selector,
    private actionFactory: (target: Entity) => Action | Action[]
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const game = (source as any).game as Game;
    const context: SelectorContext = { game, source };
    const targets = this.selector.eval(context);

    const results: unknown[] = [];

    for (const target of targets) {
      const actions = this.actionFactory(target);
      const actionArray = Array.isArray(actions) ? actions : [actions];
      for (const action of actionArray) {
        results.push(...action.trigger(source, target));
      }
    }

    return results;
  }
}

/**
 * Helper function to create IF action
 */
export function IF(
  condition: ConditionFn | Selector,
  thenActions: Action | Action[],
  elseActions?: Action | Action[]
): IfAction {
  return new IfAction(condition, thenActions, elseActions);
}

/**
 * Helper function to create FOR action
 */
export function FOR(
  selector: Selector,
  actionFactory: (target: Entity) => Action | Action[]
): ForAction {
  return new ForAction(selector, actionFactory);
}

// ============== Common Conditions ==============

/**
 * Check if it's the player's turn
 */
export function isPlayersTurn(player: Player): ConditionFn {
  return (_source: Entity, game: Game) => {
    return game.currentPlayer === player;
  };
}

/**
 * Check if player has enough mana
 */
export function hasMana(amount: number): ConditionFn {
  return (source: Entity, _game: Game) => {
    const controller = (source as any).controller as Player;
    return (controller as any).mana >= amount;
  };
}

/**
 * Check if target has tag/property
 */
export function hasTag(tag: string, value?: unknown): ConditionFn {
  return (source: Entity, _game: Game) => {
    const sourceAny = source as any;
    if (value !== undefined) {
      return sourceAny[tag] === value;
    }
    return !!sourceAny[tag];
  };
}

/**
 * Check if player has card in hand
 */
export function hasCardInHand(cardId: string): ConditionFn {
  return (source: Entity, _game: Game) => {
    const controller = (source as any).controller as Player;
    return (controller as any).hand?.some((c: Card) => c.id === cardId);
  };
}

/**
 * Check if minion is damaged
 */
export function isDamaged(): ConditionFn {
  return (source: Entity, _game: Game) => {
    const sourceAny = source as any;
    return sourceAny.damage > 0;
  };
}

/**
 * Check if it's early game (turn <= X)
 */
export function isEarlyGame(maxTurn: number = 4): ConditionFn {
  return (_source: Entity, game: Game) => {
    return game.turn <= maxTurn;
  };
}

/**
 * Check if it's late game (turn >= X)
 */
export function isLateGame(minTurn: number = 8): ConditionFn {
  return (_source: Entity, game: Game) => {
    return game.turn >= minTurn;
  };
}

/**
 * Check if player controls a minion with specific tag
 */
export function controlsMinionWithTag(tag: string): ConditionFn {
  return (source: Entity, _game: Game) => {
    const controller = (source as any).controller as Player;
    return (controller as any).field?.some((m: any) => !!m[tag]);
  };
}

/**
 * Check if opponent controls more minions
 */
export function opponentControlsMoreMinions(): ConditionFn {
  return (source: Entity, game: Game) => {
    const controller = (source as any).controller as Player;
    if (!controller.opponent) return false;
    return controller.opponent.field.length > controller.field.length;
  };
}

/**
 * Always true condition
 */
export const ALWAYS: ConditionFn = () => true;

/**
 * Always false condition
 */
export const NEVER: ConditionFn = () => false;
