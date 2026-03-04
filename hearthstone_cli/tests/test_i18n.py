"""
测试i18n国际化模块
"""
import pytest
from hearthstone_cli.i18n import _, set_language, get_current_language, get_available_languages


@pytest.fixture(autouse=True)
def reset_i18n_state():
    """每个测试前重置i18n状态"""
    from hearthstone_cli.i18n import core as i18n_core
    # 重置全局状态
    i18n_core._translation = None
    i18n_core._current_language = "zhCN"
    # 设置默认语言为zhCN
    set_language("zhCN")
    yield


class TestI18n:
    """测试国际化功能"""

    def test_get_available_languages(self):
        """测试获取可用语言列表"""
        languages = get_available_languages()
        assert "zhCN" in languages
        assert "enUS" in languages
        assert len(languages) >= 2

    def test_default_language_is_zhCN(self):
        """测试默认语言为中文"""
        # 重新导入模块以获取初始状态
        from hearthstone_cli.i18n.core import _current_language
        assert _current_language == "zhCN"

    def test_switch_to_english(self):
        """测试切换到英文"""
        result = set_language("enUS")
        assert result is True
        assert get_current_language() == "enUS"

    def test_switch_back_to_chinese(self):
        """测试切换回中文"""
        # 先切换到英文
        set_language("enUS")
        # 再切换回中文
        result = set_language("zhCN")
        assert result is True
        assert get_current_language() == "zhCN"

    def test_invalid_language_falls_back(self):
        """测试无效语言回退到默认"""
        # 先设置一个有效语言
        set_language("enUS")
        # 尝试设置无效语言
        result = set_language("invalid_lang")
        assert result is False
        # 语言应该保持不变
        assert get_current_language() == "enUS"

    def test_translation_basic(self):
        """测试基本翻译功能"""
        # 切换到中文
        set_language("zhCN")
        # 测试翻译
        assert _("Hello") == "你好"

    def test_translation_english(self):
        """测试英文翻译"""
        # 切换到英文
        set_language("enUS")
        # 英文应该返回原字符串
        assert _("Hello") == "Hello"

    def test_translation_fallback(self):
        """测试翻译回退到原文"""
        # 测试未翻译的字符串返回原文
        set_language("zhCN")
        untranslated = _("Untranslated message")
        assert untranslated == "Untranslated message"
