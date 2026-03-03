"""Observation encoder for Hearthstone Gymnasium environment."""

from typing import Any, Dict, List

from hearthstone_cli.engine.state import GameState, Attribute


class ObservationEncoder:
    """观察值编码器"""

    MAX_HAND_SIZE = 10
    MAX_BOARD_SIZE = 7
    MAX_DECK_SIZE = 40

    @classmethod
    def encode(cls, game: GameState, player: int) -> Dict[str, Any]:
        me = game.players[player]
        enemy = game.players[1 - player]

        return {
            **cls._encode_scalar_features(me, enemy, game),
            "my_hand": cls._encode_hand(me.hand),
            "my_hand_mask": cls._create_mask(len(me.hand), cls.MAX_HAND_SIZE),
            "my_board": cls._encode_board(me.board),
            "my_board_mask": cls._create_mask(len(me.board), cls.MAX_BOARD_SIZE),
            "enemy_board": cls._encode_board(enemy.board),
            "enemy_board_mask": cls._create_mask(len(enemy.board), cls.MAX_BOARD_SIZE),
            "my_deck_size": len(me.deck) / cls.MAX_DECK_SIZE,
            "enemy_deck_size": len(enemy.deck) / cls.MAX_DECK_SIZE,
        }

    @classmethod
    def _encode_scalar_features(cls, me, enemy, game) -> Dict[str, float]:
        return {
            "my_hero_health": me.hero.health / 30,
            "my_hero_armor": me.hero.armor / 20,
            "my_mana_current": me.mana.current / 10,
            "my_mana_max": me.mana.max_mana / 10,
            "opponent_hero_health": enemy.hero.health / 30,
            "opponent_hero_armor": enemy.hero.armor / 20,
            "turn": min(game.turn / 50, 1.0),
            "is_my_turn": 1.0 if game.active_player == 0 else 0.0,
            "has_weapon": 1.0 if me.hero.weapon else 0.0,
            "weapon_attack": (me.hero.weapon.attack / 10) if me.hero.weapon else 0.0,
            "weapon_durability": (me.hero.weapon.durability / 10) if me.hero.weapon else 0.0,
            "opponent_secrets_count": len(enemy.secrets) / 5,
            "my_secrets_count": len(me.secrets) / 5,
        }

    @classmethod
    def _encode_hand(cls, hand: tuple) -> List[List[float]]:
        encoded = []
        for card in hand:
            encoded.append(cls._encode_card(card))
        while len(encoded) < cls.MAX_HAND_SIZE:
            encoded.append([0.0] * 10)
        return encoded[:cls.MAX_HAND_SIZE]

    @classmethod
    def _encode_board(cls, board: tuple) -> List[List[float]]:
        encoded = []
        for minion in board:
            encoded.append(cls._encode_minion(minion))
        while len(encoded) < cls.MAX_BOARD_SIZE:
            encoded.append([0.0] * 15)
        return encoded[:cls.MAX_BOARD_SIZE]

    @classmethod
    def _encode_card(cls, card) -> List[float]:
        return [
            card.cost / 10,
            (card.attack or 0) / 10,
            (card.health or 0) / 10,
            (card.durability or 0) / 10,
            1.0 if card.card_type == "MINION" else 0.0,
            1.0 if card.card_type == "SPELL" else 0.0,
            1.0 if card.card_type == "WEAPON" else 0.0,
            0.0, 0.0, 0.0,
        ]

    @classmethod
    def _encode_minion(cls, minion) -> List[float]:
        return [
            minion.attack / 10,
            minion.health / 10,
            minion.max_health / 10,
            minion.damage_taken / 10,
            1.0 if Attribute.TAUNT in minion.attributes else 0.0,
            1.0 if Attribute.DIVINE_SHIELD in minion.attributes else 0.0,
            1.0 if Attribute.WINDFURY in minion.attributes else 0.0,
            1.0 if Attribute.CHARGE in minion.attributes else 0.0,
            1.0 if Attribute.STEALTH in minion.attributes else 0.0,
            1.0 if Attribute.POISONOUS in minion.attributes else 0.0,
            1.0 if minion.exhausted else 0.0,
            1.0 if minion.summoned_this_turn else 0.0,
            0.0, 0.0, 0.0,
        ]

    @classmethod
    def _create_mask(cls, actual: int, max_size: int) -> List[int]:
        return [1] * actual + [0] * (max_size - actual)
