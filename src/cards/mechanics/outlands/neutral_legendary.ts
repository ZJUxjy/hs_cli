// outlands - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// BT_126
cardScriptsRegistry.register('BT_126', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_126e
cardScriptsRegistry.register('BT_126e', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BT_255
cardScriptsRegistry.register('BT_255', {
});

// BT_255e
cardScriptsRegistry.register('BT_255e', {
});

// BT_735
cardScriptsRegistry.register('BT_735', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BT_735t
cardScriptsRegistry.register('BT_735t', {
  events: {
    // TODO: implement events
  },
});

// BT_737
cardScriptsRegistry.register('BT_737', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BT_850
cardScriptsRegistry.register('BT_850', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
