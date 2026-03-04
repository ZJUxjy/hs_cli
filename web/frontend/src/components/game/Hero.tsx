// web/frontend/src/components/game/Hero.tsx

import { clsx } from 'clsx';

interface HeroProps {
  heroClass: string;
  health: number;
  armor: number;
  isOpponent?: boolean;
  isTargetable?: boolean;
  onClick?: () => void;
}

const heroIcons: Record<string, string> = {
  MAGE: '🧙',
  WARRIOR: '⚔️',
  HUNTER: '🏹',
  DRUID: '🌿',
  PALADIN: '🛡️',
  ROGUE: '🗡️',
  SHAMAN: '⚡',
  WARLOCK: '👿',
  PRIEST: '✝️',
  DEMON_HUNTER: '😈',
  NEUTRAL: '🎭',
};

export function Hero({
  heroClass,
  health,
  armor,
  isOpponent: _isOpponent = false,
  isTargetable = false,
  onClick,
}: HeroProps) {
  return (
    <div
      className={clsx(
        'relative w-[120px] h-[150px] rounded-lg cursor-pointer transition-all',
        'bg-gradient-to-b from-gray-700 to-gray-800 shadow-lg',
        isTargetable && 'ring-4 ring-hearthstone-red',
        'hover:scale-105'
      )}
      onClick={onClick}
    >
      {/* Hero Portrait */}
      <div className="w-full h-[100px] bg-gray-600 rounded-t-lg flex items-center justify-center text-4xl">
        {heroIcons[heroClass] || '👤'}
      </div>

      {/* Class Name */}
      <div className="text-center text-xs text-gray-400 py-1">
        {heroClass}
      </div>

      {/* Health/Armor */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
        {armor > 0 && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-300">
            {armor}
          </div>
        )}
        <div className={clsx(
          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
          health <= 10
            ? 'bg-gradient-to-b from-red-500 to-red-700 text-white'
            : 'bg-gradient-to-b from-hearthstone-red to-red-700 text-white'
        )}>
          {health}
        </div>
      </div>
    </div>
  );
}
