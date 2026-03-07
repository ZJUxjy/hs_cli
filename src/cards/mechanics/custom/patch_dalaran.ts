// custom - patch_dalaran.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// VAN_EX1_145 - Abomination - Taunt. Deathrattle: Deal 2 damage to ALL characters
cardScriptsRegistry.register('VAN_EX1_145', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;

    // Deal 2 damage to all friendly minions
    const friendlyField = controller.field || [];
    for (const minion of friendlyField) {
      const damage = new Damage(source, minion, 2);
      damage.trigger(source);
    }

    // Deal 2 damage to all enemy minions
    const enemyField = opponent.field || [];
    for (const minion of enemyField) {
      const damage = new Damage(source, minion, 2);
      damage.trigger(source);
    }

    // Deal 2 damage to both heroes
    const damageToEnemyHero = new Damage(source, opponent.hero, 2);
    damageToEnemyHero.trigger(source);

    const damageToFriendlyHero = new Damage(source, controller.hero, 2);
    damageToFriendlyHero.trigger(source);
  },
});

// VAN_EX1_145o - Abomination buff
cardScriptsRegistry.register('VAN_EX1_145o', {
});
