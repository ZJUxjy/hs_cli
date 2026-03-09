import { Spell, CardDefinition } from './card';
import { Zone } from '../enums';
import { Player } from './player';

export interface SecretDefinition extends CardDefinition {
  secret?: boolean;
  quest?: boolean;
}

export class Secret extends Spell {
  public secret: boolean;

  constructor(def: SecretDefinition) {
    super(def);
    this.secret = def.secret ?? false;
  }

  playToSecretZone(): void {
    const controller = this.controller as Player;

    // Check secret limit
    if (controller.secrets.length >= 5) {
      console.log(`[Secret] Cannot play ${this.id} - secret limit reached`);
      return;
    }

    controller.secrets.push(this);
    this.zone = Zone.SECRET;

    console.log(`[Secret] ${controller.name} played ${this.id}`);
  }

  checkTrigger(eventName: string, eventArgs: Record<string, unknown>): boolean {
    // This would be implemented by card scripts
    // Returns true if the secret should trigger
    return false;
  }

  reveal(): void {
    const controller = this.controller as Player;
    const idx = controller.secrets.indexOf(this);
    if (idx !== -1) {
      controller.secrets.splice(idx, 1);
    }
    console.log(`[Secret] ${this.id} revealed!`);
  }

  destroy(): void {
    this.reveal();
    this.zone = Zone.GRAVEYARD;
  }
}
