import type { Entity } from '../core/entity';

export class Action {
  trigger(_source: Entity, _target?: Entity): unknown[] {
    return [];
  }
}

export class ActionArg {
  public index: number = 0;
  public name: string = '';
  public owner: unknown = null;

  evaluate(_source: Entity): unknown {
    return null;
  }
}

export { EventListener, EventListenerAt } from './eventlistener';
