// gangs - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give } from '../../../actions';

// CFM_025 - Unstable Felguard - Has +2 Attack. Deathrattle: Draw a card
cardScriptsRegistry.register('CFM_025', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const opponent = controller.opponent;
      const oppField = opponent.field || [];
      if (oppField.length > 0) {
        const target = oppField[Math.floor(Math.random() * oppField.length)];
        const damage = new Damage(source, target, 1);
        damage.trigger(source);
      }
    },
  },
});

// CFM_064 - Shudderwraith - Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('CFM_064', {
});

// Hand - Kazakus Potion container
cardScriptsRegistry.register('Hand', {
});

// CFM_095 - Gadgetzan Socialite - Deathrattle: Restore 2 Health to your hero
cardScriptsRegistry.register('CFM_095', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const heal = new Heal(source, controller.hero, 2);
    heal.trigger(source);
  },
});

// CFM_328 - Lone Champion - Battlecry: If you control no other minions, gain Taunt and Divine Shield
cardScriptsRegistry.register('CFM_328', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const otherMinions = field.filter((m: any) => m !== source);
    if (otherMinions.length === 0) {
      const buff = new Buff(source, source, { taunt: true, divineShield: true });
      buff.trigger(source);
    }
  },
});

// CFM_609 - Streetwise - Your spells cost (2) more
cardScriptsRegistry.register('CFM_609', {
});

// CFM_669 - Meanstreet Marshal - Deathrattle: If it's your opponent's turn, draw a card
cardScriptsRegistry.register('CFM_669', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const game = source.game;
    if (game.currentPlayer !== controller) {
      const draw = new Draw(controller);
      draw.trigger(source);
    }
  },
});

// CFM_790 - Bad Luck Albatross - Deathrattle: Shuffle two 1/1 Albatross into your opponent's deck
cardScriptsRegistry.register('CFM_790', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    // Shuffle two 1/1 Albatross into opponent's deck (handled by game)
  },
});

// CFM_810 - Arch-Villain Rafaam - Battlecry: Replace your hand and deck with Legendary minions
cardScriptsRegistry.register('CFM_810', {
  play: (ctx: ActionContext) => {
    // Replace hand and deck with Legendary minions (handled by game)
  },
});

// CFM_855 - Brrrrick - Battlecry: Gain Taunt if you control any other Frozen minions
cardScriptsRegistry.register('CFM_855', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const frozenMinions = field.filter((m: any) => m.frozen);
    if (frozenMinions.length > 0) {
      const buff = new Buff(source, source, { taunt: true });
      buff.trigger(source);
    }
  },
});
