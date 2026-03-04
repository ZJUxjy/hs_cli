"""Tests for aura mechanics."""

import pytest
from unittest.mock import patch, MagicMock
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute, Enchantment
)
from hearthstone_cli.engine.actions import EndTurnAction
from hearthstone_cli.engine.game import GameLogic


class TestAuraMechanics:
    """Test aura mechanics."""

    def _create_mock_card_data(self, card_id, text):
        """创建模拟的卡牌数据"""
        mock_card = MagicMock()
        mock_card.card_id = card_id
        mock_card.text = text
        return mock_card

    def test_aura_buffs_other_minions(self):
        """Test that aura minion buffs other minions."""
        # 暴风城勇士效果：你的其他随从获得+1/+1
        stormwind_champion = Minion(
            card_id="CS2_222",  # 暴风城勇士
            attack=6,
            health=6,
            max_health=6,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        wisp = Minion(
            card_id="CS2_231",  # 小精灵
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(stormwind_champion, wisp),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 模拟卡牌数据库 - 需要在导入的地方打补丁
        mock_card = self._create_mock_card_data("CS2_222", "你的其他随从获得+1/+1。")

        with patch('hearthstone_cli.cards.database.CardDatabase') as mock_db_class:
            mock_db = MagicMock()
            mock_db.get_card.return_value = mock_card
            mock_db_class.return_value = mock_db

            # 重新计算光环
            new_state = GameLogic._recalculate_auras(state, 0)

        # 检查小精灵是否获得了光环增益（通过enchantments）
        wisp_after = new_state.players[0].board[1]
        assert len(wisp_after.enchantments) > 0
        # 检查是否有+1/+1的增益
        aura_enchantments = [e for e in wisp_after.enchantments if e.attack_bonus == 1 and e.health_bonus == 1]
        assert len(aura_enchantments) > 0

    def test_aura_removed_when_source_leaves(self):
        """Test that aura is removed when the source minion leaves."""
        wisp = Minion(
            card_id="CS2_231",
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset(),
            enchantments=(Enchantment(source="aura_multi_1_1", attack_bonus=1, health_bonus=1),),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(wisp,),  # 只有小精灵，没有光环源
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 模拟卡牌数据库（没有光环）
        mock_card = self._create_mock_card_data("CS2_231", "")

        with patch('hearthstone_cli.cards.database.CardDatabase') as mock_db_class:
            mock_db = MagicMock()
            mock_db.get_card.return_value = mock_card
            mock_db_class.return_value = mock_db

            # 重新计算光环（此时没有光环源）
            new_state = GameLogic._recalculate_auras(state, 0)

        # 光环增益应该被移除
        wisp_after = new_state.players[0].board[0]
        aura_enchantments = [e for e in wisp_after.enchantments if e.source.startswith("aura")]
        assert len(aura_enchantments) == 0

    def test_aura_does_not_buff_self(self):
        """Test that aura minion does not buff itself."""
        stormwind_champion = Minion(
            card_id="CS2_222",  # 暴风城勇士
            attack=6,
            health=6,
            max_health=6,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(stormwind_champion,),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 模拟卡牌数据库
        mock_card = self._create_mock_card_data("CS2_222", "你的其他随从获得+1/+1。")

        with patch('hearthstone_cli.cards.database.CardDatabase') as mock_db_class:
            mock_db = MagicMock()
            mock_db.get_card.return_value = mock_card
            mock_db_class.return_value = mock_db

            # 重新计算光环
            new_state = GameLogic._recalculate_auras(state, 0)

        # 暴风城勇士不应该给自己加增益
        champion_after = new_state.players[0].board[0]
        aura_enchantments = [e for e in champion_after.enchantments if e.source.startswith("aura")]
        assert len(aura_enchantments) == 0

    def test_multiple_aura_sources_stack(self):
        """Test that multiple aura sources stack."""
        # 两个暴风城勇士，应该+2/+2
        champion1 = Minion(
            card_id="CS2_222",
            attack=6,
            health=6,
            max_health=6,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        champion2 = Minion(
            card_id="CS2_222",
            attack=6,
            health=6,
            max_health=6,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        wisp = Minion(
            card_id="CS2_231",
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(champion1, champion2, wisp),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 模拟卡牌数据库
        mock_card = self._create_mock_card_data("CS2_222", "你的其他随从获得+1/+1。")

        with patch('hearthstone_cli.cards.database.CardDatabase') as mock_db_class:
            mock_db = MagicMock()
            mock_db.get_card.return_value = mock_card
            mock_db_class.return_value = mock_db

            # 重新计算光环
            new_state = GameLogic._recalculate_auras(state, 0)

        # 小精灵应该获得+2/+2（两个光环）
        wisp_after = new_state.players[0].board[2]
        total_attack_bonus = sum(e.attack_bonus for e in wisp_after.enchantments)
        total_health_bonus = sum(e.health_bonus for e in wisp_after.enchantments)
        assert total_attack_bonus == 2
        assert total_health_bonus == 2
