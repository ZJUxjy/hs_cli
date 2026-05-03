"""Builds the observation dict from a fireplace.Game + perspective Player."""
from __future__ import annotations

import numpy as np
from gymnasium import spaces

from .card_features import CardFeatureEncoder, SLOT_DIM


MAX_HAND = 10
MAX_BOARD = 7

SCALAR_KEYS = (
    "player_health", "player_armor", "player_mana", "player_max_mana",
    "player_overload", "player_hand_size", "player_board_size",
    "player_deck_size", "player_secrets_count",
    "opponent_health", "opponent_armor", "opponent_hand_size",
    "opponent_board_size", "opponent_deck_size", "opponent_secrets_count",
    "weapon_atk_player", "weapon_dur_player",
    "weapon_atk_opponent", "weapon_dur_opponent",
    "turn_number", "is_my_turn",
)

SCALAR_BOUNDS = {
    "player_health": (0, 60),  "player_armor": (0, 99),
    "player_mana": (0, 10), "player_max_mana": (0, 10),
    "player_overload": (0, 10),
    "player_hand_size": (0, 10), "player_board_size": (0, 7),
    "player_deck_size": (0, 60), "player_secrets_count": (0, 5),
    "opponent_health": (0, 60), "opponent_armor": (0, 99),
    "opponent_hand_size": (0, 10), "opponent_board_size": (0, 7),
    "opponent_deck_size": (0, 60), "opponent_secrets_count": (0, 5),
    "weapon_atk_player": (0, 20), "weapon_dur_player": (0, 20),
    "weapon_atk_opponent": (0, 20), "weapon_dur_opponent": (0, 20),
    "turn_number": (0, 100), "is_my_turn": (0, 1),
}

OBS_KEYS = (
    "player_hand", "player_board", "opponent_board",
    "just_drawn_card",
) + SCALAR_KEYS


def make_observation_space() -> spaces.Dict:
    return spaces.Dict({
        "player_hand": spaces.Box(0.0, 1.0, shape=(MAX_HAND, SLOT_DIM), dtype=np.float32),
        "player_board": spaces.Box(0.0, 1.0, shape=(MAX_BOARD, SLOT_DIM), dtype=np.float32),
        "opponent_board": spaces.Box(0.0, 1.0, shape=(MAX_BOARD, SLOT_DIM), dtype=np.float32),
        "just_drawn_card": spaces.Box(0.0, 1.0, shape=(SLOT_DIM,), dtype=np.float32),
        **{
            k: spaces.Box(low=lo, high=hi, shape=(1,), dtype=np.float32)
            for k, (lo, hi) in SCALAR_BOUNDS.items()
        },
    })


def _clip(value: float, lo: float, hi: float) -> float:
    return float(min(max(value, lo), hi))


def build_observation_for(game, perspective_player, latest_drawn_card_obj=None) -> dict:
    enc = CardFeatureEncoder()
    me = perspective_player
    opp = me.opponent

    player_hand = _stack_padded(
        [enc.encode_hand_card(c) for c in me.hand[:MAX_HAND]], MAX_HAND, enc,
    )
    player_board = _stack_padded(
        [enc.encode_minion(m) for m in me.field[:MAX_BOARD]], MAX_BOARD, enc,
    )
    opponent_board = _stack_padded(
        [enc.encode_minion(m) for m in opp.field[:MAX_BOARD]], MAX_BOARD, enc,
    )

    if latest_drawn_card_obj is not None:
        just_drawn_card = enc.encode_hand_card(latest_drawn_card_obj)
    else:
        just_drawn_card = np.zeros(SLOT_DIM, dtype=np.float32)

    weapon_me = me.weapon
    weapon_op = opp.weapon

    obs: dict = {
        "player_hand": player_hand,
        "player_board": player_board,
        "opponent_board": opponent_board,
        "just_drawn_card": just_drawn_card,
    }
    obs.update(_scalars_from(game, me, opp, weapon_me, weapon_op))
    return obs


def _stack_padded(rows, target_n, enc):
    if len(rows) < target_n:
        rows = list(rows) + [enc.encode_empty()] * (target_n - len(rows))
    return np.stack(rows, axis=0).astype(np.float32)


def _scalars_from(game, me, opp, weapon_me, weapon_op) -> dict:
    def s(value, key):
        lo, hi = SCALAR_BOUNDS[key]
        return np.array([_clip(value, lo, hi)], dtype=np.float32)

    return {
        "player_health":    s(me.hero.health, "player_health"),
        "player_armor":     s(me.hero.armor, "player_armor"),
        "player_mana":      s(me.mana, "player_mana"),
        "player_max_mana":  s(me.max_mana, "player_max_mana"),
        "player_overload":  s(me.overloaded, "player_overload"),
        "player_hand_size": s(len(me.hand), "player_hand_size"),
        "player_board_size": s(len(me.field), "player_board_size"),
        "player_deck_size": s(len(me.deck), "player_deck_size"),
        "player_secrets_count": s(len(me.secrets), "player_secrets_count"),
        "opponent_health":  s(opp.hero.health, "opponent_health"),
        "opponent_armor":   s(opp.hero.armor, "opponent_armor"),
        "opponent_hand_size": s(len(opp.hand), "opponent_hand_size"),
        "opponent_board_size": s(len(opp.field), "opponent_board_size"),
        "opponent_deck_size": s(len(opp.deck), "opponent_deck_size"),
        "opponent_secrets_count": s(len(opp.secrets), "opponent_secrets_count"),
        "weapon_atk_player": s(weapon_me.atk if weapon_me else 0, "weapon_atk_player"),
        "weapon_dur_player": s(weapon_me.durability if weapon_me else 0, "weapon_dur_player"),
        "weapon_atk_opponent": s(weapon_op.atk if weapon_op else 0, "weapon_atk_opponent"),
        "weapon_dur_opponent": s(weapon_op.durability if weapon_op else 0, "weapon_dur_opponent"),
        "turn_number":      s(game.turn, "turn_number"),
        "is_my_turn":       s(1 if game.current_player is me else 0, "is_my_turn"),
    }
