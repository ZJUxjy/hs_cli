import { Action } from './base';
import { Entity } from '../core/entity';

export class Freeze extends Action {
  constructor() {
    super();
  }

  trigger(_source: Entity, target: Entity): unknown[] {
    const targetAny = target as any;
    targetAny.frozen = true;
    return [target];
  }
}
