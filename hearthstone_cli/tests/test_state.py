"""Tests for core state definitions."""

import pytest
from hearthstone_cli.engine.state import (
    Attribute,
    Card,
    Enchantment,
    GameState,
    HeroState,
    ManaState,
    Minion,
    PlayerState,
    RandomState,
    Secret,
    WeaponState,
    Zone,
)


def test_game_state_is_frozen():
    """Test that GameState is immutable."""
    state = GameState.create_new(seed=42)
    with pytest.raises(AttributeError):
        state.turn = 2


def test_player_state_is_frozen():
    """Test that PlayerState is immutable."""
    hero = HeroState(health=30)
    mana = ManaState(current=1, max_mana=1)
    player = PlayerState(
        hero=hero,
        mana=mana,
        deck=(),
        hand=(),
        board=(),
        secrets=frozenset(),
        graveyard=(),
        attacks_this_turn=tuple(),
        hero_power_used=False,
    )
    with pytest.raises(AttributeError):
        player.hero_power_used = True


def test_player_state_creation():
    """Test player state creation with all fields."""
    hero = HeroState(health=30, armor=5)
    mana = ManaState(current=5, max_mana=10)
    card = Card(
        card_id="CS1_042",
        name="Goldshire Footman",
        cost=1,
        card_type="minion",
        attack=1,
        health=2,
    )
    player = PlayerState(
        hero=hero,
        mana=mana,
        deck=(card,),
        hand=(card,),
        board=(),
        secrets=frozenset(),
        graveyard=(),
        attacks_this_turn=tuple(),
        hero_power_used=False,
    )

    assert player.hero.health == 30
    assert player.hero.armor == 5
    assert player.mana.current == 5
    assert player.mana.max_mana == 10
    assert len(player.deck) == 1
    assert len(player.hand) == 1


def test_mana_state_cannot_exceed_max():
    """Test mana state properties."""
    mana = ManaState(current=5, max_mana=10)
    assert mana.current <= mana.max_mana
    assert mana.overload == 0
    assert mana.locked == 0

    mana_with_overload = ManaState(current=3, max_mana=10, overload=2, locked=1)
    assert mana_with_overload.overload == 2
    assert mana_with_overload.locked == 1


def test_mana_state_is_frozen():
    """Test that ManaState is immutable."""
    mana = ManaState(current=5, max_mana=10)
    with pytest.raises(AttributeError):
        mana.current = 6


def test_minion_has_correct_stats():
    """Test minion attributes and properties."""
    minion = Minion(
        card_id="CS1_042",
        attack=2,
        health=3,
        max_health=3,
        attributes=frozenset({Attribute.TAUNT}),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=True,
        exhausted=True,
    )

    assert minion.attack == 2
    assert minion.health == 3
    assert minion.max_health == 3
    assert Attribute.TAUNT in minion.attributes
    assert minion.is_alive is True


def test_minion_is_alive_property():
    """Test minion is_alive property."""
    alive_minion = Minion(
        card_id="CS1_042",
        attack=2,
        health=3,
        max_health=3,
        attributes=frozenset(),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=False,
        exhausted=False,
    )
    assert alive_minion.is_alive is True

    dead_minion = Minion(
        card_id="CS1_042",
        attack=2,
        health=0,
        max_health=3,
        attributes=frozenset(),
        enchantments=(),
        damage_taken=3,
        summoned_this_turn=False,
        exhausted=False,
    )
    assert dead_minion.is_alive is False


def test_minion_is_frozen():
    """Test that Minion is immutable."""
    minion = Minion(
        card_id="CS1_042",
        attack=2,
        health=3,
        max_health=3,
        attributes=frozenset(),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=True,
        exhausted=True,
    )
    with pytest.raises(AttributeError):
        minion.attack = 5


def test_hero_state_with_weapon():
    """Test hero state with weapon equipped."""
    weapon = WeaponState(
        card_id="CS2_106",
        attack=3,
        durability=2,
        max_durability=2,
        attributes=frozenset(),
    )
    hero = HeroState(health=25, max_health=30, armor=3, weapon=weapon)

    assert hero.health == 25
    assert hero.max_health == 30
    assert hero.armor == 3
    assert hero.weapon is not None
    assert hero.weapon.attack == 3
    assert hero.weapon.durability == 2


def test_hero_state_is_frozen():
    """Test that HeroState is immutable."""
    hero = HeroState(health=30)
    with pytest.raises(AttributeError):
        hero.health = 25


def test_weapon_state_is_frozen():
    """Test that WeaponState is immutable."""
    weapon = WeaponState(
        card_id="CS2_106",
        attack=3,
        durability=2,
        max_durability=2,
    )
    with pytest.raises(AttributeError):
        weapon.durability = 1


def test_card_creation():
    """Test card creation with various types."""
    minion_card = Card(
        card_id="CS1_042",
        name="Goldshire Footman",
        cost=1,
        card_type="minion",
        attack=1,
        health=2,
    )
    assert minion_card.attack == 1
    assert minion_card.health == 2
    assert minion_card.durability is None

    weapon_card = Card(
        card_id="CS2_106",
        name="Fiery War Axe",
        cost=2,
        card_type="weapon",
        attack=3,
        durability=2,
    )
    assert weapon_card.attack == 3
    assert weapon_card.durability == 2
    assert weapon_card.health is None

    spell_card = Card(
        card_id="CS2_024",
        name="Frostbolt",
        cost=2,
        card_type="spell",
    )
    assert spell_card.attack is None
    assert spell_card.health is None
    assert spell_card.durability is None


def test_card_is_frozen():
    """Test that Card is immutable."""
    card = Card(
        card_id="CS1_042",
        name="Goldshire Footman",
        cost=1,
        card_type="minion",
    )
    with pytest.raises(AttributeError):
        card.cost = 2


def test_card_with_attributes():
    """Test card with attributes."""
    card = Card(
        card_id="CS1_042",
        name="Goldshire Footman",
        cost=1,
        card_type="minion",
        attack=1,
        health=2,
        attributes=frozenset({Attribute.TAUNT}),
    )
    assert Attribute.TAUNT in card.attributes


def test_enchantment_creation():
    """Test enchantment creation."""
    enchantment = Enchantment(
        source="spell",
        attack_bonus=2,
        health_bonus=2,
        one_turn=True,
    )
    assert enchantment.source == "spell"
    assert enchantment.attack_bonus == 2
    assert enchantment.health_bonus == 2
    assert enchantment.one_turn is True


def test_enchantment_is_frozen():
    """Test that Enchantment is immutable."""
    enchantment = Enchantment(source="spell")
    with pytest.raises(AttributeError):
        enchantment.attack_bonus = 1


def test_secret_creation():
    """Test secret creation."""
    secret = Secret(card_id="EX1_609", trigger_type="play_minion")
    assert secret.card_id == "EX1_609"
    assert secret.trigger_type == "play_minion"


def test_secret_is_frozen():
    """Test that Secret is immutable."""
    secret = Secret(card_id="EX1_609", trigger_type="attack_hero")
    with pytest.raises(AttributeError):
        secret.card_id = "EX1_610"


def test_game_state_creation():
    """Test game state creation."""
    state = GameState.create_new(seed=123)
    assert state.turn == 1
    assert state.active_player == 0
    assert len(state.players) == 2
    assert state.rng_state.seed == 123


def test_random_state_is_frozen():
    """Test that RandomState is immutable."""
    rng = RandomState(seed=42, sequence_position=5)
    with pytest.raises(AttributeError):
        rng.seed = 100


def test_zone_enum():
    """Test Zone enum values."""
    assert Zone.DECK.name == "DECK"
    assert Zone.HAND.name == "HAND"
    assert Zone.BOARD.name == "BOARD"
    assert Zone.GRAVEYARD.name == "GRAVEYARD"
    assert Zone.HERO.name == "HERO"
    assert Zone.WEAPON.name == "WEAPON"


def test_attribute_enum():
    """Test Attribute enum values."""
    assert Attribute.TAUNT.name == "TAUNT"
    assert Attribute.DIVINE_SHIELD.name == "DIVINE_SHIELD"
    assert Attribute.WINDFURY.name == "WINDFURY"
    assert Attribute.CHARGE.name == "CHARGE"
    assert Attribute.STEALTH.name == "STEALTH"
    assert Attribute.POISONOUS.name == "POISONOUS"
    assert Attribute.LIFESTEAL.name == "LIFESTEAL"
    assert Attribute.ELUSIVE.name == "ELUSIVE"


def test_player_with_secrets():
    """Test player state with secrets."""
    secret1 = Secret(card_id="EX1_609", trigger_type="play_minion")
    secret2 = Secret(card_id="EX1_610", trigger_type="attack_hero")
    hero = HeroState(health=30)
    mana = ManaState(current=1, max_mana=1)
    player = PlayerState(
        hero=hero,
        mana=mana,
        deck=(),
        hand=(),
        board=(),
        secrets=frozenset({secret1, secret2}),
        graveyard=(),
        attacks_this_turn=tuple(),
        hero_power_used=False,
    )
    assert len(player.secrets) == 2
    assert secret1 in player.secrets
    assert secret2 in player.secrets


def test_player_with_board():
    """Test player state with minions on board."""
    minion1 = Minion(
        card_id="CS1_042",
        attack=1,
        health=2,
        max_health=2,
        attributes=frozenset({Attribute.TAUNT}),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=False,
        exhausted=False,
    )
    minion2 = Minion(
        card_id="CS2_121",
        attack=2,
        health=2,
        max_health=2,
        attributes=frozenset({Attribute.CHARGE}),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=True,
        exhausted=True,
    )
    hero = HeroState(health=30)
    mana = ManaState(current=1, max_mana=1)
    player = PlayerState(
        hero=hero,
        mana=mana,
        deck=(),
        hand=(),
        board=(minion1, minion2),
        secrets=frozenset(),
        graveyard=(),
        attacks_this_turn=tuple(),
        hero_power_used=False,
    )
    assert len(player.board) == 2
    assert player.board[0].card_id == "CS1_042"
    assert player.board[1].card_id == "CS2_121"


def test_minion_with_enchantments():
    """Test minion with enchantments."""
    enchantment1 = Enchantment(
        source="spell1",
        attack_bonus=1,
        health_bonus=1,
        one_turn=False,
    )
    enchantment2 = Enchantment(
        source="spell2",
        attack_bonus=2,
        health_bonus=0,
        one_turn=True,
    )
    minion = Minion(
        card_id="CS1_042",
        attack=3,
        health=4,
        max_health=3,
        attributes=frozenset(),
        enchantments=(enchantment1, enchantment2),
        damage_taken=0,
        summoned_this_turn=False,
        exhausted=False,
    )
    assert len(minion.enchantments) == 2
    assert minion.enchantments[0].attack_bonus == 1
    assert minion.enchantments[1].attack_bonus == 2
