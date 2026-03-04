// web/frontend/src/pages/GamePage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '../components/game/GameBoard';
import { useGameStore } from '../store/gameStore';

export function GamePage() {
  const navigate = useNavigate();
  const {
    gameState,
    selectedCard,
    selectedMinion,
    startNewGame,
    playCard,
    attack,
    endTurn,
    selectCard,
    selectMinion,
    isLoading,
    error,
  } = useGameStore();

  useEffect(() => {
    // Start a game with test decks
    startNewGame('test_deck', 'test_deck');
  }, [startNewGame]);

  const handleCardClick = (index: number) => {
    if (selectedCard === index) {
      // Play the card
      playCard(index);
    } else {
      selectCard(index);
      selectMinion(null);
    }
  };

  const handleMinionClick = (id: string) => {
    if (selectedMinion) {
      // Attack with selected minion
      attack(selectedMinion, id);
    } else {
      selectMinion(id);
      selectCard(null);
    }
  };

  const handleHeroClick = () => {
    if (selectedMinion) {
      // Attack hero
      attack(selectedMinion, 'enemy_hero');
    }
  };

  if (isLoading && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-2xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-2xl text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-hearthstone-blue rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-2xl">No game state</div>
      </div>
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      selectedCard={selectedCard}
      selectedMinion={selectedMinion}
      validActions={[]}
      onCardClick={handleCardClick}
      onMinionClick={handleMinionClick}
      onHeroClick={handleHeroClick}
      onEndTurn={endTurn}
    />
  );
}
