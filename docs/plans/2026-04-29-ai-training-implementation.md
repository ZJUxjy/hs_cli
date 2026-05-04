# AI Training Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working PPO-based RL training pipeline for the Hearthstone game engine that can learn non-trivial play.

**Architecture:** 7 sequential tasks. First add PyTorch (required by later tasks), then fix two correctness bugs (reward perspective, observation perspective) and upgrade the observation space with `CardEmbedding`. Then build PPO bottom-up: a sequential `RolloutBuffer` with GAE, a shared-body Policy/Value network, and a PPO trainer that consumes rollouts. Finally, fix `BatchSimulator` to use real multi-process parallelism. Each task produces independently testable code.

**Tech Stack:** Python 3.10+, PyTorch, Gymnasium, NumPy. Existing: FastAPI (unused by training), rich (CLI rendering).

**Design notes locked here so later tasks stay consistent:**
- **Training player perspective.** The training agent is always Player 1 (`training_player_name = "player1"`). Both reward and observation must be computed from that fixed perspective regardless of whose turn it is. Using `state.current_player` for perspective is the bug Task 2 fixes.
- **Replay vs Rollout.** PPO is on-policy. We use a sequential `RolloutBuffer` that stores full trajectories and computes GAE in order. Random replay sampling is incompatible with GAE/PPO and is *not* used.
- **Observation dict.** 12 keys total: 3 card-embedding tensors (`player_hand` 10×64, `player_board` 7×64, `opponent_board` 7×64) + 9 scalar boxes (`player_health`, `player_mana`, `player_max_mana`, `player_hand_size`, `player_board_size`, `opponent_health`, `opponent_board_size`, `turn_number`, `player_deck_size`). All 9 scalars are fed to the network.
- **Decks.** `test_deck` resolves to `data/decks/test_deck.json` via `DeckManager` and is verified to exist.

---

### Task 1: Add PyTorch Dependency

PyTorch is required by Tasks 5–7. Adding it first ensures every subsequent task's tests can `import torch`.

**Files:**
- Modify: `pyproject.toml`
- Modify: `requirements.txt`

- [ ] **Step 1: Add torch to pyproject.toml dependencies**

Modify `pyproject.toml`:

```toml
dependencies = [
    "gymnasium>=0.29.0",
    "numpy>=1.24.0",
    "rich>=13.0.0",
    "torch>=2.0.0",
]
```

- [ ] **Step 2: Add torch to requirements.txt**

Modify `requirements.txt`, add a line after `numpy>=1.24.0`:

```
torch>=2.0.0
```

- [ ] **Step 3: Install and verify import works**

Run: `pip install -e .` then `python -c "import torch; print(f'PyTorch {torch.__version__}')"`
Expected: Prints PyTorch version without error.

- [ ] **Step 4: Commit**

```bash
git add pyproject.toml requirements.txt
git commit -m "build: add PyTorch dependency for RL training

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Fix Reward Function Perspective Bug

**The bug.** `RewardFunction.calculate()` always uses `new_state.current_player` to determine reward direction. After a turn-ending winning move, `current_player` is whoever just acted — possibly the opponent — so the training agent gets `VICTORY_REWARD` for losing.

**The fix.** Add a `player_name` parameter so reward direction is always relative to a specific (training) player. The existing 3rd parameter `action: Optional[Action]` was never read inside the function body — we replace it. Two existing tests pass an `Action` object as the 3rd positional arg and need to be updated.

**Files:**
- Modify: `hearthstone/ai/reward_functions.py`
- Modify: `tests/unit/ai/test_reward_functions.py` (rewrite call-sites at lines 136, 158; add new tests)

- [ ] **Step 1: Add failing test for the perspective bug**

Append to `tests/unit/ai/test_reward_functions.py` (after the existing `MockGameState` class):

```python
class MockGameStateWithPerspective:
    """Mock that lets us simulate Player 2 being current_player at game end."""
    def __init__(self, current_name="player1", winner_name="player1",
                 game_over=True, current_health=30, opposing_health=30,
                 current_board_size=0, opposing_board_size=0):
        self._current_name = current_name
        self._winner_name = winner_name
        self._game_over = game_over
        self._current_health = current_health
        self._opposing_health = opposing_health
        self._current_board_size = current_board_size
        self._opposing_board_size = opposing_board_size

    def is_game_over(self):
        return self._game_over

    def get_winner(self):
        return type('Player', (), {'name': self._winner_name})()

    @property
    def current_player(self):
        return type('Player', (), {
            'name': self._current_name,
            'hero': type('Hero', (), {'health': self._current_health})(),
            'board': [type('Minion', (), {})] * self._current_board_size,
        })()

    @property
    def opposing_player(self):
        opposing = "player2" if self._current_name == "player1" else "player1"
        return type('Player', (), {
            'name': opposing,
            'hero': type('Hero', (), {'health': self._opposing_health})(),
            'board': [type('Minion', (), {})] * self._opposing_board_size,
        })()


def test_victory_reward_when_opponent_is_current_player():
    """Player 1 should get DEFEAT when Player 2 wins on their own turn."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()
    # Game over, player2 is current (just took winning turn), player2 won
    state = MockGameStateWithPerspective(
        current_name="player2", winner_name="player2", game_over=True,
    )
    reward = rf.calculate(None, state, player_name="player1")
    assert reward == -100.0, f"Expected DEFEAT for player1, got {reward}"


def test_victory_reward_when_training_player_is_current():
    """Player 1 wins on their own turn — should get VICTORY."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()
    state = MockGameStateWithPerspective(
        current_name="player1", winner_name="player1", game_over=True,
    )
    reward = rf.calculate(None, state, player_name="player1")
    assert reward == 100.0


def test_player_name_none_falls_back_to_current_player():
    """When player_name is None, perspective falls back to current_player (legacy behavior)."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()
    state = MockGameStateWithPerspective(
        current_name="player1", winner_name="player1", game_over=True,
    )
    reward = rf.calculate(None, state, player_name=None)
    assert reward == 100.0
```

- [ ] **Step 2: Run tests to verify the new tests fail**

Run: `pytest tests/unit/ai/test_reward_functions.py::test_victory_reward_when_opponent_is_current_player -v`
Expected: FAIL — either `TypeError: unexpected keyword argument 'player_name'` or `AssertionError: Expected DEFEAT for player1, got 100.0`.

- [ ] **Step 3: Rewrite RewardFunction with perspective-aware logic**

Replace `hearthstone/ai/reward_functions.py`:

```python
"""Reward function for reinforcement learning training."""

from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from hearthstone.models.game_state import GameState


class RewardFunction:
    """Calculates rewards for AI training based on game state changes.

    Rewards are always computed from the perspective of `player_name`. If
    `player_name` is None, falls back to `state.current_player` for backward
    compatibility, but callers should pass an explicit name during training.
    """

    VICTORY_REWARD = 100.0
    DEFEAT_PENALTY = -100.0
    HEALTH_WEIGHT = 1.0
    BOARD_CONTROL_WEIGHT = 0.5

    def __init__(self, health_weight=None, board_control_weight=None):
        self.health_weight = health_weight if health_weight is not None else self.HEALTH_WEIGHT
        self.board_control_weight = (
            board_control_weight if board_control_weight is not None else self.BOARD_CONTROL_WEIGHT
        )

    def calculate(
        self,
        old_state: Optional["GameState"],
        new_state: "GameState",
        player_name: Optional[str] = None,
    ) -> float:
        """Reward from the perspective of `player_name` (defaults to current_player)."""
        if new_state.is_game_over():
            winner = new_state.get_winner()
            if winner is None:
                return 0.0
            perspective = player_name if player_name else new_state.current_player.name
            return self.VICTORY_REWARD if winner.name == perspective else self.DEFEAT_PENALTY

        reward = 0.0
        if old_state is not None:
            old_h = self._health_diff(old_state, player_name)
            new_h = self._health_diff(new_state, player_name)
            reward += (new_h - old_h) * self.health_weight

            old_b = self._board_diff(old_state, player_name)
            new_b = self._board_diff(new_state, player_name)
            reward += (new_b - old_b) * self.board_control_weight

        return reward

    def _resolve(self, state, player_name: Optional[str]):
        """Return (me, opponent) where `me` is the training player.

        When player_name is None or matches current_player.name, `me` is
        current_player; otherwise the players are swapped. Works on both
        the real GameState and the test mocks (only needs current_player /
        opposing_player and a `.name` on current_player).
        """
        if player_name and state.current_player.name != player_name:
            return state.opposing_player, state.current_player
        return state.current_player, state.opposing_player

    def _health_diff(self, state, player_name: Optional[str]) -> float:
        me, opp = self._resolve(state, player_name)
        return me.hero.health - opp.hero.health

    def _board_diff(self, state, player_name: Optional[str]) -> float:
        me, opp = self._resolve(state, player_name)
        return len(me.board) - len(opp.board)

    def __repr__(self) -> str:
        return (
            f"RewardFunction(health_weight={self.health_weight}, "
            f"board_control_weight={self.board_control_weight})"
        )
```

- [ ] **Step 4: Update existing test call-sites that passed an Action as the 3rd arg**

The two existing calls at `tests/unit/ai/test_reward_functions.py:136` and `:158` pass a `play_action` / `attack_action` object as the 3rd positional argument. After the rename, the 3rd arg is `player_name: Optional[str]`. Drop the action argument entirely (the action is asserted on its own properties, not by the reward function).

In `tests/unit/ai/test_reward_functions.py`, change:

```python
    reward = rf.calculate(old_state, new_state, play_action)
```

to:

```python
    reward = rf.calculate(old_state, new_state)
```

And similarly for the `attack_action` call.

The four existing calls that pass `None` (lines 19, 30, 46, 65) remain valid because `player_name` defaults to `None`.

- [ ] **Step 5: Run all reward tests**

Run: `pytest tests/unit/ai/test_reward_functions.py -v`
Expected: All existing tests + 3 new perspective tests PASS.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/reward_functions.py tests/unit/ai/test_reward_functions.py
git commit -m "fix(ai): reward function uses fixed training-player perspective

Replaces unused 'action' parameter with 'player_name'. Reward direction
is now relative to the training player, not whoever happens to be
current_player when the game ends. Without this fix, the agent received
VICTORY_REWARD for losing whenever the opponent ended the game on their
own turn.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Upgrade Gym Environment with CardEmbedding and Fixed Perspective

The current env returns 7 scalar features and observes from `current_player` — the same perspective bug Task 2 just fixed in the reward function. This task:
1. Upgrades the observation to include card embeddings for hand and both boards.
2. Pins the observation to the training player (default `"player1"`) regardless of whose turn it is.
3. Uses the new `RewardFunction` from Task 2 inside `step()`.

**Files:**
- Modify: `hearthstone/ai/gym_env.py` — full rewrite
- Create: `tests/unit/ai/test_gym_env_observation.py` — new test file (no test_gym_env.py exists yet)

- [ ] **Step 1: Write the test file**

Create `tests/unit/ai/test_gym_env_observation.py`:

```python
"""Tests for HearthstoneEnv observation upgrade."""
import numpy as np
from hearthstone.ai.gym_env import HearthstoneEnv


def test_observation_keys_present():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    obs, _ = env.reset()
    expected = {
        "player_hand", "player_board", "opponent_board",
        "player_health", "player_mana", "player_max_mana",
        "player_hand_size", "player_board_size",
        "opponent_health", "opponent_board_size",
        "turn_number", "player_deck_size",
    }
    assert set(obs.keys()) == expected, f"Missing/extra keys: {set(obs.keys()) ^ expected}"
    env.close()


def test_card_tensor_shapes():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    obs, _ = env.reset()
    assert obs["player_hand"].shape == (10, 64)
    assert obs["player_board"].shape == (7, 64)
    assert obs["opponent_board"].shape == (7, 64)
    env.close()


def test_card_tensor_values_in_range():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    obs, _ = env.reset()
    for key in ["player_hand", "player_board", "opponent_board"]:
        assert obs[key].dtype == np.float32
        assert np.all(obs[key] >= 0.0) and np.all(obs[key] <= 1.0), \
            f"{key} contains values outside [0, 1]"
    env.close()


def test_scalar_features_in_range():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    obs, _ = env.reset()
    assert 0 <= obs["player_health"][0] <= 30
    assert 0 <= obs["player_mana"][0] <= 10
    assert 0 <= obs["opponent_health"][0] <= 30
    assert 0 <= obs["turn_number"][0] <= 100
    env.close()


def test_observation_perspective_is_fixed():
    """Observation must always reflect the training player, not current_player."""
    env = HearthstoneEnv(
        deck1_name="test_deck", deck2_name="test_deck",
        training_player_name="player1",
    )
    obs1, _ = env.reset()
    p1_initial_health = float(obs1["player_health"][0])

    # Step until current_player has flipped at least once (end-turn is index 0)
    flipped = False
    for _ in range(5):
        obs2, _, terminated, _, _ = env.step(0)
        if env.controller.get_state().current_player.name != "player1":
            flipped = True
            # player_health in obs MUST still be player1's health
            p1_health_now = env.controller.get_state().player1.hero.health
            assert float(obs2["player_health"][0]) == p1_health_now, \
                "Observation flipped perspective when current_player changed"
            break
        if terminated:
            break
    assert flipped, "Test setup failure: current_player never flipped"
    env.close()


def test_step_returns_valid_tuple():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    env.reset()
    obs, reward, terminated, truncated, info = env.step(0)
    assert isinstance(reward, float)
    assert isinstance(terminated, bool)
    assert isinstance(truncated, bool)
    assert isinstance(info, dict)
    env.close()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_gym_env_observation.py -v`
Expected: FAIL — observation keys differ; `training_player_name` kwarg unknown.

- [ ] **Step 3: Rewrite HearthstoneEnv**

Replace `hearthstone/ai/gym_env.py`:

```python
"""Gymnasium environment for Hearthstone."""
import gymnasium as gym
from gymnasium import spaces
import numpy as np

from hearthstone.ai.card_embedding import CardEmbedding
from hearthstone.ai.reward_functions import RewardFunction
from hearthstone.decks.deck_manager import DeckManager
from hearthstone.engine.game_controller import GameController


class HearthstoneEnv(gym.Env):
    """Hearthstone environment following Gymnasium API.

    Observation includes card embeddings for hand and both boards plus 9
    scalar features. Observation and reward are always computed from the
    training player's perspective (default Player 1) regardless of whose
    turn it currently is.
    """

    metadata = {"render_modes": ["human"]}
    EMBEDDING_DIM = 64
    MAX_HAND = 10
    MAX_BOARD = 7
    NUM_ACTIONS = 100

    def __init__(
        self,
        deck1_name: str = "test_deck",
        deck2_name: str = "test_deck",
        training_player_name: str = "player1",
    ):
        super().__init__()
        self.deck1_name = deck1_name
        self.deck2_name = deck2_name
        self.training_player_name = training_player_name
        self.embedding = CardEmbedding(embedding_dim=self.EMBEDDING_DIM)
        self.reward_fn = RewardFunction()

        self.observation_space = spaces.Dict({
            "player_hand": spaces.Box(0, 1, shape=(self.MAX_HAND, self.EMBEDDING_DIM), dtype=np.float32),
            "player_board": spaces.Box(0, 1, shape=(self.MAX_BOARD, self.EMBEDDING_DIM), dtype=np.float32),
            "opponent_board": spaces.Box(0, 1, shape=(self.MAX_BOARD, self.EMBEDDING_DIM), dtype=np.float32),
            "player_health": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
            "player_mana": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_max_mana": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_hand_size": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_board_size": spaces.Box(0, 7, shape=(1,), dtype=np.float32),
            "opponent_health": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
            "opponent_board_size": spaces.Box(0, 7, shape=(1,), dtype=np.float32),
            "turn_number": spaces.Box(0, 100, shape=(1,), dtype=np.float32),
            "player_deck_size": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
        })

        self.action_space = spaces.Discrete(self.NUM_ACTIONS)
        self.controller = None
        self._last_state = None

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        manager = DeckManager()
        deck1 = manager.load_deck(self.deck1_name)
        deck2 = manager.load_deck(self.deck2_name)
        self.controller = GameController(deck1, deck2)
        self.controller.start_game()
        self._last_state = self.controller.get_state()
        return self._get_observation(), {}

    def _resolve_players(self, state):
        """Return (training_player, opponent) regardless of whose turn it is."""
        if state.player1.name == self.training_player_name:
            return state.player1, state.player2
        return state.player2, state.player1

    def _get_observation(self):
        state = self.controller.get_state()
        me, opp = self._resolve_players(state)

        return {
            "player_hand": self.embedding.encode_hand(me.hand, self.MAX_HAND),
            "player_board": self.embedding.encode_board(me.board, self.MAX_BOARD),
            "opponent_board": self.embedding.encode_board(opp.board, self.MAX_BOARD),
            "player_health": np.array([me.hero.health], dtype=np.float32),
            "player_mana": np.array([me.mana], dtype=np.float32),
            "player_max_mana": np.array([me.max_mana], dtype=np.float32),
            "player_hand_size": np.array([len(me.hand)], dtype=np.float32),
            "player_board_size": np.array([len(me.board)], dtype=np.float32),
            "opponent_health": np.array([opp.hero.health], dtype=np.float32),
            "opponent_board_size": np.array([len(opp.board)], dtype=np.float32),
            "turn_number": np.array([state.turn], dtype=np.float32),
            "player_deck_size": np.array([len(me.deck)], dtype=np.float32),
        }

    def step(self, action):
        if self.controller is None:
            raise RuntimeError("Call reset() before step()")

        old_state = self.controller.get_state()
        valid_actions = self.controller.get_valid_actions()
        invalid = action >= len(valid_actions)

        if not invalid:
            self.controller.execute_action(valid_actions[action])

        new_state = self.controller.get_state()
        terminated = self.controller.is_game_over()

        reward = self.reward_fn.calculate(
            old_state, new_state, player_name=self.training_player_name,
        )
        if invalid:
            reward -= 0.01  # small penalty for picking out-of-range action

        obs = self._get_observation()
        info = {"valid_actions": len(valid_actions), "invalid_action": invalid}
        return obs, float(reward), bool(terminated), False, info

    def render(self, mode="human"):
        pass

    def close(self):
        self.controller = None
```

- [ ] **Step 4: Run new tests to verify they pass**

Run: `pytest tests/unit/ai/test_gym_env_observation.py -v`
Expected: 6 tests PASS.

- [ ] **Step 5: Run full AI test suite for regressions**

Run: `pytest tests/unit/ai/ -v`
Expected: All previously passing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/gym_env.py tests/unit/ai/test_gym_env_observation.py
git commit -m "feat(ai): upgrade HearthstoneEnv with CardEmbedding and fixed perspective

Observation now includes card embeddings for hand (10x64) and both
boards (7x64 each) plus 9 scalar features. Both observation and reward
are computed from the training player's perspective via the new
training_player_name kwarg, matching the perspective fix in
RewardFunction.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Implement RolloutBuffer with GAE

PPO is on-policy and requires sequential rollouts to compute Generalized Advantage Estimation. A random replay buffer would compute GAE on shuffled transitions, which is mathematically wrong. This task implements a fixed-capacity sequential buffer that stores `(obs, action, reward, value, log_prob, done)` in the order they were collected, exposes `compute_returns_and_advantages(last_value)` to populate advantages and returns once a rollout is complete, and yields ready-to-train minibatches.

**Files:**
- Create: `hearthstone/ai/rollout_buffer.py`
- Create: `tests/unit/ai/test_rollout_buffer.py`

- [ ] **Step 1: Write the test file**

Create `tests/unit/ai/test_rollout_buffer.py`:

```python
"""Tests for RolloutBuffer."""
import numpy as np
import pytest
from hearthstone.ai.rollout_buffer import RolloutBuffer


def make_dummy_obs():
    return {
        "player_hand": np.zeros((10, 64), dtype=np.float32),
        "player_board": np.zeros((7, 64), dtype=np.float32),
        "opponent_board": np.zeros((7, 64), dtype=np.float32),
        "player_health": np.array([30.0], dtype=np.float32),
        "player_mana": np.array([5.0], dtype=np.float32),
        "player_max_mana": np.array([5.0], dtype=np.float32),
        "player_hand_size": np.array([3.0], dtype=np.float32),
        "player_board_size": np.array([2.0], dtype=np.float32),
        "opponent_health": np.array([30.0], dtype=np.float32),
        "opponent_board_size": np.array([0.0], dtype=np.float32),
        "turn_number": np.array([3.0], dtype=np.float32),
        "player_deck_size": np.array([20.0], dtype=np.float32),
    }


class TestRolloutBuffer:
    def test_initial_length_zero(self):
        buf = RolloutBuffer(capacity=64)
        assert len(buf) == 0

    def test_add_increments_length(self):
        buf = RolloutBuffer(capacity=64)
        buf.add(make_dummy_obs(), action=0, reward=0.1, value=0.5, log_prob=-1.0, done=False)
        assert len(buf) == 1

    def test_full_buffer_rejects_add(self):
        buf = RolloutBuffer(capacity=2)
        for _ in range(2):
            buf.add(make_dummy_obs(), 0, 0.1, 0.5, -1.0, False)
        with pytest.raises(RuntimeError, match="full"):
            buf.add(make_dummy_obs(), 0, 0.1, 0.5, -1.0, False)

    def test_compute_returns_and_advantages_shapes(self):
        buf = RolloutBuffer(capacity=10, gamma=0.99, gae_lambda=0.95)
        for i in range(5):
            buf.add(make_dummy_obs(), action=i, reward=float(i) * 0.1,
                    value=0.5, log_prob=-1.0, done=(i == 4))
        buf.compute_returns_and_advantages(last_value=0.0)
        batch = buf.get()
        assert batch["advantages"].shape == (5,)
        assert batch["returns"].shape == (5,)
        assert batch["actions"].shape == (5,)
        assert batch["old_log_probs"].shape == (5,)
        assert batch["player_health"].shape == (5, 1)

    def test_advantages_are_normalized_by_default(self):
        buf = RolloutBuffer(capacity=20, gamma=0.99, gae_lambda=0.95)
        for i in range(20):
            buf.add(make_dummy_obs(), action=0, reward=float(i),
                    value=0.0, log_prob=-1.0, done=(i == 19))
        buf.compute_returns_and_advantages(last_value=0.0)
        batch = buf.get(normalize_advantages=True)
        adv = batch["advantages"]
        assert abs(adv.mean()) < 1e-5
        assert abs(adv.std() - 1.0) < 1e-3

    def test_gae_terminal_zeros_bootstrap(self):
        """When done=True at last step, bootstrap value should not propagate."""
        buf = RolloutBuffer(capacity=3, gamma=1.0, gae_lambda=1.0)
        # Single-step episode: reward=1, value=0, done=True
        buf.add(make_dummy_obs(), 0, reward=1.0, value=0.0, log_prob=-1.0, done=True)
        buf.compute_returns_and_advantages(last_value=999.0)  # should be ignored
        batch = buf.get(normalize_advantages=False)
        # advantage = reward + gamma*0*(1-done) - value = 1 - 0 = 1
        assert abs(batch["advantages"][0] - 1.0) < 1e-6
        assert abs(batch["returns"][0] - 1.0) < 1e-6

    def test_reset_clears_buffer(self):
        buf = RolloutBuffer(capacity=10)
        buf.add(make_dummy_obs(), 0, 0.1, 0.5, -1.0, False)
        buf.reset()
        assert len(buf) == 0

    def test_get_before_compute_raises(self):
        buf = RolloutBuffer(capacity=10)
        buf.add(make_dummy_obs(), 0, 0.1, 0.5, -1.0, False)
        with pytest.raises(RuntimeError, match="compute_returns_and_advantages"):
            buf.get()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_rollout_buffer.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement RolloutBuffer**

Create `hearthstone/ai/rollout_buffer.py`:

```python
"""Sequential rollout buffer with Generalized Advantage Estimation."""
from typing import Dict, Optional
import numpy as np


class RolloutBuffer:
    """Stores on-policy trajectories and computes GAE.

    Use:
        buf = RolloutBuffer(capacity=2048, gamma=0.99, gae_lambda=0.95)
        for step in range(rollout_length):
            buf.add(obs, action, reward, value, log_prob, done)
        buf.compute_returns_and_advantages(last_value=bootstrap_value)
        batch = buf.get()
        # ... train ...
        buf.reset()
    """

    def __init__(self, capacity: int, gamma: float = 0.99, gae_lambda: float = 0.95):
        self.capacity = capacity
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self._observations: list[dict] = []
        self._actions: list[int] = []
        self._rewards: list[float] = []
        self._values: list[float] = []
        self._log_probs: list[float] = []
        self._dones: list[bool] = []
        self._advantages: Optional[np.ndarray] = None
        self._returns: Optional[np.ndarray] = None

    def add(
        self,
        obs: dict,
        action: int,
        reward: float,
        value: float,
        log_prob: float,
        done: bool,
    ) -> None:
        if len(self._observations) >= self.capacity:
            raise RuntimeError("RolloutBuffer is full; call reset() before adding more")
        self._observations.append({k: v.copy() for k, v in obs.items()})
        self._actions.append(int(action))
        self._rewards.append(float(reward))
        self._values.append(float(value))
        self._log_probs.append(float(log_prob))
        self._dones.append(bool(done))
        # Invalidate cached advantages
        self._advantages = None
        self._returns = None

    def compute_returns_and_advantages(self, last_value: float = 0.0) -> None:
        """Populate advantages and returns using GAE.

        Args:
            last_value: Value estimate V(s_{T+1}) for bootstrapping. Pass 0
                if the trajectory ended in a terminal state.
        """
        T = len(self._rewards)
        rewards = np.asarray(self._rewards, dtype=np.float32)
        values = np.asarray(self._values, dtype=np.float32)
        dones = np.asarray(self._dones, dtype=np.float32)

        advantages = np.zeros(T, dtype=np.float32)
        gae = 0.0
        for t in reversed(range(T)):
            non_terminal = 1.0 - dones[t]
            next_value = last_value if t == T - 1 else values[t + 1]
            delta = rewards[t] + self.gamma * next_value * non_terminal - values[t]
            gae = delta + self.gamma * self.gae_lambda * non_terminal * gae
            advantages[t] = gae

        self._advantages = advantages
        self._returns = advantages + values

    def get(self, normalize_advantages: bool = True) -> Dict[str, np.ndarray]:
        if self._advantages is None or self._returns is None:
            raise RuntimeError(
                "Call compute_returns_and_advantages() before get()"
            )

        obs_keys = list(self._observations[0].keys())
        batch: Dict[str, np.ndarray] = {}
        for key in obs_keys:
            batch[key] = np.stack([o[key] for o in self._observations])

        batch["actions"] = np.asarray(self._actions, dtype=np.int64)
        batch["rewards"] = np.asarray(self._rewards, dtype=np.float32)
        batch["dones"] = np.asarray(self._dones, dtype=np.float32)
        batch["old_log_probs"] = np.asarray(self._log_probs, dtype=np.float32)
        batch["values"] = np.asarray(self._values, dtype=np.float32)

        adv = self._advantages
        if normalize_advantages and len(adv) > 1:
            adv = (adv - adv.mean()) / (adv.std() + 1e-8)
        batch["advantages"] = adv.astype(np.float32)
        batch["returns"] = self._returns.astype(np.float32)
        return batch

    def reset(self) -> None:
        self._observations.clear()
        self._actions.clear()
        self._rewards.clear()
        self._values.clear()
        self._log_probs.clear()
        self._dones.clear()
        self._advantages = None
        self._returns = None

    def __len__(self) -> int:
        return len(self._observations)
```

- [ ] **Step 4: Run tests**

Run: `pytest tests/unit/ai/test_rollout_buffer.py -v`
Expected: 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/rollout_buffer.py tests/unit/ai/test_rollout_buffer.py
git commit -m "feat(ai): add RolloutBuffer with GAE

Sequential on-policy buffer that stores trajectories and computes
Generalized Advantage Estimation in order. PPO-correct alternative to
random replay sampling.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Define Policy and Value Network

Shared-body network with two heads: policy logits over actions, scalar state value. Consumes the 12-key observation dict from Task 3.

**Files:**
- Create: `hearthstone/ai/network.py`
- Create: `tests/unit/ai/test_network.py`

- [ ] **Step 1: Write tests**

Create `tests/unit/ai/test_network.py`:

```python
"""Tests for PolicyValueNetwork."""
import torch
from hearthstone.ai.network import PolicyValueNetwork


def make_batch_obs(batch_size: int = 4):
    return {
        "player_hand": torch.zeros(batch_size, 10, 64),
        "player_board": torch.zeros(batch_size, 7, 64),
        "opponent_board": torch.zeros(batch_size, 7, 64),
        "player_health": torch.full((batch_size, 1), 30.0),
        "player_mana": torch.full((batch_size, 1), 5.0),
        "player_max_mana": torch.full((batch_size, 1), 5.0),
        "player_hand_size": torch.full((batch_size, 1), 3.0),
        "player_board_size": torch.full((batch_size, 1), 2.0),
        "opponent_health": torch.full((batch_size, 1), 30.0),
        "opponent_board_size": torch.full((batch_size, 1), 1.0),
        "turn_number": torch.full((batch_size, 1), 5.0),
        "player_deck_size": torch.full((batch_size, 1), 22.0),
    }


class TestPolicyValueNetwork:
    def test_forward_shapes(self):
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        obs = make_batch_obs(4)
        logits, value = net(obs)
        assert logits.shape == (4, 100)
        assert value.shape == (4, 1)

    def test_gradients_flow(self):
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        obs = make_batch_obs(4)
        logits, value = net(obs)
        loss = logits.sum() + value.sum()
        loss.backward()
        for name, param in net.named_parameters():
            assert param.grad is not None, f"{name} has no gradient"

    def test_variable_batch_sizes(self):
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        for bs in [1, 2, 16, 32]:
            obs = make_batch_obs(bs)
            logits, value = net(obs)
            assert logits.shape == (bs, 100)
            assert value.shape == (bs, 1)

    def test_train_eval_modes(self):
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        obs = make_batch_obs(2)
        net.train()
        net(obs)
        net.eval()
        with torch.no_grad():
            net(obs)

    def test_uses_all_nine_scalar_features(self):
        """All 9 scalar features must influence the output."""
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        net.eval()

        scalar_keys = [
            "player_health", "player_mana", "player_max_mana",
            "player_hand_size", "player_board_size",
            "opponent_health", "opponent_board_size",
            "turn_number", "player_deck_size",
        ]
        for key in scalar_keys:
            obs_a = make_batch_obs(1)
            obs_b = make_batch_obs(1)
            obs_b[key] = obs_b[key] + 5.0
            with torch.no_grad():
                _, v_a = net(obs_a)
                _, v_b = net(obs_b)
            assert not torch.allclose(v_a, v_b), \
                f"Network output is invariant to {key} — feature is not wired in"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_network.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the network**

Create `hearthstone/ai/network.py`:

```python
"""Shared-body Policy and Value network."""
import torch
import torch.nn as nn


SCALAR_KEYS = (
    "player_health", "player_mana", "player_max_mana",
    "player_hand_size", "player_board_size",
    "opponent_health", "opponent_board_size",
    "turn_number", "player_deck_size",
)


class CardEncoder(nn.Module):
    """Encodes (B, N, embedding_dim) -> (B, N, hidden_dim)."""

    def __init__(self, embedding_dim: int = 64, hidden_dim: int = 128):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )

    def forward(self, x):
        return self.fc(x)


class PolicyValueNetwork(nn.Module):
    """Shared body with policy head (logits) and value head (scalar)."""

    def __init__(
        self,
        embedding_dim: int = 64,
        hidden_dim: int = 128,
        num_actions: int = 100,
    ):
        super().__init__()
        self.card_encoder = CardEncoder(embedding_dim, hidden_dim)
        self.num_scalars = len(SCALAR_KEYS)  # 9

        # hand (10*hidden) + 2 boards (2*7*hidden) + 9 scalars
        flat_dim = 10 * hidden_dim + 2 * 7 * hidden_dim + self.num_scalars

        self.shared = nn.Sequential(
            nn.Linear(flat_dim, hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
        )
        self.policy_head = nn.Linear(hidden_dim, num_actions)
        self.value_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )

    def forward(self, obs: dict):
        batch_size = obs["player_health"].shape[0]

        hand_enc = self.card_encoder(obs["player_hand"])
        p_board_enc = self.card_encoder(obs["player_board"])
        o_board_enc = self.card_encoder(obs["opponent_board"])

        hand_flat = hand_enc.reshape(batch_size, -1)
        p_board_flat = p_board_enc.reshape(batch_size, -1)
        o_board_flat = o_board_enc.reshape(batch_size, -1)

        scalars = torch.cat([obs[k] for k in SCALAR_KEYS], dim=-1)  # (B, 9)

        flat = torch.cat([hand_flat, p_board_flat, o_board_flat, scalars], dim=-1)
        h = self.shared(flat)
        return self.policy_head(h), self.value_head(h)
```

- [ ] **Step 4: Run tests**

Run: `pytest tests/unit/ai/test_network.py -v`
Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/network.py tests/unit/ai/test_network.py
git commit -m "feat(ai): add PolicyValueNetwork with card encoder

Shared body fed by hand encoder, two board encoders, and 9 scalar
features. Outputs policy logits and scalar state value.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Implement PPO Trainer

Consumes a batch produced by `RolloutBuffer.get()` (with `advantages`, `returns`, and `old_log_probs` already populated). Runs `ppo_epochs` of clipped-surrogate updates on the batch. Provides `select_action` for rollout collection.

**Files:**
- Create: `hearthstone/ai/ppo_trainer.py`
- Create: `tests/unit/ai/test_ppo_trainer.py`

- [ ] **Step 1: Write tests**

Create `tests/unit/ai/test_ppo_trainer.py`:

```python
"""Tests for PPOTrainer."""
import numpy as np
import torch
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.ppo_trainer import PPOTrainer


def make_dummy_rollout(batch_size: int = 16):
    """Mimic the output of RolloutBuffer.get() with realistic shapes."""
    rng = np.random.default_rng(0)
    obs = {
        "player_hand": rng.standard_normal((batch_size, 10, 64)).astype(np.float32) * 0.1,
        "player_board": rng.standard_normal((batch_size, 7, 64)).astype(np.float32) * 0.1,
        "opponent_board": rng.standard_normal((batch_size, 7, 64)).astype(np.float32) * 0.1,
        "player_health": rng.uniform(0, 30, (batch_size, 1)).astype(np.float32),
        "player_mana": rng.uniform(0, 10, (batch_size, 1)).astype(np.float32),
        "player_max_mana": rng.uniform(0, 10, (batch_size, 1)).astype(np.float32),
        "player_hand_size": rng.uniform(0, 10, (batch_size, 1)).astype(np.float32),
        "player_board_size": rng.uniform(0, 7, (batch_size, 1)).astype(np.float32),
        "opponent_health": rng.uniform(0, 30, (batch_size, 1)).astype(np.float32),
        "opponent_board_size": rng.uniform(0, 7, (batch_size, 1)).astype(np.float32),
        "turn_number": rng.uniform(0, 50, (batch_size, 1)).astype(np.float32),
        "player_deck_size": rng.uniform(0, 30, (batch_size, 1)).astype(np.float32),
    }
    obs["actions"] = rng.integers(0, 100, batch_size).astype(np.int64)
    obs["rewards"] = rng.standard_normal(batch_size).astype(np.float32)
    obs["dones"] = np.zeros(batch_size, dtype=np.float32)
    obs["values"] = rng.standard_normal(batch_size).astype(np.float32)
    obs["old_log_probs"] = (rng.standard_normal(batch_size).astype(np.float32) - 4.6)
    obs["advantages"] = rng.standard_normal(batch_size).astype(np.float32)
    obs["returns"] = rng.standard_normal(batch_size).astype(np.float32)
    return obs


class TestPPOTrainer:
    def test_initialization(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net, lr=3e-4, gamma=0.99, ppo_epochs=4)
        assert trainer.network is net
        assert trainer.gamma == 0.99
        assert trainer.ppo_epochs == 4

    def test_update_runs_and_returns_losses(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net, ppo_epochs=2)
        batch = make_dummy_rollout(32)
        losses = trainer.update(batch)
        for k in ("total_loss", "policy_loss", "value_loss", "entropy"):
            assert k in losses
            assert isinstance(losses[k], float)

    def test_update_no_nan_over_many_epochs(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net, ppo_epochs=4)
        batch = make_dummy_rollout(32)
        for _ in range(10):
            losses = trainer.update(batch)
            assert not np.isnan(losses["total_loss"]), "Loss became NaN"

    def test_select_action_shape_and_range(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net)
        # Build a single-batch torch obs
        torch_obs = {
            "player_hand": torch.zeros(1, 10, 64),
            "player_board": torch.zeros(1, 7, 64),
            "opponent_board": torch.zeros(1, 7, 64),
            "player_health": torch.tensor([[30.0]]),
            "player_mana": torch.tensor([[1.0]]),
            "player_max_mana": torch.tensor([[1.0]]),
            "player_hand_size": torch.tensor([[3.0]]),
            "player_board_size": torch.tensor([[0.0]]),
            "opponent_health": torch.tensor([[30.0]]),
            "opponent_board_size": torch.tensor([[0.0]]),
            "turn_number": torch.tensor([[1.0]]),
            "player_deck_size": torch.tensor([[27.0]]),
        }
        mask = np.zeros(100, dtype=np.float32)
        mask[0] = 1.0  # only end-turn valid
        action, log_prob, value = trainer.select_action(torch_obs, mask)
        assert action == 0, "Masked-out actions should never be selected"
        assert isinstance(log_prob, float)
        assert isinstance(value, float)

    def test_clip_keeps_ratio_close_when_advantages_positive(self):
        """Smoke test: a single update on a positive-advantage batch should
        not blow ratios past clip_epsilon by more than a small margin."""
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net, ppo_epochs=1, clip_epsilon=0.2)
        batch = make_dummy_rollout(16)
        batch["advantages"] = np.abs(batch["advantages"])  # all positive
        losses = trainer.update(batch)
        assert not np.isnan(losses["policy_loss"])
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_ppo_trainer.py -v`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement PPOTrainer**

Create `hearthstone/ai/ppo_trainer.py`:

```python
"""PPO trainer with clipped surrogate objective."""
from typing import Dict, Optional, Tuple
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.optim import Adam

from hearthstone.ai.network import PolicyValueNetwork


_NON_OBS_KEYS = {
    "actions", "rewards", "dones", "values",
    "old_log_probs", "advantages", "returns",
}


class PPOTrainer:
    """PPO trainer. Consumes a batch from RolloutBuffer.get()."""

    def __init__(
        self,
        network: PolicyValueNetwork,
        lr: float = 3e-4,
        gamma: float = 0.99,
        gae_lambda: float = 0.95,
        clip_epsilon: float = 0.2,
        value_coef: float = 0.5,
        entropy_coef: float = 0.01,
        max_grad_norm: float = 0.5,
        ppo_epochs: int = 4,
    ):
        self.network = network
        self.optimizer = Adam(network.parameters(), lr=lr)
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_epsilon = clip_epsilon
        self.value_coef = value_coef
        self.entropy_coef = entropy_coef
        self.max_grad_norm = max_grad_norm
        self.ppo_epochs = ppo_epochs

    def update(self, batch: Dict[str, np.ndarray]) -> Dict[str, float]:
        """Run ppo_epochs gradient updates on the rollout batch.

        Required keys: observation tensors + actions, advantages, returns,
        old_log_probs.
        """
        device = next(self.network.parameters()).device

        obs = {
            k: torch.from_numpy(v).float().to(device)
            for k, v in batch.items() if k not in _NON_OBS_KEYS
        }
        actions = torch.from_numpy(batch["actions"]).long().to(device)
        advantages = torch.from_numpy(batch["advantages"]).float().to(device)
        returns = torch.from_numpy(batch["returns"]).float().to(device).unsqueeze(-1)
        old_log_probs = torch.from_numpy(batch["old_log_probs"]).float().to(device)

        total = policy = value = entropy = 0.0
        for _ in range(self.ppo_epochs):
            logits, values = self.network(obs)
            new_log_probs = self._log_probs(logits, actions)
            ent = self._entropy(logits)

            ratio = torch.exp(new_log_probs - old_log_probs)
            unclipped = ratio * advantages
            clipped = torch.clamp(ratio, 1.0 - self.clip_epsilon, 1.0 + self.clip_epsilon) * advantages
            policy_loss = -torch.min(unclipped, clipped).mean()
            value_loss = F.mse_loss(values, returns)

            loss = (
                policy_loss
                + self.value_coef * value_loss
                - self.entropy_coef * ent
            )

            self.optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(self.network.parameters(), self.max_grad_norm)
            self.optimizer.step()

            total += loss.item()
            policy += policy_loss.item()
            value += value_loss.item()
            entropy += ent.item()

        n = float(self.ppo_epochs)
        return {
            "total_loss": total / n,
            "policy_loss": policy / n,
            "value_loss": value / n,
            "entropy": entropy / n,
        }

    def select_action(
        self,
        obs: Dict[str, torch.Tensor],
        action_mask: Optional[np.ndarray] = None,
    ) -> Tuple[int, float, float]:
        """Sample an action. Returns (action, log_prob, state_value)."""
        device = next(self.network.parameters()).device
        obs_d = {k: v.to(device) for k, v in obs.items()}

        with torch.no_grad():
            logits, value = self.network(obs_d)
            logits = logits[0]
            if action_mask is not None:
                mask = torch.from_numpy(action_mask).float().to(device)
                logits = logits + (1.0 - mask) * -1e9
            probs = F.softmax(logits, dim=-1)
            dist = torch.distributions.Categorical(probs=probs)
            action = dist.sample()
            log_prob = dist.log_prob(action).item()

        return int(action.item()), float(log_prob), float(value[0, 0].item())

    def _log_probs(self, logits, actions):
        log_probs = F.log_softmax(logits, dim=-1)
        return log_probs.gather(1, actions.unsqueeze(-1)).squeeze(-1)

    def _entropy(self, logits):
        probs = F.softmax(logits, dim=-1)
        log_probs = F.log_softmax(logits, dim=-1)
        return -(probs * log_probs).sum(dim=-1).mean()
```

- [ ] **Step 4: Run tests**

Run: `pytest tests/unit/ai/test_ppo_trainer.py -v`
Expected: 5 tests PASS.

- [ ] **Step 5: Add end-to-end pipeline smoke test**

Create `tests/unit/ai/test_training_pipeline.py`:

```python
"""End-to-end smoke test: env -> rollout buffer -> PPO update."""
import numpy as np
import torch
from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.ppo_trainer import PPOTrainer
from hearthstone.ai.rollout_buffer import RolloutBuffer


def test_full_training_loop_smoke():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=2)
    buffer = RolloutBuffer(capacity=64, gamma=0.99, gae_lambda=0.95)

    obs, _ = env.reset()
    last_value = 0.0
    for _ in range(40):
        valid_n = len(env.controller.get_valid_actions())
        if valid_n == 0:
            break
        mask = np.zeros(100, dtype=np.float32)
        mask[:min(valid_n, 100)] = 1.0

        torch_obs = {k: torch.from_numpy(v).unsqueeze(0) for k, v in obs.items()}
        action, log_prob, value = trainer.select_action(torch_obs, mask)

        next_obs, reward, terminated, _, _ = env.step(action)
        buffer.add(obs, action, reward, value, log_prob, terminated)

        obs = next_obs
        if terminated:
            obs, _ = env.reset()
            last_value = 0.0
        else:
            last_value = value  # final bootstrap if loop exits without termination

    env.close()

    buffer.compute_returns_and_advantages(last_value=last_value)
    batch = buffer.get()
    losses = trainer.update(batch)

    assert not np.isnan(losses["total_loss"]), "Pipeline produced NaN loss"
    assert "policy_loss" in losses
```

- [ ] **Step 6: Run pipeline test**

Run: `pytest tests/unit/ai/test_training_pipeline.py -v`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add hearthstone/ai/ppo_trainer.py tests/unit/ai/test_ppo_trainer.py tests/unit/ai/test_training_pipeline.py
git commit -m "feat(ai): add PPO trainer and end-to-end pipeline smoke test

PPOTrainer consumes a batch produced by RolloutBuffer.get() with
advantages and old log-probs precomputed. Runs ppo_epochs of clipped
surrogate updates with value-function MSE and entropy regularization.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: Fix BatchSimulator Multiprocessing

`BatchSimulator` currently uses `ThreadPoolExecutor`, which gets no parallelism for CPU-bound game simulation under the GIL. Switch to `ProcessPoolExecutor` with `spawn` context for true multi-core throughput.

**Important pickling constraint:** `ProcessPoolExecutor` with `spawn` requires `game_runner` and its arguments to be picklable. Lambdas, nested functions, and bound methods on un-picklable objects will fail at submit time. Document this in the docstring and update existing tests that use a nested mock function.

**Files:**
- Modify: `hearthstone/ai/batch_simulator.py` — full rewrite
- Modify: `tests/unit/ai/test_batch_simulator.py` — lift nested `mock_game_runner` to module level

- [ ] **Step 1: Update test_batch_simulator.py to lift the nested mock**

The current `test_simulate_games` defines `mock_game_runner` inside the test function. Nested functions are not picklable across processes with the `spawn` start method, so the test will hang or fail once we switch executors. Lift it out.

Replace `tests/unit/ai/test_batch_simulator.py`:

```python
"""Tests for BatchSimulator."""
import pytest


def _module_level_mock_game_runner():
    """Module-level (picklable) fake game runner used by parallel tests."""
    return {'winner': 'player1', 'turns': 10, 'reward': 1.0}


def _module_level_mixed_runner():
    """Returns alternating outcomes via a static counter."""
    _module_level_mixed_runner.count = getattr(_module_level_mixed_runner, "count", 0) + 1
    if _module_level_mixed_runner.count % 2 == 0:
        return {'winner': 'player2', 'turns': 8, 'reward': -1.0}
    return {'winner': 'player1', 'turns': 12, 'reward': 1.0}


def test_batch_simulator_exists():
    from hearthstone.ai.batch_simulator import BatchSimulator
    assert BatchSimulator() is not None


def test_batch_simulator_default_workers():
    from hearthstone.ai.batch_simulator import BatchSimulator
    assert BatchSimulator().num_workers == 4


def test_batch_simulator_custom_workers():
    from hearthstone.ai.batch_simulator import BatchSimulator
    assert BatchSimulator(num_workers=8).num_workers == 8


def test_simulate_games_all_wins():
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator(num_workers=2)
    results = sim.simulate_games(_module_level_mock_game_runner, num_games=4)
    assert results['wins'] == 4
    assert results['total_turns'] == 40
    assert results['win_rate'] == 1.0
    assert results['avg_turns'] == 10.0


def test_simulate_games_handles_errors():
    """Errors inside the worker should be counted, not crash the pool."""
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator(num_workers=2)
    results = sim.simulate_games(_module_level_raises, num_games=3)
    assert results['errors'] == 3
    assert results['wins'] == 0


def _module_level_raises():
    raise RuntimeError("boom")
```

(Note: the per-process counter trick in `_module_level_mixed_runner` is unreliable across processes — keep it out of assertions; only the all-wins and errors tests above gate the behavior.)

- [ ] **Step 2: Run updated tests on the existing implementation**

Run: `pytest tests/unit/ai/test_batch_simulator.py -v`
Expected: 4 tests PASS, 1 test (`test_simulate_games_handles_errors`) FAILS — the current `_safe_run_game` swallows the exception per-task, but the existing implementation never invokes `_safe_run_game` on the executor side; we want the new implementation to count errors. The other 4 should still pass against `ThreadPoolExecutor` if the test runs single-threaded, but we expect rewriting in Step 3 to make all 5 pass.

- [ ] **Step 3: Rewrite BatchSimulator using ProcessPoolExecutor**

Replace `hearthstone/ai/batch_simulator.py`:

```python
"""BatchSimulator: parallel game simulation with multi-process workers."""
from concurrent.futures import ProcessPoolExecutor, as_completed
from typing import Any, Callable, Dict
import multiprocessing as mp


def _run_one_game(args: tuple) -> Dict[str, Any]:
    """Top-level worker (must be picklable for spawn-context pools)."""
    game_runner, kwargs = args
    try:
        return game_runner(**kwargs)
    except Exception as e:
        return {'error': str(e), 'winner': None, 'turns': 0, 'reward': 0.0}


class BatchSimulator:
    """Run multiple game simulations in parallel using ProcessPoolExecutor.

    Pickling note: `game_runner` and any keyword arguments must be picklable
    (i.e. defined at module level, not lambdas or closures). On Linux the
    'spawn' start method is used to match macOS/Windows defaults and avoid
    fork-related bugs with PyTorch.
    """

    def __init__(self, num_workers: int = 4):
        self.num_workers = num_workers

    def simulate_games(
        self,
        game_runner: Callable[..., Dict[str, Any]],
        num_games: int,
        **kwargs,
    ) -> Dict[str, Any]:
        wins = losses = draws = errors = 0
        total_turns = 0
        total_reward = 0.0
        games: list = []

        ctx = mp.get_context('spawn')
        worker_args = [(game_runner, kwargs) for _ in range(num_games)]

        with ProcessPoolExecutor(max_workers=self.num_workers, mp_context=ctx) as pool:
            futures = [pool.submit(_run_one_game, args) for args in worker_args]
            for fut in as_completed(futures):
                try:
                    result = fut.result()
                except Exception as e:
                    result = {'error': str(e), 'winner': None, 'turns': 0, 'reward': 0.0}

                games.append(result)
                if result.get('error'):
                    errors += 1
                elif result.get('winner') == 'player1':
                    wins += 1
                elif result.get('winner') == 'player2':
                    losses += 1
                else:
                    draws += 1
                total_turns += int(result.get('turns', 0))
                total_reward += float(result.get('reward', 0.0))

        denom = num_games if num_games > 0 else 1
        return {
            'wins': wins,
            'losses': losses,
            'draws': draws,
            'errors': errors,
            'total_turns': total_turns,
            'total_reward': total_reward,
            'games': games,
            'win_rate': wins / denom,
            'avg_turns': total_turns / denom,
            'avg_reward': total_reward / denom,
        }

    def __repr__(self) -> str:
        return f"BatchSimulator(num_workers={self.num_workers})"
```

- [ ] **Step 4: Run all batch simulator tests**

Run: `pytest tests/unit/ai/test_batch_simulator.py -v`
Expected: 5 tests PASS.

- [ ] **Step 5: Run full AI test suite for regressions**

Run: `pytest tests/unit/ai/ -v`
Expected: All tests PASS — reward_functions, card_embedding, gym_env_observation, rollout_buffer, network, ppo_trainer, training_pipeline, batch_simulator, self_play.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/batch_simulator.py tests/unit/ai/test_batch_simulator.py
git commit -m "feat(ai): switch BatchSimulator to ProcessPoolExecutor

Replaces ThreadPoolExecutor with ProcessPoolExecutor (spawn context) for
true multi-core parallelism on CPU-bound simulation. Worker function
lifted to module level for pickling. Added explicit error-handling test
and updated existing tests to use module-level (picklable) game runners.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Self-Review Summary

**Spec coverage:**
- PyTorch dependency available before code that imports it → Task 1
- Reward function perspective bug → Task 2
- Observation upgrade with CardEmbedding + perspective fix → Task 3
- Sequential rollout buffer with GAE → Task 4
- Policy/Value Network using all 9 scalars → Task 5
- PPO trainer + end-to-end smoke test → Task 6
- BatchSimulator multiprocessing + pickling-safe tests → Task 7

**Type/interface consistency:**
- `RewardFunction.calculate(old, new, player_name=...)` consistent across Tasks 2, 3.
- Observation dict keys (12 total: 3 tensors + 9 scalars) consistent across Tasks 3, 4, 5, 6.
- `RolloutBuffer.get()` output (with `advantages`, `returns`, `old_log_probs`) is exactly what `PPOTrainer.update()` consumes. No random replay; PPO is on-policy throughout.
- `PolicyValueNetwork.SCALAR_KEYS` defines the 9 scalar inputs and Task 5's `test_uses_all_nine_scalar_features` enforces that none are silently dropped.
- `training_player_name` plumbed through `HearthstoneEnv` → `RewardFunction.calculate(player_name=...)`. Reward and observation share one perspective.

**Placeholder scan:** No "TBD", "TODO", "implement later", "add error handling", or "if tests fail, update them" patterns. Step 1 of Task 7 enumerates the exact tests to change.

**Edge cases covered:**
- Game ends on opponent's turn → Task 2 perspective tests.
- Observation perspective stable across turn flips → Task 3 `test_observation_perspective_is_fixed`.
- Single-step terminal episode (bootstrap value must not propagate) → Task 4 `test_gae_terminal_zeros_bootstrap`.
- All 9 scalar features influence network output → Task 5 `test_uses_all_nine_scalar_features`.
- NaN loss after many epochs → Task 6 `test_update_no_nan_over_many_epochs`.
- Action mask zeros out invalid actions → Task 6 `test_select_action_shape_and_range`.
- Worker exceptions counted, not crashing the pool → Task 7 `test_simulate_games_handles_errors`.
- Pickling constraint documented and enforced by lifting nested test helpers to module level → Task 7 Step 1.

**Decks:** `data/decks/test_deck.json` exists; `DeckManager.load_deck("test_deck")` resolves it.
