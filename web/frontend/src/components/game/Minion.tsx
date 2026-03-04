// web/frontend/src/components/game/Minion.tsx

import { clsx } from 'clsx';
import { Minion as MinionType } from '../../types/card';

interface MinionProps {
  minion: MinionType;
  onClick?: () => void;
  isSelected?: boolean;
  canAttack?: boolean;
  isTargetable?: boolean;
}

export function Minion({
  minion,
  onClick,
  isSelected = false,
  canAttack = false,
  isTargetable = false,
}: MinionProps) {
  const hasTaunt = minion.abilities.includes('TAUNT');
  const hasDivineShield = minion.abilities.includes('DIVINE_SHIELD');

  return (
    <div
      className={clsx(
        'relative w-[100px] h-[140px] rounded-lg cursor-pointer transition-all duration-200',
        'bg-gradient-to-b from-gray-700 to-gray-800 shadow-lg',
        isSelected && 'ring-4 ring-hearthstone-gold scale-110',
        canAttack && minion.can_attack && 'ring-2 ring-hearthstone-green',
        isTargetable && 'ring-2 ring-hearthstone-red',
        hasTaunt && 'border-4 border-amber-500',
        'hover:scale-105'
      )}
      onClick={onClick}
    >
      {/* Minion Art */}
      <div className="w-full h-[70px] bg-gray-600 rounded-t-lg flex items-center justify-center text-2xl">
        👤
      </div>

      {/* Name */}
      <div className="px-1 py-0.5 bg-gradient-to-r from-amber-900 to-amber-800 mx-1 mt-1 rounded text-center">
        <span className="text-white text-[10px] font-semibold truncate block">
          {minion.name}
        </span>
      </div>

      {/* Divine Shield indicator */}
      {hasDivineShield && (
        <div className="absolute inset-0 rounded-lg border-2 border-cyan-400 opacity-50" />
      )}

      {/* Stats */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1">
        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-hearthstone-gold to-yellow-600 flex items-center justify-center text-black font-bold text-xs">
          {minion.attack}
        </div>
        <div className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs',
          minion.health < minion.max_health
            ? 'bg-gradient-to-b from-red-500 to-red-700 text-white'
            : 'bg-gradient-to-b from-hearthstone-red to-red-700 text-white'
        )}>
          {minion.health}
        </div>
      </div>

      {/* Can attack glow */}
      {minion.can_attack && (
        <div className="absolute inset-0 rounded-lg shadow-[0_0_10px_rgba(34,187,51,0.5)]" />
      )}
    </div>
  );
}
