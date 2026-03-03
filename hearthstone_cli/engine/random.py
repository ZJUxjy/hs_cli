"""Deterministic random number generator for Hearthstone CLI game."""

import random
from typing import List

from hearthstone_cli.engine.state import RandomState


class DeterministicRNG:
    """确定性随机数生成器

    确保相同种子产生完全相同的序列，支持状态保存和恢复。
    这对AI训练和复现对局至关重要。
    """

    def __init__(self, seed: int):
        self._rng = random.Random(seed)
        self._call_count = 0
        self._seed = seed

    def random(self) -> float:
        """生成[0, 1)范围的随机浮点数"""
        self._call_count += 1
        return self._rng.random()

    def randint(self, a: int, b: int) -> int:
        """生成[a, b]范围的随机整数"""
        self._call_count += 1
        return self._rng.randint(a, b)

    def choice(self, seq: List):
        """从序列中随机选择"""
        self._call_count += 1
        return self._rng.choice(seq)

    def shuffle(self, lst: List) -> None:
        """随机打乱列表（原地）"""
        self._call_count += 1
        self._rng.shuffle(lst)

    def sample(self, population: List, k: int) -> List:
        """无放回抽样"""
        self._call_count += 1
        return self._rng.sample(population, k)

    def get_state(self) -> RandomState:
        """获取当前状态（可序列化）"""
        return RandomState(
            seed=self._seed,
            sequence_position=self._call_count
        )

    @classmethod
    def from_state(cls, state: RandomState) -> "DeterministicRNG":
        """从保存的状态恢复"""
        rng = cls(state.seed)
        # 恢复到指定位置
        for _ in range(state.sequence_position):
            rng._rng.random()
        rng._call_count = state.sequence_position
        return rng
