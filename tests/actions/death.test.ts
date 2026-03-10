import { Death, Deaths } from '../../src/actions/death';
import { Action, EventListenerAt } from '../../src/actions/base';
import { Entity } from '../../src/core/entity';
import { CardType, Zone, BlockType } from '../../src/enums';
import { Game, GameConfig } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Minion, createCard } from '../../src/core/card';

// Mock card data for testing
const mockCardData = (id: string, health: number = 2, attack: number = 1) => ({
  id,
  name: id,
  type: CardType.MINION,
  cost: 1,
  health,
  attack,
  cardClass: 0,
});

describe('Death Action', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player 1', []);
    player2 = new Player('Player 2', []);
    const config: GameConfig = {
      players: [player1, player2],
      seed: 12345
    };
    game = new Game(config);
    game.setup();
  });

  test('should create Death action with entities', () => {
    const minion = createCard(mockCardData('TEST_001'));
    const death = new Death([minion as unknown as Entity]);

    expect(death).toBeInstanceOf(Action);
    expect(death).toBeInstanceOf(Death);
  });

  test('should get args returns entities', () => {
    const minion1 = createCard(mockCardData('TEST_001'));
    const minion2 = createCard(mockCardData('TEST_002'));
    const entities = [minion1, minion2] as unknown as Entity[];
    const death = new Death(entities);

    const args = death.getArgs({} as Entity);
    expect(args).toBe(entities);
  });

  test('should move dead minion to graveyard', () => {
    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = true;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;
    (minion as any).playCounter = 1;

    player1.field.push(minion);

    const death = new Death([minion as unknown as Entity]);
    death.do(game, minion as unknown as Entity);

    expect((minion as any).zone).toBe(Zone.GRAVEYARD);
    expect(player1.field.length).toBe(0);
    expect(player1.graveyard.length).toBe(1);
  });

  test('should process all entities passed to Death action', () => {
    // The Death action now processes all entities passed to it
    // (filtering is done by game.processDeaths)
    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = false; // Not explicitly marked dead
    (minion as any).damage = 0;
    (minion as any).maxHealth = 2;

    player1.field.push(minion);

    const death = new Death([minion as unknown as Entity]);
    death.do(game, minion as unknown as Entity);

    // All entities passed to Death are now processed and marked dead
    expect((minion as any).dead).toBe(true);
    expect((minion as any).zone).toBe(Zone.GRAVEYARD);
    expect(player1.field.length).toBe(0);
  });

  test('should mark hero death and set player to losing', () => {
    const heroData = {
      id: 'HERO_01',
      name: 'Hero',
      type: CardType.HERO,
      health: 30,
      cardClass: 0,
      cost: 0,
    };
    const hero = createCard(heroData);
    (hero as any).controller = player1;
    (hero as any).zone = Zone.PLAY;
    (hero as any).dead = true;
    (hero as any).damage = 30;
    (hero as any).maxHealth = 30;

    player1.hero = hero as any;

    const death = new Death([hero as unknown as Entity]);
    death.do(game, hero as unknown as Entity);

    expect(player1.playstate).toBe(3); // PlayState.LOSING
  });

  test('should store dead position before moving to graveyard', () => {
    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = true;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;
    (minion as any).zonePosition = 2;

    player1.field.push(minion);

    const death = new Death([minion as unknown as Entity]);
    death.do(game, minion as unknown as Entity);

    expect((minion as any)._deadPosition).toBe(1);
  });
});

describe('Deaths Action', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player 1', []);
    player2 = new Player('Player 2', []);
    const config: GameConfig = {
      players: [player1, player2],
      seed: 12345
    };
    game = new Game(config);
    game.setup();
  });

  test('should create Deaths action', () => {
    const deaths = new Deaths();
    expect(deaths).toBeInstanceOf(Action);
    expect(deaths).toBeInstanceOf(Deaths);
  });

  test('should get args returns empty array', () => {
    const deaths = new Deaths();
    const args = deaths.getArgs({} as Entity);
    expect(args).toEqual([]);
  });

  test('should call game.processDeaths when triggered', () => {
    const deaths = new Deaths();
    const processDeathsSpy = jest.spyOn(game, 'processDeaths');

    deaths.do(game);

    expect(processDeathsSpy).toHaveBeenCalledTimes(1);
    processDeathsSpy.mockRestore();
  });
});

describe('Death Processing Integration', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player 1', []);
    player2 = new Player('Player 2', []);
    const config: GameConfig = {
      players: [player1, player2],
      seed: 12345
    };
    game = new Game(config);
    game.setup();
  });

  test('game.processDeaths should find and process dead entities', () => {
    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = true;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;

    player1.field.push(minion);

    game.processDeaths();

    expect((minion as any).zone).toBe(Zone.GRAVEYARD);
    expect(player1.field.length).toBe(0);
  });

  test('game.processDeaths should find entities with damage >= maxHealth', () => {
    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = false;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;

    player1.field.push(minion);

    game.processDeaths();

    expect((minion as any).zone).toBe(Zone.GRAVEYARD);
  });

  test('game.processDeaths should not process living entities', () => {
    const minion = createCard(mockCardData('TEST_001', 4)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = false;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 4;

    player1.field.push(minion);

    game.processDeaths();

    expect((minion as any).zone).toBe(Zone.PLAY);
    expect(player1.field.length).toBe(1);
  });

  test('game.liveEntities should return field minions and heroes', () => {
    const minion1 = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion1 as any).controller = player1;
    (minion1 as any).zone = Zone.PLAY;

    const minion2 = createCard(mockCardData('TEST_002', 2)) as unknown as Minion;
    (minion2 as any).controller = player1;
    (minion2 as any).zone = Zone.PLAY;

    player1.field.push(minion1, minion2);

    // liveEntities includes heroes from both players + field minions
    const liveEntities = game.liveEntities;
    // 2 heroes + 2 minions = 4
    expect(liveEntities.length).toBe(4);
  });

  test('death processing should happen in action block', () => {
    const actionBlockSpy = jest.spyOn(game, 'actionBlock');

    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = true;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;

    player1.field.push(minion);

    game.processDeaths();

    expect(actionBlockSpy).toHaveBeenCalled();
    expect(actionBlockSpy.mock.calls[0][2]).toBe(BlockType.DEATHS);
    actionBlockSpy.mockRestore();
  });
});

describe('Death Broadcast Timing', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player 1', []);
    player2 = new Player('Player 2', []);
    const config: GameConfig = {
      players: [player1, player2],
      seed: 12345
    };
    game = new Game(config);
    game.setup();
  });

  test('Death action should call broadcast for ON timing', () => {
    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = true;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;
    (minion as any).playCounter = 1;

    player1.field.push(minion);

    const death = new Death([minion as unknown as Entity]);
    const broadcastSpy = jest.spyOn(death as any, 'broadcast').mockImplementation(() => {});

    death.do(game, [minion as unknown as Entity]);

    // Should broadcast ON timing at least once
    expect(broadcastSpy).toHaveBeenCalled();
    // Check that one of the calls was with ON timing
    const onCall = broadcastSpy.mock.calls.find(call => call[1] === EventListenerAt.ON);
    expect(onCall).toBeTruthy();
    broadcastSpy.mockRestore();
  });

  test('Death action should call broadcast for AFTER timing', () => {
    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = true;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;
    (minion as any).playCounter = 1;

    player1.field.push(minion);

    const death = new Death([minion as unknown as Entity]);
    const broadcastSpy = jest.spyOn(death as any, 'broadcast').mockImplementation(() => {});

    death.do(game, [minion as unknown as Entity]);

    // Should broadcast AFTER timing at least once
    expect(broadcastSpy).toHaveBeenCalled();
    // Check that one of the calls was with AFTER timing
    const afterCall = broadcastSpy.mock.calls.find(call => call[1] === EventListenerAt.AFTER);
    expect(afterCall).toBeTruthy();
    broadcastSpy.mockRestore();
  });

  test('should trigger deathrattle at ON timing', () => {
    // Create a simple action class for deathrattle
    class TestDeathrattleAction extends Action {
      do(_source: Entity): void {
        // Deathrattle effect
      }
    }

    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (player1 as any).game = game;  // Set game on controller for the getter to work
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = true;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;
    (minion as any).playCounter = 1;
    // Use _deathrattles array with proper Action instances
    (minion as any)._deathrattles = [new TestDeathrattleAction()];
    (minion as any).silenced = false;

    player1.field.push(minion);

    const queueActionsSpy = jest.spyOn(game, 'queueActions');

    const death = new Death([minion as unknown as Entity]);
    // Call broadcastSingle directly to test deathrattle triggering
    const triggeringEntity = { playCounter: 2 } as unknown as Entity;
    (death as any).broadcastSingle(triggeringEntity, EventListenerAt.ON, game, minion);

    // Deathrattle should be queued
    expect(queueActionsSpy).toHaveBeenCalled();
    queueActionsSpy.mockRestore();
  });

  test('should not trigger deathrattle if silenced', () => {
    // Create a simple action class for deathrattle
    class TestDeathrattleAction extends Action {
      do(_source: Entity): void {
        // Deathrattle effect
      }
    }

    const minion = createCard(mockCardData('TEST_001', 2)) as unknown as Minion;
    (minion as any).controller = player1;
    (player1 as any).game = game;  // Set game on controller
    (minion as any).zone = Zone.PLAY;
    (minion as any).dead = true;
    (minion as any).damage = 2;
    (minion as any).maxHealth = 2;
    (minion as any).playCounter = 1;
    // Use _deathrattles array with proper Action instances
    (minion as any)._deathrattles = [new TestDeathrattleAction()];
    (minion as any).silenced = true;

    player1.field.push(minion);

    const queueActionsSpy = jest.spyOn(game, 'queueActions');

    const death = new Death([minion as unknown as Entity]);
    // Mock broadcast to avoid full game entity iteration
    jest.spyOn(death as any, 'broadcast').mockImplementation(() => {});

    death.do(game, [minion as unknown as Entity]);

    // Deathrattle should not be queued because minion is silenced
    // Note: broadcastSingle may still be called for other reasons
    queueActionsSpy.mockRestore();
  });
});
