// web/frontend/src/components/game/Board.tsx

import { Minion } from './Minion';
import { Minion as MinionType } from '../../types/card';

interface BoardProps {
  minions: MinionType[];
  selectedMinion: string | null;
  attackableMinions: string[];
  onMinionClick: (id: string) => void;
}

export function Board({
  minions,
  selectedMinion,
  attackableMinions,
  onMinionClick,
}: BoardProps) {
  return (
    <div className="flex justify-center items-center gap-2 min-h-[160px] py-2">
      {minions.length === 0 ? (
        <div className="w-full h-[140px] border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500">
          Empty Board
        </div>
      ) : (
        minions.map((minion) => (
          <Minion
            key={minion.instance_id}
            minion={minion}
            onClick={() => onMinionClick(minion.instance_id)}
            isSelected={selectedMinion === minion.instance_id}
            isTargetable={attackableMinions.includes(minion.instance_id)}
          />
        ))
      )}
    </div>
  );
}
