// web/frontend/src/components/game/GameBoard.tsx

import { useTranslation } from 'react-i18next';
import { Hand } from './Hand';
import { Board } from './Board';
import { Hero } from './Hero';
import { ManaCrystals } from './ManaCrystals';
import { GameState, Action } from '../../types/game';

interface GameBoardProps {
  gameState: GameState;
  selectedCard: number | null;
  selectedMinion: string | null;
  validActions: Action[];
  onCardClick: (index: number) => void;
  onMinionClick: (id: string) => void;
  onHeroClick: () => void;
  onEndTurn: () => void;
}

export function GameBoard({
  gameState,
  selectedCard,
  selectedMinion,
  validActions: _validActions,
  onCardClick,
  onMinionClick,
  onHeroClick,
  onEndTurn,
}: GameBoardProps) {
  const { t } = useTranslation();
  const isPlayer1Turn = gameState.current_player === gameState.player1.name;
  const currentPlayer = isPlayer1Turn ? gameState.player1 : gameState.player2;
  const opposingPlayer = isPlayer1Turn ? gameState.player2 : gameState.player1;

  // Get playable card indices
  const playableCards = currentPlayer.hand
    .map((card, index) => (card.cost <= currentPlayer.mana ? index : -1))
    .filter((i) => i >= 0);

  // Get attackable minion IDs
  const attackableMinions = opposingPlayer.board.map((m) => m.instance_id);

  // Check if hero is targetable
  const heroTargetable = selectedMinion !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 flex flex-col">
      {/* Opponent Area */}
      <div className="flex justify-between items-start mb-4">
        <Hero
          heroClass={opposingPlayer.hero_class}
          health={opposingPlayer.health}
          armor={opposingPlayer.armor}
          isOpponent
          isTargetable={heroTargetable}
          onClick={heroTargetable ? onHeroClick : undefined}
        />
        <ManaCrystals
          current={opposingPlayer.mana}
          max={opposingPlayer.max_mana}
        />
      </div>

      {/* Opponent Hand */}
      <Hand
        cards={opposingPlayer.hand}
        selectedCard={null}
        playableCards={[]}
        onCardClick={() => {}}
        isOpponent
      />

      {/* Opponent Board */}
      <Board
        minions={opposingPlayer.board}
        selectedMinion={selectedMinion}
        attackableMinions={attackableMinions}
        onMinionClick={onMinionClick}
      />

      {/* Center Divider */}
      <div className="h-2 bg-gradient-to-r from-transparent via-amber-600 to-transparent my-4" />

      {/* Player Board */}
      <Board
        minions={currentPlayer.board}
        selectedMinion={selectedMinion}
        attackableMinions={[]}
        onMinionClick={onMinionClick}
      />

      {/* Player Hand */}
      <Hand
        cards={currentPlayer.hand}
        selectedCard={selectedCard}
        playableCards={playableCards}
        onCardClick={onCardClick}
      />

      {/* Player Area */}
      <div className="flex justify-between items-end mt-4">
        <Hero
          heroClass={currentPlayer.hero_class}
          health={currentPlayer.health}
          armor={currentPlayer.armor}
        />
        <div className="flex items-center gap-4">
          <ManaCrystals
            current={currentPlayer.mana}
            max={currentPlayer.max_mana}
          />
          <button
            onClick={onEndTurn}
            className="px-8 py-4 bg-gradient-to-b from-hearthstone-gold to-yellow-600 rounded-lg text-black font-bold text-lg hover:opacity-80 transition shadow-lg"
            aria-label={t('game.endTurn')}
          >
            {t('game.endTurn')}
          </button>
        </div>
      </div>

      {/* Game Info */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded">
        {t('game.turnInfo', { turn: gameState.turn, player: currentPlayer.name })}
      </div>
    </div>
  );
}
