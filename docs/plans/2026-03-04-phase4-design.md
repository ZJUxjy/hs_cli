# Phase 4: Card Expansion & AI Training Design

## Overview

扩展卡牌系统、优化 AI 训练、提升性能，基于已完成的 Phase 1-3 和所有 Critical 问题修复。

**目标：**
- 导入 HearthstoneJSON 完整卡牌库
- 建立 AI 训练基础设施
- 优化游戏引擎性能

## 1. Card Data Model Extension

### 1.1 HearthstoneJSON Data Mapping

数据源: `https://api.hearthstonejson.com/v1/latest/enUS/cards.json`

```python
# hearthstone/data/card_importer.py

class CardImporter:
    """从 HearthstoneJSON 导入卡牌数据"""

    MECHANIC_MAP = {
        'BATTLECRY': Ability.BATTLECRY,
        'CHARGE': Ability.CHARGE,
        'TAUNT': Ability.TAUNT,
        'DIVINE_SHIELD': Ability.DIVINE_SHIELD,
        'WINDFURY': Ability.WINDFURY,
        'POISONOUS': Ability.POISONOUS,
        'LIFESTEAL': Ability.LIFESTEAL,
        'STEALTH': Ability.STEALTH,
        'RUSH': Ability.RUSH,
        'DEATHRATTLE': Ability.DEATHRATTLE,
    }

    CARD_TYPE_MAP = {
        'MINION': CardType.MINION,
        'SPELL': CardType.SPELL,
        'WEAPON': CardType.WEAPON,
        'HERO': CardType.HERO,
    }

    def load_cards(self, card_set: str = 'all') -> List[Card]:
        """加载卡牌数据"""
        pass

    def filter_collectible(self, cards: List[dict]) -> List[dict]:
        """过滤可收集卡牌"""
        return [c for c in cards if c.get('collectible', False)]
```

### 1.2 Extended Ability Enum

```python
# hearthstone/models/enums.py (扩展)

class Ability(Enum):
    # 现有能力
    CHARGE = "CHARGE"
    TAUNT = "TAUNT"
    DIVINE_SHIELD = "DIVINE_SHIELD"
    WINDFURY = "WINDFURY"
    POISONOUS = "POISONOUS"
    LIFESTEAL = "LIFESTEAL"
    FROZEN = "FROZEN"

    # 新增能力
    BATTLECRY = "BATTLECRY"      # 战吼
    DEATHRATTLE = "DEATHRATTLE"  # 亡语
    STEALTH = "STEALTH"          # 潜行
    RUSH = "RUSH"                # 突袭
    DISCOVER = "DISCOVER"        # 发现
    COMBO = "COMBO"              # 连击
    OVERLOAD = "OVERLOAD"        # 过载
    SPELLPOWER = "SPELLPOWER"    # 法术伤害
```

### 1.3 Card Factory

```python
# hearthstone/data/card_factory.py

class CardFactory:
    """根据 JSON 数据创建卡牌实例"""

    def create_card(self, json_data: dict) -> Card:
        card_type = json_data.get('type')

        if card_type == 'MINION':
            return self._create_minion(json_data)
        elif card_type == 'SPELL':
            return self._create_spell(json_data)
        elif card_type == 'WEAPON':
            return self._create_weapon(json_data)
        else:
            raise ValueError(f"Unknown card type: {card_type}")

    def _create_minion(self, data: dict) -> Minion:
        abilities = set()
        for mechanic in data.get('mechanics', []):
            if mechanic in CardImporter.MECHANIC_MAP:
                abilities.add(CardImporter.MECHANIC_MAP[mechanic])

        return Minion(
            id=data['id'],
            name=data['name'],
            cost=data.get('cost', 0),
            card_type=CardType.MINION,
            description=data.get('text', ''),
            hero_class=self._map_hero_class(data.get('cardClass')),
            attack=data.get('attack', 0),
            health=data.get('health', 0),
            abilities=abilities,
        )
```

## 2. Effect Parser System

### 2.1 Effect Categories

```python
# hearthstone/data/effect_parser.py

class EffectCategory(Enum):
    """效果类别"""
    SIMPLE = "simple"        # 简单数值效果（伤害、治疗、护甲）
    TARGETED = "targeted"    # 需要目标的效果
    SUMMON = "summon"        # 召唤随从
    MODIFY = "modify"        # 修改属性（Buff/Debuff）
    SPECIAL = "special"      # 特殊效果（需要自定义逻辑）
```

### 2.2 Effect Parser

```python
class EffectParser:
    """解析卡牌文本和机制为可执行效果"""

    EFFECT_PATTERNS = {
        'damage': r'Deal (\d+) damage',
        'heal': r'Restore (\d+) Health',
        'armor': r'Gain (\d+) Armor',
        'draw': r'Draw (\d+) cards?',
        'summon': r'Summon (\d+)/(\d+)',
    }

    def parse(self, card_data: dict) -> List[Effect]:
        """解析卡牌效果"""
        effects = []

        # 从 mechanics 字段获取机制
        for mechanic in card_data.get('mechanics', []):
            if effect := self._parse_mechanic(mechanic, card_data):
                effects.append(effect)

        # 从 text 字段解析效果
        if text := card_data.get('text', ''):
            if parsed := self._parse_text(text):
                effects.extend(parsed)

        return effects
```

### 2.3 Known Spell Effects

```python
class SpellEffectParser:
    """法术效果解析 - 预定义高频法术"""

    KNOWN_SPELLS = {
        # 法师
        'CS2_029': SpellEffect(SpellEffectType.DAMAGE, value=6),  # Fireball
        'CS2_025': SpellEffect(SpellEffectType.DAMAGE, value=3),  # Frostbolt
        'CS2_024': SpellEffect(SpellEffectType.DAMAGE, value=1),  # Arcane Missiles

        # 猎人
        'DS1_185': SpellEffect(SpellEffectType.DAMAGE, value=2),  # Arcane Shot
        'EX1_539': SpellEffect(SpellEffectType.DAMAGE, value=3),  # Kill Command

        # 德鲁伊
        'CS2_007': SpellEffect(SpellEffectType.HEAL, value=8),    # Healing Touch
        'CS2_009': SpellEffect(SpellEffectType.ARMOR, value=5),   # Mark of the Wild
    }
```

## 3. AI Training Optimization

### 3.1 Enhanced Gymnasium Environment

```python
# hearthstone/ai/gym_env.py

class HearthstoneEnv(gym.Env):
    """增强版 Gymnasium 环境"""

    def __init__(self, config: Optional[Dict] = None):
        self.observation_space = spaces.Dict({
            # 玩家状态
            'player_health': spaces.Box(0, 30, dtype=np.int32),
            'player_armor': spaces.Box(0, 30, dtype=np.int32),
            'player_mana': spaces.Box(0, 10, dtype=np.int32),
            'player_max_mana': spaces.Box(0, 10, dtype=np.int32),
            'hand_size': spaces.Box(0, 10, dtype=np.int32),
            'deck_size': spaces.Box(0, 30, dtype=np.int32),

            # 手牌编码（每张卡用64维向量）
            'hand_cards': spaces.Box(0, 1, shape=(10, 64), dtype=np.float32),

            # 场上随从（每方最多7个，每个32维）
            'friendly_board': spaces.Box(0, 1, shape=(7, 32), dtype=np.float32),
            'enemy_board': spaces.Box(0, 1, shape=(7, 32), dtype=np.float32),

            # 对手状态
            'enemy_health': spaces.Box(0, 30, dtype=np.int32),
            'enemy_hand_size': spaces.Box(0, 10, dtype=np.int32),
        })
```

### 3.2 Card Embedding

```python
# hearthstone/ai/card_embedding.py

class CardEmbedding:
    """将卡牌编码为向量用于 AI 输入"""

    def __init__(self, embedding_dim: int = 64):
        self.dim = embedding_dim

    def encode(self, card: Card) -> np.ndarray:
        """将卡牌编码为固定维度向量"""
        features = np.zeros(self.dim, dtype=np.float32)
        idx = 0

        # 基础属性（归一化）
        features[idx] = card.cost / 10.0
        idx += 1

        if isinstance(card, Minion):
            features[idx] = card.attack / 10.0
            features[idx + 1] = card.health / 10.0
            idx += 2

            # 能力 one-hot 编码
            for i, ability in enumerate(Ability):
                if ability in card.abilities:
                    features[idx + i] = 1.0

        return features
```

### 3.3 Reward Function

```python
# hearthstone/ai/reward_functions.py

class RewardFunction:
    """AI 训练奖励函数"""

    def calculate(self, old_state: GameState, new_state: GameState,
                  action: Action) -> float:
        reward = 0.0

        # 1. 胜负奖励（主要目标）
        if new_state.is_game_over():
            winner = new_state.get_winner()
            if winner == new_state.current_player:
                reward += 100.0  # 胜利
            else:
                reward -= 100.0  # 失败
            return reward

        # 2. 血量差变化
        old_hp_diff = self._health_difference(old_state)
        new_hp_diff = self._health_difference(new_state)
        reward += (new_hp_diff - old_hp_diff) * 0.5

        # 3. 场面控制
        reward += self._board_control_bonus(new_state) * 0.3

        # 4. 资源利用
        if isinstance(action, PlayCardAction):
            reward += 0.1

        # 5. 有效攻击
        if isinstance(action, AttackAction):
            reward += 0.2

        return reward
```

### 3.4 Self-Play Training

```python
# hearthstone/ai/self_play.py

class SelfPlayTrainer:
    """自我对弈训练器"""

    def __init__(self, agent_class, deck_pool: List[List[Card]]):
        self.agent_class = agent_class
        self.deck_pool = deck_pool

    def train_episode(self) -> Dict:
        """执行一局自我对弈"""
        env = HearthstoneEnv()

        deck1 = random.choice(self.deck_pool)
        deck2 = random.choice(self.deck_pool)

        obs, _ = env.reset(options={'deck1': deck1, 'deck2': deck2})

        experiences = []
        done = False

        while not done:
            action = self.agent.select_action(obs)
            next_obs, reward, terminated, truncated, info = env.step(action)
            experiences.append((obs, action, reward, next_obs, terminated))
            obs = next_obs
            done = terminated or truncated

        return {
            'experiences': experiences,
            'winner': info.get('winner'),
            'turns': info.get('turns', 0)
        }
```

## 4. Performance Optimization

### 4.1 State Cache

```python
# hearthstone/engine/state_cache.py

class StateCache:
    """游戏状态缓存，避免重复计算"""

    def __init__(self):
        self._valid_actions_cache: List[Action] = []
        self._board_state_hash: Optional[int] = None

    def get_valid_actions(self, game_state: GameState) -> List[Action]:
        current_hash = self._compute_hash(game_state)

        if current_hash != self._board_state_hash:
            self._valid_actions_cache = self._compute_valid_actions(game_state)
            self._board_state_hash = current_hash

        return self._valid_actions_cache

    def invalidate(self):
        self._board_state_hash = None
```

### 4.2 Batch Simulator

```python
# hearthstone/ai/batch_simulator.py

class BatchSimulator:
    """并行模拟多场游戏"""

    def __init__(self, num_workers: int = 4):
        self.num_workers = num_workers

    def simulate_games(self, agent1, agent2, num_games: int,
                       deck_pool: List[List[Card]]) -> Dict:
        results = {'wins': 0, 'losses': 0, 'avg_turns': 0, 'total_reward': 0.0}

        with ThreadPoolExecutor(max_workers=self.num_workers) as executor:
            futures = [
                executor.submit(self._run_single_game, agent1, agent2, deck_pool)
                for _ in range(num_games)
            ]

            for future in as_completed(futures):
                result = future.result()
                if result['winner'] == 'agent1':
                    results['wins'] += 1
                else:
                    results['losses'] += 1
                results['avg_turns'] += result['turns']
                results['total_reward'] += result['reward']

        results['avg_turns'] /= num_games
        results['win_rate'] = results['wins'] / num_games
        return results
```

## 5. File Structure

```
hearthstone/
├── data/
│   ├── __init__.py
│   ├── card_importer.py      # 卡牌导入
│   ├── card_factory.py       # 卡牌工厂
│   └── effect_parser.py      # 效果解析
├── ai/
│   ├── gym_env.py            # (现有，扩展)
│   ├── card_embedding.py     # 卡牌嵌入
│   ├── reward_functions.py   # 奖励函数
│   ├── self_play.py          # 自我对弈
│   ├── action_space.py       # 动作空间
│   └── batch_simulator.py    # 批量模拟
├── engine/
│   ├── game_engine.py        # (现有)
│   └── state_cache.py        # 状态缓存
└── models/
    └── enums.py              # (现有，扩展)
```

## 6. Dependencies

现有依赖不变，新增：
- `numpy` (AI 向量计算)
- `concurrent.futures` (并行模拟，标准库)

## 7. Success Criteria

- [ ] 成功导入 HearthstoneJSON 卡牌库
- [ ] 支持 Basic + Classic 卡牌集（约 400 张）
- [ ] AI 训练环境可用
- [ ] 自我对弈框架运行正常
- [ ] 所有测试通过
