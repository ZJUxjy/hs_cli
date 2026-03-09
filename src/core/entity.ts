import { v4 as uuidv4 } from 'uuid';
import { CardType } from '../enums';
import { Manager } from './manager';
import { EventListenerAt } from '../actions/eventlistener';

export type EntityId = number;

export interface IBaseEntity {
  readonly entityId: EntityId;
  readonly uuid: string;
  type: CardType;
}

export interface IBuffableEntity extends IBaseEntity {
  buffs: Buff[];
  slots: Slot[];
}

export interface Buff {
  remove(): void;
  _getattr(attr: string, value: number): number;
}

export interface Slot {
  _getattr(attr: string, value: number): number;
}

export interface CardData {
  scripts?: {
    events?: EntityGameEvent[];
    update?: UpdateScript[];
    [key: string]: unknown;
  };
}

export interface EntityGameEvent {
  actions: Action[];
  once?: boolean;
  trigger?: Action;      // For Action-based events
  at?: EventListenerAt;  // ON or AFTER timing
}

export interface UpdateScript {
  trigger: (entity: Entity) => void;
  priority?: number;
}

export interface Action {
  // Action interface placeholder
}

export interface Character extends IBuffableEntity {
  damage: number;
  immune: boolean;
  frozen: boolean;
}

export class Entity {
  public readonly uuid: string;
  public type: CardType = CardType.INVALID;
  public playCounter: number = 0;
  public eventArgs: unknown = null;
  public ignoreScripts: boolean = false;

  public manager: Manager;
  protected _events: EntityGameEvent[] = [];
  protected baseEvents: EntityGameEvent[] = [];

  // Private storage for buffs and slots
  protected _buffs: Buff[] = [];
  protected _slots: Slot[] = [];

  constructor(protected data: CardData | null = null) {
    this.uuid = uuidv4();
    this.manager = new Manager(this);
    if (this.data) {
      this._events = [...(this.data.scripts?.events || [])];
    }
  }

  get entityId(): EntityId {
    return this.manager.get('ENTITY_ID') as number || 0;
  }

  get isCard(): boolean {
    return this.type > CardType.PLAYER;
  }

  get events(): EntityGameEvent[] {
    return [...this.baseEvents, ...this._events];
  }

  get updateScripts(): UpdateScript[] {
    if (this.data && !this.ignoreScripts) {
      return this.data.scripts?.update || [];
    }
    return [];
  }

  getActions(name: string): Action[] {
    const actions = (this.data?.scripts as any)?.[name];
    if (typeof actions === 'function') {
      return actions(this);
    }
    return actions || [];
  }

  triggerEvent(source: Entity, event: EntityGameEvent, args: unknown[]): unknown[] {
    const actions: unknown[] = [];

    // Build action list
    for (const action of event.actions) {
      if (typeof action === 'function') {
        const result = action(this, ...args);
        if (result) {
          if (Array.isArray(result)) {
            actions.push(...result);
          } else {
            actions.push(result);
          }
        }
      } else {
        actions.push(action);
      }
    }

    // Execute via game.trigger
    const game = (source as any).game || (this as any).game;
    const ret = game?.actionTrigger?.(this, actions as Action[], args) || [];

    // Remove once events
    if (event.once) {
      const idx = this._events.indexOf(event);
      if (idx !== -1) {
        this._events.splice(idx, 1);
      }
    }

    return ret;
  }

  getDamage(amount: number, target: Character): number {
    if ((target as any).dormant) return 0;
    if ((target as any).immune) return 0;
    return amount;
  }

  getHeal(amount: number, _target: Character): number {
    return amount;
  }

  clearBuffs(): void {
    if (this.buffs?.length) {
      this.log('Clearing buffs');
      for (const buff of this.buffs.slice()) {
        buff.remove();
      }
    }
  }

  log(message: string, ...args: unknown[]): void {
    console.log(`[${this.constructor.name}] ${message}`, ...args);
  }

  get buffs(): Buff[] {
    return this._buffs || [];
  }

  get slots(): Slot[] {
    return this._slots || [];
  }

  protected _getattr(attr: string, value: number): number {
    let result = value;
    result += (this as any)['_' + attr] || 0;

    for (const buff of this.buffs) {
      result = buff._getattr(attr, result);
    }

    for (const slot of this.slots) {
      result = slot._getattr(attr, result);
    }

    // Apply data.scripts if available
    if (this.data?.scripts && !this.ignoreScripts) {
      const scriptFn = (this.data.scripts as any)[attr];
      if (typeof scriptFn === 'function') {
        result = scriptFn(this, result);
      }
    }

    return result;
  }
}
