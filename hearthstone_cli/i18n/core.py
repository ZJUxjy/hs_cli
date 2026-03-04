"""
i18n核心模块 - 基于gettext的国际化支持
"""
import gettext
import os
import re
from pathlib import Path
from typing import List, Optional, Dict

# 全局状态
_current_language: str = "zhCN"
_translation = None

# 简单的PO文件解析器
class SimplePOTranslator:
    """简单的PO文件解析器，用于开发阶段"""

    def __init__(self, po_file_path: str):
        self.translations: Dict[str, str] = {}
        self._parse_po_file(po_file_path)

    def _parse_po_file(self, po_file_path: str):
        """解析PO文件提取翻译"""
        try:
            with open(po_file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 使用正则表达式匹配msgid和msgstr
            # 匹配多行和单行情况
            # msgid "text" 或 msgid """text"""
            # msgstr "text" 或 msgstr """text"""

            # 先移除注释
            content = re.sub(r'#.*$', '', content, flags=re.MULTILINE)

            # 匹配msgid和msgstr对
            pattern = r'msgid\s+((?:"[^"]*"\s*)+)\s*msgstr\s+((?:"[^"]*"\s*)+)'
            matches = re.findall(pattern, content, re.DOTALL)

            for msgid_part, msgstr_part in matches:
                # 提取字符串内容
                msgid = self._extract_string(msgid_part)
                msgstr = self._extract_string(msgstr_part)

                if msgid and msgstr:  # 只保存非空的翻译
                    self.translations[msgid] = msgstr

        except Exception as e:
            print(f"Error parsing PO file {po_file_path}: {e}")

    def _extract_string(self, text: str) -> str:
        """从引号包围的字符串中提取内容"""
        # 匹配所有"..."的内容并连接
        parts = re.findall(r'"([^"]*)"', text)
        return ''.join(parts)

    def gettext(self, message: str) -> str:
        """获取翻译，如果没有则返回原文"""
        return self.translations.get(message, message)


def _get_locale_dir() -> str:
    """
    返回locales目录路径

    Returns:
        str: locales目录的绝对路径
    """
    # 获取当前文件所在目录
    current_dir = Path(__file__).parent
    # locales目录在当前目录下
    locale_dir = current_dir / "locales"
    return str(locale_dir.absolute())


def get_available_languages() -> List[str]:
    """
    获取所有可用语言

    Returns:
        List[str]: 可用语言代码列表
    """
    locale_dir = Path(_get_locale_dir())
    languages = []

    if locale_dir.exists():
        for item in locale_dir.iterdir():
            if item.is_dir():
                # 检查是否有LC_MESSAGES目录和po/mo文件
                lc_messages = item / "LC_MESSAGES"
                if lc_messages.exists():
                    # 只要有目录就认为可用（开发阶段）
                    languages.append(item.name)

    return sorted(languages)


def set_language(lang_code: str) -> bool:
    """
    设置当前语言

    Args:
        lang_code: 语言代码 (如 "zhCN", "enUS")

    Returns:
        bool: 是否设置成功
    """
    global _current_language, _translation

    # 检查语言是否可用
    available = get_available_languages()
    if lang_code not in available:
        return False

    try:
        locale_dir = Path(_get_locale_dir())
        po_file = locale_dir / lang_code / "LC_MESSAGES" / "messages.po"

        # 优先使用PO文件（开发阶段）
        if po_file.exists():
            _translation = SimplePOTranslator(str(po_file))
        else:
            # 回退到gettext（使用mo文件）
            _translation = gettext.translation(
                "messages",
                localedir=str(locale_dir),
                languages=[lang_code],
                fallback=True
            )

        _current_language = lang_code
        return True

    except Exception as e:
        print(f"Error setting language to {lang_code}: {e}")
        return False


def get_current_language() -> str:
    """
    获取当前语言代码

    Returns:
        str: 当前语言代码
    """
    return _current_language


def _(message: str) -> str:
    """
    翻译函数

    Args:
        message: 要翻译的字符串

    Returns:
        str: 翻译后的字符串（如果没有翻译则返回原文）
    """
    global _translation

    # 如果还没有加载翻译，尝试加载当前语言
    if _translation is None:
        set_language(_current_language)

    # 使用gettext翻译，如果没有翻译则返回原文
    if _translation is not None:
        return _translation.gettext(message)

    return message


# 注意：使用懒加载模式，_()函数第一次被调用时才初始化
# 避免模块导入时产生副作用
