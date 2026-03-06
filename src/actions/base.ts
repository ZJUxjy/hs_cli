import type { Entity } from '../core/entity';

export enum EventListenerAt {
  ON = 1,
  AFTER = 2,
}

export class EventListener {
  public trigger: string;
  public actions: unknown[];
  public at: EventListenerAt;
  public once: boolean = false;

  constructor(trigger: string, actions: unknown[], at: EventListenerAt) {
    this.trigger = trigger;
    this.actions = actions;
    this.at = at;
  }
}

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
