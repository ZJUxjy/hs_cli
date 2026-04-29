"""Tests for CurriculumFSM."""
import pytest
from hearthstone.ai.curriculum import CurriculumFSM, Phase, CurriculumEvent


@pytest.fixture
def fsm():
    return CurriculumFSM(switch_threshold=0.80, early_stop_patience=3)


class TestCurriculumFSM:
    def test_starts_in_random_phase(self, fsm):
        assert fsm.phase == Phase.RANDOM
        assert fsm.best_winrate == 0.0
        assert fsm.plateau_count == 0

    def test_new_best_is_emitted(self, fsm):
        event = fsm.update(0.30)
        assert event == CurriculumEvent.NEW_BEST
        assert fsm.best_winrate == 0.30

    def test_no_event_when_below_best(self, fsm):
        fsm.update(0.50)
        event = fsm.update(0.40)
        assert event == CurriculumEvent.NONE
        assert fsm.best_winrate == 0.50

    def test_switches_at_threshold(self, fsm):
        fsm.update(0.50)
        event = fsm.update(0.85)
        assert event == CurriculumEvent.SWITCH_TO_SELF_PLAY
        assert fsm.phase == Phase.SELF_PLAY
        assert fsm.plateau_count == 0  # reset on transition
        assert fsm.best_winrate == 0.85

    def test_no_switch_below_threshold(self, fsm):
        fsm.update(0.79)
        assert fsm.phase == Phase.RANDOM

    def test_switch_only_fires_once(self, fsm):
        fsm.update(0.85)
        event = fsm.update(0.90)
        assert event == CurriculumEvent.NEW_BEST  # not SWITCH again

    def test_plateau_only_counts_in_self_play(self, fsm):
        fsm.update(0.50)
        fsm.update(0.30)  # below best — plateau in RANDOM (must not count)
        fsm.update(0.40)
        fsm.update(0.20)
        assert fsm.plateau_count == 0
        assert fsm.phase == Phase.RANDOM

    def test_early_stop_after_patience(self, fsm):
        # Get into SELF_PLAY with best=0.85
        fsm.update(0.85)  # SWITCH
        # Now feed 3 non-improving evals
        assert fsm.update(0.60) == CurriculumEvent.NONE
        assert fsm.plateau_count == 1
        assert fsm.update(0.70) == CurriculumEvent.NONE
        assert fsm.plateau_count == 2
        event = fsm.update(0.65)
        assert fsm.plateau_count == 3
        assert event == CurriculumEvent.EARLY_STOP

    def test_new_best_resets_plateau(self, fsm):
        fsm.update(0.85)  # switch
        fsm.update(0.60)  # plateau=1
        fsm.update(0.70)  # plateau=2
        fsm.update(0.90)  # NEW_BEST → reset
        assert fsm.plateau_count == 0
        assert fsm.update(0.70) == CurriculumEvent.NONE
        assert fsm.plateau_count == 1
