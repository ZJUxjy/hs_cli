"""Card embedding for AI input representation."""
from typing import List, Union
import numpy as np
from hearthstone.models.card import Card, Minion, Spell, Weapon
from hearthstone.models.enums import CardType, Ability


class CardEmbedding:
    """Encodes cards as fixed-dimension vectors for neural network input.

    Feature layout:
        [0]: cost (normalized 0-1, max 10)
        [1]: attack (minion/weapon, normalized 0-1, max 10)
        [2]: health (minion, normalized 0-1, max 10)
        [3]: effect_value (spell, normalized 0-1, max 10)
        [4]: durability (weapon, normalized 0-1, max 10)
        [5+]: ability one-hot encodings

    Abilities are encoded in the following order:
        CHARGE, TAUNT, DIVINE_SHIELD, WINDFURY, STEALTH, FROZEN,
        POISONOUS, LIFESTEAL, RUSH, REBORN, SPELL_DAMAGE, BATTLECRY,
        DEATHRATTLE, DISCOVER, COMBO, OVERLOAD, SECRET, FREEZE, SILENCE
    """

    ABILITIES = [
        Ability.CHARGE,
        Ability.TAUNT,
        Ability.DIVINE_SHIELD,
        Ability.WINDFURY,
        Ability.STEALTH,
        Ability.FROZEN,
        Ability.POISONOUS,
        Ability.LIFESTEAL,
        Ability.RUSH,
        Ability.REBORN,
        Ability.SPELL_DAMAGE,
        Ability.BATTLECRY,
        Ability.DEATHRATTLE,
        Ability.DISCOVER,
        Ability.COMBO,
        Ability.OVERLOAD,
        Ability.SECRET,
        Ability.FREEZE,
        Ability.SILENCE,
    ]

    def __init__(self, embedding_dim: int = 64):
        """Initialize the CardEmbedding.

        Args:
            embedding_dim: Dimension of the output embedding vector.
                          If smaller than 5, only cost will be encoded.
                          If between 5-24, only some abilities will be encoded.
        """
        self.embedding_dim = embedding_dim
        self.ability_to_idx = {ability: i for i, ability in enumerate(self.ABILITIES)}

    def encode(self, card: Card) -> np.ndarray:
        """Encode a single card as a vector.

        Args:
            card: The card to encode (Minion, Spell, or Weapon).

        Returns:
            A numpy array of shape (embedding_dim,) with dtype float32.
        """
        vector = np.zeros(self.embedding_dim, dtype=np.float32)

        # Normalize cost (max 10)
        vector[0] = min(card.cost / 10.0, 1.0)

        # Encode card-type-specific features
        if isinstance(card, Minion):
            # Attack and health (normalized, max 10)
            vector[1] = min(card.attack / 10.0, 1.0)
            vector[2] = min(card.health / 10.0, 1.0)

            # Encode abilities
            for ability in card.abilities:
                if ability in self.ability_to_idx:
                    idx = 5 + self.ability_to_idx[ability]
                    if idx < self.embedding_dim:
                        vector[idx] = 1.0

        elif isinstance(card, Spell):
            # Effect value (normalized, max 10)
            if card.effect_value is not None:
                vector[3] = min(card.effect_value / 10.0, 1.0)

        elif isinstance(card, Weapon):
            # Attack and durability (normalized, max 10)
            vector[1] = min(card.attack / 10.0, 1.0)
            vector[4] = min(card.durability / 10.0, 1.0)

        return vector

    def encode_hand(self, cards: List[Card], max_size: int = 10) -> np.ndarray:
        """Encode a hand of cards as a 2D array.

        Args:
            cards: List of cards in the hand.
            max_size: Maximum hand size (padding/truncation).

        Returns:
            A numpy array of shape (max_size, embedding_dim) with dtype float32.
            Cards beyond max_size are truncated.
            Empty slots are filled with zeros.
        """
        result = np.zeros((max_size, self.embedding_dim), dtype=np.float32)

        for i, card in enumerate(cards[:max_size]):
            result[i] = self.encode(card)

        return result

    def encode_board(self, minions: List[Minion], max_size: int = 7) -> np.ndarray:
        """Encode a board of minions as a 2D array.

        Args:
            minions: List of minions on the board.
            max_size: Maximum board size (padding/truncation).

        Returns:
            A numpy array of shape (max_size, embedding_dim) with dtype float32.
            Minions beyond max_size are truncated.
            Empty slots are filled with zeros.
        """
        result = np.zeros((max_size, self.embedding_dim), dtype=np.float32)

        for i, minion in enumerate(minions[:max_size]):
            result[i] = self.encode(minion)

        return result
