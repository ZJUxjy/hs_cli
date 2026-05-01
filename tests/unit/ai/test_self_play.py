import pytest


def test_self_play_trainer_exists():
    """Test that SelfPlayTrainer can be imported."""
    from hearthstone.ai.self_play import SelfPlayTrainer
    trainer = SelfPlayTrainer(agent_class=None, deck_pool=[])
    assert trainer is not None


def test_select_decks():
    """Test deck selection.

    SelfPlayTrainer is engine-agnostic — deck_pool entries are just opaque
    list-shaped values. Use plain card-id strings (matching the fireplace
    deck representation) as stand-ins.
    """
    from hearthstone.ai.self_play import SelfPlayTrainer

    deck1 = ["CS2_182", "CS2_120"]
    deck2 = ["CS2_124"]

    trainer = SelfPlayTrainer(agent_class=None, deck_pool=[deck1, deck2])
    d1, d2 = trainer.select_decks()

    # Check that we get two different decks with the expected sizes
    # (order may vary due to random sampling)
    assert len(d1) in [1, 2]
    assert len(d2) in [1, 2]
    assert len(d1) != len(d2)  # Should be two different decks


def test_record_episode():
    """Test episode recording."""
    from hearthstone.ai.self_play import SelfPlayTrainer

    trainer = SelfPlayTrainer(agent_class=None, deck_pool=[])

    result = {'winner': 'player1', 'turns': 10}
    trainer.record_episode(result)

    assert len(trainer.episode_history) == 1
    assert trainer.episode_history[0] == result


def test_get_stats():
    """Test statistics calculation."""
    from hearthstone.ai.self_play import SelfPlayTrainer

    trainer = SelfPlayTrainer(agent_class=None, deck_pool=[])

    trainer.record_episode({'winner': 'player1', 'turns': 10})
    trainer.record_episode({'winner': 'player2', 'turns': 20})

    stats = trainer.get_stats()

    assert stats['episodes'] == 2
    assert stats['avg_turns'] == 15.0


def test_select_decks_empty_pool():
    """Test that empty deck_pool raises clear error."""
    from hearthstone.ai.self_play import SelfPlayTrainer

    trainer = SelfPlayTrainer(agent_class=None, deck_pool=[])

    with pytest.raises(ValueError, match="deck_pool is empty"):
        trainer.select_decks()
