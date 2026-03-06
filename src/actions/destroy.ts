import { Action } from './base';
import { Entity } from '../core/entity';

export class Destroy extends Action {
  constructor() {
    super();
  }

  trigger(_source: Entity, target: Entity): unknown[] {
    const targetAny = target as any;
    // Mark for destruction - actual removal handled by game loop
    targetAny.destroyed = true;
    return [target];
  }
}
