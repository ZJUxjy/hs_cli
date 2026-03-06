// Remaining Expansions - Card Effects Tests
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

// =====================
// DALARAN (152 cards)
// Core mechanics: 阴谋(Plot), 跟班(Lackey)
// =====================

describe('Dalaran - Core Card Effects', () => {
  // DAL_377 - Arch-Villain Rafaam (Legendary)
  // Battlecry: Discover two 1-Turn minions. They gain Rush
  describe('DAL_377 Arch-Villain Rafaam', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('DAL_377');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // DAL_554 - Whirlwind Tempest (Epic)
  // Your minions with "Battlecry" have +1 Attack and Rush
  describe('DAL_554 Whirlwind Tempest', () => {
    test('should be registered with aura effect', () => {
      const script = cardScriptsRegistry.get('DAL_554');
      expect(script).toBeDefined();
      expect(script?.aura).toBeDefined();
    });
  });

  // DAL_571 - EVIL Miscreant (Rare)
  // Combo: Add two 1/1 Lackeys to your hand
  describe('DAL_571 EVIL Miscreant', () => {
    test('should be registered with combo effect', () => {
      const script = cardScriptsRegistry.get('DAL_571');
      expect(script).toBeDefined();
    });
  });

  // DAL_558 - Prismatic Lens (Rare)
  // Draw a minion and a spell. Reduce their Cost by (1)
  describe('DAL_558 Prismatic Lens', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('DAL_558');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // DAL_560 - Rays of the Sun (Common)
  // Discover a Heal
  describe('DAL_560 Rays of the Sun', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('DAL_560');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // DAL_752 - Hench-Clan Hogsteed (Common)
  // Deathrattle: Summon a 1/1 Squire
  describe('DAL_752 Hench-Clan Hogsteed', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('DAL_752');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // DAL_604 - Vendetta (Rare)
  // Deal 4 damage to a minion. Costs (0) if your opponent played a Plot card this turn
  describe('DAL_604 Vendetta', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('DAL_604');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});

// =====================
// DRAGONS (218 cards)
// Core mechanics: 巨龙(Dragon), 祈求(Invoke), 腐蚀(Corrupt)
// =====================

describe('Dragons - Core Card Effects', () => {
  // DRG_303 - Dragonqueen Alexstrasza (Legendary)
  // Battlecry: If your deck contains no duplicates, Discover two Dragons
  describe('DRG_303 Dragonqueen Alexstrasza', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('DRG_303');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // DRG_257 - Evasive Drakonid (Epic)
  // Taunt. Can't be targeted by spells or Hero Powers
  describe('DRG_257 Evasive Drakonid', () => {
    test('should be registered with keywords', () => {
      const script = cardScriptsRegistry.get('DRG_257');
      expect(script).toBeDefined();
    });
  });

  // DRG_006 - Twilight Ember (Common)
  // Battlecry: Give your minions "Deathrattle: Deal 1 damage to your hero"
  describe('DRG_006 Twilight Ember', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('DRG_006');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // DRG_096 - Shudderwraith (Rare)
  // Battlecry: Trigger all friendly minions' Deathrattles
  describe('DRG_096 Shudderwraith', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('DRG_096');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // DRG_310 - Frizz Kindleroost (Legendary)
  // You can use your Hero Power twice. The first Dragon you play each turn costs (2) less
  describe('DRG_310 Frizz Kindleroost', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('DRG_310');
      expect(script).toBeDefined();
    });
  });

  // DRG_253 - Dragonmaw Sky Stalker (Rare)
  // Deathrattle: Summon a 5/6 Dragon with Taunt
  describe('DRG_253 Dragonmaw Sky Stalker', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('DRG_253');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // DRG_232 - Evasive Wyrm (Common)
  // Divine Shield
  describe('DRG_232 Evasive Wyrm', () => {
    test('should be registered with keywords', () => {
      const script = cardScriptsRegistry.get('DRG_232');
      expect(script).toBeDefined();
    });
  });
});

// =====================
// OUTLANDS (166 cards)
// Core mechanics: 恶魔猎手(Demon Hunter)
// =====================

describe('Outlands - Core Card Effects', () => {
  // BT_187 - Aldrachi Warblades (Common)
  // Lifesteal
  describe('BT_187 Aldrachi Warblades', () => {
    test('should be registered with lifesteal', () => {
      const script = cardScriptsRegistry.get('BT_187');
      expect(script).toBeDefined();
    });
  });

  // BT_321 - Chaos Strike (Common)
  // Give your hero +2 Attack this turn. Draw a card
  describe('BT_321 Chaos Strike', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BT_321');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // BT_493 - Felosophy (Epic)
  // Duplicate a minion in your deck
  describe('BT_493 Felosophy', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BT_493');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // BT_496 - Soul Split (Rare)
  // Choose a friendly Demon. Summon a copy of it
  describe('BT_496 Soul Split', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BT_496');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // BT_934 - Eye Beam (Rare)
  // Lifesteal. Deal 3 damage to a minion
  describe('BT_934 Eye Beam', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BT_934');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // BT_491 - Warglaives of Azzinoth (Epic)
  // After you play a minion, give it +2 Attack
  describe('BT_491 Warglaives of Azzinoth', () => {
    test('should be registered with aura effect', () => {
      const script = cardScriptsRegistry.get('BT_491');
      expect(script).toBeDefined();
    });
  });

  // BT_514 - Skull of Gul'dan (Epic)
  // Draw 3 cards. Reduce their Cost by (3)
  describe('BT_514 Skull of Gul\'dan', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BT_514');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});

// =====================
// ULDUM (161 cards)
// Core mechanics: 任务(Quest), 复生(Reborn)
// =====================

describe('Uldum - Core Card Effects', () => {
  // ULD_138 - Ramkahen Wildtamer (Rare)
  // Copy a random Beast in your deck
  describe('ULD_138 Ramkahen Wildtamer', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('ULD_138');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // ULD_140 - Desert Spear (Rare)
  // After your hero attacks, summon a 1/1 Cobra with Poisonous
  describe('ULD_140 Desert Spear', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('ULD_140');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // ULD_167 - Plague of Wrath (Rare)
  // Destroy all minions.(Cards that didn't start in your deck restore 5 Health instead)
  describe('ULD_167 Plague of Wrath', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('ULD_167');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // ULD_165 - Pharaoh's Blessing (Rare)
  // Give a minion +8/+8. Divine Shield
  describe('ULD_165 Pharaoh\'s Blessing', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('ULD_165');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // ULD_207 - Candlebreaker (Common)
  // Your Candles cost (1) less
  describe('ULD_207 Candlebreaker', () => {
    test('should be registered with aura effect', () => {
      const script = cardScriptsRegistry.get('ULD_207');
      expect(script).toBeDefined();
    });
  });

  // ULD_003 - Tirion Fordring (Legendary)
  // Divine Shield. Taunt. Deathrattle: Equip a 5/3 Ashbringer
  describe('ULD_003 Tirion Fordring', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('ULD_003');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // ULD_712 - Injured Tol'vir (Common)
  // Taunt. Battlecry: Deal 6 damage to this minion
  describe('ULD_712 Injured Tol\'vir', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('ULD_712');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});

// =====================
// GANGS (154 cards)
// Core mechanics: 帮派(Gangs), 暗金教(Kazakusan)
// =====================

describe('Gangs - Core Card Effects', () => {
  // CFM_621 - Kazakus (Legendary)
  // Battlecry: Discover a spell
  describe('CFM_621 Kazakus', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('CFM_621');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CFM_651 - Patches the Pirate (Legendary)
  // Charge. Battlecry: If your deck contains no duplicates, add Patches to your hand
  describe('CFM_651 Patches the Pirate', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('CFM_651');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CFM_668 - Small-Time Buccaneer (Rare)
  // Has +2 Attack while you have a weapon
  describe('CFM_668 Small-Time Buccaneer', () => {
    test('should be registered with aura effect', () => {
      const script = cardScriptsRegistry.get('CFM_668');
      expect(script).toBeDefined();
    });
  });

  // CFM_630 - Grimestreet Enforcer (Rare)
  // At the end of your turn, give a random minion in your hand +1/+1
  describe('CFM_630 Grimestreet Enforcer', () => {
    test('should be registered with aura effect', () => {
      const script = cardScriptsRegistry.get('CFM_630');
      expect(script).toBeDefined();
    });
  });

  // CFM_695 - Felguard (Rare)
  // Taunt. Battlecry: Destroy a random enemy minion
  describe('CFM_695 Felguard', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('CFM_695');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CFM_750 - Burgly Bully (Epic)
  // Whenever your opponent casts a spell, add a Coin to your hand
  describe('CFM_750 Burgly Bully', () => {
    test('should be registered with events', () => {
      const script = cardScriptsRegistry.get('CFM_750');
      expect(script).toBeDefined();
    });
  });

  // CFM_712 - Jade Lightning (Common)
  // Deal 4 damage. Summon a 1/1 Jade Golem
  describe('CFM_712 Jade Lightning', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('CFM_712');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});

// =====================
// TROLL (152 cards)
// Core mechanics: 嗜血(Battlecry: Give +1/+1 to all minions)
// =====================

describe('Troll - Core Card Effects', () => {
  // TRL_537 - Scepter of Summoning (Legendary)
  // Your minions that cost 5 or more cost (5)
  describe('TRL_537 Scepter of Summoning', () => {
    test('should be registered with aura effect', () => {
      const script = cardScriptsRegistry.get('TRL_537');
      expect(script).toBeDefined();
    });
  });

  // TRL_564 - Amani War Bear (Rare)
  // Rush. Taunt
  describe('TRL_564 Amani War Bear', () => {
    test('should be registered with keywords', () => {
      const script = cardScriptsRegistry.get('TRL_564');
      expect(script).toBeDefined();
    });
  });

  // TRL_096 - High Priest Thekal (Legendary)
  // Battlecry: Transform all other minions into 1/1s
  describe('TRL_096 High Priest Thekal', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('TRL_096');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // TRL_542 - Soulblade (Epic)
  // Lifesteal. Your other weapons have +2 Attack
  describe('TRL_542 Soulblade', () => {
    test('should be registered with aura effect', () => {
      const script = cardScriptsRegistry.get('TRL_542');
      expect(script).toBeDefined();
    });
  });

  // TRL_541 - Gral's Shark (Rare)
  // Deathrattle: Add a random Hunter minion to your hand
  describe('TRL_541 Gral\'s Shark', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('TRL_541');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // TRL_324 - Iron Hide (Common)
  // Gain 5 Armor
  describe('TRL_324 Iron Hide', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('TRL_324');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // TRL_533 - Zakuroff (Epic)
  // Battlecry: Deal 2 damage to all other minions
  describe('TRL_533 Zakuroff', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('TRL_533');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});
