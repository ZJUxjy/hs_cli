// custom - patch_icc.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// VAN_EX1_169 - Inner Fire - Change a minion's Attack and Health to become the same
cardScriptsRegistry.register('VAN_EX1_169', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;
    if (target) {
      // Set Health = Attack
      const attack = target.attack || 0;
      const health = target.maxHealth || target.health || 0;
      target.maxHealth = health;
      target.attack = attack;
      target.damage = 0;
    }
  },
});
