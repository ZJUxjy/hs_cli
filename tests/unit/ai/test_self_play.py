import pytest


def test_self_play_trainer_exists():
    """Test that SelfPlayTrainer can be imported."""
    from hearthstone.ai.self_play import SelfPlayTrainer
    trainer = SelfPlayTrainer(agent_class=None, deck_pool=[])
    assert trainer is not None


def test_select_decks():
    """Test deck selection."""
    from hearthstone.ai.self_play import SelfPlayTrainer
    from hearthstone.models.card import Minion
    from hearthstone.models.enums import CardType

    deck1 = [
        Minion(id='1', name='A', cost=1, card_type=CardType.MINION, attack=1, health=1),
        Minion(id='2', name='B', cost=2, card_type=CardType.MINION, attack=2, health=2),
    ]
    deck2 = [
        Minion(id='3', name='C', cost=3, card_type=CardType.MINION, attack=3, health=3),
    ]

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
