import { Dormant, Awaken } from '../../src/actions/dormant';
import { Minion } from '../../src/core/card';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { CardType, CardClass } from '../../src/enums';

describe('Dormant/Awaken Mechanics', () => {
  test('Dormant sets dormant_turns on minion', () => {
    const minion = new Minion({
      id: 'BT_126',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 5,
      attack: 4,
      health: 5
    });

    const dormant = new Dormant(minion, 2);
    dormant.trigger(minion);

    expect((minion as any).dormantTurns).toBe(2);
    expect((minion as any).dormant).toBe(true);
  });

  test('Awaken removes dormant state', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    game.setup();

    const minion = new Minion({
      id: 'BT_126',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 5,
      attack: 4,
      health: 5
    });
    (minion as any).controller = player;
    (minion as any).dormantTurns = 0;

    const awaken = new Awaken(minion);
    awaken.trigger(game);

    expect((minion as any).dormant).toBe(false);
    expect((minion as any).dormantTurns).toBe(0);
  });
});
