// custom - patch_karazhan.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy } from '../../../actions';

// VAN_CS2_103 - Darkshire Councilman - After you summon a minion, gain +1 Health
cardScriptsRegistry.register('VAN_CS2_103', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const target = ctx.target || source;
    // Give +1 Health
    const buff = new Buff(source, target, { HEALTH: 1 });
    buff.trigger(source);
  },
});

// VAN_CS2_103e2 - Darkshire Councilman buff
cardScriptsRegistry.register('VAN_CS2_103e2', {
});
