# AI Training Driver Design

**Date:** 2026-04-29
**Status:** Approved, ready for implementation plan
**Predecessor:** `docs/plans/2026-04-29-ai-training-implementation.md` (PPO infrastructure — completed)

## Goal

Build a runnable training script that drives the existing PPO infrastructure (`HearthstoneEnv`, `RolloutBuffer`, `PolicyValueNetwork`, `PPOTrainer`) over many iterations, with a curriculum that starts against a random opponent and switches to self-play when win-rate vs random reaches 80%. Produces checkpoints, a CSV metrics log, and a learning curve we can plot.

## Non-goals

- Multi-process or distributed rollout collection (single-process v1)
- Past-snapshot opponent pool / league-style self-play (v1 uses only the latest best checkpoint)
- TensorBoard / W&B integration (CSV is enough for v1)
- GPU OOM handling, mixed-precision, multi-GPU
- Hyperparameter sweeps as first-class feature (use `--override` for ad-hoc sweeps)

## High-level approach

The training script is a state machine over two phases — `RANDOM` and `SELF_PLAY` — driven by periodic evaluation against a random opponent. Eval win-rate vs random is the only metric used for curriculum transitions, best-checkpoint selection, and early stopping.

Three new modules:
- `hearthstone/ai/opponent_env.py` — `gym.Env` wrapper that runs opponent moves inside `step()` so the training agent's observations are always from its own turn.
- `hearthstone/ai/opponents.py` — `OpponentPolicy` interface, `RandomOpponent`, `SelfPlayOpponent`.
- `scripts/train.py` — config loading, curriculum FSM, rollout/update/eval loop, CSV logging, checkpointing.

Plus a small refactor to `hearthstone/ai/card_embedding.py` to expose a `build_observation(state, perspective_player)` helper, called by both `HearthstoneEnv._get_observation` (existing) and `SelfPlayOpponent.act` (new).

## Architecture

### File layout

```
hearthstone/ai/
├── opponent_env.py       NEW    ~120 lines
├── opponents.py          NEW    ~80 lines
├── card_embedding.py     MODIFY +30 lines (extract build_observation)
├── gym_env.py            MODIFY -10 lines (delegate to build_observation)
├── (other files unchanged: ppo_trainer, rollout_buffer, network, ...)
configs/
└── default.yaml          NEW    ~40 lines
scripts/
└── train.py              NEW    ~250 lines
runs/<timestamp>/                produced by training
├── metrics.csv
└── config.yaml
checkpoints/                     produced by training
├── iter_NNNN.pt
└── best.pt
tests/unit/ai/
├── test_opponent_env.py  NEW
├── test_opponents.py     NEW
└── test_train_loop.py    NEW
```

### Dependencies

- Add `pyyaml>=6.0` to `pyproject.toml` and `requirements.txt`. PyYAML is small, ubiquitous, and covers v1's config needs without pulling in pydantic.

## Component design

### `OpponentEnv` wrapper

Wraps a `HearthstoneEnv` and an `OpponentPolicy`. `reset()` and `step()` run any opponent turns internally so the agent only ever sees observations from its own turn.

```python
class OpponentEnv(gym.Env):
    MAX_OPPONENT_ACTIONS_PER_STEP = 200

    def __init__(self, base_env: HearthstoneEnv, opponent: OpponentPolicy):
        self._env = base_env
        self.opponent = opponent  # mutable; driver reassigns on phase transition
        self.observation_space = base_env.observation_space
        self.action_space = base_env.action_space

    def reset(self, **kw):
        obs, info = self._env.reset(**kw)
        obs, extra, terminated, truncated, info = self._loop_opponent(obs, info)
        return obs, info

    def step(self, action):
        obs, reward, terminated, truncated, info = self._env.step(action)
        if terminated:
            return obs, reward, terminated, truncated, info
        obs, extra, terminated, truncated, info = self._loop_opponent(obs, info)
        return obs, reward + extra, terminated, truncated, info

    def _loop_opponent(self, obs, info) -> tuple:
        """Run opponent steps until it's the training player's turn or game over.

        Accumulates reward from the opponent's perspective-flipped damage
        events into `extra`, so the agent's next observation arrives with
        the consequence of having ended its turn.
        """
        extra_reward = 0.0
        for _ in range(self.MAX_OPPONENT_ACTIONS_PER_STEP):
            controller = self._env.controller
            if controller.is_game_over():
                break
            state = controller.get_state()
            if state.current_player.name == self._env.training_player_name:
                break
            opp_action = self.opponent.act(controller)
            obs, r, terminated, truncated, info = self._env.step(opp_action)
            extra_reward += r
            if terminated:
                return obs, extra_reward, True, truncated, info
        else:
            # Hit the action cap without ending opponent turn — force end.
            logger.warning("Opponent action cap hit; forcing end turn")
            obs, r, terminated, truncated, info = self._env.step(0)  # 0 = end turn
            extra_reward += r
        return obs, extra_reward, self._env.controller.is_game_over(), False, info
```

**Why accumulate reward across opponent turns.** `RewardFunction` produces shaping reward from the training player's perspective. When the opponent attacks, the training player's health drops — a (negative) shaping signal. Without accumulation, the opponent's turn is invisible to the agent's reward signal and "end turn" becomes free.

### `OpponentPolicy` interface and concrete classes

```python
class OpponentPolicy:
    def act(self, controller) -> int:
        """Return an index into controller.get_valid_actions()."""
        raise NotImplementedError


class RandomOpponent(OpponentPolicy):
    def act(self, controller) -> int:
        valid = controller.get_valid_actions()
        if not valid:
            return 0  # fallback: end turn
        return random.randrange(len(valid))


class SelfPlayOpponent(OpponentPolicy):
    """Frozen network, greedy action selection. Reloads only on explicit
    load_from() — the driver calls this on phase transition.
    """
    def __init__(self, network_path: Optional[str], embedding_dim: int = 64,
                 hidden_dim: int = 128, num_actions: int = 100):
        self.network = PolicyValueNetwork(
            embedding_dim=embedding_dim, hidden_dim=hidden_dim, num_actions=num_actions,
        )
        if network_path is not None:
            self.load_from(network_path)
        self.network.eval()
        self.embedding_dim = embedding_dim

    def load_from(self, path: str) -> None:
        ckpt = torch.load(path, map_location="cpu")
        state_dict = ckpt["network"] if "network" in ckpt else ckpt
        self.network.load_state_dict(state_dict)
        self.network.eval()

    def act(self, controller) -> int:
        state = controller.get_state()
        # Build observation from THIS player's perspective (current_player).
        obs = build_observation(state, perspective_player=state.current_player,
                                embedding_dim=self.embedding_dim)
        torch_obs = {k: torch.from_numpy(v).unsqueeze(0) for k, v in obs.items()}
        valid_n = len(controller.get_valid_actions())
        if valid_n == 0:
            return 0
        mask = np.zeros(self.network.policy_head.out_features, dtype=np.float32)
        mask[: min(valid_n, mask.shape[0])] = 1.0
        with torch.no_grad():
            logits, _ = self.network(torch_obs)
            logits = logits[0] + (1.0 - torch.from_numpy(mask)) * -1e9
            return int(torch.argmax(logits).item())
```

**Greedy, not sampled.** A stable opponent is the right target for the training agent to find a best-response against. Sampling injects opponent-side noise that hurts convergence.

### `build_observation(state, perspective_player, embedding_dim=64)` helper

Lives in `hearthstone/ai/card_embedding.py`. Pure function; takes a `GameState` and a `Player` reference (the perspective owner — does not have to be `current_player`), returns the same 12-key observation dict that `HearthstoneEnv` produces today.

`HearthstoneEnv._get_observation` is updated to a one-liner that calls this helper with `perspective_player = self._resolve_players(state)[0]`. `SelfPlayOpponent.act` calls it with `perspective_player = state.current_player` (because at opponent-turn the current_player IS the opponent, and that's whose POV the network needs to see).

### Training loop FSM

The driver state:

```python
@dataclass
class TrainState:
    iter: int = 0
    phase: Phase = Phase.RANDOM       # RANDOM | SELF_PLAY
    best_winrate: float = 0.0
    plateau_count: int = 0
```

Per iteration:

```
1. Collect 2048 steps via OpponentEnv into RolloutBuffer.
   Opponent in env wrapper reflects current phase.
2. If buffer is empty (rare; immediate game-over), skip update; warn; continue.
3. last_value = forward_pass(network, last_observation).value
   buffer.compute_returns_and_advantages(last_value)
4. losses = trainer.update(buffer.get())   # 4 PPO epochs, full batch
5. buffer.reset()
6. Log losses to stdout + metrics.csv (winrate cell empty).
7. If iter % eval_every == 0:
     winrate = evaluate(network, RandomOpponent(), n_games=eval_games)
     Append eval row to metrics.csv.
     If winrate > best_winrate:
         save checkpoints/best.pt
         best_winrate = winrate
         plateau_count = 0
     else:
         plateau_count += 1   # only matters in SELF_PLAY phase
     # Transitions
     if phase == RANDOM and winrate >= switch_threshold:
         phase = SELF_PLAY
         plateau_count = 0
         opponent_env.opponent = SelfPlayOpponent(best_checkpoint_path, ...)
         log "[curriculum] switching to SELF_PLAY"
     elif phase == SELF_PLAY and plateau_count >= early_stop_patience:
         log "[early stop] no improvement for N evals"
         break
8. If iter % checkpoint_every == 0:
     save checkpoints/iter_{iter:04d}.pt
9. iter += 1
```

**Bootstrap value at rollout boundary.** When the buffer fills without termination, the last transition's `next_state` value is needed for GAE bootstrap. The driver runs one extra forward pass on the post-rollout observation; passes the result as `last_value` to `compute_returns_and_advantages`.

**`SelfPlayOpponent` refresh policy: only on phase transition.** Mid-phase refresh would create a moving target (training agent chases an opponent that drifts every iteration). Stable opponent → training agent converges to a best-response → next phase transition advances the opponent. v2 may add periodic refresh as a config knob (`self_play_refresh_every`); v1 does not.

### Eval

```python
def evaluate(network, opponent_factory, n_games, deck1, deck2, training_player_name) -> float:
    eval_agent = SelfPlayOpponent(network_path=None)  # reuse greedy-act logic
    eval_agent.network = network                      # share weights, no copy
    eval_agent.network.eval()
    wins = 0
    for _ in range(n_games):
        env = OpponentEnv(
            HearthstoneEnv(deck1, deck2, training_player_name=training_player_name),
            opponent_factory(),
        )
        obs, _ = env.reset()
        terminated = truncated = False
        while not (terminated or truncated):
            action = eval_agent.act(env._env.controller)
            obs, _, terminated, truncated, _ = env.step(action)
        winner = env._env.controller.get_winner()
        if winner is not None and winner.name == env._env.training_player_name:
            wins += 1
    return wins / n_games
```

Eval is greedy on the agent side. Always against `RandomOpponent`, regardless of training phase, so the metric is comparable across phases and across runs.

`opponent_factory` is a callable so each game gets a fresh stateless opponent (matters less for `RandomOpponent`, but the interface is right for future opponents that might carry state).

### Config

`configs/default.yaml`:

```yaml
seed: 42
max_iters: 1000
rollout_steps: 2048
ppo_epochs: 4
deck1: test_deck
deck2: test_deck
training_player_name: "Player 1"

lr: 3.0e-4
gamma: 0.99
gae_lambda: 0.95
clip_epsilon: 0.2
value_coef: 0.5
entropy_coef: 0.01
max_grad_norm: 0.5

embedding_dim: 64
hidden_dim: 128

curriculum:
  switch_threshold: 0.80
  early_stop_patience: 5

eval_every: 10
eval_games: 50

checkpoint_every: 25
checkpoint_dir: checkpoints
best_checkpoint_path: checkpoints/best.pt

runs_dir: runs
```

Loaded via `yaml.safe_load` into a `TrainConfig` dataclass; missing keys raise `TypeError` from the dataclass constructor; extra keys also raise. No pydantic.

### CLI

```
python scripts/train.py --config configs/default.yaml
python scripts/train.py --config configs/default.yaml --resume checkpoints/iter_0250.pt
python scripts/train.py --config configs/default.yaml --override seed=7 lr=1e-4
```

`--override` accepts `key=value` pairs and applies them to the loaded YAML (parsed by `yaml.safe_load(value)` so types are right) before dataclass construction. Nested keys use dotted notation: `--override curriculum.switch_threshold=0.75`.

`--resume` silently overrides hyperparameters from `--config` with those embedded in the checkpoint, with a stderr warning. The `--config` flag is still required (used to locate `runs_dir` etc., though those too are overridden if present in the checkpoint). Ensures resumed runs are reproducible regardless of what `--config` points to now.

### Logging

stdout, one line per iteration; eval-iter lines are additional:

```
[iter 0042] phase=RANDOM total_loss=0.812 policy=-0.043 value=0.821 entropy=4.21
[iter 0050] phase=RANDOM eval winrate=0.62 vs RandomOpponent
[iter 0100] phase=RANDOM eval winrate=0.84 → switching to SELF_PLAY
[iter 0250] phase=SELF_PLAY checkpoint saved to checkpoints/iter_0250.pt
```

`runs/<timestamp>/metrics.csv` columns:

```
iter, phase, total_loss, policy_loss, value_loss, entropy, eval_winrate, best_winrate, plateau_count
```

Per-iter rows fill loss columns; eval rows additionally fill the eval/best/plateau columns. Non-eval iters leave eval columns blank. `pd.read_csv` and `df.dropna(subset=["eval_winrate"])` give the eval curve directly.

### Checkpointing

```python
def save_checkpoint(path, network, optimizer, iter_num, config, best_winrate, phase):
    torch.save({
        "iter": iter_num,
        "network": network.state_dict(),
        "optimizer": optimizer.state_dict(),
        "config": asdict(config),
        "best_winrate": best_winrate,
        "phase": phase.value,
    }, path)
```

Restoring on `--resume`: load network, optimizer, iter, best_winrate, phase, and the embedded config (overriding `--config`). If `phase == SELF_PLAY` at resume time, also reload `SelfPlayOpponent` from `best_checkpoint_path`.

`checkpoints/best.pt` is overwritten on each new best eval win-rate. `checkpoints/iter_NNNN.pt` is written every `checkpoint_every` iterations.

`KeyboardInterrupt` saves `checkpoints/interrupted.pt` and exits cleanly.

## Failure modes

| Failure | Detection | Response |
|---|---|---|
| NaN loss after update | `np.isnan(losses["total_loss"])` | Save checkpoint with `_nan` suffix, log advantage/ratio stats, raise. |
| 0% win-rate for first 5 evals in RANDOM phase | counter on consecutive zero evals | Log warning ("agent never wins vs random — check action mask / reward / perspective"); continue. |
| Opponent action-loop hits cap | `for _ in range(MAX_OPPONENT_ACTIONS_PER_STEP)` `else` branch | Log warning, force-end opponent turn via action 0. |
| Config missing keys / wrong types | `dataclass(**raw)` raises `TypeError` | Print key, exit 1. |
| `--resume` path missing | `os.path.exists()` check at startup | Print error, exit 1. |
| Empty rollout buffer | `RolloutBuffer.get()` raises (already implemented) | Skip update, log warning, continue. |
| Ctrl-C | `KeyboardInterrupt` handler | Save `checkpoints/interrupted.pt`, exit 0. |
| Output dirs missing | `os.makedirs(..., exist_ok=True)` at startup | Auto-create. |

## Testing strategy

Three new test files. None mock PyTorch — they exercise tiny real networks (the existing `make_batch_obs` helper is fast). Slow integration tests use `@pytest.mark.slow`.

### `tests/unit/ai/test_opponent_env.py`

- `test_reset_runs_opponent_first_when_p2_is_training` — env starts with P1 acting; if `training_player_name="Player 2"`, wrapper's `reset()` runs P1's turn before returning.
- `test_step_loops_opponent_until_training_turn` — after agent step that ends turn, wrapper invokes opponent until current_player is back to training player or game over.
- `test_reward_accumulates_across_opponent_turns` — fixed-script opponent that damages the agent's hero; the next agent observation arrives with negative shaping reward summed into return value of `step()`.
- `test_terminated_during_opponent_turn` — opponent kills agent's hero; wrapper returns `terminated=True` and DEFEAT reward.
- `test_opponent_action_cap_force_ends_turn` — fake opponent that picks non-end-turn actions forever; wrapper hits cap, calls action 0 (end turn), continues.

### `tests/unit/ai/test_opponents.py`

- `test_random_opponent_returns_valid_index` — over many calls, all returned indices are `< len(valid_actions)`.
- `test_random_opponent_with_no_valid_actions` — returns 0 (end-turn fallback) without crashing.
- `test_self_play_opponent_loads_state_dict_round_trip` — save a network, instantiate `SelfPlayOpponent` with that path, verify weights match.
- `test_self_play_opponent_greedy_respects_mask` — set logits so a masked-out action has the highest logit; verify the selected action is among valid ones.
- `test_self_play_opponent_observation_uses_acting_player_perspective` — when called in a state where current_player is P2, observation reflects P2's hand/board (not P1's). Catches the same class of bug the existing `test_observation_perspective_is_fixed` test catches for the agent.

### `tests/unit/ai/test_train_loop.py`

- `test_config_load_and_validate` — load fixture YAML, all fields populated correctly.
- `test_config_missing_key_raises_typeerror`.
- `test_config_extra_key_raises_typeerror`.
- `test_override_flag_parses_flat_and_nested` — `--override seed=7 curriculum.switch_threshold=0.75`.
- `test_curriculum_switches_at_threshold` — feed scripted eval sequence into FSM, verify phase transitions exactly when win-rate ≥ 0.80.
- `test_early_stop_after_patience` — feed flat eval sequence in SELF_PLAY phase; verify break after `early_stop_patience` consecutive non-improvements.
- `test_resume_silently_overrides_config` — write checkpoint with `lr=1e-4`; pass `--config` with `lr=3e-4`; run for 0 iterations; verify resumed config has `lr=1e-4` and a warning was emitted on stderr.

### Integration smoke (`@pytest.mark.slow`)

- `test_two_iter_train_smoke` — run `train.py` with `max_iters=2, rollout_steps=64, eval_every=1, eval_games=4`; verify `runs/<timestamp>/metrics.csv` has 2 iter rows and 2 eval rows; verify a checkpoint file was created. Doesn't claim the agent learned anything — only confirms wiring.

## Open questions

None at design time. All decisions are recorded above.

## Spec self-review

- **Placeholders:** none. All defaults are concrete values.
- **Internal consistency:** `SelfPlayOpponent` greedy + only-on-phase-transition refresh is consistent across components C and FSM section. `build_observation` placement (in `card_embedding.py`) is consistent across components C and the file layout. Eval always uses `RandomOpponent` is consistent with curriculum FSM and eval section.
- **Scope:** focused on a single training script. No multi-process, no league self-play, no W&B. v1.
- **Ambiguities resolved:**
  - "Improvement" for plateau detection = strictly greater than `best_winrate`. Equal counts as no improvement.
  - "Phase = SELF_PLAY at resume" → reload `SelfPlayOpponent` from `best_checkpoint_path` (not from the resumed checkpoint, which is the *training* agent).
  - `--override` with `key=value` parses values via `yaml.safe_load` to preserve types (so `lr=1e-4` becomes float, not string).
