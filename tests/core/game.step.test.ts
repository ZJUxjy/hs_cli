import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Step } from '../../src/enums';

describe('Game Step State Machine', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';
    game = new Game({ players: [player1, player2] });
  });

  test('initial step should be BEGIN_FIRST', () => {
    expect(game.step).toBe(Step.BEGIN_FIRST);
  });

  test('setup should transition to BEGIN_DRAW', () => {
    game.setup();
    expect(game.step).toBe(Step.BEGIN_DRAW);
  });

  test('stepTransition should update step and nextStep', () => {
    game.stepTransition(Step.MAIN_READY);
    expect(game.step).toBe(Step.BEGIN_SHUFFLE); // Was nextStep
    expect(game.nextStep).toBe(Step.MAIN_READY);
  });

  test('stepTransition should call manager.step with old and new step', () => {
    const stepSpy = jest.spyOn(game.manager, 'step');
    game.stepTransition(Step.BEGIN_MULLIGAN);
    expect(stepSpy).toHaveBeenCalledWith(Step.BEGIN_FIRST, Step.BEGIN_SHUFFLE);
  });
});
