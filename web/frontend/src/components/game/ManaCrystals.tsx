// web/frontend/src/components/game/ManaCrystals.tsx

import { clsx } from 'clsx';

interface ManaCrystalsProps {
  current: number;
  max: number;
}

export function ManaCrystals({ current, max }: ManaCrystalsProps) {
  const crystals = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="flex items-center gap-1">
      {crystals.map((i) => (
        <div
          key={i}
          className={clsx(
            'w-6 h-8 rounded-sm transition-all',
            i < max
              ? i < current
                ? 'bg-gradient-to-b from-hearthstone-blue to-blue-700 shadow-md'
                : 'bg-gradient-to-b from-gray-500 to-gray-700 opacity-50'
              : 'bg-gray-800 opacity-30'
          )}
        />
      ))}
      <span className="ml-2 text-white font-bold">
        {current}/{max}
      </span>
    </div>
  );
}
