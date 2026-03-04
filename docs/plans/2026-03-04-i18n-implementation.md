# 多语言国际化(i18n)实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现完整的i18n支持，允许用户在简体中文(zhCN)和英文(enUS)之间切换，所有UI文本、日志、错误信息均从翻译文件中加载。

**Architecture:** 采用Python标准gettext方案，所有翻译字符串存储在`hearthstone_cli/locales/`目录下的.po文件中。核心i18n模块提供`_()`翻译函数，支持运行时语言切换。CLI渲染器、UI、日志模块均通过`_()`获取本地化文本。

**Tech Stack:** Python标准库gettext, dataclasses, typing

---

## 现状分析

### 硬编码文本统计

| 文件 | 硬编码中文数量 | 主要类型 |
|------|---------------|---------|
| `cli/renderer.py` | ~20 | UI渲染文本 ("你", "对手", "场上", "手牌", 属性名) |
| `cli/ui.py` | ~15 | 用户交互文本 ("你赢了", "可执行的行动", "无效的选择") |
| `__main__.py` | ~25 | 启动信息、菜单、统计信息 |
| `cards/parser.py` | ~50 | 效果解析正则、触发器模式 |
| `cards/loader.py` | ~5 | 加载状态信息 |
| `engine/*.py` | ~10 | 注释、docstring、硬编码卡牌ID |
| **总计** | **~125处** | |

### 需要i18n的文本类别

1. **CLI界面文本** - 高优先级
2. **日志/状态信息** - 高优先级
3. **卡牌属性名称** - 中优先级
4. **错误信息** - 中优先级
5. **效果解析模式** - 保持双语（不解耦）

---

## 详细实施步骤

### Task 1: 创建i18n核心模块

**Files:**
- Create: `hearthstone_cli/i18n/__init__.py`
- Create: `hearthstone_cli/i18n/core.py`
- Create: `hearthstone_cli/locales/zhCN/LC_MESSAGES/messages.po`
- Create: `hearthstone_cli/locales/enUS/LC_MESSAGES/messages.po`
- Test: `tests/test_i18n.py`

**Step 1: Write the failing test**

```python
# tests/test_i18n.py
import pytest
from hearthstone_cli.i18n import _, set_language, get_available_languages


class TestI18n:
    """测试国际化模块"""

    def test_get_available_languages(self):
        """测试获取可用语言列表"""
        languages = get_available_languages()
        assert "zhCN" in languages
        assert "enUS" in languages

    def test_default_language_is_zhCN(self):
        """测试默认语言是简体中文"""
        result = _("Hello")
        # 默认应该返回中文翻译
        assert result == "你好" or result == "Hello"  # 如果没有翻译则返回原字符串

    def test_switch_to_english(self):
        """测试切换到英文"""
        set_language("enUS")
        result = _("Hello")
        assert result == "Hello"

    def test_switch_back_to_chinese(self):
        """测试切换回中文"""
        set_language("zhCN")
        result = _("Hello")
        assert result == "你好"

    def test_invalid_language_falls_back(self):
        """测试无效语言回退到默认"""
        set_language("invalid")
        result = _("Hello")
        # 应该回退到默认语言
        assert result is not None
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/test_i18n.py -v
```
Expected: FAIL with "ModuleNotFoundError: No module named 'hearthstone_cli.i18n'"

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/i18n/__init__.py
"""国际化(i18n)模块"""

from .core import _, set_language, get_available_languages, get_current_language

__all__ = ["_", "set_language", "get_available_languages", "get_current_language"]
```

```python
# hearthstone_cli/i18n/core.py
"""i18n核心实现

使用Python标准gettext实现多语言支持。
"""

import gettext
import os
from pathlib import Path
from typing import List, Optional

# 当前语言设置
_current_language: str = "zhCN"
_translation: Optional[gettext.GNUTranslations] = None


def _get_locale_dir() -> str:
    """获取locale文件目录"""
    return str(Path(__file__).parent.parent / "locales")


def set_language(lang_code: str) -> bool:
    """设置当前语言

    Args:
        lang_code: 语言代码，如 "zhCN", "enUS"

    Returns:
        True if successful, False otherwise
    """
    global _current_language, _translation

    locale_dir = _get_locale_dir()

    # 检查语言是否可用
    if lang_code not in get_available_languages():
        return False

    try:
        translation = gettext.translation(
            "messages",
            localedir=locale_dir,
            languages=[lang_code],
            fallback=True
        )
        _translation = translation
        _current_language = lang_code
        return True
    except Exception:
        # 如果加载失败，使用fallback
        _translation = None
        _current_language = lang_code
        return False


def get_current_language() -> str:
    """获取当前语言代码"""
    return _current_language


def get_available_languages() -> List[str]:
    """获取所有可用语言列表"""
    locale_dir = Path(_get_locale_dir())
    if not locale_dir.exists():
        return ["zhCN"]  # 默认至少支持中文

    languages = []
    for item in locale_dir.iterdir():
        if item.is_dir():
            # 检查是否有LC_MESSAGES/messages.mo文件
            mo_file = item / "LC_MESSAGES" / "messages.mo"
            if mo_file.exists():
                languages.append(item.name)

    return languages if languages else ["zhCN"]


def _(message: str) -> str:
    """翻译函数

    Args:
        message: 要翻译的英文消息

    Returns:
        翻译后的字符串
    """
    global _translation

    if _translation is None:
        # 首次调用，初始化
        set_language(_current_language)

    if _translation:
        return _translation.gettext(message)
    return message


# 初始化默认语言
set_language("zhCN")
```

```po
# hearthstone_cli/locales/zhCN/LC_MESSAGES/messages.po
# 简体中文翻译文件
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Language: zhCN\\n"

msgid "Hello"
msgstr "你好"
```

```po
# hearthstone_cli/locales/enUS/LC_MESSAGES/messages.po
# English translation file
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Language: enUS\\n"

msgid "Hello"
msgstr "Hello"
```

**Step 4: Run test to verify it passes**

```bash
pytest tests/test_i18n.py -v
```
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/i18n/ hearthstone_cli/locales/ tests/test_i18n.py
git commit -m "feat(i18n): add core i18n module with gettext support

- Add i18n/core.py with set_language() and _() functions
- Add zhCN and enUS locale directories
- Add tests for language switching"
```

---

### Task 2: 添加CLI渲染器翻译

**Files:**
- Modify: `hearthstone_cli/cli/renderer.py:1-69`
- Modify: `hearthstone_cli/locales/zhCN/LC_MESSAGES/messages.po`
- Modify: `hearthstone_cli/locales/enUS/LC_MESSAGES/messages.po`
- Test: `tests/test_i18n.py` (新增测试)

**Step 1: Write the failing test**

```python
# tests/test_renderer_i18n.py
import pytest
from hearthstone_cli.i18n import set_language
from hearthstone_cli.cli.renderer import TextRenderer
from hearthstone_cli.engine.state import GameState, PlayerState, HeroState, ManaState


class TestRendererI18n:
    """测试渲染器国际化"""

    def setup_method(self):
        """每个测试前重置语言"""
        set_language("zhCN")

    def test_render_player_zhCN(self):
        """测试中文渲染"""
        set_language("zhCN")
        player = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        lines = TextRenderer._render_player(player, is_opponent=False)
        # 验证包含中文字符
        assert any("你" in line for line in lines)
        assert any("水晶" in line for line in lines)

    def test_render_player_enUS(self):
        """测试英文渲染"""
        set_language("enUS")
        player = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        lines = TextRenderer._render_player(player, is_opponent=False)
        # 验证包含英文
        assert any("You" in line for line in lines)
        assert any("Mana" in line for line in lines)

    def test_render_minion_attributes_zhCN(self):
        """测试随从属性中文渲染"""
        set_language("zhCN")
        from hearthstone_cli.engine.state import Minion, Attribute
        minion = Minion(
            card_id="TEST",
            attack=2,
            health=3,
            max_health=3,
            attributes=frozenset({Attribute.TAUNT, Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        result = TextRenderer._render_minion(minion, 0)
        assert "嘲讽" in result
        assert "圣盾" in result

    def test_render_minion_attributes_enUS(self):
        """测试随从属性英文渲染"""
        set_language("enUS")
        from hearthstone_cli.engine.state import Minion, Attribute
        minion = Minion(
            card_id="TEST",
            attack=2,
            health=3,
            max_health=3,
            attributes=frozenset({Attribute.TAUNT, Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        result = TextRenderer._render_minion(minion, 0)
        assert "Taunt" in result
        assert "Divine Shield" in result
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/test_renderer_i18n.py -v
```
Expected: FAIL with renderer未使用翻译

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/cli/renderer.py
"""文本渲染器模块"""

from typing import List

from hearthstone_cli.engine.state import GameState, PlayerState, Minion, Attribute
from hearthstone_cli.i18n import _


class TextRenderer:
    """文本渲染器"""

    # 属性名称映射
    _ATTRIBUTE_NAMES = {
        Attribute.TAUNT: _("Taunt"),
        Attribute.DIVINE_SHIELD: _("Divine Shield"),
        Attribute.WINDFURY: _("Windfury"),
        Attribute.CHARGE: _("Charge"),
        Attribute.STEALTH: _("Stealth"),
        Attribute.POISONOUS: _("Poisonous"),
        Attribute.LIFESTEAL: _("Lifesteal"),
    }

    @classmethod
    def render(cls, game: GameState) -> str:
        """渲染游戏状态为文本"""
        lines = []
        opponent = game.players[1]
        lines.extend(cls._render_player(opponent, is_opponent=True))
        lines.append("")
        lines.append("-" * 60)
        lines.append("")
        player = game.players[0]
        lines.extend(cls._render_player(player, is_opponent=False))
        return "\n".join(lines)

    @classmethod
    def _render_player(cls, player: PlayerState, is_opponent: bool) -> List[str]:
        lines = []
        prefix = _("Opponent") if is_opponent else _("You")

        hero_line = f"{prefix}: HP {player.hero.health}/30"
        if player.hero.armor > 0:
            hero_line += f"  {_('Armor')}: {player.hero.armor}"
        hero_line += f" | {_('Mana')}: {player.mana.current}/{player.mana.max_mana}"
        lines.append(hero_line)

        if is_opponent:
            lines.append(_("Hand: {} cards").format(len(player.hand)))
        else:
            hand_str = _("Hand: ") + " ".join(f"[{c.cost}{c.name[:3]}]" for c in player.hand)
            lines.append(hand_str)

        if player.board:
            lines.append(_("Board:"))
            for i, minion in enumerate(player.board):
                minion_str = cls._render_minion(minion, i)
                lines.append(f"  {minion_str}")
        else:
            lines.append(_("Board: (empty)"))

        return lines

    @classmethod
    def _render_minion(cls, minion: Minion, index: int) -> str:
        attrs = []
        for attr in minion.attributes:
            if attr in cls._ATTRIBUTE_NAMES:
                attrs.append(cls._ATTRIBUTE_NAMES[attr])

        attr_str = f" [{', '.join(attrs)}]" if attrs else ""
        exhausted_str = f" ({_('Exhausted')})" if minion.exhausted else ""

        return f"[{index}] {minion.attack}/{minion.health} {minion.card_id}{attr_str}{exhausted_str}"
```

```po
# hearthstone_cli/locales/zhCN/LC_MESSAGES/messages.po (添加)
msgid "You"
msgstr "你"

msgid "Opponent"
msgstr "对手"

msgid "Armor"
msgstr "护甲"

msgid "Mana"
msgstr "水晶"

msgid "Hand: {} cards"
msgstr "手牌: {} 张"

msgid "Hand: "
msgstr "手牌: "

msgid "Board:"
msgstr "场上:"

msgid "Board: (empty)"
msgstr "场上: (空)"

msgid "Taunt"
msgstr "嘲讽"

msgid "Divine Shield"
msgstr "圣盾"

msgid "Windfury"
msgstr "风怒"

msgid "Charge"
msgstr "冲锋"

msgid "Stealth"
msgstr "潜行"

msgid "Poisonous"
msgstr "剧毒"

msgid "Lifesteal"
msgstr "吸血"

msgid "Exhausted"
msgstr "已攻击"
```

```po
# hearthstone_cli/locales/enUS/LC_MESSAGES/messages.po (添加)
msgid "You"
msgstr "You"

msgid "Opponent"
msgstr "Opponent"

msgid "Armor"
msgstr "Armor"

msgid "Mana"
msgstr "Mana"

msgid "Hand: {} cards"
msgstr "Hand: {} cards"

msgid "Hand: "
msgstr "Hand: "

msgid "Board:"
msgstr "Board:"

msgid "Board: (empty)"
msgstr "Board: (empty)"

msgid "Taunt"
msgstr "Taunt"

msgid "Divine Shield"
msgstr "Divine Shield"

msgid "Windfury"
msgstr "Windfury"

msgid "Charge"
msgstr "Charge"

msgid "Stealth"
msgstr "Stealth"

msgid "Poisonous"
msgstr "Poisonous"

msgid "Lifesteal"
msgstr "Lifesteal"

msgid "Exhausted"
msgstr "Exhausted"
```

**Step 4: Run test to verify it passes**

```bash
pytest tests/test_renderer_i18n.py -v
```
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/cli/renderer.py tests/test_renderer_i18n.py
git add hearthstone_cli/locales/
git commit -m "feat(i18n): add i18n support to CLI renderer

- Add translation for player/opponent labels
- Add translation for minion attributes
- Add translation for board/hand labels"
```

---

### Task 3: 添加CLI UI翻译

**Files:**
- Modify: `hearthstone_cli/cli/ui.py:1-107`
- Modify: 翻译文件
- Test: `tests/test_ui_i18n.py`

**Step 1: Write the failing test**

```python
# tests/test_ui_i18n.py
import pytest
from hearthstone_cli.i18n import set_language
from hearthstone_cli.cli.ui import CLIInterface


class TestUII18n:
    """测试UI国际化"""

    def setup_method(self):
        set_language("zhCN")

    def test_action_to_str_end_turn_zhCN(self):
        """测试中文结束回合文本"""
        set_language("zhCN")
        from hearthstone_cli.engine.actions import EndTurnAction
        ui = CLIInterface(None)
        action = EndTurnAction(player=0)
        result = ui._action_to_str(action)
        assert result == "结束回合"

    def test_action_to_str_end_turn_enUS(self):
        """测试英文结束回合文本"""
        set_language("enUS")
        from hearthstone_cli.engine.actions import EndTurnAction
        ui = CLIInterface(None)
        action = EndTurnAction(player=0)
        result = ui._action_to_str(action)
        assert result == "End Turn"
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/test_ui_i18n.py -v
```
Expected: FAIL

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/cli/ui.py (修改部分)
from hearthstone_cli.i18n import _

# ... 在 _action_to_str 方法中:
def _action_to_str(self, action: Action) -> str:
    action_type = type(action).__name__
    if action_type == "EndTurnAction":
        return _("End Turn")
    elif action_type == "AttackAction":
        attacker = action.attacker
        defender = action.defender
        if attacker.zone.value == "BOARD":
            minion = self.game.players[attacker.player].board[attacker.index]
            attacker_str = f"{minion.card_id}({minion.attack}/{minion.health})"
        else:
            attacker_str = _("Hero")
        if defender.zone.value == "BOARD":
            minion = self.game.players[defender.player].board[defender.index]
            defender_str = f"{minion.card_id}({minion.attack}/{minion.health})"
        else:
            defender_str = _("Enemy Hero")
        return _("Attack: {} → {}").format(attacker_str, defender_str)
    elif action_type == "PlayCardAction":
        card = self.game.players[action.player].hand[action.card_index]
        card_type = card.card_type.value
        if card_type == "MINION":
            stats = f"({card.attack}/{card.health})"
        elif card_type == "SPELL":
            stats = _("(Spell)")
        elif card_type == "WEAPON":
            stats = f"({card.attack}/{card.durability})"
        else:
            stats = ""
        return _("Play [{} mana] {} {}").format(card.cost, card.name, stats)
    return action_type
```

```po
# zhCN.po 添加:
msgid "Hero"
msgstr "英雄"

msgid "Enemy Hero"
msgstr "敌方英雄"

msgid "Attack: {} → {}"
msgstr "攻击: {} → {}"

msgid "(Spell)"
msgstr "(法术)"

msgid "Play [{} mana] {} {}"
msgstr "打出 [{}费] {} {}"

msgid "End Turn"
msgstr "结束回合"

msgid "Available actions:"
msgstr "可执行的行动:"

msgid "Choose action (or 'q' to quit): "
msgstr "选择行动 (或输入 'q' 退出): "

msgid "Invalid choice, please try again"
msgstr "无效的选择，请重试"

msgid "Please enter a number"
msgstr "请输入数字"

msgid "Opponent is thinking..."
msgstr "对手思考中..."

msgid "You win!"
msgstr "你赢了！"

msgid "You lose..."
msgstr "你输了..."

msgid "Draw"
msgstr "平局"
```

**Step 4: Run test to verify it passes**

```bash
pytest tests/test_ui_i18n.py -v
```
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/cli/ui.py tests/test_ui_i18n.py
git commit -m "feat(i18n): add i18n support to CLI UI

- Translate action descriptions
- Translate game over messages
- Translate user prompts"
```

---

### Task 4: 添加主程序入口翻译

**Files:**
- Modify: `hearthstone_cli/__main__.py:1-171`
- Modify: 翻译文件
- Test: `tests/test_main_i18n.py`

**Step 1: Write the failing test**

```python
# tests/test_main_i18n.py
import pytest
from hearthstone_cli.i18n import set_language, _


class TestMainI18n:
    """测试主程序国际化"""

    def test_title_translation_zhCN(self):
        """测试中文标题"""
        set_language("zhCN")
        assert _("Hearthstone CLI Game") == "炉石传说 CLI 游戏"

    def test_title_translation_enUS(self):
        """测试英文标题"""
        set_language("enUS")
        assert _("Hearthstone CLI Game") == "Hearthstone CLI Game"

    def test_loading_messages_zhCN(self):
        """测试加载消息中文"""
        set_language("zhCN")
        assert _("Loading card data...") == "正在加载卡牌数据..."
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/test_main_i18n.py -v
```
Expected: FAIL

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/__main__.py (修改部分)
from hearthstone_cli.i18n import _, set_language

def main():
    # 可以在启动时通过环境变量设置语言
    import os
    lang = os.environ.get("HEARTHSTONE_LANG", "zhCN")
    set_language(lang)

    print("=" * 60)
    print(_("Hearthstone CLI Game"))
    print("=" * 60)
    # ... 其他翻译
```

```po
# zhCN.po 添加:
msgid "Hearthstone CLI Game"
msgstr "炉石传说 CLI 游戏"

msgid "Loading card data..."
msgstr "正在加载卡牌数据..."

msgid "Standard sets: {}"
msgstr "标准模式扩展包: {} 个"

msgid "Loaded {} cards (minions + spells)"
msgstr "已加载 {} 张卡牌（随从+法术）"

msgid "Failed to load from network: {}"
msgstr "从网络加载失败: {}"

msgid "Using local test cards..."
msgstr "使用本地测试卡牌..."

msgid "Database has {} cards:"
msgstr "数据库中有 {} 张卡牌:"

msgid "  - Minions: {}"
msgstr "  - 随从: {} 张"

msgid "  - Spells: {}"
msgstr "  - 法术: {} 张"

msgid "Example cards:"
msgstr "示例卡牌:"

msgid "  Minions:"
msgstr "  随从:"

msgid "  Spells:"
msgstr "  法术:"

msgid "Created demo deck ({} cards)"
msgstr "创建了演示卡组（{} 张卡牌）"
```

**Step 4: Run test to verify it passes**

```bash
pytest tests/test_main_i18n.py -v
```
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/__main__.py tests/test_main_i18n.py
git commit -m "feat(i18n): add i18n support to main entry point

- Translate all print statements in __main__.py
- Support HEARTHSTONE_LANG environment variable"
```

---

### Task 5: 添加卡牌加载器翻译

**Files:**
- Modify: `hearthstone_cli/cards/loader.py`
- Modify: 翻译文件

**Step 1: Write the test**

```python
# tests/test_loader_i18n.py
import pytest
from hearthstone_cli.i18n import set_language, _


class TestLoaderI18n:
    """测试加载器国际化"""

    def test_using_cached_data_zhCN(self):
        set_language("zhCN")
        assert _("Using cached card data: {}") == "使用缓存的卡牌数据: {}"

    def test_downloading_cards_zhCN(self):
        set_language("zhCN")
        assert _("Downloading card data: {}") == "正在下载卡牌数据: {}"
```

**Step 2: Run test**

```bash
pytest tests/test_loader_i18n.py -v
```

**Step 3: Write implementation**

```python
# hearthstone_cli/cards/loader.py
from hearthstone_cli.i18n import _

# 将print语句中的硬编码文本替换为_()
```

```po
# zhCN.po 添加:
msgid "Using cached card data: {}"
msgstr "使用缓存的卡牌数据: {}"

msgid "Downloading card data: {}"
msgstr "正在下载卡牌数据: {}"

msgid "Downloaded {} cards"
msgstr "已下载 {} 张卡牌"

msgid "Download failed: {}"
msgstr "下载失败: {}"

msgid "Using cached card data"
msgstr "使用缓存的卡牌数据"

msgid "Failed to parse card {}: {}"
msgstr "解析卡牌失败 {}: {}"
```

**Step 4: Run test**

```bash
pytest tests/test_loader_i18n.py -v
```
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/cards/loader.py tests/test_loader_i18n.py
git commit -m "feat(i18n): add i18n support to card loader"
```

---

### Task 6: 创建MO文件编译脚本

**Files:**
- Create: `scripts/compile_translations.py`
- Create: `Makefile` (可选)

**Step 1: Write the implementation**

```python
# scripts/compile_translations.py
"""编译.po文件为.mo文件"""

import subprocess
import sys
from pathlib import Path


def compile_po_files():
    """将所有.po文件编译为.mo文件"""
    locale_dir = Path(__file__).parent.parent / "hearthstone_cli" / "locales"

    po_files = list(locale_dir.rglob("*.po"))

    if not po_files:
        print("No .po files found!")
        return False

    for po_file in po_files:
        mo_file = po_file.parent / "messages.mo"

        try:
            subprocess.run(
                ["msgfmt", "-o", str(mo_file), str(po_file)],
                check=True
            )
            print(f"Compiled: {po_file} -> {mo_file}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to compile {po_file}: {e}")
            return False
        except FileNotFoundError:
            print("Error: msgfmt not found. Please install gettext.")
            print("  Ubuntu/Debian: sudo apt-get install gettext")
            print("  macOS: brew install gettext")
            return False

    print("All translations compiled successfully!")
    return True


if __name__ == "__main__":
    success = compile_po_files()
    sys.exit(0 if success else 1)
```

**Step 2: 创建Makefile (可选)**

```makefile
# Makefile
.PHONY: i18n i18n-extract i18n-compile test

i18n: i18n-compile

i18n-extract:
	@echo "Extracting translatable strings..."
	@xgettext --keyword=_ --language=Python -o hearthstone_cli/locales/messages.pot \
		hearthstone_cli/cli/*.py \
		hearthstone_cli/cards/*.py \
		hearthstone_cli/*.py

i18n-compile:
	@python scripts/compile_translations.py

test:
	@pytest tests/test_i18n*.py -v
```

**Step 3: Commit**

```bash
git add scripts/compile_translations.py Makefile
git commit -m "build(i18n): add translation compilation script

- Add compile_translations.py to compile .po to .mo
- Add Makefile targets for i18n management"
```

---

### Task 7: 添加命令行语言切换选项

**Files:**
- Modify: `hearthstone_cli/__main__.py`
- Modify: `hearthstone_cli/cli/ui.py`

**Step 1: Write the implementation**

```python
# hearthstone_cli/__main__.py 添加语言选择菜单

def show_language_menu():
    """显示语言选择菜单"""
    print("\n" + "=" * 40)
    print(_("Select Language / 选择语言"))
    print("=" * 40)
    print("1. English")
    print("2. 简体中文 (zhCN)")
    print("=" * 40)

    choice = input(_("Enter choice (default: 2): ")).strip()

    if choice == "1":
        return "enUS"
    else:
        return "zhCN"

# 在main()函数开始处调用
lang = show_language_menu()
set_language(lang)
```

**Step 2: Commit**

```bash
git add hearthstone_cli/__main__.py
git commit -m "feat(i18n): add language selection menu at startup"
```

---

### Task 8: 完整集成测试

**Files:**
- Create: `tests/test_i18n_integration.py`

**Step 1: Write the integration test**

```python
# tests/test_i18n_integration.py
"""i18n集成测试"""

import pytest
from hearthstone_cli.i18n import set_language, get_available_languages, _
from hearthstone_cli.cli.renderer import TextRenderer
from hearthstone_cli.cli.ui import CLIInterface
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute
)
from hearthstone_cli.engine.actions import EndTurnAction, AttackAction, PlayCardAction
from hearthstone_cli.engine.game import GameLogic


class TestI18nIntegration:
    """i18n端到端集成测试"""

    def test_full_game_flow_zhCN(self):
        """测试中文完整游戏流程"""
        set_language("zhCN")

        # 创建简单游戏状态
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=None,
            phase_stack=tuple()
        )

        # 渲染并检查中文
        output = TextRenderer.render(game)
        assert "你" in output
        assert "对手" in output
        assert "水晶" in output

    def test_full_game_flow_enUS(self):
        """测试英文完整游戏流程"""
        set_language("enUS")

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=None,
            phase_stack=tuple()
        )

        output = TextRenderer.render(game)
        assert "You" in output
        assert "Opponent" in output
        assert "Mana" in output

    def test_attribute_names_in_both_languages(self):
        """测试属性名称在两种语言中正确"""
        # 中文测试
        set_language("zhCN")
        attr_names_zh = {
            Attribute.TAUNT: _("Taunt"),
            Attribute.DIVINE_SHIELD: _("Divine Shield"),
        }
        assert attr_names_zh[Attribute.TAUNT] == "嘲讽"
        assert attr_names_zh[Attribute.DIVINE_SHIELD] == "圣盾"

        # 英文测试
        set_language("enUS")
        attr_names_en = {
            Attribute.TAUNT: _("Taunt"),
            Attribute.DIVINE_SHIELD: _("Divine Shield"),
        }
        assert attr_names_en[Attribute.TAUNT] == "Taunt"
        assert attr_names_en[Attribute.DIVINE_SHIELD] == "Divine Shield"
```

**Step 2: Run test**

```bash
pytest tests/test_i18n_integration.py -v
```

**Step 3: Commit**

```bash
git add tests/test_i18n_integration.py
git commit -m "test(i18n): add i18n integration tests"
```

---

## 实施顺序总结

| 顺序 | 任务 | 预计时间 | 依赖 |
|------|------|---------|------|
| 1 | 创建i18n核心模块 | 30分钟 | 无 |
| 2 | CLI渲染器翻译 | 30分钟 | Task 1 |
| 3 | CLI UI翻译 | 30分钟 | Task 1 |
| 4 | 主程序入口翻译 | 20分钟 | Task 1 |
| 5 | 卡牌加载器翻译 | 15分钟 | Task 1 |
| 6 | MO文件编译脚本 | 15分钟 | 无 |
| 7 | 命令行语言切换 | 20分钟 | Task 1 |
| 8 | 集成测试 | 20分钟 | Task 1-5 |
| **总计** | | **~3小时** | |

---

## 目录结构变化

```
hearthstone_cli/
├── i18n/
│   ├── __init__.py
│   └── core.py
├── locales/
│   ├── zhCN/
│   │   └── LC_MESSAGES/
│   │       ├── messages.po
│   │       └── messages.mo (generated)
│   └── enUS/
│       └── LC_MESSAGES/
│           ├── messages.po
│           └── messages.mo (generated)
├── cli/
│   ├── ui.py (modified)
│   └── renderer.py (modified)
├── cards/
│   └── loader.py (modified)
└── __main__.py (modified)

scripts/
└── compile_translations.py

tests/
├── test_i18n.py
├── test_renderer_i18n.py
├── test_ui_i18n.py
├── test_main_i18n.py
├── test_loader_i18n.py
└── test_i18n_integration.py
```

---

## 验证清单

实施完成后，运行以下命令验证:

```bash
# 1. 编译翻译文件
python scripts/compile_translations.py

# 2. 运行所有i18n测试
pytest tests/test_i18n*.py -v

# 3. 运行所有测试确保没有回归
pytest hearthstone_cli/tests/ -v

# 4. 手动测试中文
HEARTHSTONE_LANG=zhCN python -m hearthstone_cli

# 5. 手动测试英文
HEARTHSTONE_LANG=enUS python -m hearthstone_cli
```

## 注意事项

1. **效果解析器(parser.py)不需要i18n** - 正则表达式需要同时匹配中英文，保持现有实现
2. **卡牌名称不解耦** - 卡牌名称从HearthstoneJSON获取，根据locale参数加载不同语言
3. **MO文件需要编译** - .po文件需要编译为.mo文件才能被gettext使用
4. **回退机制** - 如果翻译缺失，显示英文原文
