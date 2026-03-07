// brawl - gift_exchange.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_GiftExchange_Snowball - Deal 1 damage to a character
cardScriptsRegistry.register('TB_GiftExchange_Snowball', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(1);
      damage.trigger(ctx.source, ctx.target);
    }
  },
});

// TB_GiftExchange_Treasure - Deathrattle: Give a random friend a card
cardScriptsRegistry.register('TB_GiftExchange_Treasure', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    if (field.length > 0) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const { Give } = require('../../../actions/give');
      // Give a random card - using GUILD_072 which is a random card
      const give = new Give('GAME_003');
      give.trigger(ctx.source, target);
    }
  },
});

// TB_GiftExchange_Treasure_Spell - Add a random card to your hand
cardScriptsRegistry.register('TB_GiftExchange_Treasure_Spell', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Give } = require('../../../actions/give');
    // Add a random card to hand - using a placeholder
    const give = new Give('GAME_003');
    give.trigger(ctx.source, controller.hero);
  },
});

// TB_GiftExchange_Enchantment - Events (for tracking the buff)
cardScriptsRegistry.register('TB_GiftExchange_Enchantment', {
});
