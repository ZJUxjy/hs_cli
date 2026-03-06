import type { Entity } from '../core/entity';
import type { SelectorFn } from '../dsl/selector';

export class AuraBuff {
  public tags: Map<string, number> = new Map();
  public tick: number = 0;

  constructor(
    public source: Entity,
    public entity: Entity
  ) {}

  updateTags(tags: Record<string, number>): void {
    for (const [key, value] of Object.entries(tags)) {
      this.tags.set(key, value);
    }
    this.tick = (this.source as any).game?.tick || 0;
  }

  remove(): void {
    const entityAny = this.entity as any;
    const sourceAny = this.source as any;

    const slots = entityAny.slots || [];
    const idx = slots.indexOf(this);
    if (idx !== -1) slots.splice(idx, 1);

    const game = sourceAny.game;
    if (game) {
      const auraBuffs = game.activeAuraBuffs || [];
      const idx2 = auraBuffs.indexOf(this);
      if (idx2 !== -1) auraBuffs.splice(idx2, 1);
    }
  }

  _getattr(attr: string, value: number): number {
    const tagValue = this.tags.get(attr);
    if (tagValue !== undefined) {
      return value + tagValue;
    }
    return value;
  }
}

export class Refresh {
  constructor(
    public selector: SelectorFn,
    public tags: Record<string, number> | null = null,
    public buff: AuraBuff | null = null,
    public priority: number = 50
  ) {}

  trigger(source: Entity): void {
    const game = (source as any).game;
    if (!game) return;

    const entities = this.selector(source, game);

    for (const entity of entities) {
      if (this.buff) {
        // Refresh buff
        const entityAny = entity as any;
        if (!entityAny.slots) entityAny.slots = [];

        // Check if already has this buff
        let found = false;
        for (const slot of entityAny.slots) {
          if (slot.source === this.buff.source) {
            slot.tick = game.tick;
            found = true;
            break;
          }
        }

        if (!found) {
          const newBuff = new AuraBuff(this.buff.source, entity);
          if (this.buff.tags) {
            newBuff.updateTags(Object.fromEntries(this.buff.tags));
          }
          entityAny.slots.push(newBuff);
          if (!game.activeAuraBuffs) game.activeAuraBuffs = [];
          game.activeAuraBuffs.push(newBuff);
        }
      } else if (this.tags) {
        // Refresh tags directly
        const entityAny = entity as any;
        for (const [tag, value] of Object.entries(this.tags)) {
          entityAny[tag] = (entityAny[tag] || 0) + value;
        }
      }
    }
  }
}

// Interface for entities that can receive auras
export interface TargetableByAuras {
  slots: AuraBuff[];
  refresh_buff(source: Entity, buff: AuraBuff): void;
  refresh_tags(source: Entity, tags: Record<string, number>): void;
}
