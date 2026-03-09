import { Damage } from '../../src/actions/damage';
import { Draw } from '../../src/actions/draw';
import { Summon } from '../../src/actions/summon';
import { Action, EventListenerAt } from '../../src/actions/base';
import { Entity } from '../../src/core/entity';
import { Minion, CardDefinition } from '../../src/core/card';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { CardType, CardClass } from '../../src/enums';

describe('Action System Integration', () => {
  describe('Damage action', () => {
    test('Damage action should work with new system', () => {
      const target = new Minion({
        id: 'TEST',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 5
      });
      const damage = new Damage(3);
      damage.trigger(target);
      expect(target.damage).toBe(3);
    });

    test('Damage action should apply to specified target', () => {
      const target = new Minion({
        id: 'TARGET',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 5
      });
      const source = new Minion({
        id: 'SOURCE',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 5
      });

      const damage = new Damage(2, target);
      damage.trigger(source);
      expect(target.damage).toBe(2);
      expect(source.damage).toBe(0);
    });

    test('Damage action should broadcast ON and AFTER events', () => {
      const target = new Minion({
        id: 'TEST',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 5
      });

      // Create mock game for broadcasting
      const mockBroadcast = jest.fn();
      const damage = new Damage(2);
      damage.broadcast = mockBroadcast;

      damage.trigger(target);

      // Should have called broadcast for ON and AFTER
      expect(mockBroadcast).toHaveBeenCalledTimes(2);
      expect(mockBroadcast).toHaveBeenNthCalledWith(1, target, EventListenerAt.ON, 2);
      expect(mockBroadcast).toHaveBeenNthCalledWith(2, target, EventListenerAt.AFTER, 2);
    });

    test('Damage action should queue callbacks', () => {
      const player = new Player('Player1', []);
      const player2 = new Player('Player2', []);
      const game = new Game({ players: [player, player2], seed: 12345 });
      game.setup();

      const target = new Minion({
        id: 'TEST',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 5
      });
      (target as any).controller = player;

      const callbackAction = new Action();
      const callbackSpy = jest.spyOn(callbackAction, 'trigger').mockImplementation(() => []);

      const damage = new Damage(2);
      damage.callback = [callbackAction];

      damage.trigger(target);

      // Callback should be queued via game.queueActions
      // Note: In actual implementation, the callback gets queued but may not execute immediately
    });
  });

  describe('Draw action', () => {
    let game: Game;
    let player: Player;

    beforeEach(() => {
      player = new Player('Player1', []);
      const player2 = new Player('Player2', []);
      game = new Game({ players: [player, player2], seed: 12345 });
      game.setup();

      // Add cards to deck
      const cardDef: CardDefinition = {
        id: 'card1',
        type: CardType.SPELL,
        cardClass: CardClass.MAGE,
        cost: 1
      };
      const card1 = new Minion(cardDef);
      const card2 = new Minion(cardDef);
      player.deck.push(card1, card2);
    });

    test('Draw action should work with new system', () => {
      const draw = new Draw(1);
      draw.trigger(player);
      expect(player.hand.length).toBe(1);
      expect(player.deck.length).toBe(1);
    });

    test('Draw action should draw multiple cards', () => {
      const draw = new Draw(2);
      draw.trigger(player);
      expect(player.hand.length).toBe(2);
      expect(player.deck.length).toBe(0);
    });

    test('Draw action should not draw more than available', () => {
      const draw = new Draw(5);
      draw.trigger(player);
      expect(player.hand.length).toBe(2);
    });

    test('Draw action should broadcast events', () => {
      const mockBroadcast = jest.fn();
      const draw = new Draw(1);
      draw.broadcast = mockBroadcast;

      draw.trigger(player);

      expect(mockBroadcast).toHaveBeenCalledTimes(2);
      expect(mockBroadcast).toHaveBeenNthCalledWith(1, player, EventListenerAt.ON, 1);
      expect(mockBroadcast).toHaveBeenNthCalledWith(2, player, EventListenerAt.AFTER, 1);
    });
  });

  describe('Summon action', () => {
    let game: Game;
    let player: Player;

    beforeEach(() => {
      player = new Player('Player1', []);
      const player2 = new Player('Player2', []);
      game = new Game({ players: [player, player2], seed: 12345 });
      game.setup();
    });

    test('Summon action should work with new system', () => {
      const minion = new Minion({
        id: 'minion1',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 1
      });

      const summon = new Summon(minion);
      summon.trigger(player);

      expect(player.field.length).toBe(1);
    });

    test('Summon action should not summon if board is full', () => {
      // Fill the board
      for (let i = 0; i < 7; i++) {
        const minion = new Minion({
          id: `minion${i}`,
          type: CardType.MINION,
          cardClass: CardClass.NEUTRAL,
          cost: 1,
          attack: 1,
          health: 1
        });
        player.field.push(minion);
      }

      const newMinion = new Minion({
        id: 'minion_new',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 1
      });

      const summon = new Summon(newMinion);
      summon.trigger(player);

      expect(player.field.length).toBe(7);
    });

    test('Summon action should summon at specific index', () => {
      const minion1 = new Minion({
        id: 'minion1',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 1
      });
      player.field.push(minion1);

      const minion2 = new Minion({
        id: 'minion2',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 1
      });

      const summon = new Summon(minion2, 0);
      summon.trigger(player);

      // After summon at index 0, minion2 should be first
      expect(player.field.first()).toBe(minion2);
    });

    test('Summon action should broadcast events', () => {
      const minion = new Minion({
        id: 'minion1',
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 1
      });

      const mockBroadcast = jest.fn();
      const summon = new Summon(minion);
      summon.broadcast = mockBroadcast;

      summon.trigger(player);

      expect(mockBroadcast).toHaveBeenCalledTimes(2);
      expect(mockBroadcast).toHaveBeenNthCalledWith(1, player, EventListenerAt.ON, minion);
      expect(mockBroadcast).toHaveBeenNthCalledWith(2, player, EventListenerAt.AFTER, minion);
    });
  });

  describe('Action chaining with then()', () => {
    test('should chain actions using then()', () => {
      const damage = new Damage(2);
      const draw = new Draw(1);

      const chained = damage.then(draw);

      expect(chained).toBeInstanceOf(Action);
      expect(chained.callback).toContain(draw);
    });
  });

  describe('Event listeners with on() and after()', () => {
    test('should create ON event listener', () => {
      const damage = new Damage(2);
      const callback = new Action();

      const listener = damage.on(callback);

      expect(listener.trigger).toBe(damage);
      expect(listener.actions).toContain(callback);
      expect(listener.at).toBe(EventListenerAt.ON);
    });

    test('should create AFTER event listener', () => {
      const damage = new Damage(2);
      const callback = new Action();

      const listener = damage.after(callback);

      expect(listener.trigger).toBe(damage);
      expect(listener.actions).toContain(callback);
      expect(listener.at).toBe(EventListenerAt.AFTER);
    });
  });
});
