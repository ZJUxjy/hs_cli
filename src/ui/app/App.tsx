import React, { useState, useEffect } from 'react';

interface GameState {
  turn: number;
  currentPlayer: string;
  message: string;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    turn: 1,
    currentPlayer: 'Player 1',
    message: 'Welcome to JS Fireplace!',
  });

  useEffect(() => {
    // Initialize game engine here in later tasks
    console.log('[App] Game initialized');
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>JS Fireplace</h1>
        <p>Hearthstone Simulator</p>
      </header>

      <main className="game-container">
        <div className="status-bar">
          <span>Turn: {gameState.turn}</span>
          <span>Current Player: {gameState.currentPlayer}</span>
        </div>

        <div className="board">
          <div className="opponent-area">
            <div className="hero opponent-hero">
              <span className="hero-name">Opponent Hero</span>
              <span className="health">30</span>
            </div>
            <div className="hand opponent-hand">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card card-back">
                  ?
                </div>
              ))}
            </div>
          </div>

          <div className="battlefield">
            <div className="minions opponent-minions">
              <p className="placeholder">Opponent minions will appear here</p>
            </div>
            <div className="minions player-minions">
              <p className="placeholder">Your minions will appear here</p>
            </div>
          </div>

          <div className="player-area">
            <div className="hand player-hand">
              <p className="placeholder">Your hand will appear here</p>
            </div>
            <div className="hero player-hero">
              <span className="hero-name">Your Hero</span>
              <span className="health">30</span>
            </div>
          </div>
        </div>

        <div className="controls">
          <button className="btn btn-primary">End Turn</button>
          <button className="btn btn-secondary">Concede</button>
        </div>
      </main>

      <aside className="log-panel">
        <h3>Action Log</h3>
        <div className="log-entries">
          <p>{gameState.message}</p>
        </div>
      </aside>
    </div>
  );
};

export default App;
