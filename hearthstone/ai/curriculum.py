"""Curriculum FSM: transitions between RANDOM and SELF_PLAY phases."""
from enum import Enum


class Phase(str, Enum):
    RANDOM = "RANDOM"
    SELF_PLAY = "SELF_PLAY"


class CurriculumEvent(str, Enum):
    NONE = "none"
    NEW_BEST = "new_best"
    SWITCH_TO_SELF_PLAY = "switch_to_self_play"
    EARLY_STOP = "early_stop"


class CurriculumFSM:
    """Encapsulates curriculum state and transitions.

    Driven by per-eval winrate-vs-random measurements. Emits events that
    the run loop reacts to (saving best.pt, swapping opponent, breaking).

    Plateau detection only counts during SELF_PLAY phase. During RANDOM
    phase, "no improvement" is expected — agent is learning from scratch.
    """

    def __init__(self, switch_threshold: float, early_stop_patience: int):
        self.switch_threshold = switch_threshold
        self.early_stop_patience = early_stop_patience
        self.phase = Phase.RANDOM
        self.best_winrate = 0.0
        self.plateau_count = 0

    def update(self, winrate: float) -> CurriculumEvent:
        """Process a new eval result and return the transition event, if any."""
        # 1. Switch RANDOM → SELF_PLAY at threshold (takes precedence over NEW_BEST signal).
        if self.phase == Phase.RANDOM and winrate >= self.switch_threshold:
            self.phase = Phase.SELF_PLAY
            self.best_winrate = max(self.best_winrate, winrate)
            self.plateau_count = 0
            return CurriculumEvent.SWITCH_TO_SELF_PLAY

        # 2. New best?
        if winrate > self.best_winrate:
            self.best_winrate = winrate
            self.plateau_count = 0  # reset plateau on improvement
            return CurriculumEvent.NEW_BEST

        # 3. Not improving — only count toward plateau in SELF_PLAY.
        if self.phase == Phase.SELF_PLAY:
            self.plateau_count += 1
            if self.plateau_count >= self.early_stop_patience:
                return CurriculumEvent.EARLY_STOP

        return CurriculumEvent.NONE
