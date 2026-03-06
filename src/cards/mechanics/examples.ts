// Example: Register card scripts for testing
import { cardScriptsRegistry } from './index';

// === Classic Mage Cards ===

// Polymorph - Transform a minion into a 1/1 Sheep
cardScriptsRegistry.register('CS2_022', {
  play: (ctx) => {
    if (ctx.target) {
      const { Morph } = require('../../actions/morph');
      const morph = new Morph('CS2_tk1');
      morph.trigger(ctx.source, ctx.target);
    }
  },
  requirements: { 1: 0, 48: 0 },
});

// Arcane Intellect - Draw 2 cards
cardScriptsRegistry.register('CS2_023', {
  play: () => {
    // This would normally be handled by the game loop
    console.log('Arcane Intellect: Drawing 2 cards');
  },
});

// Frostbolt - Deal 3 damage and Freeze
cardScriptsRegistry.register('CS2_024', {
  play: (ctx) => {
    if (ctx.target) {
      const { Damage } = require('../../actions/damage');
      const dmg = new Damage(3);
      dmg.trigger(ctx.source, ctx.target);
      (ctx.target as any).frozen = true;
    }
  },
  requirements: { 48: 0 },
});

// Fireball - Deal 6 damage
cardScriptsRegistry.register('CS2_042', {
  play: (ctx) => {
    if (ctx.target) {
      const { Damage } = require('../../actions/damage');
      const dmg = new Damage(6);
      dmg.trigger(ctx.source, ctx.target);
    }
  },
  requirements: { 48: 0 },
});

// === Classic Neutral Cards ===

// Bloodfen Raptor - No special ability (just a 3/2)
cardScriptsRegistry.register('CS2_172', {});

// Chillwind Yeti - No special ability (4/5)
cardScriptsRegistry.register('CS2_182', {});

// Boulderfist Ogre - No special ability (6/7)
cardScriptsRegistry.register('CS2_200', {});

console.log('[CardScripts] Registered', cardScriptsRegistry.getAllCardIds().length, 'scripts');
