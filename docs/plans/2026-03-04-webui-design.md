# Hearthstone WebUI Design Document

## Overview

为炉石传说 CLI 项目构建完整的 Web 图形界面，包括游戏对战、卡组管理、卡牌收藏和游戏回放功能。

**技术栈：** FastAPI + React + TypeScript + Zustand + TailwindCSS

**目标用户：** AI 训练研究人员、游戏开发者、炉石传说爱好者

---

## 1. Architecture

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React SPA (Vite + TypeScript)                          │ │
│  │  ├── Game Board Canvas/CSS                              │ │
│  │  ├── Deck Builder                                       │ │
│  │  ├── Card Collection                                    │ │
│  │  └── Replay Viewer                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FastAPI Backend                                             │
│  ├── REST API (卡组/收藏/回放)                               │
│  ├── WebSocket (实时对战)                                    │
│  └── Static Files (生产环境)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Python import
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  现有游戏引擎 (hearthstone/)                                 │
│  ├── engine/game_engine.py                                  │
│  ├── engine/game_controller.py                              │
│  ├── models/ (Card, Minion, Spell, Hero, Player)            │
│  └── data/ (CardImporter, CardFactory)                      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Project Structure

```
hs_glm/
├── hearthstone/              # 现有游戏引擎（保持不变）
│   ├── engine/
│   ├── models/
│   ├── data/
│   └── ai/
├── web/                      # 新增 WebUI 模块
│   ├── backend/              # FastAPI 后端
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI 应用入口
│   │   ├── config.py         # 配置管理
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── game.py       # 游戏对战 API + WebSocket
│   │   │   ├── deck.py       # 卡组管理 API
│   │   │   ├── cards.py      # 卡牌收藏 API
│   │   │   └── replay.py     # 回放 API
│   │   ├── schemas.py        # Pydantic 请求/响应模型
│   │   ├── services.py       # 业务逻辑封装
│   │   └── game_session.py   # WebSocket 游戏会话管理
│   └── frontend/             # React 前端
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── index.html
│       ├── public/
│       │   └── assets/
│       │       └── cards/    # 卡牌图片缓存
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css
│           ├── components/
│           │   ├── game/
│           │   │   ├── GameBoard.tsx       # 主游戏棋盘
│           │   │   ├── Hand.tsx            # 手牌区
│           │   │   ├── Board.tsx           # 随从区
│           │   │   ├── Hero.tsx            # 英雄显示
│           │   │   ├── ManaCrystals.tsx    # 法力水晶
│           │   │   ├── Card.tsx            # 卡牌组件
│           │   │   ├── Minion.tsx          # 随从组件
│           │   │   └── GameLog.tsx         # 战斗日志
│           │   ├── deck/
│           │   │   ├── DeckBuilder.tsx     # 卡组构建器
│           │   │   ├── DeckList.tsx        # 卡组列表
│           │   │   ├── DeckSlot.tsx        # 卡组槽位
│           │   │   └── CardFilter.tsx      # 卡牌筛选器
│           │   ├── collection/
│           │   │   ├── CardCollection.tsx  # 卡牌收藏
│           │   │   ├── CardGrid.tsx        # 卡牌网格
│           │   │   └── CardDetail.tsx      # 卡牌详情
│           │   ├── replay/
│           │   │   ├── ReplayViewer.tsx    # 回放查看器
│           │   │   └── ReplayControls.tsx  # 播放控制
│           │   └── common/
│           │       ├── Layout.tsx          # 页面布局
│           │       ├── Navbar.tsx          # 导航栏
│           │       ├── Button.tsx          # 按钮组件
│           │       ├── Modal.tsx           # 模态框
│           │       └── Tooltip.tsx         # 提示框
│           ├── pages/
│           │   ├── HomePage.tsx            # 首页
│           │   ├── GamePage.tsx            # 对战页面
│           │   ├── DeckPage.tsx            # 卡组管理页面
│           │   ├── CollectionPage.tsx      # 收藏页面
│           │   └── ReplayPage.tsx          # 回放页面
│           ├── hooks/
│           │   ├── useGame.ts              # 游戏状态 Hook
│           │   ├── useDeck.ts              # 卡组状态 Hook
│           │   └── useWebSocket.ts         # WebSocket Hook
│           ├── store/
│           │   ├── gameStore.ts            # 游戏状态 (Zustand)
│           │   ├── deckStore.ts            # 卡组状态
│           │   └── uiStore.ts              # UI 状态
│           ├── api/
│           │   ├── client.ts               # API 客户端
│           │   ├── game.ts                 # 游戏 API
│           │   ├── deck.ts                 # 卡组 API
│           │   └── cards.ts                # 卡牌 API
│           ├── types/
│           │   ├── game.ts                 # 游戏类型定义
│           │   ├── card.ts                 # 卡牌类型定义
│           │   └── deck.ts                 # 卡组类型定义
│           └── utils/
│               ├── cardUtils.ts            # 卡牌工具函数
│               └── gameUtils.ts            # 游戏工具函数
├── main.py                   # 现有 CLI 入口
└── run_web.py                # 新增 Web 入口脚本
```

---

## 2. Backend API Design

### 2.1 REST API Endpoints

#### Cards API (`/api/cards`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards` | 获取所有卡牌列表 |
| GET | `/api/cards/{card_id}` | 获取单张卡牌详情 |
| GET | `/api/cards/search` | 搜索卡牌（按名称、职业、费用等） |
| GET | `/api/cards/image/{card_id}` | 获取卡牌图片 URL |

#### Deck API (`/api/decks`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/decks` | 获取所有卡组列表 |
| GET | `/api/decks/{deck_id}` | 获取卡组详情 |
| POST | `/api/decks` | 创建新卡组 |
| PUT | `/api/decks/{deck_id}` | 更新卡组 |
| DELETE | `/api/decks/{deck_id}` | 删除卡组 |
| POST | `/api/decks/{deck_id}/validate` | 验证卡组合法性 |

#### Game API (`/api/game`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/game/start` | 开始新游戏 |
| GET | `/api/game/{game_id}` | 获取游戏状态 |
| POST | `/api/game/{game_id}/action` | 执行游戏动作 |
| POST | `/api/game/{game_id}/end-turn` | 结束回合 |
| GET | `/api/game/{game_id}/valid-actions` | 获取合法动作列表 |

#### Replay API (`/api/replay`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/replay` | 获取回放列表 |
| GET | `/api/replay/{replay_id}` | 获取回放详情 |
| POST | `/api/replay` | 保存回放 |
| DELETE | `/api/replay/{replay_id}` | 删除回放 |

### 2.2 WebSocket Protocol

**连接端点:** `ws://localhost:8000/ws/game/{game_id}`

**消息格式:**

```typescript
// 客户端 -> 服务端
interface ClientMessage {
  type: 'action' | 'ping';
  payload: PlayCardPayload | AttackPayload | EndTurnPayload;
}

// 服务端 -> 客户端
interface ServerMessage {
  type: 'state_update' | 'action_result' | 'game_over' | 'error';
  payload: GameState | ActionResult | GameOverResult | ErrorInfo;
}
```

### 2.3 Pydantic Schemas

```python
# web/backend/schemas.py

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class CardType(str, Enum):
    MINION = "MINION"
    SPELL = "SPELL"
    WEAPON = "WEAPON"

class CardSchema(BaseModel):
    id: str
    name: str
    cost: int
    card_type: CardType
    description: str
    hero_class: Optional[str] = None
    attack: Optional[int] = None
    health: Optional[int] = None
    abilities: List[str] = []
    image_url: Optional[str] = None

class DeckSchema(BaseModel):
    id: str
    name: str
    hero_class: str
    cards: List[str]  # Card IDs
    created_at: str
    updated_at: str

class GameStateSchema(BaseModel):
    game_id: str
    turn: int
    current_player: str
    player1: PlayerStateSchema
    player2: PlayerStateSchema
    is_game_over: bool
    winner: Optional[str] = None

class PlayerStateSchema(BaseModel):
    name: str
    hero_class: str
    health: int
    armor: int
    mana: int
    max_mana: int
    hand: List[CardSchema]
    board: List[MinionSchema]
    deck_size: int

class MinionSchema(BaseModel):
    instance_id: str
    card_id: str
    name: str
    attack: int
    health: int
    max_health: int
    can_attack: bool
    abilities: List[str]

class ActionSchema(BaseModel):
    action_type: str  # 'play_card', 'attack', 'end_turn'
    card_index: Optional[int] = None
    attacker_id: Optional[str] = None
    target_id: Optional[str] = None
```

---

## 3. Frontend Design

### 3.1 Game Board Layout

```
┌────────────────────────────────────────────────────────────────┐
│  [ opponent hero ]                    [ opponent mana: 3/10 ]  │
│  [ opponent hand: 4 cards (face down) ]                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│  │     │ │     │ │     │ │     │ │     │ │     │ │     │     │
│  │ opp │ │ opp │ │ opp │ │ opp │ │ opp │ │ opp │ │ opp │     │
│  │board│ │board│ │board│ │board│ │board│ │board│ │board│     │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │
│                                                                 │
│  ═════════════════════════════════════════════════════════════ │
│                        GAME BOARD                               │
│  ═════════════════════════════════════════════════════════════ │
│                                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│  │     │ │     │ │     │ │     │ │     │ │     │ │     │     │
│  │ my  │ │ my  │ │ my  │ │ my  │ │ my  │ │ my  │ │ my  │     │
│  │board│ │board│ │board│ │board│ │board│ │board│ │board│     │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  [ my hero ]                          [ my mana: 5/10 ]         │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
│  │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │ │   │  │
│  │ 0 │ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │ 7 │ │ 8 │ │ 9 │  │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘  │
│                     [ my hand (arc layout) ]                    │
│                    [ END TURN BUTTON ]                          │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Card Component Design

**视觉规格：**
- 卡牌比例: 2:3 (约 200x300 px)
- 边框: 根据稀有度着色 (普通-灰, 稀有-蓝, 史诗-紫, 传说-橙)
- 法力水晶: 左上角蓝色六边形
- 名称: 顶部羊皮纸横幅
- 插画: 中央区域
- 效果文本: 底部羊皮纸区域
- 攻击力: 左下角黄色圆形
- 生命值: 右下角红色圆形

**交互状态：**
- 默认: 正常显示
- 悬停: 放大 1.2x，显示详细提示
- 可用: 发光边框效果
- 选中: 高亮边框 + 抬起效果
- 禁用: 灰色遮罩

### 3.3 Deck Builder Layout

```
┌────────────────────────────────────────────────────────────────┐
│  [ Deck Builder ]                            [ Save ] [ Clear ] │
├────────────────────────────────────────────────────────────────┤
│  Class Filter: [ All ▼ ]  Cost: [ All ▼ ]  Search: [_______]  │
├─────────────────────────────┬──────────────────────────────────┤
│                             │                                   │
│     Available Cards         │       Current Deck (23/30)       │
│     (filtered collection)   │                                   │
│                             │  ┌───┐ x2                        │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │  │   │ Fireball                  │
│  │   │ │   │ │   │ │   │   │  └───┘                            │
│  └───┘ └───┘ └───┘ └───┘   │  ┌───┐ x2                        │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │  │   │ Frostbolt                 │
│  │   │ │   │ │   │ │   │   │  └───┘                            │
│  └───┘ └───┘ └───┘ └───┘   │  ...                              │
│  ...                       │                                   │
│                             │  Total: 23 cards                  │
│                             │  Mana Curve: [bar chart]         │
└─────────────────────────────┴──────────────────────────────────┘
```

### 3.4 State Management (Zustand)

```typescript
// store/gameStore.ts

interface GameStore {
  // State
  gameId: string | null;
  gameState: GameState | null;
  selectedCard: number | null;
  selectedMinion: string | null;
  validActions: Action[];
  isConnected: boolean;

  // Actions
  startGame: (deckId1: string, deckId2: string) => Promise<void>;
  playCard: (cardIndex: number, targetId?: string) => void;
  attack: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  selectCard: (index: number | null) => void;
  selectMinion: (id: string | null) => void;
  updateGameState: (state: GameState) => void;
}
```

---

## 4. Card Visual Resources

### 4.1 Image Sources

**HearthstoneJSON CDN:**
```
https://art.hearthstonejson.com/v1/render/latest/enUS/512x/{cardId}.png
```

示例：
- 火球术: `https://art.hearthstonejson.com/v1/render/latest/enUS/512x/CS2_029.png`
- 冰枪术: `https://art.hearthstonejson.com/v1/render/latest/enUS/512x/CS2_031.png`

### 4.2 CSS Card Framework

```css
/* 卡牌基础样式 */
.card {
  width: 200px;
  height: 300px;
  border-radius: 12px;
  position: relative;
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: scale(1.1);
}

/* 法力水晶 */
.mana-crystal {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 36px;
  height: 36px;
  background: linear-gradient(180deg, #4a9eff 0%, #2563eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 稀有度边框 */
.card.rare { border: 3px solid #0070dd; }
.card.epic { border: 3px solid #a335ee; }
.card.legendary { border: 3px solid #ff8000; }

/* 攻击力/生命值 */
.stat-attack {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  background: linear-gradient(180deg, #ffd700 0%, #b8860b 100%);
  border-radius: 50%;
}

.stat-health {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: linear-gradient(180deg, #ff4444 0%, #cc0000 100%);
  border-radius: 50%;
}
```

---

## 5. API Integration

### 5.1 Backend Service Layer

```python
# web/backend/services.py

from hearthstone.engine.game_controller import GameController
from hearthstone.decks.deck_manager import DeckManager
from hearthstone.data.card_importer import CardImporter

class GameService:
    def __init__(self):
        self.sessions: Dict[str, GameController] = {}
        self.deck_manager = DeckManager()
        self.card_importer = CardImporter()

    async def start_game(self, deck1_id: str, deck2_id: str) -> str:
        """开始新游戏，返回 game_id"""
        game_id = str(uuid.uuid4())
        deck1 = self.deck_manager.load_deck(deck1_id)
        deck2 = self.deck_manager.load_deck(deck2_id)
        controller = GameController(deck1, deck2)
        controller.start_game()
        self.sessions[game_id] = controller
        return game_id

    def get_state(self, game_id: str) -> dict:
        """获取游戏状态"""
        controller = self.sessions.get(game_id)
        if not controller:
            raise ValueError(f"Game not found: {game_id}")
        return self._serialize_state(controller.get_state())

    async def execute_action(self, game_id: str, action: dict) -> dict:
        """执行游戏动作"""
        controller = self.sessions.get(game_id)
        # ... action handling
```

### 5.2 Frontend API Client

```typescript
// api/client.ts

const API_BASE = '/api';

export async function fetchCards(filters?: CardFilters): Promise<Card[]> {
  const params = new URLSearchParams(filters as any);
  const res = await fetch(`${API_BASE}/cards?${params}`);
  return res.json();
}

export async function startGame(deck1Id: string, deck2Id: string): Promise<GameState> {
  const res = await fetch(`${API_BASE}/game/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck1_id: deck1Id, deck2_id: deck2Id }),
  });
  return res.json();
}

export function createGameWebSocket(gameId: string): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return new WebSocket(`${protocol}//${window.location.host}/ws/game/${gameId}`);
}
```

---

## 6. Development Phases

### Phase 1: Foundation (Week 1)
- [ ] FastAPI 项目结构
- [ ] React + Vite 项目初始化
- [ ] 基础 API 端点
- [ ] 卡牌列表 API
- [ ] 基础卡牌组件

### Phase 2: Game Board (Week 2)
- [ ] 游戏棋盘布局
- [ ] 手牌区组件
- [ ] 随从区组件
- [ ] 英雄/法力水晶组件
- [ ] WebSocket 实时通信

### Phase 3: Deck Builder (Week 3)
- [ ] 卡组管理 API
- [ ] 卡组构建界面
- [ ] 卡牌筛选器
- [ ] 卡组保存/加载
- [ ] 费用曲线图

### Phase 4: Polish (Week 4)
- [ ] 卡牌收藏界面
- [ ] 游戏回放功能
- [ ] 动画效果
- [ ] 响应式设计
- [ ] 生产部署配置

---

## 7. Dependencies

### Backend (Python)

```txt
fastapi>=0.100.0
uvicorn>=0.23.0
websockets>=11.0
python-multipart>=0.0.6
```

### Frontend (Node.js)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "zustand": "^4.3.0",
    "axios": "^1.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

---

## 8. Success Criteria

- [ ] 用户可通过 Web 界面开始游戏
- [ ] 游戏棋盘正确显示双方手牌、随从、英雄、法力
- [ ] 支持出牌、攻击、结束回合等基本操作
- [ ] 卡组构建器支持创建、保存、加载卡组
- [ ] 卡牌收藏支持浏览、搜索、筛选
- [ ] 游戏回放可回看历史对局
- [ ] 所有操作响应流畅（< 100ms）
