import type { Action } from './base';

export enum EventListenerAt {
  ON = 1,
  AFTER = 2,
}

export class EventListener {
  public trigger: Action;
  public actions: Action[];
  public at: EventListenerAt;
  public once: boolean = false;

  constructor(trigger: Action, actions: Action[], at: EventListenerAt) {
    this.trigger = trigger;
    this.actions = actions;
    this.at = at;
  }
}
