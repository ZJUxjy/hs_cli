"""Reward function from training player's perspective."""
from __future__ import annotations

from hearthstone.enums import PlayState


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
    DAMAGE_OPP_COEF  = 0.01
    DAMAGE_SELF_COEF = -0.01
    BOARD_DELTA_COEF = 0.05
    WIN_REWARD  = 1.0
    LOSS_REWARD = -1.0
    TIE_REWARD  = 0.0

    def calc(self, before: dict, after: dict, training_player) -> float:
        if after["ended"] and not before["ended"]:
            ps = after["p_playstate"]
            if ps == PlayState.WON:
                return self.WIN_REWARD
            if ps == PlayState.LOST:
                return self.LOSS_REWARD
            return self.TIE_REWARD

        opp_eh_b = before["o_health"] + before["o_armor"]
        opp_eh_a = after["o_health"]  + after["o_armor"]
        own_eh_b = before["p_health"] + before["p_armor"]
        own_eh_a = after["p_health"]  + after["p_armor"]

        opp_damage_dealt  = opp_eh_b - opp_eh_a
        self_damage_taken = own_eh_b - own_eh_a

        r  = self.DAMAGE_OPP_COEF  * opp_damage_dealt
        r += self.DAMAGE_SELF_COEF * self_damage_taken
        r += self.BOARD_DELTA_COEF * (after["p_board"] - before["p_board"])
        r -= self.BOARD_DELTA_COEF * (after["o_board"] - before["o_board"])
        return float(r)
