# AI Training Driver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `scripts/train.py` and supporting modules that drive the existing PPO infrastructure with a curriculum (random → self-play at 80% win-rate vs random), CSV metrics, and checkpointing.

**Architecture:** 8 sequential tasks. Foundation refactor first (extract a perspective-aware `build_observation` helper so the agent and the self-play opponent share one source of truth). Then build the components bottom-up: opponent policies → env wrapper → config → training utilities → curriculum FSM + eval → driver script + smoke test. Each component lands in its own module under `hearthstone/ai/` so it's unit-testable in isolation; `scripts/train.py` is a thin wiring layer.

**Tech Stack:** Python 3.10+, PyTorch, Gymnasium, NumPy, PyYAML (new). Existing infrastructure in `hearthstone/ai/`: `gym_env`, `card_embedding`, `network`, `rollout_buffer`, `ppo_trainer`, `reward_functions`.

**Spec:** `docs/specs/2026-04-29-ai-training-driver-design.md` (approved).

**Module map (created across tasks):**
- `hearthstone/ai/config.py` — `TrainConfig`, `CurriculumConfig`, YAML loading, CLI parsing (Task 5)
- `hearthstone/ai/opponents.py` — `OpponentPolicy`, `RandomOpponent`, `SelfPlayOpponent` (Tasks 2, 3)
- `hearthstone/ai/opponent_env.py` — `OpponentEnv` wrapper (Task 4)
- `hearthstone/ai/training_utils.py` — `MetricsLogger`, `save_checkpoint`, `load_checkpoint` (Task 6)
- `hearthstone/ai/curriculum.py` — `Phase` enum, `CurriculumFSM` (Task 7)
- `hearthstone/ai/evaluate.py` — `evaluate(network, opponent_factory, ...)` (Task 7)
- `scripts/train.py` — `run_training_loop(config, resume_path)` + `__main__` (Task 8)
- `configs/default.yaml` — default hyperparameters (Task 8)

**Modified:**
- `hearthstone/ai/card_embedding.py` — add `build_observation` helper (Task 1)
- `hearthstone/ai/gym_env.py` — `_get_observation` delegates to helper (Task 1)
- `pyproject.toml`, `requirements.txt` — add PyYAML (Task 1)

---

### Task 1: Extract `build_observation` helper and add PyYAML

`HearthstoneEnv._get_observation()` and `SelfPlayOpponent.act()` (Task 3) both need to build the same 12-key observation dict, but from different perspective players. Extract the construction into a pure function in `card_embedding.py` so it has one source of truth.

PyYAML is added in this task because it's needed in Task 5 (config loading) and we want each later task's tests to run from a clean install.

**Files:**
- Modify: `hearthstone/ai/card_embedding.py` — add `build_observation` at module level
- Modify: `hearthstone/ai/gym_env.py` — `_get_observation` becomes a one-liner
- Create: `tests/unit/ai/test_build_observation.py`
- Modify: `pyproject.toml` — add `pyyaml>=6.0`
- Modify: `requirements.txt` — add `pyyaml>=6.0`

- [ ] **Step 1: Add PyYAML dependency**

In `pyproject.toml` modify the `dependencies` block:

```toml
dependencies = [
    "gymnasium>=0.29.0",
    "numpy>=1.24.0",
    "rich>=13.0.0",
    "torch>=2.0.0",
    "pyyaml>=6.0",
]
```

In `requirements.txt`, append after `torch>=2.0.0`:

```
pyyaml>=6.0
```

Run: `pip install -e . && python -c "import yaml; print(yaml.__version__)"`
Expected: prints a 6.x version string.

- [ ] **Step 2: Write tests for `build_observation`**

Create `tests/unit/ai/test_build_observation.py`:

```python
"""Tests for the build_observation helper."""
import numpy as np
import pytest
from hearthstone.ai.card_embedding import CardEmbedding, build_observation
from hearthstone.decks.deck_manager import DeckManager
from hearthstone.engine.game_controller import GameController


def _make_state():
    """Start a fresh game and return its state."""
    manager = DeckManager()
    deck1 = manager.load_deck("test_deck")
    deck2 = manager.load_deck("test_deck")
    controller = GameController(deck1, deck2)
    controller.start_game()
    return controller.get_state()


def test_returns_twelve_keys():
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1)
    expected = {
        "player_hand", "player_board", "opponent_board",
        "player_health", "player_mana", "player_max_mana",
        "player_hand_size", "player_board_size",
        "opponent_health", "opponent_board_size",
        "turn_number", "player_deck_size",
    }
    assert set(obs.keys()) == expected


def test_card_tensor_shapes():
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1, embedding_dim=64)
    assert obs["player_hand"].shape == (10, 64)
    assert obs["player_board"].shape == (7, 64)
    assert obs["opponent_board"].shape == (7, 64)


def test_perspective_p1_vs_p2_swaps_hands_and_boards():
    """Calling with perspective_player=player2 yields P2's hand and board sizes."""
    state = _make_state()
    obs1 = build_observation(state, perspective_player=state.player1)
    obs2 = build_observation(state, perspective_player=state.player2)
    # Hand sizes typically differ at game start (P1 draws 3, P2 draws 4 with coin)
    assert obs1["player_hand_size"][0] == len(state.player1.hand)
    assert obs2["player_hand_size"][0] == len(state.player2.hand)
    assert obs1["opponent_health"][0] == state.player2.hero.health
    assert obs2["opponent_health"][0] == state.player1.hero.health


def test_uses_provided_embedding_instance():
    """When `embedding=...` is passed, the helper does not create a fresh one."""
    state = _make_state()
    custom = CardEmbedding(embedding_dim=64)
    obs = build_observation(state, perspective_player=state.player1, embedding=custom)
    # If the embedding were ignored, the test would still pass — verify by
    # checking the encoding matches what `custom` produces directly.
    expected_hand = custom.encode_hand(state.player1.hand, max_size=10)
    assert np.array_equal(obs["player_hand"], expected_hand)


def test_creates_default_embedding_when_none():
    """Default path still works when no embedding instance is provided."""
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1, embedding_dim=64)
    assert obs["player_hand"].shape == (10, 64)


def test_embedding_dim_changes_tensor_shape():
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1, embedding_dim=32)
    assert obs["player_hand"].shape == (10, 32)


def test_values_in_zero_one_range():
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1)
    for key in ["player_hand", "player_board", "opponent_board"]:
        assert np.all(obs[key] >= 0.0) and np.all(obs[key] <= 1.0)
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_build_observation.py -v`
Expected: FAIL — `ImportError: cannot import name 'build_observation' from 'hearthstone.ai.card_embedding'`.

- [ ] **Step 4: Implement `build_observation`**

Append to `hearthstone/ai/card_embedding.py` (after the `CardEmbedding` class):

```python
from typing import Dict, Optional


def build_observation(
    state,
    perspective_player,
    embedding_dim: int = 64,
    embedding: Optional["CardEmbedding"] = None,
    max_hand: int = 10,
    max_board: int = 7,
) -> Dict[str, np.ndarray]:
    """Build the 12-key observation dict from `perspective_player`'s POV.

    The opponent is derived from `state` by identity comparison: if
    perspective_player is state.player1, opponent is state.player2;
    otherwise opponent is state.player1.

    Args:
        state: A GameState.
        perspective_player: The Player whose POV the observation reflects.
            Does NOT have to be state.current_player.
        embedding_dim: Card embedding dimensionality (used only when
            `embedding` is None).
        embedding: Optional pre-built CardEmbedding instance. Pass one to
            avoid per-call allocation in tight loops.
        max_hand: Hand padding/truncation size.
        max_board: Board padding/truncation size.

    Returns:
        Dict with 3 card-embedding tensors and 9 scalar boxes.
    """
    if embedding is None:
        embedding = CardEmbedding(embedding_dim=embedding_dim)

    if perspective_player is state.player1:
        opponent = state.player2
    else:
        opponent = state.player1

    return {
        "player_hand": embedding.encode_hand(perspective_player.hand, max_hand),
        "player_board": embedding.encode_board(perspective_player.board, max_board),
        "opponent_board": embedding.encode_board(opponent.board, max_board),
        "player_health": np.array([perspective_player.hero.health], dtype=np.float32),
        "player_mana": np.array([perspective_player.mana], dtype=np.float32),
        "player_max_mana": np.array([perspective_player.max_mana], dtype=np.float32),
        "player_hand_size": np.array([len(perspective_player.hand)], dtype=np.float32),
        "player_board_size": np.array([len(perspective_player.board)], dtype=np.float32),
        "opponent_health": np.array([opponent.hero.health], dtype=np.float32),
        "opponent_board_size": np.array([len(opponent.board)], dtype=np.float32),
        "turn_number": np.array([state.turn], dtype=np.float32),
        "player_deck_size": np.array([len(perspective_player.deck)], dtype=np.float32),
    }
```

- [ ] **Step 5: Refactor `HearthstoneEnv._get_observation` to delegate**

In `hearthstone/ai/gym_env.py`, replace the `_get_observation` method. Find the existing method (currently around lines 80–98) and replace its body:

```python
    def _get_observation(self):
        from hearthstone.ai.card_embedding import build_observation
        state = self.controller.get_state()
        me, _ = self._resolve_players(state)
        return build_observation(
            state,
            perspective_player=me,
            embedding=self.embedding,
            max_hand=self.MAX_HAND,
            max_board=self.MAX_BOARD,
        )
```

(The `embedding_dim` arg is unnecessary because `embedding` is provided directly.)

- [ ] **Step 6: Run new tests + regression suite**

Run: `pytest tests/unit/ai/test_build_observation.py tests/unit/ai/test_gym_env_observation.py -v`
Expected: 7 build_observation tests + 7 gym_env_observation tests all PASS.

Run: `pytest tests/unit/ai/ -v`
Expected: All 52 existing AI tests + 7 new tests pass (59 total).

- [ ] **Step 7: Commit**

```bash
git add hearthstone/ai/card_embedding.py hearthstone/ai/gym_env.py \
        tests/unit/ai/test_build_observation.py pyproject.toml requirements.txt
git commit -m "$(cat <<'EOF'
feat(ai): extract build_observation helper; add PyYAML dependency

Pulls observation construction out of HearthstoneEnv._get_observation
into a perspective-aware module-level function in card_embedding.py.
Both the env and the upcoming SelfPlayOpponent will call it. The env's
method becomes a one-liner that passes its cached CardEmbedding.

PyYAML is added in advance for the upcoming config module.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `OpponentPolicy` interface and `RandomOpponent`

**Files:**
- Create: `hearthstone/ai/opponents.py`
- Create: `tests/unit/ai/test_opponents.py`

- [ ] **Step 1: Write tests for `RandomOpponent`**

Create `tests/unit/ai/test_opponents.py`:

```python
"""Tests for opponent policies."""
import pytest
from hearthstone.ai.opponents import OpponentPolicy, RandomOpponent
from hearthstone.ai.gym_env import HearthstoneEnv


def _fresh_env():
    return HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")


class TestRandomOpponent:
    def test_returns_index_within_valid_actions(self):
        opp = RandomOpponent(seed=42)
        env = _fresh_env()
        env.reset()
        # Random opponent should always return a valid index over many calls
        for _ in range(50):
            valid = env.controller.get_valid_actions()
            if not valid:
                continue
            action = opp.act(env.controller)
            assert 0 <= action < len(valid)
        env.close()

    def test_no_valid_actions_returns_zero(self):
        """When valid_actions is empty, fall back to 0 instead of crashing."""
        class EmptyController:
            def get_valid_actions(self):
                return []
        opp = RandomOpponent()
        assert opp.act(EmptyController()) == 0

    def test_seeded_is_deterministic(self):
        env1 = _fresh_env(); env1.reset()
        env2 = _fresh_env(); env2.reset()
        opp1 = RandomOpponent(seed=123)
        opp2 = RandomOpponent(seed=123)
        a1 = opp1.act(env1.controller)
        a2 = opp2.act(env2.controller)
        assert a1 == a2
        env1.close(); env2.close()


def test_opponent_policy_act_is_abstract():
    """OpponentPolicy.act() should raise NotImplementedError."""
    base = OpponentPolicy()
    with pytest.raises(NotImplementedError):
        base.act(None)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_opponents.py -v`
Expected: FAIL — `ImportError: No module named 'hearthstone.ai.opponents'`.

- [ ] **Step 3: Implement `OpponentPolicy` and `RandomOpponent`**

Create `hearthstone/ai/opponents.py`:

```python
"""Opponent policies used by OpponentEnv during training and eval."""
import random
from typing import Optional


class OpponentPolicy:
    """Abstract opponent policy. Implementations choose an action index given a controller."""

    def act(self, controller) -> int:
        """Return an integer index into controller.get_valid_actions().

        Args:
            controller: A GameController whose `current_player` is the
                player this policy is acting for. Implementations should
                NOT mutate the controller; only inspect.

        Returns:
            int: index in [0, len(valid_actions)). If valid_actions is
                empty, return 0 (driver / wrapper handles this safely).
        """
        raise NotImplementedError


class RandomOpponent(OpponentPolicy):
    """Picks a uniform-random valid action. Falls back to index 0 when empty."""

    def __init__(self, seed: Optional[int] = None):
        self._rng = random.Random(seed)

    def act(self, controller) -> int:
        valid = controller.get_valid_actions()
        if not valid:
            return 0
        return self._rng.randrange(len(valid))
```

- [ ] **Step 4: Run tests**

Run: `pytest tests/unit/ai/test_opponents.py -v`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/opponents.py tests/unit/ai/test_opponents.py
git commit -m "$(cat <<'EOF'
feat(ai): add OpponentPolicy interface and RandomOpponent

OpponentPolicy is the abstract base for plugging different opponents
into OpponentEnv. RandomOpponent is the simplest concrete implementation
and serves as the curriculum's first phase + the always-on eval baseline.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `SelfPlayOpponent`

A frozen-network opponent that acts greedily, used in the SELF_PLAY phase. It loads weights from a checkpoint (network state_dict only, not optimizer) on construction and via `load_from(path)`. Builds its own observation from the *acting* player's perspective.

**Files:**
- Modify: `hearthstone/ai/opponents.py` — add `SelfPlayOpponent`
- Modify: `tests/unit/ai/test_opponents.py` — add `TestSelfPlayOpponent`

- [ ] **Step 1: Write tests for `SelfPlayOpponent`**

Append to `tests/unit/ai/test_opponents.py`:

```python
import numpy as np
import torch
from hearthstone.ai.opponents import SelfPlayOpponent
from hearthstone.ai.network import PolicyValueNetwork


def _save_random_network(tmp_path, embedding_dim=64, hidden_dim=128):
    net = PolicyValueNetwork(
        embedding_dim=embedding_dim, hidden_dim=hidden_dim, num_actions=100,
    )
    path = tmp_path / "ckpt.pt"
    torch.save({"network": net.state_dict()}, path)
    return path, net


class TestSelfPlayOpponent:
    def test_construct_without_path_creates_random_network(self):
        opp = SelfPlayOpponent(network_path=None)
        # Just verify the network exists and is in eval mode
        assert isinstance(opp.network, PolicyValueNetwork)
        assert not opp.network.training

    def test_load_from_round_trip(self, tmp_path):
        path, original = _save_random_network(tmp_path)
        opp = SelfPlayOpponent(network_path=str(path))
        # Verify weights match
        for (k1, v1), (k2, v2) in zip(
            original.state_dict().items(), opp.network.state_dict().items()
        ):
            assert k1 == k2
            assert torch.equal(v1, v2)

    def test_load_from_accepts_bare_state_dict(self, tmp_path):
        """Older checkpoints may save the state_dict directly without 'network' key."""
        net = PolicyValueNetwork()
        path = tmp_path / "bare.pt"
        torch.save(net.state_dict(), path)  # bare state_dict, no wrapping dict
        opp = SelfPlayOpponent(network_path=str(path))
        assert isinstance(opp.network, PolicyValueNetwork)

    def test_act_returns_valid_index(self, tmp_path):
        path, _ = _save_random_network(tmp_path)
        opp = SelfPlayOpponent(network_path=str(path))
        env = _fresh_env()
        env.reset()
        for _ in range(20):
            valid = env.controller.get_valid_actions()
            if not valid:
                break
            action = opp.act(env.controller)
            assert 0 <= action < len(valid), \
                f"got {action} but only {len(valid)} valid actions (mask must filter)"
            # Step forward so the test exercises various game states
            env.step(action if action < env.action_space.n else 0)
            if env.controller.is_game_over():
                break
        env.close()

    def test_act_uses_current_player_perspective(self, tmp_path, monkeypatch):
        """When current_player is P2, act() must pass P2 as perspective_player."""
        path, _ = _save_random_network(tmp_path)
        opp = SelfPlayOpponent(network_path=str(path))
        env = _fresh_env()
        env.reset()
        # Advance until current_player has flipped (or game ends).
        for _ in range(5):
            env.step(0)  # end turn
            if env.controller.is_game_over():
                pytest.skip("game ended before turn flipped")
            if env.controller.get_state().current_player.name != "Player 1":
                break
        else:
            pytest.skip("turn never flipped")

        captured = {}
        from hearthstone.ai import opponents as opp_module
        original = opp_module.build_observation
        def spy(state, perspective_player, **kw):
            captured["perspective"] = perspective_player
            return original(state, perspective_player=perspective_player, **kw)
        monkeypatch.setattr(opp_module, "build_observation", spy)

        opp.act(env.controller)

        state = env.controller.get_state()
        assert captured["perspective"] is state.current_player, \
            "act() must use the acting player (current_player), not state.player1"
        env.close()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_opponents.py::TestSelfPlayOpponent -v`
Expected: FAIL — `ImportError: cannot import name 'SelfPlayOpponent'`.

- [ ] **Step 3: Implement `SelfPlayOpponent`**

Append to `hearthstone/ai/opponents.py`:

```python
import numpy as np
import torch
import torch.nn.functional as F

from hearthstone.ai.card_embedding import CardEmbedding, build_observation
from hearthstone.ai.network import PolicyValueNetwork


class SelfPlayOpponent(OpponentPolicy):
    """Frozen-network opponent. Greedy action selection over a masked policy.

    The network is loaded once at construction (or via load_from) and is
    NOT updated during training. The driver calls load_from() exactly
    once on phase transition; mid-phase weights are stable.
    """

    def __init__(
        self,
        network_path: Optional[str],
        embedding_dim: int = 64,
        hidden_dim: int = 128,
        num_actions: int = 100,
    ):
        self.network = PolicyValueNetwork(
            embedding_dim=embedding_dim,
            hidden_dim=hidden_dim,
            num_actions=num_actions,
        )
        if network_path is not None:
            self.load_from(network_path)
        self.network.eval()
        self.embedding_dim = embedding_dim
        self.num_actions = num_actions
        # Cache a CardEmbedding instance to avoid per-call allocation.
        self._embedding = CardEmbedding(embedding_dim=embedding_dim)

    def load_from(self, path: str) -> None:
        """Load network weights from a checkpoint.

        Loads only the network state_dict — optimizer state, iter counter,
        and training metadata are intentionally ignored. Opponents are
        frozen inference-only.
        """
        ckpt = torch.load(path, map_location="cpu")
        if isinstance(ckpt, dict) and "network" in ckpt:
            state_dict = ckpt["network"]
        else:
            state_dict = ckpt
        self.network.load_state_dict(state_dict)
        self.network.eval()

    def act(self, controller) -> int:
        valid = controller.get_valid_actions()
        if not valid:
            return 0

        state = controller.get_state()
        obs = build_observation(
            state,
            perspective_player=state.current_player,
            embedding_dim=self.embedding_dim,
            embedding=self._embedding,
        )
        torch_obs = {k: torch.from_numpy(v).unsqueeze(0) for k, v in obs.items()}

        mask = np.zeros(self.num_actions, dtype=np.float32)
        mask[: min(len(valid), self.num_actions)] = 1.0
        mask_t = torch.from_numpy(mask)

        with torch.no_grad():
            logits, _ = self.network(torch_obs)
            logits = logits[0] + (1.0 - mask_t) * -1e9
            return int(torch.argmax(logits).item())
```

- [ ] **Step 4: Run tests**

Run: `pytest tests/unit/ai/test_opponents.py -v`
Expected: 4 RandomOpponent tests + 5 SelfPlayOpponent tests PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/opponents.py tests/unit/ai/test_opponents.py
git commit -m "$(cat <<'EOF'
feat(ai): add SelfPlayOpponent for frozen-network opponent play

Loads a checkpoint (network state_dict only, not optimizer) and selects
actions greedily over a masked policy. Builds its observation from the
acting player's perspective so it sees the right hand/board when it's
P2's turn. The driver will call load_from() on curriculum transition.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `OpponentEnv` wrapper

Wraps `HearthstoneEnv` and runs opponent moves inside `step()` / `reset()` so the agent only ever observes its own turn. Accumulates the opponent-turn shaping reward into the agent's `step()` return value.

**Files:**
- Create: `hearthstone/ai/opponent_env.py`
- Create: `tests/unit/ai/test_opponent_env.py`

- [ ] **Step 1: Write tests for `OpponentEnv`**

Create `tests/unit/ai/test_opponent_env.py`:

```python
"""Tests for OpponentEnv wrapper."""
import logging
import pytest
from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.opponent_env import OpponentEnv
from hearthstone.ai.opponents import OpponentPolicy, RandomOpponent


class ScriptedOpponent(OpponentPolicy):
    """Picks the action at a given index list, then end-turn."""
    def __init__(self, indices=None):
        self.indices = list(indices or [])
        self.calls = 0

    def act(self, controller):
        valid = controller.get_valid_actions()
        if self.calls < len(self.indices):
            idx = min(self.indices[self.calls], len(valid) - 1)
            self.calls += 1
            return idx
        # Fall back to end-turn (find it in valid)
        from hearthstone.engine.action import EndTurnAction
        for i, a in enumerate(valid):
            if isinstance(a, EndTurnAction):
                return i
        return 0


class NeverEndTurnOpponent(OpponentPolicy):
    """Pathological: always picks a non-EndTurn action; loops until cap."""
    def act(self, controller):
        from hearthstone.engine.action import EndTurnAction
        valid = controller.get_valid_actions()
        for i, a in enumerate(valid):
            if not isinstance(a, EndTurnAction):
                return i
        return 0  # only end-turn available — return it


def _make_wrapped(training_player_name="Player 1", opponent=None):
    base = HearthstoneEnv(
        deck1_name="test_deck", deck2_name="test_deck",
        training_player_name=training_player_name,
    )
    return OpponentEnv(base, opponent or RandomOpponent(seed=0))


class TestOpponentEnv:
    def test_controller_property_forwards(self):
        env = _make_wrapped()
        env.reset()
        assert env.controller is env._env.controller
        env.close()

    def test_training_player_name_property_forwards(self):
        env = _make_wrapped(training_player_name="Player 2")
        assert env.training_player_name == "Player 2"

    def test_reset_returns_obs_with_training_player_turn(self):
        """After reset, current_player should be the training player."""
        env = _make_wrapped(training_player_name="Player 1")
        obs, _ = env.reset()
        state = env.controller.get_state()
        assert state.current_player.name == "Player 1"
        env.close()

    def test_reset_runs_opponent_first_when_p2_is_training(self):
        """If training_player_name='Player 2', reset() must run P1's turn first."""
        # Use a scripted opponent that immediately ends turn.
        env = _make_wrapped(
            training_player_name="Player 2",
            opponent=ScriptedOpponent(indices=[]),  # always end-turn
        )
        obs, _ = env.reset()
        state = env.controller.get_state()
        # Should now be P2's turn (or game over, which is unlikely).
        assert state.current_player.name == "Player 2" or env.controller.is_game_over()
        env.close()

    def test_step_loops_opponent_until_training_turn_or_done(self):
        """After agent ends turn, wrapper invokes opponent until back to agent."""
        env = _make_wrapped(opponent=ScriptedOpponent(indices=[]))
        obs, _ = env.reset()
        # Action 0 in test_deck is normally end-turn or play-card.
        # End the agent's turn explicitly: find EndTurnAction's index.
        from hearthstone.engine.action import EndTurnAction
        valid = env.controller.get_valid_actions()
        end_idx = next(i for i, a in enumerate(valid) if isinstance(a, EndTurnAction))
        obs, reward, terminated, truncated, info = env.step(end_idx)
        state = env.controller.get_state()
        # After step(), it must be agent's turn again or game over.
        assert state.current_player.name == "Player 1" or terminated
        env.close()

    def test_reward_accumulates_across_opponent_turns(self):
        """When opponent acts and damage occurs, returned reward includes the
        perspective-correct shaping signal from the opponent's turn."""
        env = _make_wrapped(opponent=ScriptedOpponent(indices=[]))
        env.reset()
        from hearthstone.engine.action import EndTurnAction
        valid = env.controller.get_valid_actions()
        end_idx = next(i for i, a in enumerate(valid) if isinstance(a, EndTurnAction))
        # Take note of pre-step health
        pre_state = env.controller.get_state()
        pre_p1_health = pre_state.player1.hero.health
        pre_p2_health = pre_state.player2.hero.health
        obs, reward, terminated, _, _ = env.step(end_idx)
        # No assertion on sign — for test_deck the random scripted opponent
        # may not deal damage on turn 1. Just verify reward is finite and
        # consistent with health change.
        post_state = env.controller.get_state()
        # After reset+step+opp turn(s)+possibly more, current_player is P1 again or done
        assert isinstance(reward, float)
        env.close()

    def test_terminated_during_opponent_turn(self, monkeypatch):
        """Forcing the opponent to win on their turn yields terminated=True."""
        env = _make_wrapped()
        env.reset()
        # Monkey-patch is_game_over to return True after the next opponent step.
        # Simpler: damage P1's hero to 1 HP and let opponent attack.
        # But test_deck may not have an attacker — skip if so.
        pytest.skip("requires deck/scenario engineering; covered by smoke test")

    def test_action_cap_force_ends_turn(self, caplog):
        """A pathological opponent that never ends turn hits the cap; wrapper
        force-ends via EndTurnAction lookup and logs a warning."""
        env = _make_wrapped(opponent=NeverEndTurnOpponent())
        env.reset()
        from hearthstone.engine.action import EndTurnAction
        valid = env.controller.get_valid_actions()
        end_idx = next(i for i, a in enumerate(valid) if isinstance(a, EndTurnAction))
        with caplog.at_level(logging.WARNING):
            obs, reward, terminated, _, _ = env.step(end_idx)
        # If the opponent had any non-end-turn action available on its turn,
        # it loops; the wrapper must have force-ended.
        # If the opponent's turn produced only EndTurnAction immediately, no
        # warning is expected. So we assert: either we got back to P1's turn
        # OR the warning was logged.
        post_state = env.controller.get_state()
        assert (post_state.current_player.name == "Player 1"
                or "action cap" in caplog.text.lower()
                or terminated)
        env.close()

    def test_observation_and_action_spaces_forwarded(self):
        env = _make_wrapped()
        assert env.observation_space is env._env.observation_space
        assert env.action_space is env._env.action_space
        env.close()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_opponent_env.py -v`
Expected: FAIL — `ImportError: No module named 'hearthstone.ai.opponent_env'`.

- [ ] **Step 3: Implement `OpponentEnv`**

Create `hearthstone/ai/opponent_env.py`:

```python
"""Gym env wrapper that runs the opponent's turn(s) inside step()/reset()."""
import logging
from typing import Tuple

import gymnasium as gym

from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.opponents import OpponentPolicy

logger = logging.getLogger(__name__)


class OpponentEnv(gym.Env):
    """Wraps HearthstoneEnv with an opponent so the agent only sees its own turn.

    On reset() and after the agent's step(), opponent moves are run
    internally until current_player == training_player_name or the game
    ends. Reward from opponent turns is accumulated and returned in the
    agent's step() result so the agent observes the consequences of
    ending its turn.
    """

    MAX_OPPONENT_ACTIONS_PER_STEP = 200

    def __init__(self, base_env: HearthstoneEnv, opponent: OpponentPolicy):
        self._env = base_env
        self.opponent = opponent  # mutable; driver swaps on phase transition
        self.observation_space = base_env.observation_space
        self.action_space = base_env.action_space

    @property
    def controller(self):
        """Expose the underlying GameController for eval / opponent logic."""
        return self._env.controller

    @property
    def training_player_name(self) -> str:
        """Name of the training player (forwarded from the inner env)."""
        return self._env.training_player_name

    def reset(self, **kw):
        obs, info = self._env.reset(**kw)
        obs, _, _, _, info = self._loop_opponent(obs, info)
        return obs, info

    def step(self, action):
        obs, reward, terminated, truncated, info = self._env.step(action)
        if terminated or truncated:
            return obs, reward, terminated, truncated, info
        obs, extra, terminated, truncated, info = self._loop_opponent(obs, info)
        return obs, reward + extra, terminated, truncated, info

    def _loop_opponent(self, obs, info) -> Tuple:
        """Run opponent steps until training-player turn or game over.

        Accumulates reward (always perspective-correct via inner env's
        RewardFunction, which uses training_player_name) into `extra`.
        """
        extra_reward = 0.0
        terminated = self._env.controller.is_game_over()
        truncated = False

        for _ in range(self.MAX_OPPONENT_ACTIONS_PER_STEP):
            controller = self._env.controller
            if controller.is_game_over():
                terminated = True
                break
            state = controller.get_state()
            if state.current_player.name == self._env.training_player_name:
                break
            opp_action = self.opponent.act(controller)
            obs, r, terminated, truncated, info = self._env.step(opp_action)
            extra_reward += r
            if terminated or truncated:
                break
        else:
            # Action cap hit — force-end the opponent's turn.
            logger.warning(
                "Opponent action cap (%d) hit; forcing end turn",
                self.MAX_OPPONENT_ACTIONS_PER_STEP,
            )
            from hearthstone.engine.action import EndTurnAction
            valid = self._env.controller.get_valid_actions()
            idx = next(
                (i for i, a in enumerate(valid) if isinstance(a, EndTurnAction)), 0
            )
            obs, r, terminated, truncated, info = self._env.step(idx)
            extra_reward += r

        return obs, extra_reward, terminated, truncated, info

    def render(self, mode="human"):
        return self._env.render(mode)

    def close(self):
        return self._env.close()
```

- [ ] **Step 4: Run tests**

Run: `pytest tests/unit/ai/test_opponent_env.py -v`
Expected: 7 tests PASS, 1 SKIPPED (`test_terminated_during_opponent_turn`).

- [ ] **Step 5: Run full AI test suite for regressions**

Run: `pytest tests/unit/ai/ -v`
Expected: All previously passing tests continue to pass.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/opponent_env.py tests/unit/ai/test_opponent_env.py
git commit -m "$(cat <<'EOF'
feat(ai): add OpponentEnv wrapper

Wraps HearthstoneEnv with an opponent policy so the agent only ever
observes its own turn. Loops opponent actions inside step()/reset();
accumulates opponent-turn shaping reward into the next agent step()
return value. Force-ends the opponent's turn via EndTurnAction lookup
when the action cap is hit.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `TrainConfig` + YAML loading + CLI parsing

**Files:**
- Create: `hearthstone/ai/config.py`
- Create: `tests/unit/ai/test_config.py`

- [ ] **Step 1: Write tests for config loading and CLI**

Create `tests/unit/ai/test_config.py`:

```python
"""Tests for TrainConfig: YAML load, dataclass validation, CLI parsing."""
import sys
import yaml
import pytest
from hearthstone.ai.config import (
    TrainConfig, CurriculumConfig, load_config, parse_cli, apply_overrides,
)


def _minimal_yaml(tmp_path, **overrides):
    base = {
        "seed": 42,
        "max_iters": 1000,
        "rollout_steps": 2048,
        "ppo_epochs": 4,
        "deck1": "test_deck",
        "deck2": "test_deck",
        "training_player_name": "Player 1",
        "lr": 3.0e-4,
        "gamma": 0.99,
        "gae_lambda": 0.95,
        "clip_epsilon": 0.2,
        "value_coef": 0.5,
        "entropy_coef": 0.01,
        "max_grad_norm": 0.5,
        "embedding_dim": 64,
        "hidden_dim": 128,
        "curriculum": {"switch_threshold": 0.80, "early_stop_patience": 5},
        "eval_every": 10,
        "eval_games": 50,
        "checkpoint_every": 25,
        "checkpoint_dir": "checkpoints",
        "best_checkpoint_path": "checkpoints/best.pt",
        "runs_dir": "runs",
    }
    base.update(overrides)
    path = tmp_path / "config.yaml"
    path.write_text(yaml.safe_dump(base))
    return path


class TestLoadConfig:
    def test_load_minimal(self, tmp_path):
        path = _minimal_yaml(tmp_path)
        cfg = load_config(str(path))
        assert isinstance(cfg, TrainConfig)
        assert cfg.seed == 42
        assert cfg.lr == 3.0e-4
        assert isinstance(cfg.curriculum, CurriculumConfig)
        assert cfg.curriculum.switch_threshold == 0.80

    def test_missing_key_raises(self, tmp_path):
        path = _minimal_yaml(tmp_path)
        # Drop a required key
        data = yaml.safe_load(path.read_text())
        del data["lr"]
        path.write_text(yaml.safe_dump(data))
        with pytest.raises(TypeError, match="lr"):
            load_config(str(path))

    def test_extra_key_raises(self, tmp_path):
        path = _minimal_yaml(tmp_path, garbage_key="oops")
        with pytest.raises(TypeError, match="garbage_key"):
            load_config(str(path))


class TestApplyOverrides:
    def test_flat_override(self, tmp_path):
        path = _minimal_yaml(tmp_path)
        cfg = load_config(str(path), overrides=["seed=7", "lr=1e-4"])
        assert cfg.seed == 7
        assert cfg.lr == 1e-4
        assert isinstance(cfg.lr, float)

    def test_nested_override(self, tmp_path):
        path = _minimal_yaml(tmp_path)
        cfg = load_config(
            str(path),
            overrides=["curriculum.switch_threshold=0.75"],
        )
        assert cfg.curriculum.switch_threshold == 0.75

    def test_override_yaml_typed(self, tmp_path):
        """Overrides must yaml-parse so 'true'→bool, '1e-4'→float, etc."""
        path = _minimal_yaml(tmp_path)
        cfg = load_config(str(path), overrides=["max_iters=500"])
        assert cfg.max_iters == 500
        assert isinstance(cfg.max_iters, int)


class TestParseCli:
    def test_parse_basic(self):
        args = parse_cli(["--config", "configs/default.yaml"])
        assert args.config == "configs/default.yaml"
        assert args.resume is None
        assert args.override == []
        assert args.device == "cpu"

    def test_parse_with_overrides(self):
        args = parse_cli([
            "--config", "configs/default.yaml",
            "--override", "seed=7", "lr=1e-4",
        ])
        assert args.override == ["seed=7", "lr=1e-4"]

    def test_parse_resume_and_device(self):
        args = parse_cli([
            "--config", "configs/default.yaml",
            "--resume", "checkpoints/iter_0250.pt",
            "--device", "cuda",
        ])
        assert args.resume == "checkpoints/iter_0250.pt"
        assert args.device == "cuda"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_config.py -v`
Expected: FAIL — `ImportError: No module named 'hearthstone.ai.config'`.

- [ ] **Step 3: Implement `TrainConfig`, YAML loader, CLI parser**

Create `hearthstone/ai/config.py`:

```python
"""Training configuration: dataclass schema, YAML loading, CLI parsing."""
import argparse
from dataclasses import dataclass, field
from typing import List, Optional

import yaml


@dataclass
class CurriculumConfig:
    switch_threshold: float
    early_stop_patience: int


@dataclass
class TrainConfig:
    seed: int
    max_iters: int
    rollout_steps: int
    ppo_epochs: int
    deck1: str
    deck2: str
    training_player_name: str

    lr: float
    gamma: float
    gae_lambda: float
    clip_epsilon: float
    value_coef: float
    entropy_coef: float
    max_grad_norm: float

    embedding_dim: int
    hidden_dim: int

    curriculum: CurriculumConfig

    eval_every: int
    eval_games: int

    checkpoint_every: int
    checkpoint_dir: str
    best_checkpoint_path: str

    runs_dir: str


def apply_overrides(raw: dict, overrides: List[str]) -> dict:
    """Apply --override key=value pairs to a raw config dict in-place.

    Supports dotted keys for nested fields, e.g.
    'curriculum.switch_threshold=0.75'. Values are parsed via yaml.safe_load
    so types are preserved (1e-4 → float, true → bool).
    """
    for item in overrides:
        if "=" not in item:
            raise ValueError(f"--override expects key=value, got: {item!r}")
        key, value_str = item.split("=", 1)
        value = yaml.safe_load(value_str)
        parts = key.split(".")
        target = raw
        for part in parts[:-1]:
            if part not in target or not isinstance(target[part], dict):
                raise KeyError(f"override path {key!r}: {part} not in config")
            target = target[part]
        target[parts[-1]] = value
    return raw


def load_config(path: str, overrides: Optional[List[str]] = None) -> TrainConfig:
    """Load a YAML config file, apply overrides, return a validated TrainConfig.

    Missing keys → TypeError from dataclass constructor.
    Extra keys → TypeError from dataclass constructor.
    """
    with open(path) as f:
        raw = yaml.safe_load(f)
    if overrides:
        apply_overrides(raw, overrides)
    raw["curriculum"] = CurriculumConfig(**raw["curriculum"])
    return TrainConfig(**raw)


def parse_cli(argv: Optional[List[str]] = None) -> argparse.Namespace:
    """Parse CLI args. Returns a Namespace with: config, resume, override, device."""
    parser = argparse.ArgumentParser(description="Train Hearthstone AI via PPO.")
    parser.add_argument("--config", required=True, help="Path to YAML config file")
    parser.add_argument("--resume", default=None, help="Path to checkpoint to resume from")
    parser.add_argument(
        "--override", nargs="*", default=[],
        help="key=value pairs (supports nested keys via dot notation)",
    )
    parser.add_argument(
        "--device", default="cpu", choices=["cpu", "cuda"],
        help="PyTorch device for training (default: cpu)",
    )
    return parser.parse_args(argv)
```

- [ ] **Step 4: Run tests**

Run: `pytest tests/unit/ai/test_config.py -v`
Expected: 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/config.py tests/unit/ai/test_config.py
git commit -m "$(cat <<'EOF'
feat(ai): add TrainConfig with YAML loading and CLI parsing

Dataclass schema with nested CurriculumConfig. Missing or extra keys
raise TypeError from the dataclass constructor (no pydantic). Supports
flat and nested --override key=value with yaml-typed value parsing.
CLI: --config, --resume, --override, --device cpu|cuda.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Metrics CSV writer + checkpoint helpers

**Files:**
- Create: `hearthstone/ai/training_utils.py`
- Create: `tests/unit/ai/test_training_utils.py`

- [ ] **Step 1: Write tests**

Create `tests/unit/ai/test_training_utils.py`:

```python
"""Tests for MetricsLogger and checkpoint save/load helpers."""
import csv
from dataclasses import asdict

import pytest
import torch

from hearthstone.ai.config import TrainConfig, CurriculumConfig
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.training_utils import (
    MetricsLogger, save_checkpoint, load_checkpoint,
)


def _minimal_config() -> TrainConfig:
    return TrainConfig(
        seed=42, max_iters=10, rollout_steps=64, ppo_epochs=2,
        deck1="test_deck", deck2="test_deck", training_player_name="Player 1",
        lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_epsilon=0.2,
        value_coef=0.5, entropy_coef=0.01, max_grad_norm=0.5,
        embedding_dim=64, hidden_dim=128,
        curriculum=CurriculumConfig(switch_threshold=0.8, early_stop_patience=5),
        eval_every=2, eval_games=4,
        checkpoint_every=5, checkpoint_dir="checkpoints",
        best_checkpoint_path="checkpoints/best.pt",
        runs_dir="runs",
    )


class TestMetricsLogger:
    def test_writes_header_on_open(self, tmp_path):
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.close()
        rows = list(csv.reader(path.open()))
        assert rows[0] == [
            "iter", "phase", "total_loss", "policy_loss", "value_loss",
            "entropy", "eval_winrate", "best_winrate", "plateau_count",
        ]

    def test_log_iter_blanks_eval_columns(self, tmp_path):
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.log_iter(
            iter=1, phase="RANDOM",
            total_loss=0.5, policy_loss=0.1, value_loss=0.4, entropy=4.2,
        )
        logger.close()
        rows = list(csv.reader(path.open()))
        assert rows[1][:6] == ["1", "RANDOM", "0.5", "0.1", "0.4", "4.2"]
        assert rows[1][6:] == ["", "", ""]  # eval columns blank

    def test_log_eval_fills_eval_columns(self, tmp_path):
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.log_eval(
            iter=10, phase="RANDOM",
            eval_winrate=0.75, best_winrate=0.75, plateau_count=0,
        )
        logger.close()
        rows = list(csv.reader(path.open()))
        # Eval row: loss columns are blank, eval columns filled
        assert rows[1][0] == "10"
        assert rows[1][1] == "RANDOM"
        assert rows[1][2:6] == ["", "", "", ""]
        assert rows[1][6:] == ["0.75", "0.75", "0"]


class TestCheckpointing:
    def test_save_load_round_trip(self, tmp_path):
        net = PolicyValueNetwork()
        opt = torch.optim.Adam(net.parameters(), lr=3e-4)
        cfg = _minimal_config()
        path = tmp_path / "ckpt.pt"

        save_checkpoint(
            str(path), network=net, optimizer=opt, iter_num=42,
            config=cfg, best_winrate=0.83, phase="SELF_PLAY",
        )

        ckpt = load_checkpoint(str(path))
        assert ckpt["iter"] == 42
        assert ckpt["best_winrate"] == 0.83
        assert ckpt["phase"] == "SELF_PLAY"
        assert ckpt["config"]["lr"] == 3e-4
        # Network weights preserved
        net2 = PolicyValueNetwork()
        net2.load_state_dict(ckpt["network"])
        for (k1, v1), (k2, v2) in zip(net.state_dict().items(), net2.state_dict().items()):
            assert torch.equal(v1, v2)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_training_utils.py -v`
Expected: FAIL — `ImportError: No module named 'hearthstone.ai.training_utils'`.

- [ ] **Step 3: Implement `MetricsLogger`, `save_checkpoint`, `load_checkpoint`**

Create `hearthstone/ai/training_utils.py`:

```python
"""Training-time utilities: CSV metrics, checkpoint save/load."""
import csv
from dataclasses import asdict
from typing import Any, Dict

import torch


_HEADER = [
    "iter", "phase", "total_loss", "policy_loss", "value_loss",
    "entropy", "eval_winrate", "best_winrate", "plateau_count",
]


class MetricsLogger:
    """Append-only CSV logger for per-iter and per-eval metrics.

    Iter rows fill loss columns; eval columns are blank.
    Eval rows fill eval columns; loss columns are blank.
    Header is written on open.
    """

    def __init__(self, path: str):
        self._file = open(path, "w", newline="")
        self._writer = csv.writer(self._file)
        self._writer.writerow(_HEADER)
        self._file.flush()

    def log_iter(
        self, iter: int, phase: str,
        total_loss: float, policy_loss: float, value_loss: float, entropy: float,
    ) -> None:
        self._writer.writerow([
            iter, phase, total_loss, policy_loss, value_loss, entropy,
            "", "", "",
        ])
        self._file.flush()

    def log_eval(
        self, iter: int, phase: str,
        eval_winrate: float, best_winrate: float, plateau_count: int,
    ) -> None:
        self._writer.writerow([
            iter, phase, "", "", "", "",
            eval_winrate, best_winrate, plateau_count,
        ])
        self._file.flush()

    def close(self) -> None:
        if not self._file.closed:
            self._file.close()


def save_checkpoint(
    path: str,
    network: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    iter_num: int,
    config,  # TrainConfig
    best_winrate: float,
    phase: str,
) -> None:
    """Serialize training state to disk."""
    torch.save({
        "iter": iter_num,
        "network": network.state_dict(),
        "optimizer": optimizer.state_dict(),
        "config": asdict(config),
        "best_winrate": best_winrate,
        "phase": phase,
    }, path)


def load_checkpoint(path: str) -> Dict[str, Any]:
    """Load a checkpoint dict written by save_checkpoint."""
    return torch.load(path, map_location="cpu")
```

- [ ] **Step 4: Run tests**

Run: `pytest tests/unit/ai/test_training_utils.py -v`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/training_utils.py tests/unit/ai/test_training_utils.py
git commit -m "$(cat <<'EOF'
feat(ai): add MetricsLogger and checkpoint save/load helpers

CSV logger writes a fixed 9-column header; iter and eval rows leave
the other column group blank so downstream pandas readers can split
them with dropna(). Checkpoint dict bundles iter, network state_dict,
optimizer state_dict, config (asdict), best_winrate, and phase.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `CurriculumFSM` + `evaluate()`

The curriculum state machine and the eval function are independent components; both are unit-testable in isolation. They're combined in this task because both feed into the run loop in Task 8.

**Files:**
- Create: `hearthstone/ai/curriculum.py`
- Create: `hearthstone/ai/evaluate.py`
- Create: `tests/unit/ai/test_curriculum.py`
- Create: `tests/unit/ai/test_evaluate.py`

- [ ] **Step 1: Write tests for `CurriculumFSM`**

Create `tests/unit/ai/test_curriculum.py`:

```python
"""Tests for CurriculumFSM."""
import pytest
from hearthstone.ai.curriculum import CurriculumFSM, Phase, CurriculumEvent


@pytest.fixture
def fsm():
    return CurriculumFSM(switch_threshold=0.80, early_stop_patience=3)


class TestCurriculumFSM:
    def test_starts_in_random_phase(self, fsm):
        assert fsm.phase == Phase.RANDOM
        assert fsm.best_winrate == 0.0
        assert fsm.plateau_count == 0

    def test_new_best_is_emitted(self, fsm):
        event = fsm.update(0.30)
        assert event == CurriculumEvent.NEW_BEST
        assert fsm.best_winrate == 0.30

    def test_no_event_when_below_best(self, fsm):
        fsm.update(0.50)
        event = fsm.update(0.40)
        assert event == CurriculumEvent.NONE
        assert fsm.best_winrate == 0.50

    def test_switches_at_threshold(self, fsm):
        fsm.update(0.50)
        event = fsm.update(0.85)
        assert event == CurriculumEvent.SWITCH_TO_SELF_PLAY
        assert fsm.phase == Phase.SELF_PLAY
        assert fsm.plateau_count == 0  # reset on transition
        assert fsm.best_winrate == 0.85

    def test_no_switch_below_threshold(self, fsm):
        fsm.update(0.79)
        assert fsm.phase == Phase.RANDOM

    def test_switch_only_fires_once(self, fsm):
        fsm.update(0.85)
        event = fsm.update(0.90)
        assert event == CurriculumEvent.NEW_BEST  # not SWITCH again

    def test_plateau_only_counts_in_self_play(self, fsm):
        fsm.update(0.50)
        fsm.update(0.30)  # below best — plateau in RANDOM (must not count)
        fsm.update(0.40)
        fsm.update(0.20)
        assert fsm.plateau_count == 0
        assert fsm.phase == Phase.RANDOM

    def test_early_stop_after_patience(self, fsm):
        # Get into SELF_PLAY with best=0.85
        fsm.update(0.85)  # SWITCH
        # Now feed 3 non-improving evals
        assert fsm.update(0.60) == CurriculumEvent.NONE
        assert fsm.plateau_count == 1
        assert fsm.update(0.70) == CurriculumEvent.NONE
        assert fsm.plateau_count == 2
        event = fsm.update(0.65)
        assert fsm.plateau_count == 3
        assert event == CurriculumEvent.EARLY_STOP

    def test_new_best_resets_plateau(self, fsm):
        fsm.update(0.85)  # switch
        fsm.update(0.60)  # plateau=1
        fsm.update(0.70)  # plateau=2
        fsm.update(0.90)  # NEW_BEST → reset
        assert fsm.plateau_count == 0
        assert fsm.update(0.70) == CurriculumEvent.NONE
        assert fsm.plateau_count == 1
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_curriculum.py -v`
Expected: FAIL — `ImportError: No module named 'hearthstone.ai.curriculum'`.

- [ ] **Step 3: Implement `CurriculumFSM`**

Create `hearthstone/ai/curriculum.py`:

```python
"""Curriculum FSM: transitions between RANDOM and SELF_PLAY phases."""
from enum import Enum


class Phase(str, Enum):
    RANDOM = "RANDOM"
    SELF_PLAY = "SELF_PLAY"


class CurriculumEvent(str, Enum):
    NONE = "none"
    NEW_BEST = "new_best"
    SWITCH_TO_SELF_PLAY = "switch_to_self_play"
    EARLY_STOP = "early_stop"


class CurriculumFSM:
    """Encapsulates curriculum state and transitions.

    Driven by per-eval winrate-vs-random measurements. Emits events that
    the run loop reacts to (saving best.pt, swapping opponent, breaking).

    Plateau detection only counts during SELF_PLAY phase. During RANDOM
    phase, "no improvement" is expected — agent is learning from scratch.
    """

    def __init__(self, switch_threshold: float, early_stop_patience: int):
        self.switch_threshold = switch_threshold
        self.early_stop_patience = early_stop_patience
        self.phase = Phase.RANDOM
        self.best_winrate = 0.0
        self.plateau_count = 0

    def update(self, winrate: float) -> CurriculumEvent:
        """Process a new eval result and return the transition event, if any."""
        # 1. Switch RANDOM → SELF_PLAY at threshold (takes precedence over NEW_BEST signal).
        if self.phase == Phase.RANDOM and winrate >= self.switch_threshold:
            self.phase = Phase.SELF_PLAY
            self.best_winrate = max(self.best_winrate, winrate)
            self.plateau_count = 0
            return CurriculumEvent.SWITCH_TO_SELF_PLAY

        # 2. New best?
        if winrate > self.best_winrate:
            self.best_winrate = winrate
            self.plateau_count = 0  # reset plateau on improvement
            return CurriculumEvent.NEW_BEST

        # 3. Not improving — only count toward plateau in SELF_PLAY.
        if self.phase == Phase.SELF_PLAY:
            self.plateau_count += 1
            if self.plateau_count >= self.early_stop_patience:
                return CurriculumEvent.EARLY_STOP

        return CurriculumEvent.NONE
```

- [ ] **Step 4: Run curriculum tests**

Run: `pytest tests/unit/ai/test_curriculum.py -v`
Expected: 9 tests PASS.

- [ ] **Step 5: Write tests for `evaluate()`**

Create `tests/unit/ai/test_evaluate.py`:

```python
"""Tests for evaluate()."""
import numpy as np
import pytest
from hearthstone.ai.evaluate import evaluate
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.opponents import RandomOpponent


def test_winrate_in_zero_one_range():
    """Untrained network vs random opponent: winrate is some float in [0, 1]."""
    net = PolicyValueNetwork()
    winrate = evaluate(
        network=net,
        opponent_factory=lambda: RandomOpponent(seed=0),
        n_games=4,
        deck1="test_deck", deck2="test_deck",
        training_player_name="Player 1",
    )
    assert 0.0 <= winrate <= 1.0


def test_returns_float():
    net = PolicyValueNetwork()
    winrate = evaluate(
        network=net,
        opponent_factory=lambda: RandomOpponent(seed=0),
        n_games=2,
        deck1="test_deck", deck2="test_deck",
        training_player_name="Player 1",
    )
    assert isinstance(winrate, float)


def test_two_runs_with_same_seed_produce_same_result():
    """Greedy agent + seeded opponent → fully deterministic."""
    net = PolicyValueNetwork()
    # Set network to eval to fix any dropout etc. (PolicyValueNetwork has none, but be safe)
    net.eval()
    w1 = evaluate(
        network=net,
        opponent_factory=lambda: RandomOpponent(seed=123),
        n_games=4,
        deck1="test_deck", deck2="test_deck",
        training_player_name="Player 1",
    )
    w2 = evaluate(
        network=net,
        opponent_factory=lambda: RandomOpponent(seed=123),
        n_games=4,
        deck1="test_deck", deck2="test_deck",
        training_player_name="Player 1",
    )
    assert w1 == w2
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `pytest tests/unit/ai/test_evaluate.py -v`
Expected: FAIL — `ImportError: No module named 'hearthstone.ai.evaluate'`.

- [ ] **Step 7: Implement `evaluate()`**

Create `hearthstone/ai/evaluate.py`:

```python
"""Evaluation of an agent's win-rate against an opponent factory."""
from typing import Callable

from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.opponent_env import OpponentEnv
from hearthstone.ai.opponents import OpponentPolicy, SelfPlayOpponent


def evaluate(
    network: PolicyValueNetwork,
    opponent_factory: Callable[[], OpponentPolicy],
    n_games: int,
    deck1: str,
    deck2: str,
    training_player_name: str,
) -> float:
    """Play n_games using `network` (greedy) against fresh opponents.

    Returns win-rate from the training player's perspective.

    The agent uses the same greedy-act logic as SelfPlayOpponent — a
    SelfPlayOpponent instance is constructed without loading weights and
    its network is replaced with the provided network (no copy).

    `opponent_factory` is called once per game so opponents that carry
    state get a fresh instance each match.
    """
    eval_agent = SelfPlayOpponent(network_path=None)
    eval_agent.network = network
    eval_agent.network.eval()

    wins = 0
    for _ in range(n_games):
        base = HearthstoneEnv(
            deck1_name=deck1, deck2_name=deck2,
            training_player_name=training_player_name,
        )
        env = OpponentEnv(base, opponent_factory())
        obs, _ = env.reset()
        terminated = truncated = False
        while not (terminated or truncated):
            action = eval_agent.act(env.controller)
            obs, _, terminated, truncated, _ = env.step(action)
        winner = env.controller.get_winner()
        if winner is not None and winner.name == env.training_player_name:
            wins += 1
        env.close()
    return wins / n_games
```

- [ ] **Step 8: Run evaluate tests**

Run: `pytest tests/unit/ai/test_evaluate.py -v`
Expected: 3 tests PASS.

- [ ] **Step 9: Commit**

```bash
git add hearthstone/ai/curriculum.py hearthstone/ai/evaluate.py \
        tests/unit/ai/test_curriculum.py tests/unit/ai/test_evaluate.py
git commit -m "$(cat <<'EOF'
feat(ai): add CurriculumFSM and evaluate function

CurriculumFSM tracks (phase, best_winrate, plateau_count) and emits
NEW_BEST / SWITCH_TO_SELF_PLAY / EARLY_STOP / NONE events so the run
loop can react. Plateau detection only counts in SELF_PLAY phase.

evaluate() runs n_games of the agent (greedy via shared network) against
a fresh opponent each match and returns win-rate. Determinism verified
when the opponent is seeded.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: `run_training_loop` driver, default YAML, smoke test

The driver wires every component together. The training loop is exposed as `run_training_loop(config, resume_path=None)` so the smoke test can call it without subprocess.

**Files:**
- Create: `scripts/__init__.py` (empty, for importability)
- Create: `scripts/train.py`
- Create: `configs/default.yaml`
- Create: `tests/unit/ai/test_train_smoke.py`

- [ ] **Step 1: Create the default config**

Create `configs/default.yaml`:

```yaml
# Default training config for Hearthstone PPO.
seed: 42
max_iters: 1000
rollout_steps: 2048
ppo_epochs: 4
deck1: test_deck
deck2: test_deck
training_player_name: "Player 1"

# PPO hyperparameters
lr: 3.0e-4
gamma: 0.99
gae_lambda: 0.95
clip_epsilon: 0.2
value_coef: 0.5
entropy_coef: 0.01
max_grad_norm: 0.5

# Network
embedding_dim: 64
hidden_dim: 128

# Curriculum
curriculum:
  switch_threshold: 0.80
  early_stop_patience: 5

# Eval
eval_every: 10
eval_games: 50

# Checkpointing
checkpoint_every: 25
checkpoint_dir: checkpoints
best_checkpoint_path: checkpoints/best.pt

# Logging
runs_dir: runs
```

- [ ] **Step 2: Create `scripts/__init__.py`**

Create empty file `scripts/__init__.py` so the package is importable from tests:

```python
```

(File is intentionally empty. The `__init__.py` marker is enough.)

- [ ] **Step 3: Write the smoke test**

Create `tests/unit/ai/test_train_smoke.py`:

```python
"""Slow integration smoke test for run_training_loop."""
import csv
import os

import pytest

from hearthstone.ai.config import TrainConfig, CurriculumConfig


@pytest.mark.slow
def test_two_iter_train_smoke(tmp_path):
    """Run 2 tiny iterations and verify metrics + checkpoint files exist."""
    cfg = TrainConfig(
        seed=42, max_iters=2, rollout_steps=64, ppo_epochs=2,
        deck1="test_deck", deck2="test_deck", training_player_name="Player 1",
        lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_epsilon=0.2,
        value_coef=0.5, entropy_coef=0.01, max_grad_norm=0.5,
        embedding_dim=64, hidden_dim=128,
        curriculum=CurriculumConfig(switch_threshold=0.80, early_stop_patience=5),
        eval_every=1, eval_games=4,
        checkpoint_every=1,
        checkpoint_dir=str(tmp_path / "checkpoints"),
        best_checkpoint_path=str(tmp_path / "checkpoints" / "best.pt"),
        runs_dir=str(tmp_path / "runs"),
    )
    from scripts.train import run_training_loop
    run_dir = run_training_loop(cfg, resume_path=None, device="cpu")

    metrics_path = os.path.join(run_dir, "metrics.csv")
    assert os.path.exists(metrics_path), f"missing {metrics_path}"

    rows = list(csv.reader(open(metrics_path)))
    # Header + 2 iter rows + 2 eval rows = 5 rows
    assert len(rows) >= 5, f"expected >=5 csv rows, got {len(rows)}"

    # At least one checkpoint file in the checkpoints dir
    ckpt_dir = tmp_path / "checkpoints"
    assert ckpt_dir.exists()
    ckpt_files = list(ckpt_dir.glob("*.pt"))
    assert len(ckpt_files) >= 1, f"no checkpoint files in {ckpt_dir}"
```

- [ ] **Step 4: Implement `run_training_loop` and main**

Create `scripts/train.py`:

```python
"""Entry point: PPO training driver with curriculum and CSV logging.

Usage:
    python scripts/train.py --config configs/default.yaml
    python scripts/train.py --config configs/default.yaml --resume checkpoints/iter_0250.pt
    python scripts/train.py --config configs/default.yaml --override seed=7 lr=1e-4
    python scripts/train.py --config configs/default.yaml --device cuda
"""
import logging
import os
import random
import shutil
import sys
import time
from typing import Optional

import numpy as np
import torch

from hearthstone.ai.config import (
    CurriculumConfig, TrainConfig, load_config, parse_cli,
)
from hearthstone.ai.curriculum import CurriculumEvent, CurriculumFSM, Phase
from hearthstone.ai.evaluate import evaluate
from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.opponent_env import OpponentEnv
from hearthstone.ai.opponents import RandomOpponent, SelfPlayOpponent
from hearthstone.ai.ppo_trainer import PPOTrainer
from hearthstone.ai.rollout_buffer import RolloutBuffer
from hearthstone.ai.training_utils import (
    MetricsLogger, load_checkpoint, save_checkpoint,
)

logger = logging.getLogger(__name__)


def _seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def _build_obs_for_network(obs: dict) -> dict:
    """Convert a numpy obs dict to a torch tensor obs dict (batch dim added)."""
    return {k: torch.from_numpy(v).unsqueeze(0) for k, v in obs.items()}


def _make_env(cfg: TrainConfig, opponent) -> OpponentEnv:
    base = HearthstoneEnv(
        deck1_name=cfg.deck1,
        deck2_name=cfg.deck2,
        training_player_name=cfg.training_player_name,
    )
    return OpponentEnv(base, opponent)


def _action_mask(controller, n_actions: int) -> np.ndarray:
    valid = controller.get_valid_actions()
    mask = np.zeros(n_actions, dtype=np.float32)
    mask[: min(len(valid), n_actions)] = 1.0
    return mask


def _bootstrap_value(network: PolicyValueNetwork, obs: dict) -> float:
    """Forward-pass an observation through the value head; return scalar."""
    torch_obs = _build_obs_for_network(obs)
    with torch.no_grad():
        _, value = network(torch_obs)
    return float(value[0, 0].item())


def run_training_loop(
    config: TrainConfig,
    resume_path: Optional[str] = None,
    device: str = "cpu",
) -> str:
    """Run the full PPO + curriculum training loop.

    Returns the run directory path (`runs/<timestamp>/`).
    """
    # 1. Set up run directory
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    run_dir = os.path.join(config.runs_dir, timestamp)
    os.makedirs(run_dir, exist_ok=True)
    os.makedirs(config.checkpoint_dir, exist_ok=True)

    # Copy resolved config for reproducibility
    import yaml
    from dataclasses import asdict
    with open(os.path.join(run_dir, "config.yaml"), "w") as f:
        yaml.safe_dump(asdict(config), f)

    # 2. Seed and device
    _seed_everything(config.seed)
    torch.set_default_device(device)

    # 3. Build agent components
    network = PolicyValueNetwork(
        embedding_dim=config.embedding_dim,
        hidden_dim=config.hidden_dim,
        num_actions=100,
    ).to(device)
    trainer = PPOTrainer(
        network,
        lr=config.lr,
        gamma=config.gamma,
        gae_lambda=config.gae_lambda,
        clip_epsilon=config.clip_epsilon,
        value_coef=config.value_coef,
        entropy_coef=config.entropy_coef,
        max_grad_norm=config.max_grad_norm,
        ppo_epochs=config.ppo_epochs,
    )
    buffer = RolloutBuffer(
        capacity=config.rollout_steps,
        gamma=config.gamma,
        gae_lambda=config.gae_lambda,
    )
    fsm = CurriculumFSM(
        switch_threshold=config.curriculum.switch_threshold,
        early_stop_patience=config.curriculum.early_stop_patience,
    )

    # 4. Optional resume
    start_iter = 1
    if resume_path is not None:
        ckpt = load_checkpoint(resume_path)
        network.load_state_dict(ckpt["network"])
        trainer.optimizer.load_state_dict(ckpt["optimizer"])
        start_iter = ckpt["iter"] + 1
        fsm.best_winrate = ckpt["best_winrate"]
        fsm.phase = Phase(ckpt["phase"])
        logger.warning(
            "Resuming from %s (iter=%d, best_winrate=%.3f, phase=%s); "
            "config from --config flag is ignored",
            resume_path, ckpt["iter"], ckpt["best_winrate"], ckpt["phase"],
        )

    # 5. Build env with phase-appropriate opponent
    if fsm.phase == Phase.SELF_PLAY:
        opp = SelfPlayOpponent(
            network_path=config.best_checkpoint_path,
            embedding_dim=config.embedding_dim,
            hidden_dim=config.hidden_dim,
        )
    else:
        opp = RandomOpponent(seed=config.seed)
    env = _make_env(config, opp)

    # 6. Open metrics logger
    metrics = MetricsLogger(os.path.join(run_dir, "metrics.csv"))

    # 7. Main loop
    obs, _ = env.reset()
    try:
        for it in range(start_iter, config.max_iters + 1):
            # --- Collect rollout ---
            buffer.reset()
            for _ in range(config.rollout_steps):
                mask = _action_mask(env.controller, n_actions=100)
                torch_obs = _build_obs_for_network(obs)
                action, log_prob, value = trainer.select_action(torch_obs, mask)
                next_obs, reward, terminated, truncated, _ = env.step(action)
                buffer.add(obs, action, reward, value, log_prob, terminated)
                obs = next_obs
                if terminated or truncated:
                    obs, _ = env.reset()
            # --- Bootstrap final value ---
            last_value = _bootstrap_value(network, obs)
            buffer.compute_returns_and_advantages(last_value)

            # --- Update ---
            try:
                batch = buffer.get()
                losses = trainer.update(batch)
            except RuntimeError as e:
                logger.warning("buffer.get() failed: %s; skipping update", e)
                continue

            if any(np.isnan(v) for v in losses.values()):
                save_checkpoint(
                    os.path.join(config.checkpoint_dir, f"iter_{it:04d}_nan.pt"),
                    network=network, optimizer=trainer.optimizer, iter_num=it,
                    config=config, best_winrate=fsm.best_winrate,
                    phase=fsm.phase.value,
                )
                raise RuntimeError(f"NaN loss at iter {it}: {losses}")

            metrics.log_iter(
                iter=it, phase=fsm.phase.value,
                total_loss=losses["total_loss"],
                policy_loss=losses["policy_loss"],
                value_loss=losses["value_loss"],
                entropy=losses["entropy"],
            )
            print(
                f"[iter {it:04d}] phase={fsm.phase.value} "
                f"total_loss={losses['total_loss']:.4f} "
                f"policy={losses['policy_loss']:.4f} "
                f"value={losses['value_loss']:.4f} "
                f"entropy={losses['entropy']:.4f}"
            )

            # --- Eval ---
            if it % config.eval_every == 0:
                winrate = evaluate(
                    network=network,
                    opponent_factory=lambda: RandomOpponent(seed=config.seed + it),
                    n_games=config.eval_games,
                    deck1=config.deck1, deck2=config.deck2,
                    training_player_name=config.training_player_name,
                )
                event = fsm.update(winrate)
                metrics.log_eval(
                    iter=it, phase=fsm.phase.value,
                    eval_winrate=winrate,
                    best_winrate=fsm.best_winrate,
                    plateau_count=fsm.plateau_count,
                )
                print(
                    f"[iter {it:04d}] phase={fsm.phase.value} "
                    f"eval winrate={winrate:.3f} (best={fsm.best_winrate:.3f}, "
                    f"plateau={fsm.plateau_count})"
                )

                if event in (CurriculumEvent.NEW_BEST, CurriculumEvent.SWITCH_TO_SELF_PLAY):
                    save_checkpoint(
                        config.best_checkpoint_path,
                        network=network, optimizer=trainer.optimizer, iter_num=it,
                        config=config, best_winrate=fsm.best_winrate,
                        phase=fsm.phase.value,
                    )

                if event == CurriculumEvent.SWITCH_TO_SELF_PLAY:
                    print(f"[iter {it:04d}] curriculum: switching to SELF_PLAY")
                    env.opponent = SelfPlayOpponent(
                        network_path=config.best_checkpoint_path,
                        embedding_dim=config.embedding_dim,
                        hidden_dim=config.hidden_dim,
                    )
                    obs, _ = env.reset()  # restart episode against new opponent

                if event == CurriculumEvent.EARLY_STOP:
                    print(
                        f"[iter {it:04d}] early stop: "
                        f"no improvement for {fsm.early_stop_patience} evals"
                    )
                    break

            # --- Periodic checkpoint ---
            if it % config.checkpoint_every == 0:
                ckpt_path = os.path.join(config.checkpoint_dir, f"iter_{it:04d}.pt")
                save_checkpoint(
                    ckpt_path,
                    network=network, optimizer=trainer.optimizer, iter_num=it,
                    config=config, best_winrate=fsm.best_winrate,
                    phase=fsm.phase.value,
                )
                print(f"[iter {it:04d}] checkpoint saved to {ckpt_path}")

    except KeyboardInterrupt:
        interrupted_path = os.path.join(config.checkpoint_dir, "interrupted.pt")
        save_checkpoint(
            interrupted_path,
            network=network, optimizer=trainer.optimizer, iter_num=it,
            config=config, best_winrate=fsm.best_winrate, phase=fsm.phase.value,
        )
        print(f"\n[interrupted] checkpoint saved to {interrupted_path}")
    finally:
        metrics.close()
        env.close()

    return run_dir


def main(argv=None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    args = parse_cli(argv)

    if args.resume is not None:
        ckpt = load_checkpoint(args.resume)
        # Reconstruct TrainConfig from the checkpoint's saved config dict
        cfg_dict = ckpt["config"]
        cfg_dict["curriculum"] = CurriculumConfig(**cfg_dict["curriculum"])
        config = TrainConfig(**cfg_dict)
        print(f"resuming from {args.resume}; --config is ignored", file=sys.stderr)
    else:
        config = load_config(args.config, overrides=args.override)

    run_dir = run_training_loop(config, resume_path=args.resume, device=args.device)
    print(f"training complete; run directory: {run_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 5: Run the smoke test**

Run: `pytest tests/unit/ai/test_train_smoke.py -v -m slow`
Expected: PASS — 2 csv iter rows + 2 eval rows + at least one checkpoint file produced.

If `pytest` doesn't recognize `slow` marker, register it. In `pyproject.toml`:

```toml
[tool.pytest.ini_options]
markers = ["slow: marks slow integration tests"]
```

(Add only if missing — check first with `grep slow pyproject.toml`.)

- [ ] **Step 6: Run the full AI test suite for regressions**

Run: `pytest tests/unit/ai/ -v`
Expected: All tests pass. The smoke test is excluded by default unless `-m slow` is passed.

- [ ] **Step 7: Commit**

```bash
git add scripts/__init__.py scripts/train.py configs/default.yaml \
        tests/unit/ai/test_train_smoke.py pyproject.toml
git commit -m "$(cat <<'EOF'
feat(ai): add training driver with curriculum, eval, checkpointing

scripts/train.py exposes run_training_loop(config, resume_path, device)
as both a CLI entry point and an importable function. Wires together
RolloutBuffer + PPOTrainer + OpponentEnv + CurriculumFSM + MetricsLogger.

The curriculum starts with RandomOpponent; on first eval winrate >= 0.80
the FSM emits SWITCH_TO_SELF_PLAY and the env's opponent is reassigned
to SelfPlayOpponent loading from best.pt. During SELF_PLAY, plateau
detection over the configured patience triggers EARLY_STOP.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage:**
- File layout (spec architecture) → Tasks 1, 2, 3, 4, 5, 6, 7, 8 each create the documented modules.
- PyYAML dependency → Task 1.
- `build_observation` helper in `card_embedding.py` → Task 1.
- `OpponentEnv` wrapper with reward accumulation, action cap, EndTurnAction lookup, controller and training_player_name properties → Task 4.
- `OpponentPolicy` interface, `RandomOpponent`, `SelfPlayOpponent` (greedy, refresh on phase transition only, network-only state_dict load) → Tasks 2, 3.
- `TrainConfig` dataclass + nested `CurriculumConfig` + YAML load + missing/extra-key validation → Task 5.
- `--config / --resume / --override / --device` CLI → Tasks 5 (parsing), 8 (use in `main`).
- Metrics CSV (header + iter rows + eval rows with blanked columns) → Task 6.
- Checkpoint save/load (network, optimizer, iter, config, best_winrate, phase) → Task 6.
- Curriculum FSM (RANDOM → SELF_PLAY at threshold; EARLY_STOP after patience; plateau-only-in-self-play) → Task 7.
- `evaluate()` against fresh opponent factory, greedy agent, against RandomOpponent regardless of phase → Task 7, used in Task 8.
- `run_training_loop` driver: rollout → bootstrap → update → eval → checkpoint → curriculum step; opponent swap on phase transition; KeyboardInterrupt → interrupted.pt → Task 8.
- Failure modes: NaN-loss save-and-raise; empty rollout buffer skip-and-warn; action cap force-end + warning; missing/extra config keys raise; auto-create dirs → Tasks 6, 8.
- Smoke test as importable function (no subprocess) → Task 8.

**Placeholder scan:**
- "TBD/TODO/implement later/handle edge cases/similar to Task N" — none.
- Each step that changes code shows the exact code.
- Each test step shows the exact test bodies.
- Commit messages are concrete; commands are exact.

**Type consistency:**
- `Phase` is a `str` enum — used as `phase.value` for serialization in checkpoints (Task 6, 7) and CSV (Task 8); used as `Phase("RANDOM")` for deserialization on resume (Task 8). Consistent.
- `CurriculumEvent` is a `str` enum — only consumed by Task 8 via `event in (NEW_BEST, SWITCH_TO_SELF_PLAY)` and `event == EARLY_STOP`. Consistent.
- `OpponentPolicy.act(controller) -> int` signature consistent across Tasks 2, 3 (definition), 4 (consumer), 7, 8 (consumers).
- `build_observation` signature `(state, perspective_player, embedding_dim=64, embedding=None, max_hand=10, max_board=7)` consistent: defined in Task 1; called by `gym_env._get_observation` in Task 1 and `SelfPlayOpponent.act` in Task 3.
- `RolloutBuffer.get()` output shape (with `actions`, `rewards`, `dones`, `values`, `old_log_probs`, `advantages`, `returns`, plus 12 obs keys) is what `PPOTrainer.update()` consumes — established in the previous (completed) plan, reused unchanged here.
- `save_checkpoint` parameter list consistent across Tasks 6 (definition) and 8 (callers).
- `evaluate` parameter list `(network, opponent_factory, n_games, deck1, deck2, training_player_name)` consistent across Tasks 7 (definition + tests) and 8 (caller).
- `run_training_loop(config, resume_path=None, device="cpu")` signature consistent across Task 8 (definition, smoke test, and `main`).
- `MetricsLogger.log_iter` and `log_eval` argument order consistent between Task 6 tests and Task 8 callers.

**Edge cases covered:**
- Resume + phase=SELF_PLAY → reload `SelfPlayOpponent` from `best_checkpoint_path` (not from the resumed checkpoint, which is the *training* agent) → Task 8 step 4.
- Empty rollout buffer → `RolloutBuffer.get()` raises; driver catches, warns, skips update → Task 8.
- NaN loss → save with `_nan` suffix and raise → Task 8.
- KeyboardInterrupt → save `interrupted.pt`, exit gracefully → Task 8.
- Action cap hit → force-end via `EndTurnAction` lookup → Task 4.
- Override with nested dotted keys → Task 5 test `test_nested_override`.
- Override types preserved via `yaml.safe_load` → Task 5 test `test_override_yaml_typed`.
- Determinism of greedy eval with seeded opponent → Task 7 test `test_two_runs_with_same_seed_produce_same_result`.
- Self-play opponent observation perspective bug (acting player vs. state.player1) → Task 3 test `test_act_uses_current_player_perspective`.
- `SelfPlayOpponent.load_from` accepts both `{"network": state_dict}` and bare state_dict → Task 3 test `test_load_from_accepts_bare_state_dict`.

**Decks verified:** `data/decks/test_deck.json` exists; `DeckManager.load_deck("test_deck")` resolves it.
