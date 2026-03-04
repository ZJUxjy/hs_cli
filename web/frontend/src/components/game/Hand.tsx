// web/frontend/src/components/game/Hand.tsx

import { Card } from './Card';
import { Card as CardType } from '../../types/card';

interface HandProps {
  cards: CardType[];
  selectedCard: number | null;
  playableCards: number[];
  onCardClick: (index: number) => void;
  isOpponent?: boolean;
}

export function Hand({
  cards,
  selectedCard,
  playableCards,
  onCardClick,
  isOpponent = false,
}: HandProps) {
  return (
    <div className="flex justify-center items-end gap-[-20px] py-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="transition-all duration-200"
          style={{
            transform: `rotate(${(index - cards.length / 2) * 3}deg)`,
            marginLeft: index > 0 ? '-30px' : '0',
            zIndex: index,
          }}
        >
          {isOpponent ? (
            <div className="w-[100px] h-[140px] rounded-lg bg-gradient-to-b from-gray-600 to-gray-800 shadow-lg border-2 border-gray-500" />
          ) : (
            <Card
              card={card}
              onClick={() => onCardClick(index)}
              isSelected={selectedCard === index}
              isPlayable={playableCards.includes(index)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
