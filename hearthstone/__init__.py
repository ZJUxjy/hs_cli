"""Hearthstone game engine core package.

Extends ``__path__`` to include the PyPI ``hearthstone`` package's
directory so that fireplace can import ``hearthstone.cardxml`` etc.
without namespace collisions.
"""
import os
import sys

__version__ = "0.1.0"

# Merge the PyPI hearthstone package into our __path__ so that
# submodules like ``cardxml``, ``enums``, ``entities`` remain
# importable (fireplace depends on them).
_this_init = os.path.realpath(__file__)
for _sp in sys.path:
    _candidate = os.path.join(_sp, "hearthstone", "__init__.py")
    if os.path.isfile(_candidate) and os.path.realpath(_candidate) != _this_init:
        _dir = os.path.dirname(_candidate)
        if _dir not in __path__:
            __path__.append(_dir)
        break
