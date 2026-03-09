// Re-export HeroPower from card.ts to maintain backward compatibility
// Note: HeroPower is now defined in card.ts to avoid circular dependency
export type { HeroPowerDefinition } from './card';
export { HeroPower } from './card';
