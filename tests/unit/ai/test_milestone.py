"""Tests for MilestoneRunner."""
import os
import pytest


def test_milestone_runner_creates_output_dir(tmp_path):
    from hearthstone.ai.milestone import MilestoneRunner
    out = tmp_path / "milestones"
    assert not out.exists()
    runner = MilestoneRunner(output_dir=str(out))
    assert out.is_dir()
    runner.shutdown(wait=False)


def test_milestone_runner_cleans_partial_csvs_on_init(tmp_path):
    from hearthstone.ai.milestone import MilestoneRunner
    out = tmp_path / "milestones"
    out.mkdir()
    stale = out / "iter_0001"
    stale.mkdir()
    partial = stale / "heatmap.csv.partial"
    partial.write_text("stale data")
    assert partial.exists()
    runner = MilestoneRunner(output_dir=str(out))
    assert not partial.exists()
    runner.shutdown(wait=False)


def test_milestone_runner_uses_spawn_context(tmp_path, monkeypatch):
    """The executor should be constructed with mp_context=spawn."""
    from hearthstone.ai import milestone
    captured = {}
    real = milestone.ProcessPoolExecutor

    def fake(*args, **kwargs):
        captured.update(kwargs)
        return real(*args, **kwargs)

    monkeypatch.setattr(milestone, "ProcessPoolExecutor", fake)
    runner = milestone.MilestoneRunner(output_dir=str(tmp_path / "m"))
    runner.shutdown(wait=False)
    assert "mp_context" in captured
    assert captured["mp_context"].get_start_method() == "spawn"


def _make_tiny_ckpt(tmp_path, hidden_dim=64):
    """Save a fresh PolicyValueNetwork to disk. Returns path."""
    import torch
    from hearthstone.ai.network import PolicyValueNetwork
    net = PolicyValueNetwork(slot_dim=90, hidden_dim=hidden_dim, num_actions=512)
    path = str(tmp_path / "tiny.pt")
    torch.save({
        "network": net.state_dict(),
        "config": {
            "slot_dim": 90, "hidden_dim": hidden_dim, "num_actions": 512,
        },
    }, path)
    return path


@pytest.mark.slow
def test_milestone_end_to_end_two_decks_one_game(tmp_path):
    """Submit one milestone with 2 decks × 1 game; assert CSV has 4 rows
    (2 ordered pairs × 2 training_player_idx) with the expected schema."""
    import csv
    from hearthstone.ai.milestone import MilestoneRunner
    out = tmp_path / "milestones"
    runner = MilestoneRunner(output_dir=str(out))
    ckpt = _make_tiny_ckpt(tmp_path)

    csv_path = runner.submit(
        iter_num=1, checkpoint_path=ckpt,
        deck_names=["aggro_mage", "control_warrior"],
        games_per_matchup=1, slot_dim=90, num_actions=512,
    )
    runner.shutdown(wait=True)        # block until subprocess finishes

    assert os.path.exists(csv_path), f"expected milestone CSV at {csv_path}"
    with open(csv_path) as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 4    # 2 ordered pairs × 2 tp_idx
    assert set(rows[0].keys()) == {
        "deck_a", "deck_b", "training_player_idx",
        "n_games", "winrate", "cap_hit_count",
    }
    for row in rows:
        assert 0.0 <= float(row["winrate"]) <= 1.0
        assert int(row["cap_hit_count"]) >= 0


@pytest.mark.slow
def test_failed_subprocess_logs_and_continues(tmp_path, caplog):
    """Submit with a non-existent ckpt path; collect_completed; assert
    logger.error fired; assert no exception escapes."""
    import logging
    from hearthstone.ai.milestone import MilestoneRunner
    runner = MilestoneRunner(output_dir=str(tmp_path / "m"))
    bad_ckpt = str(tmp_path / "does_not_exist.pt")
    # We need bad_ckpt to NOT exist so shutil.copy in submit fails. But
    # submit() itself does the copy synchronously, so it would raise here
    # before futures even get involved. To exercise the subprocess error
    # path, write a tiny FILE that's not a valid checkpoint and let the
    # subprocess try to torch.load it.
    bad_ckpt_path = tmp_path / "bad_ckpt.pt"
    bad_ckpt_path.write_text("not a valid torch checkpoint")
    runner.submit(
        iter_num=99, checkpoint_path=str(bad_ckpt_path),
        deck_names=["aggro_mage", "control_warrior"],
        games_per_matchup=1, slot_dim=90, num_actions=512,
    )
    # Wait for subprocess to fail
    import time
    deadline = time.time() + 60
    while runner._pending and time.time() < deadline:
        runner.collect_completed()
        time.sleep(1)
    # Final collect
    runner.collect_completed()
    runner.shutdown(wait=True)

    error_records = [r for r in caplog.records if r.levelno >= logging.ERROR]
    assert len(error_records) >= 1, "expected subprocess failure logged"
