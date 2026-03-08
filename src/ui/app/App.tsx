import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createGameController, GameController, initializeCardLoader, areCardsLoaded } from '../engine-bridge';
import type { UIGameState } from '../types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controller, setController] = useState<GameController | null>(null);
  const [gameState, setGameState] = useState<UIGameState | null>(null);

  // Initialize card loader and create game controller
  useEffect(() => {
    const init = async () => {
      try {
        // Load cards first
        if (!areCardsLoaded()) {
          console.log('[App] Loading card definitions...');
          initializeCardLoader();
        }

        // Create game controller
        console.log('[App] Creating game controller...');
        const ctrl = createGameController();
        setController(ctrl);
        setIsLoading(false);
      } catch (err) {
        console.error('[App] Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize game');
        setIsLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    // Subscribe to game state changes
    if (!controller) return;
    const unsubscribe = controller.subscribe(setGameState);
    return unsubscribe;
  }, [controller]);

  const handleEndTurn = useCallback(() => {
    console.log(`[App] handleEndTurn clicked`);
    controller?.dispatch({ type: 'END_TURN' });
  }, [controller]);

  const handleConcede = useCallback(() => {
    controller?.dispatch({ type: 'CONCEDE' });
  }, [controller]);

  const handleNewGame = useCallback(() => {
    controller?.reset();
  }, [controller]);

  const handlePlayCard = useCallback((handIndex: number) => {
    console.log(`[App] handlePlayCard clicked - index: ${handIndex}`);
    if (!controller) {
      console.log(`[App] No controller available`);
      return;
    }
    const result = controller.dispatch({ type: 'PLAY_CARD', handIndex });
    console.log(`[App] Play card result:`, result);
  }, [controller]);

  const handleAttack = useCallback((attackerId: string, defenderId: string) => {
    controller?.dispatch({ type: 'ATTACK', attackerId, defenderId });
  }, [controller]);

  // Drag and drop state for attacks
  const [draggedEntity, setDraggedEntity] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Drag and drop state for playing cards from hand
  const [draggedHandCard, setDraggedHandCard] = useState<number | null>(null);
  const [dragOverField, setDragOverField] = useState<boolean>(false);

  const handleDragStart = (entityId: string) => {
    setDraggedEntity(entityId);
  };

  const handleDragOver = (targetId: string | null) => {
    setDragOverTarget(targetId);
  };

  const handleDrop = (targetId: string) => {
    if (draggedEntity && targetId && draggedEntity !== targetId) {
      handleAttack(draggedEntity, targetId);
    }
    setDraggedEntity(null);
    setDragOverTarget(null);
  };

  // Handle dragging a card from hand to play it
  const handleHandCardDragStart = (handIndex: number) => {
    setDraggedHandCard(handIndex);
  };

  const handleHandCardDragEnd = () => {
    setDraggedHandCard(null);
    setDragOverField(false);
  };

  const handleFieldDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverField(true);
  };

  const handleFieldDragLeave = () => {
    setDragOverField(false);
  };

  const handleFieldDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedHandCard !== null && controller) {
      const card = localPlayer?.hand[draggedHandCard];
      if (card?.playable && isLocalPlayerTurn) {
        handlePlayCard(draggedHandCard);
      }
    }
    setDraggedHandCard(null);
    setDragOverField(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading">
        <p>Loading cards and initializing game...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="loading">
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Don't render until we have game state
  if (!gameState) {
    return (
      <div className="loading">
        <p>Loading game...</p>
      </div>
    );
  }

  const { localPlayer, opponent, turn, mode, isLocalPlayerTurn, winnerId, pendingTarget } = gameState;

  // Helper to check if an entity is a valid target (by matching short UUID)
  // Note: This is a regular function, not useCallback, because it's defined after early returns
  const isValidTarget = (uiId: string): boolean => {
    if (!pendingTarget) return false;
    // Check if any valid target UUID is contained in the entity's UI ID
    return pendingTarget.validTargetIds.some(uuid => uiId.includes(uuid));
  };

  // Handle selecting a target for a card
  const handleSelectTarget = (targetId: string) => {
    if (!pendingTarget || !controller) return;
    console.log(`[App] Target selected: ${targetId} for card ${pendingTarget.sourceCardId}`);
    // Find the hand index of the source card
    const handIndex = localPlayer.hand.findIndex(c => c.id === pendingTarget.sourceCardId);
    if (handIndex === -1) {
      console.error('[App] Source card not found in hand');
      return;
    }
    const result = controller.dispatch({
      type: 'PLAY_CARD',
      handIndex,
      targetId
    });
    console.log(`[App] Play card with target result:`, result);
  };

  const handleCancelTarget = () => {
    if (!controller) return;
    controller.dispatch({ type: 'CANCEL_TARGET' });
  };

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
          {/* Opponent Hand - at the very top */}
          <div className="hand opponent-hand">
            {Array.from({ length: opponent.hand.length }).map((_, i) => (
              <div key={i} className="card card-back" />
            ))}
          </div>

          {/* Opponent Hero Row - Weapon | Hero | Hero Power */}
          <div className="hero-row opponent-hero-row">
            <div className="weapon-slot opponent-weapon">
              {opponent.hasWeapon && <div className="weapon" />}
            </div>
            {opponent.hero && (
              <div
                className={`hero-portrait opponent-hero ${dragOverTarget === opponent.hero.uiId ? 'drop-target' : ''} ${isValidTarget(opponent.hero.uiId) ? 'valid-target' : ''}`}
                data-hero-id={opponent.hero.uiId}
                onClick={() => {
                  if (isValidTarget(opponent.hero.uiId)) {
                    handleSelectTarget(opponent.hero.uiId);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(opponent.hero.uiId);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(opponent.hero.uiId);
                }}
              >
                <div className="hero-avatar">{opponent.hero.name.charAt(0)}</div>
                <div className="hero-stats">
                  {opponent.hero.attack > 0 && (
                    <span className="hero-attack">{opponent.hero.attack}</span>
                  )}
                  <span className="hero-health">{opponent.hero.health}</span>
                  {opponent.hero.armor > 0 && (
                    <span className="hero-armor">{opponent.hero.armor}</span>
                  )}
                </div>
              </div>
            )}
            <div className="hero-power-slot opponent-power">
              <div className="hero-power" />
            </div>
            <div className="player-info-overlay">
              <span className="deck-count">{opponent.deckCount}</span>
              {opponent.maxMana > 0 && (
                <span className="mana">{opponent.mana}/{opponent.maxMana}</span>
              )}
            </div>
          </div>

          {/* Opponent Minions */}
          <div className="field opponent-field">
            {opponent.field.length === 0 ? (
              <p className="placeholder">No minions</p>
            ) : (
              opponent.field.map((minion) => (
                <div
                  key={minion.uiId}
                  className={`minion ${minion.taunt ? 'taunt-minion' : ''} ${minion.divineShield ? 'divine-shield-minion' : ''} ${dragOverTarget === minion.uiId ? 'drop-target' : ''} ${isValidTarget(minion.uiId) ? 'valid-target' : ''}`}
                  onClick={() => {
                    if (isValidTarget(minion.uiId)) {
                      handleSelectTarget(minion.uiId);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    handleDragOver(minion.uiId);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(minion.uiId);
                  }}
                >
                  <span className="minion-name">{minion.name}</span>
                  <div className="minion-stats">
                    <span className="attack">{minion.attack}</span>
                    <span className="health">{minion.health}</span>
                  </div>
                  <div className="keywords">
                    {minion.taunt && <span className="keyword taunt">Taunt</span>}
                    {minion.divineShield && <span className="keyword divine-shield">DS</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Center Divider with Turn Info */}
          <div className="center-divider">
            <span className="turn-info">Turn {turn}</span>
          </div>

          {/* Player Minions - Drop zone for playing cards */}
          <div
            className={`field player-field ${dragOverField && draggedHandCard !== null ? 'drop-zone-active' : ''}`}
            onDragOver={handleFieldDragOver}
            onDragLeave={handleFieldDragLeave}
            onDrop={handleFieldDrop}
          >
            {localPlayer.field.length === 0 ? (
              <p className="placeholder">No minions</p>
            ) : (
              localPlayer.field.map((minion) => (
                <div
                  key={minion.uiId}
                  className={`minion ${minion.taunt ? 'taunt-minion' : ''} ${minion.divineShield ? 'divine-shield-minion' : ''} ${minion.canAttack && isLocalPlayerTurn ? 'can-attack' : ''} ${isValidTarget(minion.uiId) ? 'valid-target' : ''}`}
                  draggable={minion.canAttack && isLocalPlayerTurn}
                  onDragStart={() => handleDragStart(minion.uiId)}
                  onDragEnd={() => setDraggedEntity(null)}
                  onClick={() => {
                    if (isValidTarget(minion.uiId)) {
                      handleSelectTarget(minion.uiId);
                    }
                  }}
                >
                  <span className="minion-name">{minion.name}</span>
                  <div className="minion-stats">
                    <span className="attack">{minion.attack}</span>
                    <span className="health">{minion.health}</span>
                  </div>
                  <div className="keywords">
                    {minion.taunt && <span className="keyword taunt">Taunt</span>}
                    {minion.divineShield && <span className="keyword divine-shield">DS</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Player Hero Row - Weapon | Hero | Hero Power */}
          <div className="hero-row player-hero-row">
            <div className="weapon-slot player-weapon">
              {localPlayer.hasWeapon && <div className="weapon" />}
            </div>
            {localPlayer.hero && (
              <div
                className={`hero-portrait player-hero ${localPlayer.hero.canAttack && isLocalPlayerTurn ? 'can-attack' : ''} ${isValidTarget(localPlayer.hero.uiId) ? 'valid-target' : ''}`}
                draggable={localPlayer.hero.canAttack && isLocalPlayerTurn}
                onDragStart={() => handleDragStart(localPlayer.hero!.uiId)}
                onDragEnd={() => setDraggedEntity(null)}
                onClick={() => {
                  if (isValidTarget(localPlayer.hero!.uiId)) {
                    handleSelectTarget(localPlayer.hero!.uiId);
                  }
                }}
              >
                <div className="hero-avatar">{localPlayer.hero.name.charAt(0)}</div>
                <div className="hero-stats">
                  {localPlayer.hero.attack > 0 && (
                    <span className="hero-attack">{localPlayer.hero.attack}</span>
                  )}
                  <span className="hero-health">{localPlayer.hero.health}</span>
                  {localPlayer.hero.armor > 0 && (
                    <span className="hero-armor">{localPlayer.hero.armor}</span>
                  )}
                </div>
              </div>
            )}
            <div className="hero-power-slot player-power">
              <div className="hero-power" />
            </div>
            <div className="player-info-overlay">
              <span className="deck-count">{localPlayer.deckCount}</span>
              {localPlayer.maxMana > 0 && (
                <span className="mana">{localPlayer.mana}/{localPlayer.maxMana}</span>
              )}
            </div>
          </div>

          {/* Player Hand - at the very bottom */}
          <div className="hand player-hand">
            {localPlayer.hand.length === 0 ? (
              <p className="placeholder">No cards in hand</p>
            ) : (
              localPlayer.hand.map((card, i) => (
                <div
                  key={card.uiId}
                  className={`card player-card ${card.playable && isLocalPlayerTurn ? 'playable' : 'unplayable'} ${draggedHandCard === i ? 'dragging' : ''}`}
                  draggable={card.playable && isLocalPlayerTurn && (card.type === 'minion' || card.type === 'weapon')}
                  onDragStart={() => handleHandCardDragStart(i)}
                  onDragEnd={handleHandCardDragEnd}
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

        {/* Game Over Overlay */}
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

        {/* Targeting Overlay */}
        {pendingTarget && (
          <div className="targeting-overlay">
            <div className="targeting-prompt">
              <p>{pendingTarget.prompt || 'Select a target'}</p>
              <button className="btn btn-secondary" onClick={handleCancelTarget}>
                Cancel
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
