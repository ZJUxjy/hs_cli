import { Action } from './base';
import { Entity } from '../core/entity';
import type { PlayableCard } from '../core/card';
import type { Player } from '../core/player';

/**
 * Play Action - Play a card from hand
 */
export class Play extends Action {
  constructor(
    public player: Player,
    public card: PlayableCard,
    public target?: Entity,
    public index?: number
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    console.log(`[Play] ${this.player.name} plays ${this.card.id}`);

    // Remove from hand
    const handIdx = this.player.hand.indexOf(this.card);
    if (handIdx !== -1) {
      this.player.hand.splice(handIdx, 1);
    }

    // Pay mana cost
    const cost = this.card.cost || 0;
    this.player.usedMana += cost;

    // Track cards played
    this.player.cardsPlayedThisTurn++;
    this.player.combo = true;

    // Handle different card types
    const cardAny = this.card as any;
    if (cardAny.type === 'MINION') {
      // Summon minion
      if (this.player.field.length < 7) {
        this.player.field.push(this.card as any);
        cardAny.zone = 'PLAY';
        cardAny.turnsInPlay = 0;
        console.log(`[Play] Minion ${this.card.id} summoned to field`);
      }
    } else if (cardAny.type === 'SPELL') {
      // Spell effect would be applied here
      console.log(`[Play] Spell ${this.card.id} cast`);
      this.player.graveyard.push(this.card);
    }

    return [this.card];
  }
}
