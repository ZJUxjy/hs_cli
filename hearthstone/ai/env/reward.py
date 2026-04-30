# hearthstone/ai/env/reward.py -- phase 3 stub; phase 4 replaces this.
"""Reward function (phase-3 stub; phase 4 replaces with proper logic)."""


def reward_snapshot(env) -> dict:
    p = env.training_player
    o = env.opponent_player
    return {
        "p_health": p.hero.health, "p_armor": p.hero.armor,
        "o_health": o.hero.health, "o_armor": o.hero.armor,
        "p_board": len(p.field), "o_board": len(o.field),
        "ended": env.game.ended,
        "p_playstate": p.playstate,
    }


class RewardFunction:
    def calc(self, before: dict, after: dict, training_player) -> float:
        return 0.0
