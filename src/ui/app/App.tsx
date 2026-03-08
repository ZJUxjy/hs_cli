import React, { useState, useEffect, useCallback } from 'react';
import { createGameController, GameController } from '../engine-bridge';
import type { UIGameState } from '../types';

export const App: React.FC = () => {
  const [controller] = useState<GameController>(() => createGameController());
  const [gameState, setGameState] = useState<UIGameState | null>(null);

  useEffect(() => {
    const unsubscribe = controller.subscribe(setGameState);
    return unsubscribe;
  }, [controller]);

  const handleEndTurn = useCallback(() => {
    controller.dispatch({ type: 'END_TURN' });
  }, [controller]);

  const handleConcede = useCallback(() => {
    controller.dispatch({ type: 'CONCEDE' });
  }, [controller]);

  const handleNewGame = useCallback(() => {
    controller.reset();
  }, [controller]);

  const handlePlayCard = useCallback((handIndex: number) => {
    controller.dispatch({ type: 'PLAY_CARD', handIndex });
  }, [controller]);

  if (!gameState) {
    return (
      <div className="loading">
        <p>Loading game...</p>
      </div>
    );
  }

  const { localPlayer, opponent, turn, mode, isLocalPlayerTurn, winnerId } = gameState;

  return (
    <div className="app">
      <header className="header">
        <h1>JS Fireplace</h1>
        <p>Hearthstone Simulator</p>
      </header>

      <main className="game-container">
        <div className="status-bar">
          <span>Turn: {turn}</span>
          <span>Current: {gameState.currentPlayerId}</span>
          <span className={isLocalPlayerTurn ? 'your-turn' : 'opponent-turn'}>
            {isLocalPlayerTurn ? 'Your Turn' : "Opponent's Turn"}
          </span>
        </div>

        <div className="board">
          <div className="opponent-area">
            <div className="player-info opponent-info">
              <span className="player-name">{opponent.name}</span>
              <div className="mana-crystals">
                {opponent.maxMana > 0 && (
                  <span className="mana">{opponent.mana}/{opponent.maxMana}</span>
                )}
              </div>
              <span className="deck-count">Deck: {opponent.deckCount}</span>
            </div>

            {opponent.hero && (
              <div className="hero opponent-hero">
                <span className="hero-name">{opponent.hero.name}</span>
                <span className="health">{opponent.hero.health}</span>
                {opponent.hero.armor > 0 && (
                  <span className="armor">{opponent.hero.armor}</span>
                )}
              </div>
            )}

            <div className="hand opponent-hand">
              {Array.from({ length: opponent.hand.length }).map((_, i) => (
                <div key={i} className="card card-back">
                  ?
                </div>
              ))}
            </div>

            <div className="field opponent-field">
              {opponent.field.length === 0 ? (
                <p className="placeholder">No minions</p>
              ) : (
                opponent.field.map((minion) => (
                  <div key={minion.uiId} className="minion opponent-minion">
                    <span className="minion-name">{minion.name}</span>
                    <div className="minion-stats">
                      <span className="attack">{minion.attack}</span>
                      <span className="health">{minion.health}</span>
                    </div>
                    {minion.taunt && <span className="keyword taunt">Taunt</span>}
                    {minion.divineShield && <span className="keyword divine-shield">DS</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="player-area">
            <div className="field player-field">
              {localPlayer.field.length === 0 ? (
                <p className="placeholder">No minions</p>
              ) : (
                localPlayer.field.map((minion) => (
                  <div key={minion.uiId} className="minion player-minion">
                    <span className="minion-name">{minion.name}</span>
                    <div className="minion-stats">
                      <span className="attack">{minion.attack}</span>
                      <span className="health">{minion.health}</span>
                    </div>
                    {minion.taunt && <span className="keyword taunt">Taunt</span>}
                    {minion.divineShield && <span className="keyword divine-shield">DS</span>}
                  </div>
                ))
              )}
            </div>

            <div className="hand player-hand">
              {localPlayer.hand.length === 0 ? (
                <p className="placeholder">No cards in hand</p>
              ) : (
                localPlayer.hand.map((card, i) => (
                  <div
                    key={card.uiId}
                    className={`card player-card ${card.playable && isLocalPlayerTurn ? 'playable' : 'unplayable'}`}
                    onClick={() => card.playable && isLocalPlayerTurn && handlePlayCard(i)}
                  >
                    <span className="card-cost">{card.cost}</span>
                    <span className="card-name">{card.name}</span>
                    {(card.type === 'minion' || card.type === 'weapon') && (
                      <div className="card-stats">
                        <span className="attack">{card.attack}</span>
                        <span className="health">{card.health}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {localPlayer.hero && (
              <div className="hero player-hero">
                <span className="hero-name">{localPlayer.hero.name}</span>
                <span className="health">{localPlayer.hero.health}</span>
                {localPlayer.hero.armor > 0 && (
                  <span className="armor">{localPlayer.hero.armor}</span>
                )}
              </div>
            )}

            <div className="player-info local-info">
              <span className="player-name">{localPlayer.name}</span>
              <div className="mana-crystals">
                {localPlayer.maxMana > 0 && (
                  <span className="mana">{localPlayer.mana}/{localPlayer.maxMana}</span>
                )}
              </div>
              <span className="deck-count">Deck: {localPlayer.deckCount}</span>
            </div>
          </div>
        </div>

        <div className="controls">
          <button
            className="btn btn-primary"
            onClick={handleEndTurn}
            disabled={!isLocalPlayerTurn || mode === 'game_over'}
          >
            End Turn
          </button>
          <button className="btn btn-secondary" onClick={handleConcede}>
            Concede
          </button>
          <button className="btn btn-secondary" onClick={handleNewGame}>
            New Game
          </button>
        </div>

        {mode === 'game_over' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>Game Over</h2>
              <p>{winnerId ? `${winnerId} Wins!` : 'Draw!'}</p>
              <button className="btn btn-primary" onClick={handleNewGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      <aside className="log-panel">
        <h3>Action Log</h3>
        <div className="log-entries">
          {gameState.log.length === 0 ? (
            <p>Game started</p>
          ) : (
            gameState.log.map((entry, i) => (
              <p key={i} className={`log-entry log-${entry.type}`}>
                {entry.message}
              </p>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};

export default App;
