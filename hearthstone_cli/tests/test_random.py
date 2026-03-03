"""Tests for deterministic random number generator."""

import pickle

from hearthstone_cli.engine.random import DeterministicRNG
from hearthstone_cli.engine.state import RandomState


def test_rng_produces_deterministic_sequence():
    """相同种子产生相同序列"""
    rng1 = DeterministicRNG(seed=42)
    rng2 = DeterministicRNG(seed=42)
    seq1 = [rng1.random() for _ in range(10)]
    seq2 = [rng2.random() for _ in range(10)]
    assert seq1 == seq2


def test_rng_produces_different_sequences_with_different_seeds():
    """不同种子产生不同序列"""
    rng1 = DeterministicRNG(seed=42)
    rng2 = DeterministicRNG(seed=123)
    seq1 = [rng1.random() for _ in range(10)]
    seq2 = [rng2.random() for _ in range(10)]
    assert seq1 != seq2


def test_rng_randint_range():
    """randint产生指定范围的整数"""
    rng = DeterministicRNG(seed=42)
    for _ in range(100):
        value = rng.randint(1, 6)
        assert 1 <= value <= 6
        assert isinstance(value, int)


def test_rng_shuffle_changes_order():
    """shuffle改变列表顺序"""
    rng = DeterministicRNG(seed=42)
    original = list(range(20))
    shuffled = list(range(20))
    rng.shuffle(shuffled)
    # 顺序应该不同（概率极低会相同，但seed固定后行为确定）
    assert shuffled != original
    # 但元素应该相同
    assert sorted(shuffled) == original


def test_rng_state_can_be_saved_and_restored():
    """随机状态可以保存和恢复"""
    rng1 = DeterministicRNG(seed=42)
    # 生成一些随机数
    values_before = [rng1.random() for _ in range(5)]

    # 保存状态
    state = rng1.get_state()

    # 继续生成
    values_after_save = [rng1.random() for _ in range(5)]

    # 从状态恢复
    rng2 = DeterministicRNG.from_state(state)
    values_after_restore = [rng2.random() for _ in range(5)]

    # 恢复后的序列应该与保存前继续生成的序列相同
    assert values_after_restore == values_after_save


def test_rng_state_is_serializable():
    """状态可以序列化（可哈希）"""
    rng = DeterministicRNG(seed=42)
    # 生成一些随机数
    for _ in range(10):
        rng.random()

    state = rng.get_state()

    # 验证是可哈希的（frozen dataclass）
    assert isinstance(state, RandomState)
    assert state.seed == 42
    assert state.sequence_position == 10

    # 验证可以pickle序列化
    pickled = pickle.dumps(state)
    restored_state = pickle.loads(pickled)
    assert restored_state == state

    # 验证可以用作dict key
    d = {state: "test"}
    assert d[state] == "test"


def test_rng_choice():
    """choice从序列中选择元素"""
    rng = DeterministicRNG(seed=42)
    items = ["a", "b", "c", "d", "e"]
    chosen = rng.choice(items)
    assert chosen in items


def test_rng_sample():
    """sample无放回抽样"""
    rng = DeterministicRNG(seed=42)
    items = list(range(10))
    sample = rng.sample(items, 5)
    assert len(sample) == 5
    assert len(set(sample)) == 5  # 无重复
    assert all(x in items for x in sample)


def test_rng_call_count_tracking():
    """调用计数正确跟踪"""
    rng = DeterministicRNG(seed=42)
    assert rng.get_state().sequence_position == 0

    rng.random()
    assert rng.get_state().sequence_position == 1

    rng.randint(1, 10)
    assert rng.get_state().sequence_position == 2

    rng.choice([1, 2, 3])
    assert rng.get_state().sequence_position == 3

    rng.shuffle([1, 2, 3])
    assert rng.get_state().sequence_position == 4

    rng.sample([1, 2, 3], 2)
    assert rng.get_state().sequence_position == 5
