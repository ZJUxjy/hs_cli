import { Action } from './base';
import { Entity } from '../core/entity';
import { CardLoader } from '../cards/loader';
import { Minion, Spell, Weapon } from '../core/card';
import { CardType, Zone } from '../enums';

export class Shuffle extends Action {
  constructor(private cardId: string) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const sourceAny = source as any;
    const controller = sourceAny.controller;

    if (!controller) return [];

    // Get card definition
    const cardDef = CardLoader.get(this.cardId);
    if (!cardDef) {
      console.warn(`Shuffle: card ${this.cardId} not found`);
      return [];
    }

    // Create card instance
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

    // Set zone to DECK
    cardInstance.zone = Zone.DECK;
    (cardInstance as any).controller = controller;

    // Add to deck
    if (!controller.deck) {
      controller.deck = [];
    }

    // Insert at random position
    const position = Math.floor(Math.random() * (controller.deck.length + 1));
    controller.deck.splice(position, 0, cardInstance);

    return [cardInstance];
  }
}
