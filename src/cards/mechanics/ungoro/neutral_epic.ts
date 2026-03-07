// ungoro - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage, Draw, Give } from '../../../actions';

// UNG_085 - Elise the Trailblazer - Battlecry: Discover a card. Replace your deck with copies of it.
cardScriptsRegistry.register('UNG_085', {
  play: (ctx: ActionContext) => {
    // Discover and replace deck - handled by game
  },
});

// UNG_087 - Blazecaller - Battlecry: If you played an Elemental last turn, deal 5 damage.
cardScriptsRegistry.register('UNG_087', {
  events: {
    // Check if elemental was played - handled by game
  },
});

// UNG_088 - Tortollan Primalist - Battlecry: Discover a spell and cast it with random targets.
cardScriptsRegistry.register('UNG_088', {
  play: (ctx: ActionContext) => {
    // Discover spell - handled by game
  },
});

// UNG_089 - Gentle Megasaur - Battlecry: Adapt your Murlocs.
cardScriptsRegistry.register('UNG_089', {
  play: (ctx: ActionContext) => {
    // Adapt murlocs - handled by game
  },
});

// UNG_099 - Charged Devilsaur - Battlecry: If this attacks a minion, it also attacks the enemy hero.
cardScriptsRegistry.register('UNG_099', {
  play: (ctx: ActionContext) => {
    // Charge effect - handled by game
  },
});

// UNG_099e
cardScriptsRegistry.register('UNG_099e', {
});

// UNG_113 - Bright-Eyed Scout - Battlecry: Draw a card. Change its Cost to (5).
cardScriptsRegistry.register('UNG_113', {
  play: (ctx: ActionContext) => {
    // Draw card and set cost to 5 - handled by game
  },
});

// UNG_113e
cardScriptsRegistry.register('UNG_113e', {
  events: {
    // Cost modification - handled by game
  },
});

// UNG_847 - Jungletender - Battlecry: If you control a Beast, gain +1/+1.
cardScriptsRegistry.register('UNG_847', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Check for beast - handled by game
  },
});

// UNG_848 - Shudderwraith - Battlecry: Deal 3 damage.
cardScriptsRegistry.register('UNG_848', {
  play: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 3);
    damage.trigger(ctx.source);
  },
});

// UNG_946 - Corridor Creeper - Battlecry: If your opponent summons a minion, lose 1 Attack.
cardScriptsRegistry.register('UNG_946', {
  play: (ctx: ActionContext) => {
    // Lose attack when opponent summons - handled by game
  },
});
