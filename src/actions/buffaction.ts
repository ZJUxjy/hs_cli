import { Action } from './base';
import { Entity } from '../core/entity';
import { Buff, BuffData } from '../core/buff';

/**
 * Buff Action - Apply a buff to a target
 */
export class BuffAction extends Action {
  constructor(
    public source: Entity,
    public target: Entity,
    public buffId: string,
    public data: BuffData = {}
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const targetAny = this.target as any;

    // Check if target supports buffing
    if (typeof targetAny.buff === 'function') {
      const buff = targetAny.buff(this.source, this.buffId, this.data);
      return [buff];
    }

    console.warn(`[BuffAction] Target does not support buffing: ${targetAny.id || targetAny.constructor.name}`);
    return [];
  }
}

/**
 * Unbuff Action - Remove a buff from a target
 */
export class UnbuffAction extends Action {
  constructor(
    public target: Entity,
    public buffId: string
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const targetAny = this.target as any;

    if (typeof targetAny.getBuff === 'function') {
      const buff = targetAny.getBuff(this.buffId);
      if (buff) {
        buff.remove();
        return [buff];
      }
    }

    return [];
  }
}

/**
 * SetAttribute Action - Set an attribute on an entity
 */
export class SetAttribute extends Action {
  constructor(
    public target: Entity,
    public attr: string,
    public value: unknown
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    (this.target as any)[this.attr] = this.value;
    return [this.target];
  }
}

/**
 * ClearBuffs Action - Remove all buffs from a target
 */
export class ClearBuffs extends Action {
  constructor(public target: Entity) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const targetAny = this.target as any;

    if (typeof targetAny.clearBuffs === 'function') {
      targetAny.clearBuffs();
      return [this.target];
    }

    return [];
  }
}
