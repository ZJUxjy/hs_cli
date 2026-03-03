"""Core enum types for Hearthstone game engine."""
from enum import Enum


class CardType(str, Enum):
    """Card types in Hearthstone."""
    MINION = "MINION"
    SPELL = "SPELL"
    WEAPON = "WEAPON"
    HERO = "HERO"


class GamePhase(str, Enum):
    """Game phases in Hearthstone."""
    MULLIGAN = "MULLIGAN"
    MAIN = "MAIN"
    END = "END"


class Ability(str, Enum):
    """Minion abilities in Hearthstone."""
    CHARGE = "CHARGE"
    TAUNT = "TAUNT"
    DIVINE_SHIELD = "DIVINE_SHIELD"
    WINDFURY = "WINDFURY"
    STEALTH = "STEALTH"
    FROZEN = "FROZEN"
    POISONOUS = "POISONOUS"
    LIFESTEAL = "LIFESTEAL"
    RUSH = "RUSH"
    REBORN = "REBORN"
    SPELL_DAMAGE = "SPELL_DAMAGE"


class HeroClass(str, Enum):
    """Hero classes in Hearthstone."""
    WARRIOR = "WARRIOR"
    SHAMAN = "SHAMAN"
    ROGUE = "ROGUE"
    PALADIN = "PALADIN"
    HUNTER = "HUNTER"
    DRUID = "DRUID"
    WARLOCK = "WARLOCK"
    MAGE = "MAGE"
    PRIEST = "PRIEST"
    DEMON_HUNTER = "DEMON_HUNTER"
    NEUTRAL = "NEUTRAL"


class SpellEffect(str, Enum):
    """Spell effect types."""
    DAMAGE = "DAMAGE"  # Deal damage to target
    HEAL = "HEAL"  # Restore health to target
    DRAW = "DRAW"  # Draw cards
    ARMOR = "ARMOR"  # Gain armor
