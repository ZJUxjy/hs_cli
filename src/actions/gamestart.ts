import { Action } from './base';
import { Entity } from '../core/entity';

/**
 * GameStart Action - Triggered when the game starts
 */
export class GameStart extends Action {
  constructor() {
    super();
  }

  trigger(source: Entity): unknown[] {
    console.log('[Game] Game started');
    return [source];
  }
}
