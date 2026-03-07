// DSL exports
export * from './selector';
export * from './lazynum';
export { IF, FOR, IfAction, ForAction, ConditionFn } from './conditions';
export {
  isPlayersTurn,
  hasMana,
  hasTag,
  hasCardInHand,
  isDamaged,
  isEarlyGame,
  isLateGame,
  controlsMinionWithTag,
  opponentControlsMoreMinions,
  ALWAYS,
  NEVER,
} from './conditions';
export * from './cardscripts';
