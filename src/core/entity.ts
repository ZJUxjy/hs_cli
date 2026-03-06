import { v4 as uuidv4 } from 'uuid';
import { CardType } from '../enums';
import { Manager } from './manager';

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
    events?: GameEvent[];
    update?: UpdateScript[];
    [key: string]: unknown;
  };
}

export interface GameEvent {
  actions: Action[];
  once?: boolean;
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
  protected _events: GameEvent[] = [];
  protected baseEvents: GameEvent[] = [];

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

  get events(): GameEvent[] {
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

  triggerEvent(source: Entity, event: GameEvent, args: unknown[]): unknown[] {
    const actions: Action[] = [];
    for (const action of event.actions) {
      if (typeof action === 'function') {
        const result = action(this, ...args);
        if (result) {
          if (typeof result[Symbol.iterator] === 'function') {
            actions.push(...result);
          } else {
            actions.push(result);
          }
        }
      } else {
        actions.push(action);
      }
    }
    const ret = (source as any).game?.trigger(this, actions, args);
    if (event.once) {
      const idx = this._events.indexOf(event);
      if (idx !== -1) this._events.splice(idx, 1);
    }
    return ret || [];
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
    return [];
  }

  get slots(): Slot[] {
    return [];
  }

  protected _getattr(_attr: string, value: number): number {
    return value;
  }
}
