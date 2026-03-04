// web/frontend/src/components/game/Card.tsx

import { clsx } from 'clsx';
import { Card as CardType } from '../../types/card';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  isHovered?: boolean;
  showDetails?: boolean;
}

export function Card({
  card,
  onClick,
  isSelected = false,
  isPlayable = false,
  isHovered = false,
  showDetails: _showDetails = false,
}: CardProps) {
  const isMinion = card.card_type === 'MINION';

  return (
    <div
      className={clsx(
        'relative w-[140px] h-[200px] rounded-lg cursor-pointer transition-all duration-200',
        'bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg',
        isSelected && 'ring-4 ring-hearthstone-gold scale-110',
        isPlayable && 'ring-2 ring-hearthstone-green animate-pulse',
        isHovered && !isSelected && 'scale-105',
        'hover:shadow-xl'
      )}
      onClick={onClick}
    >
      {/* Mana Crystal */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gradient-to-b from-hearthstone-blue to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
        {card.cost}
      </div>

      {/* Card Image */}
      {card.image_url ? (
        <img
          src={card.image_url}
          alt={card.name}
          className="w-full h-[100px] object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-[100px] bg-gray-700 rounded-t-lg flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}

      {/* Card Name */}
      <div className="px-2 py-1 bg-gradient-to-r from-amber-900 to-amber-800 mx-2 mt-1 rounded text-center">
        <span className="text-white text-xs font-semibold truncate block">
          {card.name}
        </span>
      </div>

      {/* Stats for Minion */}
      {isMinion && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-hearthstone-gold to-yellow-600 flex items-center justify-center text-black font-bold text-xs">
            {card.attack}
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-hearthstone-red to-red-700 flex items-center justify-center text-white font-bold text-xs">
            {card.health}
          </div>
        </div>
      )}

      {/* Spell indicator */}
      {card.card_type === 'SPELL' && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          Spell
        </div>
      )}
    </div>
  );
}
