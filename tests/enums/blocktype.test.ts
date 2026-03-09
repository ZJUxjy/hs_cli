import { BlockType } from '../../src/enums/blocktype';

describe('BlockType', () => {
  test('should have all block types defined', () => {
    expect(BlockType.ATTACK).toBe(1);
    expect(BlockType.JOUST).toBe(2);
    expect(BlockType.POWER).toBe(3);
    expect(BlockType.TRIGGER).toBe(5);
    expect(BlockType.DEATHS).toBe(6);
    expect(BlockType.PLAY).toBe(7);
    expect(BlockType.FATIGUE).toBe(8);
    expect(BlockType.RITUAL).toBe(9);
    expect(BlockType.REVEAL_CARD).toBe(10);
    expect(BlockType.GAME_RESET).toBe(11);
    expect(BlockType.MOVE_MINION).toBe(12);
  });
});
