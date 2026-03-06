// gangs - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CFM_061 - Jade Lightning (Common)
// Deal 4 damage. Summon a 1/1 Jade Golem
cardScriptsRegistry.register('CFM_061', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage. Summon a 1/1 Jade Golem
  },
});

// CFM_324 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('CFM_324', {
  deathrattle: (ctx: ActionContext) => {
    // Battlecry: Trigger all friendly minions' Deathrattles
  },
});

// CFM_697 - Fire Plume Phoenix (Rare)
// Battlecry: Deal 3 damage
cardScriptsRegistry.register('CFM_697', {
  events: {
    // Deal 3 damage
  },
});

// CFM_310 - Corridor Creeper (Rare)
// Deathrattle: Summon a 5/6 Dragon with Taunt
cardScriptsRegistry.register('CFM_310', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Deathrattle: Summon a 5/6 Dragon with Taunt
  },
});

// CFM_313 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('CFM_313', {
  play: (ctx: ActionContext) => {
    // Your other Murlocs have +1 Attack
  },
});

// CFM_696 - Fire Plume Phoenix (Rare)
// Battlecry: Deal 3 damage
cardScriptsRegistry.register('CFM_696', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage
  },
});

// CFM_712 - Jade Lightning (Common)
// Deal 4 damage. Summon a 1/1 Jade Golem
cardScriptsRegistry.register('CFM_712', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage. Summon a 1/1 Jade Golem
  },
});
