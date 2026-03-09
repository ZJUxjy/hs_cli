import type { Entity } from '../core/entity';

/**
 * ActionArg represents an argument placeholder for Actions.
 * When an event listener triggers and the callback Action has arguments
 * of the type Action.FOO, this class is used to retrieve the actual value
 * from the event arguments.
 */
export class ActionArg {
  public index: number = 0;
  public name: string = '';
  public owner: unknown = null;

  /**
   * Setup metadata for this ActionArg.
   * Called when the Action class is being constructed.
   */
  _setup(index: number, name: string, owner: unknown): void {
    this.index = index;
    this.name = name;
    this.owner = owner;
  }

  /**
   * Evaluate this argument for a given source entity.
   * Returns null by default - subclasses may override to extract
   * values from source.event_args.
   */
  evaluate(_source: Entity): unknown {
    return null;
  }
}
