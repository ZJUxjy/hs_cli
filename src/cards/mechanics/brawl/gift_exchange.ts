// brawl - gift_exchange.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_GiftExchange_Snowball
cardScriptsRegistry.register('TB_GiftExchange_Snowball', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// TB_GiftExchange_Treasure
cardScriptsRegistry.register('TB_GiftExchange_Treasure', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// TB_GiftExchange_Treasure_Spell
cardScriptsRegistry.register('TB_GiftExchange_Treasure_Spell', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// TB_GiftExchange_Enchantment
cardScriptsRegistry.register('TB_GiftExchange_Enchantment', {
  events: { /* TODO */ },
});
