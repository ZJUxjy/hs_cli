import { Action } from './base';
import { Entity } from '../core/entity';
import { CardLoader } from '../cards/loader';
import { Minion, Spell, Weapon } from '../core/card';
import { CardType, Zone } from '../enums';

export class Give extends Action {
  constructor(private cardId: string) {
    super();
  }

  trigger(_source: Entity, target: Entity): unknown[] {
    const targetAny = target as any;

    // Get card definition
    const cardDef = CardLoader.get(this.cardId);
    if (!cardDef) {
      console.warn(`Give: card ${this.cardId} not found`);
      return [];
    }

    // Create card instance based on type
    let cardInstance: any;
    switch (cardDef.type) {
      case CardType.MINION:
        cardInstance = new Minion(cardDef);
        break;
      case CardType.SPELL:
        cardInstance = new Spell(cardDef);
        break;
      case CardType.WEAPON:
        cardInstance = new Weapon(cardDef);
        break;
      default:
        cardInstance = new Minion(cardDef);
    }

    // Set zone to HAND
    cardInstance.zone = Zone.HAND;
    (cardInstance as any).controller = targetAny;

    // Add to hand
    if (!targetAny.hand) {
      targetAny.hand = [];
    }
    targetAny.hand.push(cardInstance);

    return [cardInstance];
  }
}
