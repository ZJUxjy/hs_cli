// tgt - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// AT_019 - Dreadsteed - Deathrattle: Return to your hand
cardScriptsRegistry.register('AT_019', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const cardId = source.id;
    const giveAction = new Give(cardId);
    giveAction.trigger(source, controller);
  },
});

// AT_019e - Dreadsteed buff
cardScriptsRegistry.register('AT_019e', {
  events: {
    // Gains +1/+1 - handled by game
  },
});

// AT_021 - Renounce Darkness - Replace your Hero Power and weapons with random new ones
cardScriptsRegistry.register('AT_021', {
  events: {
    // Replace hero power and weapons - handled by game
  },
});

// AT_023 - Fist of Jaraxxus - Deal 4 damage to a minion. If it dies, summon a 6/6 Infernal
cardScriptsRegistry.register('AT_023', {
});

// AT_026 - Imp-losion - Deal 2 damage to a minion. Summon a 1/1 Imp
cardScriptsRegistry.register('AT_026', {
  events: {
    // Deal 2 damage and summon Imp - handled by game
  },
});

// AT_027 - Demonfuse - Give a Demon +3/+3. Give your opponent a card
cardScriptsRegistry.register('AT_027', {
  events: {
    // Give Demon +3/+3 and give card to opponent - handled by game
  },
});

// AT_027e - Demonfuse buff
cardScriptsRegistry.register('AT_027e', {
  events: {
    // +3/+3 - handled by game
  },
});

// AT_022 - Dark Bargain - Destroy 2 random enemy minions. Discard 2 cards
cardScriptsRegistry.register('AT_022', {
  play: (ctx: ActionContext) => {
    // Destroy 2 random enemy minions - handled by game
  },
});

// AT_024 - Void Crusher - Battlecry: Destroy a random enemy minion. Deathrattle: Your minions get +1/+1
cardScriptsRegistry.register('AT_024', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Destroy random enemy minion - handled by game
  },
});

// AT_025 - Lord Jaraxxus - Battlecry: Equip a 3/8 Blood Fury
cardScriptsRegistry.register('AT_025', {
  play: (ctx: ActionContext) => {
    // Equip 3/8 Blood Fury - handled by game
  },
});
