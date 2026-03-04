"""
i18n国际化模块

提供gettext-based国际化支持
"""
from .core import (
    _,
    set_language,
    get_current_language,
    get_available_languages,
)

__all__ = [
    "_",
    "set_language",
    "get_current_language",
    "get_available_languages",
]
