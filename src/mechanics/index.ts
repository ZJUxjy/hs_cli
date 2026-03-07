// Card mechanics exports
export { Secret, SecretManager, AttackTriggeredSecret, SpellTriggeredSecret, MinionPlayTriggeredSecret, DamageTriggeredSecret } from './secret';
export { Discover, DiscoverOptions, DiscoverSpell, DiscoverMinion, DiscoverWeapon, DiscoverSameCost } from './discover';
export { Quest, createPlayCardCondition, createSummonCondition, createDealDamageCondition, createHeroPowerCondition } from './quest';
export { Adapt, AdaptOption, AdaptEffect, ADAPT_EFFECTS, AdaptMinion } from './adapt';
export { Keywords, Recruit, Trade, InfuseCounter, CorruptTracker, checkManathirst, checkCombo, getComboMultiplier, checkOutcast } from './keywords';

// New mechanics (Phase 3.5)
export { Twinspell, isTwinspellCopy, createTwinspell } from './twinspell';
export { SpellburstEffect, Spellburstable, SpellburstManager, addSpellburst, hasSpellburst, triggerSpellburst } from './spellburst';
export { FrenzyEffect, Frenziable, FrenzyManager, addFrenzy, hasFrenzy, triggerFrenzy } from './frenzy';
export { HonorableKillEffect, HonorableKillable, HonorableKillManager, addHonorableKill, hasHonorableKill, checkHonorableKill } from './honorable_kill';
export { Magnetic, MagneticManager, addMagnetic, isMagnetic, tryMagnetize, handleMagneticPlay } from './magnetic';
export { Dormant, DormantState, AwakenCondition, DormantManager, addDormant, isDormant, canTargetMinion, awakenMinion } from './dormant';
export { InspireEffect, Inspireable, InspireManager, addInspire, hasInspire, triggerInspire } from './inspire';
