import { Action } from './base';
import { Entity } from '../core/entity';
import { CardType, Race } from '../enums';
import type { PlayableCard } from '../core/card';
import type { Player } from '../core/player';
import { executePlay, cardScriptsRegistry } from '../cards/mechanics';
import { GameEvent } from '../events/eventtypes';
import { Game } from '../core/game';

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
    if (this.card.type === CardType.MINION) {
      // Summon minion
      if (this.player.field.length < 7) {
        this.player.field.push(this.card as any);
        (this.card as any).zone = 'PLAY';
        (this.card as any).turnsInPlay = 0;
        // Minions without Charge are sleeping (can't attack until next turn)
        const hasCharge = (this.card as any).charge || (this.card as any)._charge;
        (this.card as any).sleeping = !hasCharge;
        console.log(`[Play] Minion ${this.card.id} summoned to field, sleeping: ${!hasCharge}`);

        // Broadcast MINION_SUMMON event BEFORE battlecry
        // This allows auras to react to the new minion
        if (this.player.game?.eventManager) {
          this.player.game.eventManager.broadcast(GameEvent.MINION_SUMMON, {
            source: this.card,
            card: this.card,
            player: this.player,
          });
        }

        // Execute battlecry AFTER minion is on the field
        const battlecryTarget = this.target;
        console.log(`[Battlecry] Executing battlecry for ${this.card.id}, target: ${battlecryTarget ? (battlecryTarget as any).id : 'none'}`);
        executePlay(this.card as any, battlecryTarget);

        // Register event listeners from card scripts
        const script = cardScriptsRegistry.get(this.card.id);
        if (script?.events && this.player.game) {
          const game = this.player.game;
          for (const [eventName, handler] of Object.entries(script.events)) {
            const eventType = GameEvent[eventName as keyof typeof GameEvent];
            if (eventType && handler) {
              game.eventManager.on(this.card as any, {
                event: eventType,
                handler: (payload) => {
                  const context = {
                    source: this.card,
                    target: payload.target,
                    game: game,
                    event: {
                      type: eventName as any,
                      source: this.card,
                      target: payload.target,
                      player: payload.player,
                    },
                  };
                  handler(context);
                },
              });
            }
          }
        }
      }

      // Track elemental plays for synergy effects
      if ((this.card as any).race === Race.ELEMENTAL) {
        this.player.elementalPlayedThisTurn++;
        console.log(`[Elemental] ${this.player.name} played elemental this turn (${this.player.elementalPlayedThisTurn})`);
      }
    } else if (this.card.type === CardType.SPELL) {
      // Spell effect would be applied here
      console.log(`[Play] Spell ${this.card.id} cast`);
      this.player.graveyard.push(this.card);
    }

    return [this.card];
  }
}
