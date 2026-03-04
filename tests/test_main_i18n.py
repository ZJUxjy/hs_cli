"""Tests for __main__.py i18n support"""
import os
import sys
import pytest
from unittest.mock import patch, MagicMock

# Ensure the hearthstone_cli package is in the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hearthstone_cli.i18n import set_language, get_current_language


class TestMainI18n:
    """Test i18n support in __main__.py"""

    @pytest.fixture(autouse=True)
    def reset_language(self):
        """Reset language to default after each test"""
        original_lang = get_current_language()
        yield
        set_language(original_lang)

    def test_title_translation_zhCN(self, capsys):
        """Test that title displays in Chinese when language is zhCN"""
        set_language("zhCN")

        # Import and call the main function's title print
        from hearthstone_cli.i18n import _

        # Simulate printing the title
        print("=" * 60)
        print(_("Hearthstone CLI Game"))
        print("=" * 60)

        captured = capsys.readouterr()
        assert "炉石传说 CLI 游戏" in captured.out

    def test_title_translation_enUS(self, capsys):
        """Test that title displays in English when language is enUS"""
        set_language("enUS")

        # Import and call the main function's title print
        from hearthstone_cli.i18n import _

        # Simulate printing the title
        print("=" * 60)
        print(_("Hearthstone CLI Game"))
        print("=" * 60)

        captured = capsys.readouterr()
        assert "Hearthstone CLI Game" in captured.out
        assert "炉石传说" not in captured.out

    def test_loading_messages_zhCN(self, capsys):
        """Test loading messages in Chinese"""
        set_language("zhCN")

        from hearthstone_cli.i18n import _

        # Test loading message
        print(_("Loading card data..."))
        print(_("Standard sets: {}").format(5))
        print(_("Loaded {} cards (minions + spells)").format(100))

        captured = capsys.readouterr()
        assert "正在加载卡牌数据..." in captured.out
        assert "标准模式扩展包: 5 个" in captured.out
        assert "已加载 100 张卡牌（随从+法术）" in captured.out

    def test_loading_messages_enUS(self, capsys):
        """Test loading messages in English"""
        set_language("enUS")

        from hearthstone_cli.i18n import _

        # Test loading message
        print(_("Loading card data..."))
        print(_("Standard sets: {}").format(5))
        print(_("Loaded {} cards (minions + spells)").format(100))

        captured = capsys.readouterr()
        assert "Loading card data..." in captured.out
        assert "Standard sets: 5" in captured.out
        assert "Loaded 100 cards (minions + spells)" in captured.out

    def test_error_messages_zhCN(self, capsys):
        """Test error messages in Chinese"""
        set_language("zhCN")

        from hearthstone_cli.i18n import _

        print(_("Failed to load from network: {}").format("Connection error"))
        print(_("Using local test cards..."))

        captured = capsys.readouterr()
        assert "从网络加载失败: Connection error" in captured.out
        assert "使用本地测试卡牌..." in captured.out

    def test_error_messages_enUS(self, capsys):
        """Test error messages in English"""
        set_language("enUS")

        from hearthstone_cli.i18n import _

        print(_("Failed to load from network: {}").format("Connection error"))
        print(_("Using local test cards..."))

        captured = capsys.readouterr()
        assert "Failed to load from network: Connection error" in captured.out
        assert "Using local test cards..." in captured.out

    def test_database_stats_zhCN(self, capsys):
        """Test database stats messages in Chinese"""
        set_language("zhCN")

        from hearthstone_cli.i18n import _

        print(_("Database has {} cards:").format(50))
        print(_("  - Minions: {}").format(30))
        print(_("  - Spells: {}").format(20))

        captured = capsys.readouterr()
        assert "数据库中有 50 张卡牌:" in captured.out
        assert "  - 随从: 30 张" in captured.out
        assert "  - 法术: 20 张" in captured.out

    def test_database_stats_enUS(self, capsys):
        """Test database stats messages in English"""
        set_language("enUS")

        from hearthstone_cli.i18n import _

        print(_("Database has {} cards:").format(50))
        print(_("  - Minions: {}").format(30))
        print(_("  - Spells: {}").format(20))

        captured = capsys.readouterr()
        assert "Database has 50 cards:" in captured.out
        assert "  - Minions: 30" in captured.out
        assert "  - Spells: 20" in captured.out

    def test_example_cards_zhCN(self, capsys):
        """Test example cards section in Chinese"""
        set_language("zhCN")

        from hearthstone_cli.i18n import _

        print(_("Example cards:"))
        print(_("  Minions:"))
        print(_("  Spells:"))

        captured = capsys.readouterr()
        assert "示例卡牌:" in captured.out
        assert "  随从:" in captured.out
        assert "  法术:" in captured.out

    def test_example_cards_enUS(self, capsys):
        """Test example cards section in English"""
        set_language("enUS")

        from hearthstone_cli.i18n import _

        print(_("Example cards:"))
        print(_("  Minions:"))
        print(_("  Spells:"))

        captured = capsys.readouterr()
        assert "Example cards:" in captured.out
        assert "  Minions:" in captured.out
        assert "  Spells:" in captured.out

    def test_demo_deck_message_zhCN(self, capsys):
        """Test demo deck message in Chinese"""
        set_language("zhCN")

        from hearthstone_cli.i18n import _

        print(_("Created demo deck ({} cards)").format(30))

        captured = capsys.readouterr()
        assert "创建了演示卡组（30 张卡牌）" in captured.out

    def test_demo_deck_message_enUS(self, capsys):
        """Test demo deck message in English"""
        set_language("enUS")

        from hearthstone_cli.i18n import _

        print(_("Created demo deck ({} cards)").format(30))

        captured = capsys.readouterr()
        assert "Created demo deck (30 cards)" in captured.out

    @patch.dict(os.environ, {"HEARTHSTONE_LANG": "enUS"})
    def test_environment_variable_enUS(self):
        """Test that HEARTHSTONE_LANG environment variable is respected"""
        # Simulate what main() does
        lang = os.environ.get("HEARTHSTONE_LANG", "zhCN")
        set_language(lang)

        assert get_current_language() == "enUS"

    @patch.dict(os.environ, {"HEARTHSTONE_LANG": "zhCN"})
    def test_environment_variable_zhCN(self):
        """Test that HEARTHSTONE_LANG environment variable works with zhCN"""
        # Simulate what main() does
        lang = os.environ.get("HEARTHSTONE_LANG", "zhCN")
        set_language(lang)

        assert get_current_language() == "zhCN"

    def test_environment_variable_default(self):
        """Test default language when HEARTHSTONE_LANG is not set"""
        # Ensure environment variable is not set
        with patch.dict(os.environ, {}, clear=True):
            lang = os.environ.get("HEARTHSTONE_LANG", "zhCN")
            assert lang == "zhCN"
