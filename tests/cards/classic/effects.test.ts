// Classic - Card Effects Tests
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

// =====================
// CLASSIC - DRUID
// =====================

describe('Classic Druid - Card Effects', () => {
  // EX1_165 - Druid of the Claw (Choose One)
  describe('EX1_165 Druid of the Claw', () => {
    test('should be registered with choose effect', () => {
      const script = cardScriptsRegistry.get('EX1_165');
      expect(script).toBeDefined();
      expect(script?.choose).toBeDefined();
    });
  });

  // CS2_005 - Claw
  describe('CS2_005 Claw', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_005');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_007 - Healing Touch
  describe('CS2_007 Healing Touch', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_007');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_008 - Moonfire
  describe('CS2_008 Moonfire', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_008');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_009 - Mark of the Wild
  describe('CS2_009 Mark of the Wild', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_009');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_011 - Savagery
  describe('CS2_011 Savagery', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_011');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_012 - Swipe
  describe('CS2_012 Swipe', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_012');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_013 - Starfire
  describe('CS2_013 Starfire', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_013');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_154 - Soul of the Forest (Choose One)
  describe('EX1_154 Soul of the Forest', () => {
    test('should be registered with choose effect', () => {
      const script = cardScriptsRegistry.get('EX1_154');
      expect(script).toBeDefined();
      expect(script?.choose).toBeDefined();
    });
  });

  // EX1_155 - Power of the Wild (Choose One)
  describe('EX1_155 Power of the Wild', () => {
    test('should be registered with choose effect', () => {
      const script = cardScriptsRegistry.get('EX1_155');
      expect(script).toBeDefined();
      expect(script?.choose).toBeDefined();
    });
  });

  // EX1_158 - Soul of the Forest
  describe('EX1_158 Soul of the Forest', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_158');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_158e - Soul of the Forest Enchantment
  describe('EX1_158e Soul of the Forest Enchantment', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('EX1_158e');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // EX1_164 - Innervate
  describe('EX1_164 Innervate', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_164');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_169 - Force of Nature
  describe('EX1_169 Force of Nature', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_169');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_173 - Starfall (Choose One)
  describe('EX1_173 Starfall', () => {
    test('should be registered with choose effect', () => {
      const script = cardScriptsRegistry.get('EX1_173');
      expect(script).toBeDefined();
      expect(script?.choose).toBeDefined();
    });
  });

  // EX1_570 - Bite
  describe('EX1_570 Bite', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_570');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_183 - Ironbark Protector
  describe('EX1_183 Ironbark Protector', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_183');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });
});

// =====================
// CLASSIC - PALADIN
// =====================

describe('Classic Paladin - Card Effects', () => {
  // CS2_088 - Blessing of Kings
  describe('CS2_088 Blessing of Kings', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_088');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_362 - Blessing of Wisdom
  describe('EX1_362 Blessing of Wisdom', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_362');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_382 - Hand of Protection
  describe('EX1_382 Hand of Protection', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_382');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_383 - Humility
  describe('EX1_383 Humility', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_383');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_087 - Holy Light
  describe('CS2_087 Holy Light', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_087');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_092 - Blessing of Might
  describe('CS2_092 Blessing of Might', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_092');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_093 - Holy Wrath
  describe('CS2_093 Holy Wrath', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_093');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_094 - Consecration
  describe('CS2_094 Consecration', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_094');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});

// =====================
// CLASSIC - PRIEST
// =====================

describe('Classic Priest - Card Effects', () => {
  // EX1_091 - Cabal Shadow Priest
  describe('EX1_091 Cabal Shadow Priest', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_091');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_193 - Shadow Word: Pain
  describe('EX1_193 Shadow Word: Pain', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_193');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_198 - Temple Enforcer
  describe('EX1_198 Temple Enforcer', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_198');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_623 - Shadow Word: Death
  describe('EX1_623 Shadow Word: Death', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_623');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_004 - Holy Nova
  describe('CS2_004 Holy Nova', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_004');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS1_112 - Holy Smite
  describe('CS1_112 Holy Smite', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS1_112');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS1_113 - Mind Blast
  describe('CS1_113 Mind Blast', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS1_113');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_003 - Mind Vision
  describe('CS2_003 Mind Vision', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_003');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS1_129 - Shadow Madness
  describe('CS1_129 Shadow Madness', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS1_129');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });
});

// =====================
// CLASSIC - ROGUE
// =====================

describe('Classic Rogue - Card Effects', () => {
  // EX1_134 - Eviscerate
  describe('EX1_134 Eviscerate', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_134');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_613 - Sinister Strike
  describe('EX1_613 Sinister Strike', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_613');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // NEW1_005 - Fan of Knives
  describe('NEW1_005 Fan of Knives', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('NEW1_005');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_072 - Shiv
  describe('CS2_072 Shiv', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_072');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_075 - Sprint
  describe('CS2_075 Sprint', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_075');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_076 - Vanish
  describe('CS2_076 Vanish', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_076');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_077 - Backstab
  describe('CS2_077 Backstab', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_077');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_233 - Sap
  describe('CS2_233 Sap', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_233');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_129 - Fan of Knives (fan)
  describe('EX1_129 Fan of Knives', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_129');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});

// =====================
// CLASSIC - SHAMAN
// =====================

describe('Classic Shaman - Card Effects', () => {
  // CS2_042 - Rockbiter Weapon
  describe('CS2_042 Rockbiter Weapon', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_042');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_575 - Totemic Might
  describe('EX1_575 Totemic Might', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_575');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_587 - Lava Burst
  describe('EX1_587 Lava Burst', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_587');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_037 - Lightning Bolt
  describe('CS2_037 Lightning Bolt', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_037');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_038 - Ancestral Healing
  describe('CS2_038 Ancestral Healing', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_038');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_039 - Windfury
  describe('CS2_039 Windfury', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_039');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_041 - Frost Shock
  describe('CS2_041 Frost Shock', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_041');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_045 - Hex
  describe('CS2_045 Hex', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_045');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });
});

// =====================
// CLASSIC - WARLOCK
// =====================

describe('Classic Warlock - Card Effects', () => {
  // CS2_064 - Hellfire
  describe('CS2_064 Hellfire', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_064');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_301 - Sense Demons
  describe('EX1_301 Sense Demons', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_301');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_304 - Flame Imp
  describe('EX1_304 Flame Imp', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_304');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_306 - Felguard
  describe('EX1_306 Felguard', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_306');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_310 - Soulfire
  describe('EX1_310 Soulfire', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_310');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_313 - Siphon Soul
  describe('EX1_313 Siphon Soul', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_313');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_319 - Corruption
  describe('EX1_319 Corruption', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_319');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_323 - Dread Infernal
  describe('EX1_323 Dread Infernal', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_323');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});

// =====================
// CLASSIC - WARRIOR
// =====================

describe('Classic Warrior - Card Effects', () => {
  // EX1_398 - Arathi Weaponsmith
  describe('EX1_398 Arathi Weaponsmith', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_398');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // EX1_603 - Cleave
  describe('EX1_603 Cleave', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_603');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_103 - Execute
  describe('CS2_103 Execute', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_103');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_104 - Heroic Strike
  describe('CS2_104 Heroic Strike', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_104');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_105 - Shield Slam
  describe('CS2_105 Shield Slam', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_105');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_108 - Charge
  describe('CS2_108 Charge', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_108');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });
});

// =====================
// CLASSIC - MAGE
// =====================

describe('Classic Mage - Card Effects', () => {
  // EX1_612 - Teleport
  describe('EX1_612 Teleport', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('EX1_612');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_022 - Polymorph
  describe('CS2_022 Polymorph', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_022');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_023 - Arcane Intellect
  describe('CS2_023 Arcane Intellect', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_023');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_024 - Frost Nova
  describe('CS2_024 Frost Nova', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_024');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_025 - Fireball
  describe('CS2_025 Fireball', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_025');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // CS2_026 - Flamestrike
  describe('CS2_026 Flamestrike', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_026');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_027 - Mirror Entity
  describe('CS2_027 Mirror Entity', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_027');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_028 - Ice Block
  describe('CS2_028 Ice Block', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('CS2_028');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // CS2_031 - Cone of Cold
  describe('CS2_031 Cone of Cold', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('CS2_031');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_277 - Pyroblast
  describe('EX1_277 Pyroblast', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_277');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });

  // EX1_279 - Blizzard
  describe('EX1_279 Blizzard', () => {
    test('should be registered with play effect and requirements', () => {
      const script = cardScriptsRegistry.get('EX1_279');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
      expect(script?.requirements).toBeDefined();
    });
  });
});
