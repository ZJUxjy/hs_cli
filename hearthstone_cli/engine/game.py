"""Game logic for Hearthstone CLI game."""

from dataclasses import replace
from typing import FrozenSet, List, Optional

from hearthstone_cli.engine.state import (
    Attribute,
    GameState,
    HeroState,
    ManaState,
    Minion,
    PlayerState,
    RandomState,
)
from hearthstone_cli.engine.actions import (
    Action,
    AttackAction,
    EndTurnAction,
    HeroPowerAction,
    PlayCardAction,
    TargetReference,
    Zone,
)
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.engine.random import DeterministicRNG
from hearthstone_cli.cards.database import CardDatabase


class GameLogic:
    """游戏逻辑核心 - 纯静态方法，所有操作都是纯函数"""

    @classmethod
    def apply_action(cls, state: GameState, action: Action) -> GameState:
        """应用行动，返回新状态"""
        if isinstance(action, EndTurnAction):
            return cls._apply_end_turn(state, action)
        elif isinstance(action, AttackAction):
            return cls._apply_attack(state, action)
        elif isinstance(action, PlayCardAction):
            return cls._apply_play_card(state, action)
        elif isinstance(action, HeroPowerAction):
            return cls._apply_hero_power(state, action)
        else:
            return state

    @classmethod
    def _apply_end_turn(cls, state: GameState, action: EndTurnAction) -> GameState:
        """应用结束回合"""
        new_active = 1 - state.active_player
        new_turn = state.turn + (1 if new_active == 0 else 0)

        players = list(state.players)
        current = players[new_active]

        # 重置水晶，处理过载
        new_max = min(10, current.mana.max_mana + 1)
        # 上回合的过载变为本回合的锁定水晶
        locked_mana = current.mana.overload
        # 可用水晶 = 最大水晶 - 锁定水晶
        available_mana = max(0, new_max - locked_mana)
        new_mana = ManaState(current=available_mana, max_mana=new_max, overload=0, locked=locked_mana)

        # 重置随从状态（移除冻结）
        new_board = tuple(
            replace(
                m,
                exhausted=False,
                summoned_this_turn=False,
                attributes=m.attributes - {Attribute.FROZEN}  # 移除冻结
            )
            for m in current.board
        )

        # 回合开始抽牌
        new_fatigue_count = current.fatigue_count
        new_hero = current.hero
        new_deck = current.deck
        new_hand = current.hand

        if current.deck:
            # 正常抽牌
            card_drawn = current.deck[0]
            if len(current.hand) < 10:
                new_hand = current.hand + (card_drawn,)
            new_deck = current.deck[1:]
        else:
            # 疲劳伤害
            new_fatigue_count = current.fatigue_count + 1
            new_health = max(0, current.hero.health - new_fatigue_count)
            new_hero = replace(current.hero, health=new_health)

        players[new_active] = replace(
            current,
            hero=new_hero,
            mana=new_mana,
            hand=new_hand,
            deck=new_deck,
            hero_power_used=False,
            attacks_this_turn=tuple(),
            board=new_board,
            fatigue_count=new_fatigue_count
        )

        return replace(
            state,
            turn=new_turn,
            active_player=new_active,
            players=tuple(players)
        )

    @classmethod
    def _apply_attack(cls, state: GameState, action: AttackAction) -> GameState:
        """应用攻击（含亡语结算）"""
        from hearthstone_cli.engine.state import WeaponState

        players = list(state.players)
        attacker_player = players[action.player]
        defender_player = players[1 - action.player]

        # 获取攻击者和防御者
        is_hero_attack = False
        weapon = None

        if action.attacker.zone == Zone.BOARD:
            attacker_idx = action.attacker.index
            attacker = attacker_player.board[attacker_idx]
        elif action.attacker.zone == Zone.HERO:
            # 英雄攻击（需要装备武器）
            is_hero_attack = True
            weapon = attacker_player.hero.weapon
            if weapon is None:
                return state  # 没有武器不能攻击
            # 创建一个临时的"攻击者"用于统一处理
            attacker = None  # 英雄攻击不需要随从对象
        else:
            return state

        if action.defender.zone == Zone.BOARD:
            defender_idx = action.defender.index
            defender = defender_player.board[defender_idx]
        elif action.defender.zone == Zone.HERO:
            defender = None
            defender_health = defender_player.hero.health
        else:
            return state

        # 获取攻击力和反击力
        if is_hero_attack:
            attacker_attack = weapon.attack
            defender_attack = defender.attack if defender else 0
        else:
            attacker_attack = attacker.attack
            defender_attack = defender.attack if defender else 0

        # 计算实际造成的伤害（用于吸血）
        actual_damage_dealt = 0

        # 更新攻击者（受到反击伤害，仅当攻击随从时）
        if is_hero_attack:
            # 英雄攻击：如果攻击随从，英雄受到反击伤害
            if defender:
                # 英雄受到反击伤害
                new_health = attacker_player.hero.health - defender_attack
                attacker_player = replace(
                    attacker_player,
                    hero=replace(attacker_player.hero, health=new_health)
                )
        else:
            # 随从攻击
            # 圣盾：防止一次伤害并移除圣盾
            # 剧毒：如果防御者有毒，攻击者被秒杀
            if defender:
                if Attribute.DIVINE_SHIELD in attacker.attributes:
                    # 圣盾抵消伤害，移除圣盾
                    new_attacker = replace(
                        attacker,
                        attributes=attacker.attributes - {Attribute.DIVINE_SHIELD}
                    )
                elif Attribute.POISONOUS in defender.attributes:
                    # 防御者有毒，攻击者被秒杀
                    new_attacker = replace(attacker, damage_taken=attacker.max_health)
                else:
                    new_attacker = replace(attacker, damage_taken=attacker.damage_taken + defender_attack)
            else:
                new_attacker = attacker  # 攻击英雄不受反击伤害
            new_board = list(attacker_player.board)
            new_board[attacker_idx] = new_attacker
            attacker_player = replace(attacker_player, board=tuple(new_board))

        # 计算实际造成的伤害（用于吸血）
        actual_damage_dealt = 0

        # 更新防御者
        if defender:
            if Attribute.DIVINE_SHIELD in defender.attributes:
                # 圣盾抵消伤害，移除圣盾
                new_defender = replace(
                    defender,
                    attributes=defender.attributes - {Attribute.DIVINE_SHIELD}
                )
                # 圣盾阻挡了伤害，吸血不触发
                actual_damage_dealt = 0
            elif is_hero_attack:
                # 英雄（武器）攻击：检查武器是否有剧毒
                if Attribute.POISONOUS in weapon.attributes:
                    actual_damage_dealt = defender.max_health - defender.damage_taken
                    new_defender = replace(defender, damage_taken=defender.max_health)
                else:
                    actual_damage_dealt = attacker_attack
                    new_defender = replace(defender, damage_taken=defender.damage_taken + attacker_attack)
            elif Attribute.POISONOUS in attacker.attributes:
                # 随从剧毒：直接消灭目标（设置伤害为最大生命值）
                actual_damage_dealt = defender.max_health - defender.damage_taken
                new_defender = replace(defender, damage_taken=defender.max_health)
            else:
                actual_damage_dealt = attacker_attack
                new_defender = replace(defender, damage_taken=defender.damage_taken + attacker_attack)
            new_board = list(defender_player.board)
            new_board[defender_idx] = new_defender
            defender_player = replace(defender_player, board=tuple(new_board))
        else:
            # 攻击英雄
            actual_damage_dealt = attacker_attack
            new_hero = replace(defender_player.hero, health=defender_health - attacker_attack)
            defender_player = replace(defender_player, hero=new_hero)

        # 吸血：治疗攻击者的英雄
        # 检查武器是否有吸血（英雄攻击）或随从是否有吸血
        has_lifesteal = (is_hero_attack and Attribute.LIFESTEAL in weapon.attributes) or \
                       (not is_hero_attack and Attribute.LIFESTEAL in attacker.attributes)
        if has_lifesteal and actual_damage_dealt > 0:
            new_health = min(30, attacker_player.hero.health + actual_damage_dealt)
            attacker_player = replace(
                attacker_player,
                hero=replace(attacker_player.hero, health=new_health)
            )

        # 记录攻击次数（用于风怒）
        if not is_hero_attack:
            attacks_dict = dict(attacker_player.attacks_this_turn)
            attacks_dict[attacker_idx] = attacks_dict.get(attacker_idx, 0) + 1
            attacks_tuple = tuple(sorted(attacks_dict.items()))
            attacker_player = replace(attacker_player, attacks_this_turn=attacks_tuple)

            # 攻击后移除潜行
            if attacker_idx < len(attacker_player.board):
                attacking_minion = attacker_player.board[attacker_idx]
                if Attribute.STEALTH in attacking_minion.attributes:
                    new_minion = replace(
                        attacking_minion,
                        attributes=attacking_minion.attributes - {Attribute.STEALTH}
                    )
                    new_board = list(attacker_player.board)
                    new_board[attacker_idx] = new_minion
                    attacker_player = replace(attacker_player, board=tuple(new_board))

        # 英雄攻击：减少武器耐久度
        if is_hero_attack:
            new_durability = weapon.durability - 1
            if new_durability <= 0:
                # 武器耐久度为0，摧毁武器
                attacker_player = replace(
                    attacker_player,
                    hero=replace(attacker_player.hero, weapon=None)
                )
            else:
                # 更新武器耐久度
                new_weapon = replace(weapon, durability=new_durability)
                attacker_player = replace(
                    attacker_player,
                    hero=replace(attacker_player.hero, weapon=new_weapon)
                )

        players[action.player] = attacker_player
        players[1 - action.player] = defender_player
        state = replace(state, players=tuple(players))

        # 检查奥秘触发（攻击英雄时）
        if action.defender.zone == Zone.HERO:
            state = cls._check_and_trigger_secrets(
                state,
                "attack_hero",
                action.player,
                attacker=action.attacker
            )

        # 死亡结算（包括亡语触发）
        state = cls._resolve_deaths(state)

        return state

    @classmethod
    def _apply_hero_power(cls, state: GameState, action: HeroPowerAction) -> GameState:
        """应用英雄技能"""
        players = list(state.players)
        player = players[action.player]
        enemy = players[1 - action.player]

        # 获取英雄技能
        hero_power = player.hero.hero_power
        if hero_power is None:
            return state

        # 扣除法力值
        new_mana = replace(player.mana, current=player.mana.current - hero_power.cost)

        # 应用英雄技能效果
        # 1. 伤害效果
        if hero_power.damage > 0 and action.target:
            if action.target.zone == Zone.HERO:
                # 对英雄造成伤害
                target_player = players[action.target.player]
                new_health = max(0, target_player.hero.health - hero_power.damage)
                players[action.target.player] = replace(
                    target_player,
                    hero=replace(target_player.hero, health=new_health)
                )
            elif action.target.zone == Zone.BOARD:
                # 对随从造成伤害
                target_player = players[action.target.player]
                if action.target.index < len(target_player.board):
                    minion = target_player.board[action.target.index]
                    new_minion = replace(minion, damage_taken=minion.damage_taken + hero_power.damage)
                    new_board = list(target_player.board)
                    new_board[action.target.index] = new_minion
                    players[action.target.player] = replace(
                        target_player,
                        board=tuple(new_board)
                    )

        # 2. 治疗效果
        if hero_power.heal > 0:
            new_health = min(30, player.hero.health + hero_power.heal)
            player = replace(player, hero=replace(player.hero, health=new_health))

        # 3. 护甲效果
        if hero_power.armor > 0:
            new_armor = player.hero.armor + hero_power.armor
            player = replace(player, hero=replace(player.hero, armor=new_armor))

        # 标记英雄技能已使用
        player = replace(player, hero_power_used=True, mana=new_mana)
        players[action.player] = player

        return replace(state, players=tuple(players))

    @classmethod
    def _apply_freeze(cls, state: GameState, player_idx: int, minion_idx: int) -> GameState:
        """应用冻结效果到指定随从"""
        players = list(state.players)
        player = players[player_idx]

        if minion_idx >= len(player.board):
            return state

        minion = player.board[minion_idx]
        frozen_minion = replace(
            minion,
            attributes=minion.attributes | {Attribute.FROZEN}
        )

        new_board = list(player.board)
        new_board[minion_idx] = frozen_minion
        players[player_idx] = replace(player, board=tuple(new_board))

        return replace(state, players=tuple(players))

    @classmethod
    def _apply_silence(cls, state: GameState, player_idx: int, minion_idx: int) -> GameState:
        """应用沉默效果到指定随从

        沉默会：
        1. 移除所有属性（嘲讽、圣盾等）
        2. 移除所有增益效果
        3. 保留基础攻击力和生命值
        """
        players = list(state.players)
        player = players[player_idx]

        if minion_idx >= len(player.board):
            return state

        minion = player.board[minion_idx]

        # 沉默：移除所有属性和增益
        silenced_minion = replace(
            minion,
            attributes=frozenset(),  # 移除所有属性
            enchantments=()  # 移除所有增益
        )

        new_board = list(player.board)
        new_board[minion_idx] = silenced_minion
        players[player_idx] = replace(player, board=tuple(new_board))

        return replace(state, players=tuple(players))

    @classmethod
    def _apply_transform(
        cls,
        state: GameState,
        player_idx: int,
        minion_idx: int,
        new_card_id: str,
        new_attack: int,
        new_health: int,
        new_attributes: Optional[FrozenSet[Attribute]] = None
    ) -> GameState:
        """应用变形效果

        变形会：
        1. 改变随从的card_id、攻击力、生命值
        2. 替换所有属性
        3. 移除所有增益效果
        4. 保留已受到的伤害
        """

        players = list(state.players)
        player = players[player_idx]

        if minion_idx >= len(player.board):
            return state

        minion = player.board[minion_idx]

        # 变形：创建新的随从状态
        transformed_minion = replace(
            minion,
            card_id=new_card_id,
            attack=new_attack,
            health=new_health,
            max_health=new_health,
            attributes=new_attributes if new_attributes is not None else frozenset(),
            enchantments=()  # 移除所有增益
            # 保留damage_taken
        )

        new_board = list(player.board)
        new_board[minion_idx] = transformed_minion
        players[player_idx] = replace(player, board=tuple(new_board))

        return replace(state, players=tuple(players))

    @classmethod
    def _return_to_hand(cls, state: GameState, player_idx: int, minion_idx: int) -> GameState:
        """将随从返回手牌"""
        from hearthstone_cli.engine.state import Card
        from hearthstone_cli.cards.database import CardDatabase

        players = list(state.players)
        player = players[player_idx]

        if minion_idx >= len(player.board):
            return state

        minion = player.board[minion_idx]

        # 从数据库获取卡牌信息
        db = CardDatabase()
        card_data = db.get_card(minion.card_id)

        if card_data:
            # 使用数据库中的卡牌数据
            card = Card(
                card_id=card_data.card_id,
                name=card_data.name,
                cost=card_data.cost,
                card_type=card_data.card_type,
                attack=card_data.attack,
                health=card_data.health,
                attributes=frozenset()  # 清除所有属性
            )
        else:
            # 数据库中没有，使用随从数据创建
            card = Card(
                card_id=minion.card_id,
                name=minion.card_id,
                cost=0,  # 未知费用
                card_type="MINION",
                attack=minion.attack,
                health=minion.max_health,  # 恢复满血
                attributes=frozenset()
            )

        # 从场上移除随从
        new_board = list(player.board)
        del new_board[minion_idx]

        # 尝试添加到手牌（手牌上限10张）
        new_hand = list(player.hand)
        if len(new_hand) < 10:
            new_hand.append(card)
        # 否则卡牌被销毁（不添加）

        players[player_idx] = replace(
            player,
            board=tuple(new_board),
            hand=tuple(new_hand)
        )

        state = replace(state, players=tuple(players))

        # 重新计算光环效果（随从离开可能影响光环）
        state = cls._recalculate_auras(state, player_idx)

        return state

    @classmethod
    def _recalculate_auras(cls, state: GameState, player_idx: int) -> GameState:
        """重新计算所有光环效果"""
        from hearthstone_cli.cards.parser import EffectParser
        from hearthstone_cli.engine.state import Enchantment
        from hearthstone_cli.cards.database import CardDatabase

        players = list(state.players)
        player = players[player_idx]

        db = CardDatabase()

        # 首先清除所有非光环增益（保留手动添加的buff）
        # 然后重新应用光环

        # 找出所有具有光环效果的随从
        aura_sources = []
        for minion in player.board:
            card_data = db.get_card(minion.card_id)
            if card_data and card_data.text:
                aura = EffectParser.parse_aura(card_data.text)
                if aura:
                    aura_sources.append((minion, aura))

        # 重新计算每个随从的增益
        new_board = []
        for i, minion in enumerate(player.board):
            # 计算这个随从应该从光环获得多少增益
            total_attack_bonus = 0
            total_health_bonus = 0

            for source_minion, aura in aura_sources:
                # 跳过自己（光环通常不影响自己）
                if source_minion == minion and not aura.include_self:
                    continue

                # 应用光环
                total_attack_bonus += aura.attack_bonus
                total_health_bonus += aura.health_bonus

            # 更新随从的enchantments
            # 保留非光环增益，添加新的光环增益
            non_aura_enchantments = [
                e for e in minion.enchantments
                if not e.source.startswith("aura_")
            ]

            if total_attack_bonus > 0 or total_health_bonus > 0:
                aura_enchantment = Enchantment(
                    source=f"aura_multi_{total_attack_bonus}_{total_health_bonus}",
                    attack_bonus=total_attack_bonus,
                    health_bonus=total_health_bonus
                )
                non_aura_enchantments.append(aura_enchantment)

            new_minion = replace(
                minion,
                enchantments=tuple(non_aura_enchantments)
            )
            new_board.append(new_minion)

        players[player_idx] = replace(player, board=tuple(new_board))
        return replace(state, players=tuple(players))

    @classmethod
    def _apply_aura_from_minion(cls, state: GameState, player_idx: int, minion_idx: int) -> GameState:
        """从新登场的随从应用光环效果"""
        from hearthstone_cli.cards.parser import EffectParser
        from hearthstone_cli.engine.state import Enchantment
        from hearthstone_cli.cards.database import CardDatabase

        players = list(state.players)
        player = players[player_idx]

        if minion_idx >= len(player.board):
            return state

        new_minion = player.board[minion_idx]

        db = CardDatabase()
        card_data = db.get_card(new_minion.card_id)

        if not card_data or not card_data.text:
            return state

        aura = EffectParser.parse_aura(card_data.text)
        if not aura:
            return state

        # 将光环增益应用到其他随从
        new_board = list(player.board)
        for i, minion in enumerate(new_board):
            if i == minion_idx and not aura.include_self:
                continue

            # 添加光环增益
            aura_enchantment = Enchantment(
                source=f"aura_{new_minion.card_id}",
                attack_bonus=aura.attack_bonus,
                health_bonus=aura.health_bonus
            )

            updated_minion = replace(
                minion,
                enchantments=minion.enchantments + (aura_enchantment,)
            )
            new_board[i] = updated_minion

        players[player_idx] = replace(player, board=tuple(new_board))
        return replace(state, players=tuple(players))

    @classmethod
    def _apply_weapon(cls, state: GameState, player_idx: int, card) -> GameState:
        """装备武器"""
        from hearthstone_cli.engine.state import WeaponState

        players = list(state.players)
        player = players[player_idx]

        # 创建武器
        weapon = WeaponState(
            card_id=card.card_id,
            attack=card.attack or 0,
            durability=card.durability or 0,
            max_durability=card.durability or 0,
            attributes=card.attributes
        )

        # 装备武器（替换当前武器）
        player = replace(player, hero=replace(player.hero, weapon=weapon))
        players[player_idx] = player

        return replace(state, players=tuple(players))

    @classmethod
    def _apply_play_card(cls, state: GameState, action: PlayCardAction) -> GameState:
        """应用打出卡牌"""
        from hearthstone_cli.cards.parser import EffectParser

        players = list(state.players)
        player = players[action.player]
        enemy = players[1 - action.player]

        # 获取打出的卡牌
        card = player.hand[action.card_index]

        # 从手牌移除
        new_hand = list(player.hand)
        del new_hand[action.card_index]

        # 扣除法力值
        new_mana = replace(player.mana, current=player.mana.current - card.cost)

        # 更新玩家状态（手牌和法力）
        player = replace(player, hand=tuple(new_hand), mana=new_mana)
        players[action.player] = player
        state = replace(state, players=tuple(players))

        # 获取卡牌类型（兼容 Card 和 CardData）
        card_type_str = card.card_type.value if hasattr(card.card_type, 'value') else card.card_type

        # 处理随从牌
        if card_type_str == "MINION":
            # 创建随从
            minion = Minion(
                card_id=card.card_id,
                attack=card.attack or 0,
                health=card.health or 0,
                max_health=card.health or 0,
                attributes=card.attributes,
                enchantments=(),
                damage_taken=0,
                summoned_this_turn=True,
                exhausted=Attribute.CHARGE not in card.attributes,
            )

            # 插入到指定位置
            new_board = list(player.board)
            pos = min(action.board_position, len(new_board))
            new_board.insert(pos, minion)

            player = replace(player, board=tuple(new_board))
            players[action.player] = player
            state = replace(state, players=tuple(players))

            # 处理战吼效果
            if card.text and ("战吼" in card.text or "Battlecry" in card.text):
                state = cls._apply_battlecry(state, action.player, card, action.target)

            # 检查奥秘触发（打出随从后）
            state = cls._check_and_trigger_secrets(
                state,
                "play_minion",
                action.player,
                minion=minion
            )

            # 重新计算光环效果（新随从可能影响/被影响光环）
            state = cls._recalculate_auras(state, action.player)

        # 处理法术牌
        elif card_type_str == "SPELL":
            # 检查是否是奥秘
            if EffectParser.is_secret(card.text):
                state = cls._apply_secret(state, action.player, card)
            else:
                # 解析并执行法术效果
                state = cls._apply_spell(state, action.player, card, action.target)

        # 处理武器牌
        elif card_type_str == "WEAPON":
            state = cls._apply_weapon(state, action.player, card)

        # 处理过载效果
        overload_amount = EffectParser.parse_overload(card.text)
        if overload_amount > 0:
            players = list(state.players)
            player = players[action.player]
            # 增加下回合的过载锁定
            new_mana = replace(
                player.mana,
                overload=player.mana.overload + overload_amount
            )
            player = replace(player, mana=new_mana)
            players[action.player] = player
            state = replace(state, players=tuple(players))

        return state

    @classmethod
    def _apply_secret(cls, state: GameState, player_idx: int, card) -> GameState:
        """应用奥秘（将奥秘放入奥秘区）"""
        from hearthstone_cli.cards.parser import EffectParser
        from hearthstone_cli.engine.state import Secret

        players = list(state.players)
        player = players[player_idx]

        # 解析触发类型
        trigger_type = EffectParser.get_secret_trigger(card.text)

        # 创建奥秘
        secret = Secret(
            card_id=card.card_id,
            trigger_type=trigger_type,
            effect_data=(("text", card.text),)
        )

        # 添加到奥秘区（最多5个奥秘）
        if len(player.secrets) < 5:
            new_secrets = player.secrets | {secret}
            player = replace(player, secrets=new_secrets)
            players[player_idx] = player
            state = replace(state, players=tuple(players))

        return state

    @classmethod
    def _check_and_trigger_secrets(
        cls,
        state: GameState,
        trigger_type: str,
        trigger_player: int,
        **context
    ) -> GameState:
        """检查并触发奥秘

        Args:
            state: 当前游戏状态
            trigger_type: 触发类型 ("attack_hero", "play_minion", "cast_spell", etc.)
            trigger_player: 触发奥秘的玩家（即奥秘拥有者的对手）
            **context: 额外上下文信息
        """
        secret_owner = 1 - trigger_player
        player = state.players[secret_owner]

        # 查找匹配的奥秘
        secrets_to_trigger = [
            s for s in player.secrets
            if s.trigger_type == trigger_type or s.trigger_type == "unknown"
        ]

        if not secrets_to_trigger:
            return state

        # 触发第一个匹配的奥秘（简化处理）
        secret = secrets_to_trigger[0]

        # 应用奥秘效果
        state = cls._apply_secret_effect(state, secret_owner, secret, trigger_player, **context)

        # 将触发的奥秘移入墓地
        players = list(state.players)
        player = players[secret_owner]
        new_secrets = frozenset(s for s in player.secrets if s != secret)

        # 查找原始卡牌加入墓地
        db = CardDatabase()
        original_card = db.get_card(secret.card_id)
        if original_card:
            new_graveyard = player.graveyard + (original_card,)
            player = replace(player, secrets=new_secrets, graveyard=new_graveyard)
        else:
            player = replace(player, secrets=new_secrets)

        players[secret_owner] = player
        return replace(state, players=tuple(players))

    @classmethod
    def _apply_secret_effect(
        cls,
        state: GameState,
        secret_owner: int,
        secret: "Secret",
        trigger_player: int,
        **context
    ) -> GameState:
        """应用奥秘效果"""
        players = list(state.players)
        owner = players[secret_owner]
        enemy = players[trigger_player]

        # Convert tuple of tuples to dict for easier access
        effect_dict = dict(secret.effect_data)
        text = effect_dict.get("text", "")
        clean_text = text.lower()

        # 镜像实体：召唤对手使用的随从的复制
        if "镜像实体" in text or "mirror entity" in clean_text:
            if context.get("minion"):
                minion = context["minion"]
                if len(owner.board) < 7:
                    copied_minion = replace(
                        minion,
                        card_id=minion.card_id + "_COPY",
                        summoned_this_turn=True,
                        exhausted=True
                    )
                    owner = replace(owner, board=owner.board + (copied_minion,))
                    players[secret_owner] = owner
                    state = replace(state, players=tuple(players))

        # 冰冻陷阱：将攻击的随从移回手牌
        elif "冰冻陷阱" in text or "freezing trap" in clean_text:
            if context.get("attacker"):
                attacker_ref = context["attacker"]
                if attacker_ref.zone == Zone.BOARD:
                    enemy = players[trigger_player]
                    if attacker_ref.index < len(enemy.board):
                        minion = enemy.board[attacker_ref.index]
                        # 将随从移回手牌（如果手牌不满）
                        if len(enemy.hand) < 10:
                            # 这里简化处理，直接让随从死亡
                            new_board = list(enemy.board)
                            new_board.pop(attacker_ref.index)
                            enemy = replace(enemy, board=tuple(new_board))
                            players[trigger_player] = enemy
                            state = replace(state, players=tuple(players))

        # 爆炸陷阱：对所有敌方随从造成2点伤害
        elif "爆炸陷阱" in text or "explosive trap" in clean_text:
            enemy = players[trigger_player]
            # 对敌方英雄造成伤害
            new_health = max(0, enemy.hero.health - 2)
            enemy = replace(enemy, hero=replace(enemy.hero, health=new_health))
            # 对所有敌方随从造成伤害
            new_board = []
            for minion in enemy.board:
                if Attribute.DIVINE_SHIELD in minion.attributes:
                    new_minion = replace(minion, attributes=minion.attributes - {Attribute.DIVINE_SHIELD})
                else:
                    new_minion = replace(minion, damage_taken=minion.damage_taken + 2)
                new_board.append(new_minion)
            enemy = replace(enemy, board=tuple(new_board))
            players[trigger_player] = enemy
            state = replace(state, players=tuple(players))
            # 触发死亡结算
            state = cls._resolve_deaths(state)

        # 寒冰屏障：防止致命伤害
        elif "寒冰屏障" in text or "ice block" in clean_text:
            # 这个需要在伤害计算时处理，这里简化
            pass

        return state

    @classmethod
    def _resolve_deaths(cls, state: GameState) -> GameState:
        """结算死亡（包括亡语触发）

        实现延迟死亡结算：
        1. 收集所有已死亡的随从
        2. 触发亡语效果
        3. 将随从移入墓地
        4. 处理亡语产生的新死亡（递归）
        """
        from hearthstone_cli.cards.parser import EffectParser

        # 收集所有死亡的随从
        death_queue = []  # [(player_idx, minion_idx, minion, card_id), ...]

        for player_idx in range(2):
            player = state.players[player_idx]
            for minion_idx, minion in enumerate(player.board):
                # 实际生命值 = max_health - damage_taken
                actual_health = minion.max_health - minion.damage_taken
                if actual_health <= 0:
                    # 获取原始卡牌ID（用于查找亡语）
                    card_id = minion.card_id
                    death_queue.append((player_idx, minion_idx, minion, card_id))

        if not death_queue:
            return state  # 没有死亡，直接返回

        # 移除死亡的随从（从后往前移除，避免索引错乱）
        players = list(state.players)
        graveyard_additions = [[] for _ in range(2)]  # 每个玩家的墓地新增

        # 按索引排序，从大到小移除
        for player_idx, minion_idx, minion, card_id in sorted(death_queue, key=lambda x: (x[0], x[1]), reverse=True):
            player = players[player_idx]
            new_board = list(player.board)
            removed_minion = new_board.pop(minion_idx)

            # 添加到墓地
            # 注意：这里简化处理，墓地存储Card而不是Minion
            # 实际应该查找原始CardData
            db = CardDatabase()
            original_card = db.get_card(card_id)
            if original_card:
                graveyard_additions[player_idx].append(original_card)

            players[player_idx] = replace(player, board=tuple(new_board))

        state = replace(state, players=tuple(players))

        # 触发亡语效果
        for player_idx, minion_idx, minion, card_id in death_queue:
            # 查找原始卡牌的亡语效果
            db = CardDatabase()
            original_card = db.get_card(card_id)

            if original_card and original_card.text:
                # 检查是否有亡语
                if "亡语" in original_card.text or "Deathrattle" in original_card.text:
                    state = cls._apply_deathrattle(state, player_idx, original_card)

        # 将卡牌加入墓地（使用更新后的state）
        players = list(state.players)
        for player_idx in range(2):
            if graveyard_additions[player_idx]:
                player = players[player_idx]
                new_graveyard = player.graveyard + tuple(graveyard_additions[player_idx])
                players[player_idx] = replace(player, graveyard=new_graveyard)

        state = replace(state, players=tuple(players))

        # 递归处理新的死亡（亡语可能召唤新随从，然后新随从死亡）
        # 使用递归深度限制避免无限循环
        return cls._resolve_deaths_recursive(state, depth=0)

    @classmethod
    def _resolve_deaths_recursive(cls, state: GameState, depth: int) -> GameState:
        """递归处理新产生的死亡"""
        if depth > 5:  # 限制递归深度
            return state

        # 检查是否有新的死亡
        has_new_deaths = False
        for player_idx in range(2):
            player = state.players[player_idx]
            for minion in player.board:
                actual_health = minion.max_health - minion.damage_taken
                if actual_health <= 0:
                    has_new_deaths = True
                    break
            if has_new_deaths:
                break

        if has_new_deaths:
            return cls._resolve_deaths(state)

        return state

    @classmethod
    def _apply_deathrattle(cls, state: GameState, player_idx: int, card) -> GameState:
        """应用亡语效果"""
        from hearthstone_cli.cards.parser import EffectParser

        players = list(state.players)
        player = players[player_idx]
        enemy = players[1 - player_idx]

        # 解析亡语效果
        effects = EffectParser.parse_text(card.text)

        for effect in effects:
            # 召唤效果（最常见亡语）
            if hasattr(effect, 'card_id') and 'summon' in str(type(effect)).lower():
                # 解析召唤数量
                count = getattr(effect, 'count', 1)
                for _ in range(count):
                    if len(player.board) < 7:
                        minion = Minion(
                            card_id="DEATHRATTLE_SUMMON",
                            attack=1,
                            health=1,
                            max_health=1,
                            attributes=frozenset(),
                            enchantments=(),
                            damage_taken=0,
                            summoned_this_turn=True,
                            exhausted=True,
                        )
                        player = replace(player, board=player.board + (minion,))

            # 抽牌效果
            elif hasattr(effect, 'count') and 'draw' in str(type(effect)).lower():
                for _ in range(effect.count):
                    if player.deck:
                        card_drawn = player.deck[0]
                        if len(player.hand) < 10:
                            player = replace(
                                player,
                                hand=player.hand + (card_drawn,),
                                deck=player.deck[1:]
                            )
                        else:
                            player = replace(player, deck=player.deck[1:])

            # 伤害效果（如对随机敌人造成伤害）
            elif hasattr(effect, 'amount') and 'damage' in str(type(effect)).lower():
                # 对敌方英雄造成伤害（简化）
                new_health = max(0, enemy.hero.health - effect.amount)
                enemy = replace(enemy, hero=replace(enemy.hero, health=new_health))
                players[1 - player_idx] = enemy

            # 治疗效果
            elif hasattr(effect, 'amount') and 'heal' in str(type(effect)).lower():
                new_health = min(30, player.hero.health + effect.amount)
                player = replace(player, hero=replace(player.hero, health=new_health))

        players[player_idx] = player
        return replace(state, players=tuple(players))

    @classmethod
    def _apply_spell(cls, state: GameState, player_idx: int, card, target: Optional[TargetReference] = None) -> GameState:
        """应用法术效果"""
        from hearthstone_cli.cards.parser import EffectParser

        players = list(state.players)
        player = players[player_idx]
        enemy = players[1 - player_idx]

        # 解析效果
        effects = EffectParser.parse_text(card.text)
        target_type = EffectParser.get_target_type(card.text)

        for effect in effects:
            # 伤害效果
            if hasattr(effect, 'amount') and 'damage' in str(type(effect)).lower():
                # 如果有目标且效果需要目标，应用到目标
                if target and target_type != "none":
                    state = cls._apply_damage_to_target(state, player_idx, target, effect.amount)
                elif effect.target_selector == "all_enemies":
                    # AOE效果：对所有敌方随从和英雄造成伤害
                    state = cls._apply_damage_to_all_enemies(state, player_idx, effect.amount)
                else:
                    # 默认对敌方英雄造成伤害
                    new_health = max(0, enemy.hero.health - effect.amount)
                    enemy = replace(enemy, hero=replace(enemy.hero, health=new_health))
                    players[1 - player_idx] = enemy
                    state = replace(state, players=tuple(players))

            # 抽牌效果
            elif hasattr(effect, 'count') and 'draw' in str(type(effect)).lower():
                for _ in range(effect.count):
                    if player.deck:
                        card_drawn = player.deck[0]
                        if len(player.hand) < 10:  # 手牌上限10张
                            player = replace(
                                player,
                                hand=player.hand + (card_drawn,),
                                deck=player.deck[1:]
                            )
                        else:
                            # 手牌满了，牌被烧掉
                            player = replace(player, deck=player.deck[1:])
                players[player_idx] = player
                state = replace(state, players=tuple(players))

            # 治疗效果
            elif hasattr(effect, 'amount') and 'heal' in str(type(effect)).lower():
                if target and target_type != "none":
                    state = cls._apply_heal_to_target(state, player_idx, target, effect.amount)
                else:
                    new_health = min(30, player.hero.health + effect.amount)
                    player = replace(player, hero=replace(player.hero, health=new_health))
                    players[player_idx] = player
                    state = replace(state, players=tuple(players))

            # 消灭效果
            elif 'destroy' in str(type(effect)).lower():
                if target and target_type != "none":
                    state = cls._apply_destroy_to_target(state, player_idx, target)

            # 召唤效果
            elif hasattr(effect, 'card_id') and 'summon' in str(type(effect)).lower():
                # 简化：召唤一个1/1的小怪
                if len(player.board) < 7:
                    minion = Minion(
                        card_id="SKELETON",
                        attack=1,
                        health=1,
                        max_health=1,
                        attributes=frozenset(),
                        enchantments=(),
                        damage_taken=0,
                        summoned_this_turn=True,
                        exhausted=True,
                    )
                    player = replace(player, board=player.board + (minion,))
                    players[player_idx] = player
                    state = replace(state, players=tuple(players))

        # 法术可能造成伤害，触发死亡结算
        state = cls._resolve_deaths(state)

        return state

    @classmethod
    def _apply_damage_to_target(cls, state: GameState, player_idx: int, target: TargetReference, amount: int) -> GameState:
        """对指定目标造成伤害"""
        players = list(state.players)

        if target.zone == Zone.HERO:
            # 对英雄造成伤害
            player = players[target.player]
            new_health = max(0, player.hero.health - amount)
            players[target.player] = replace(player, hero=replace(player.hero, health=new_health))
        elif target.zone == Zone.BOARD:
            # 对随从造成伤害
            player = players[target.player]
            if target.index < len(player.board):
                minion = player.board[target.index]
                # 检查圣盾
                if Attribute.DIVINE_SHIELD in minion.attributes:
                    new_minion = replace(minion, attributes=minion.attributes - {Attribute.DIVINE_SHIELD})
                else:
                    new_minion = replace(minion, damage_taken=minion.damage_taken + amount)

                new_board = list(player.board)
                new_board[target.index] = new_minion
                players[target.player] = replace(player, board=tuple(new_board))

        return replace(state, players=tuple(players))

    @classmethod
    def _apply_damage_to_all_enemies(cls, state: GameState, player_idx: int, amount: int) -> GameState:
        """对所有敌人造成伤害（AOE）"""
        players = list(state.players)
        enemy_idx = 1 - player_idx
        enemy = players[enemy_idx]

        # 对敌方英雄造成伤害
        new_health = max(0, enemy.hero.health - amount)
        enemy = replace(enemy, hero=replace(enemy.hero, health=new_health))

        # 对所有敌方随从造成伤害
        new_board = []
        for minion in enemy.board:
            if Attribute.DIVINE_SHIELD in minion.attributes:
                new_minion = replace(minion, attributes=minion.attributes - {Attribute.DIVINE_SHIELD})
            else:
                new_minion = replace(minion, damage_taken=minion.damage_taken + amount)
            new_board.append(new_minion)

        enemy = replace(enemy, board=tuple(new_board))
        players[enemy_idx] = enemy

        return replace(state, players=tuple(players))

    @classmethod
    def _apply_heal_to_target(cls, state: GameState, player_idx: int, target: TargetReference, amount: int) -> GameState:
        """对指定目标进行治疗"""
        players = list(state.players)

        if target.zone == Zone.HERO:
            player = players[target.player]
            new_health = min(30, player.hero.health + amount)
            players[target.player] = replace(player, hero=replace(player.hero, health=new_health))
        elif target.zone == Zone.BOARD:
            player = players[target.player]
            if target.index < len(player.board):
                minion = player.board[target.index]
                # 治疗：减少已承受的伤害
                new_damage = max(0, minion.damage_taken - amount)
                new_minion = replace(minion, damage_taken=new_damage)
                new_board = list(player.board)
                new_board[target.index] = new_minion
                players[target.player] = replace(player, board=tuple(new_board))

        return replace(state, players=tuple(players))

    @classmethod
    def _apply_destroy_to_target(cls, state: GameState, player_idx: int, target: TargetReference) -> GameState:
        """消灭指定目标"""
        players = list(state.players)

        if target.zone == Zone.BOARD:
            player = players[target.player]
            if target.index < len(player.board):
                # 直接设置伤害为生命值，触发死亡
                minion = player.board[target.index]
                new_minion = replace(minion, damage_taken=minion.max_health)
                new_board = list(player.board)
                new_board[target.index] = new_minion
                players[target.player] = replace(player, board=tuple(new_board))

        return replace(state, players=tuple(players))

    @classmethod
    def _apply_battlecry(cls, state: GameState, player_idx: int, card, target: Optional[TargetReference] = None) -> GameState:
        """应用战吼效果"""
        from hearthstone_cli.cards.parser import EffectParser

        players = list(state.players)
        player = players[player_idx]
        enemy = players[1 - player_idx]

        # 解析战吼效果
        effects = EffectParser.parse_text(card.text)
        target_type = EffectParser.get_target_type(card.text)

        for effect in effects:
            # 伤害效果（如：战吼：对一个敌方随从造成1点伤害）
            if hasattr(effect, 'amount') and 'damage' in str(type(effect)).lower():
                if target and target_type != "none":
                    state = cls._apply_damage_to_target(state, player_idx, target, effect.amount)
                else:
                    # 默认对敌方英雄造成伤害
                    new_health = max(0, enemy.hero.health - effect.amount)
                    enemy = replace(enemy, hero=replace(enemy.hero, health=new_health))
                    players[1 - player_idx] = enemy
                    state = replace(state, players=tuple(players))

            # 抽牌效果
            elif hasattr(effect, 'count') and 'draw' in str(type(effect)).lower():
                for _ in range(effect.count):
                    if player.deck:
                        card_drawn = player.deck[0]
                        if len(player.hand) < 10:
                            player = replace(
                                player,
                                hand=player.hand + (card_drawn,),
                                deck=player.deck[1:]
                            )
                        else:
                            player = replace(player, deck=player.deck[1:])
                players[player_idx] = player
                state = replace(state, players=tuple(players))

            # 治疗效果
            elif hasattr(effect, 'amount') and 'heal' in str(type(effect)).lower():
                new_health = min(30, player.hero.health + effect.amount)
                player = replace(player, hero=replace(player.hero, health=new_health))
                players[player_idx] = player
                state = replace(state, players=tuple(players))

            # 召唤效果（如：战吼：召唤一个1/1的小鬼）
            elif hasattr(effect, 'card_id') and 'summon' in str(type(effect)).lower():
                if len(player.board) < 7:
                    minion = Minion(
                        card_id="IMP",
                        attack=1,
                        health=1,
                        max_health=1,
                        attributes=frozenset(),
                        enchantments=(),
                        damage_taken=0,
                        summoned_this_turn=True,
                        exhausted=True,
                    )
                    player = replace(player, board=player.board + (minion,))
                    players[player_idx] = player
                    state = replace(state, players=tuple(players))

        # 战吼可能造成伤害或召唤，触发死亡结算
        state = cls._resolve_deaths(state)

        return state

    @classmethod
    def get_legal_actions(cls, state: GameState, player: int) -> List[Action]:
        """获取玩家所有合法行动"""
        actions: List[Action] = [EndTurnAction(player=player)]

        if state.active_player != player:
            return actions

        player_state = state.players[player]

        # 可以打出的手牌
        for i, card in enumerate(player_state.hand):
            if card.cost <= player_state.mana.current:
                # 随从牌需要检查场上是否有空位
                card_type_str = card.card_type.value if hasattr(card.card_type, 'value') else card.card_type
                if card_type_str == "MINION":
                    if len(player_state.board) < 7:  # 场上最多7个随从
                        # 检查是否需要目标
                        if card.text and EffectParser.requires_target(card.text):
                            # 生成所有可能的目标
                            targets = cls._get_valid_targets(state, player, card)
                            for target in targets:
                                actions.append(PlayCardAction(
                                    player=player,
                                    card_index=i,
                                    target=target,
                                    board_position=len(player_state.board)
                                ))
                        else:
                            # 简化：总是放在最右边
                            actions.append(PlayCardAction(
                                player=player,
                                card_index=i,
                                target=None,
                                board_position=len(player_state.board)
                            ))
                elif card_type_str == "SPELL":
                    # 检查法术是否需要目标
                    if EffectParser.requires_target(card.text):
                        targets = cls._get_valid_targets(state, player, card)
                        for target in targets:
                            actions.append(PlayCardAction(
                                player=player,
                                card_index=i,
                                target=target,
                                board_position=0
                            ))
                    else:
                        # 法术/武器等其他卡牌
                        actions.append(PlayCardAction(
                            player=player,
                            card_index=i,
                            target=None,
                            board_position=0
                        ))
                else:
                    # 其他卡牌类型
                    actions.append(PlayCardAction(
                        player=player,
                        card_index=i,
                        target=None,
                        board_position=0
                    ))

        # 可以攻击的随从
        for i, minion in enumerate(player_state.board):
            if cls._can_attack(minion, player_state, i):
                enemy = state.players[1 - player]
                # 嘲讽随从强制优先攻击，但潜行随从即使有嘲讽也不会被强制攻击
                taunts = [j for j, m in enumerate(enemy.board)
                         if Attribute.TAUNT in m.attributes and Attribute.STEALTH not in m.attributes]

                if taunts:
                    for t in taunts:
                        actions.append(AttackAction(
                            player=player,
                            attacker=TargetReference.board(player, i),
                            defender=TargetReference.board(1 - player, t)
                        ))
                else:
                    actions.append(AttackAction(
                        player=player,
                        attacker=TargetReference.board(player, i),
                        defender=TargetReference.hero(1 - player)
                    ))
                    for j, enemy_minion in enumerate(enemy.board):
                        # 潜行随从不能被选为目标（除非特殊情况）
                        if Attribute.STEALTH not in enemy_minion.attributes:
                            actions.append(AttackAction(
                                player=player,
                                attacker=TargetReference.board(player, i),
                                defender=TargetReference.board(1 - player, j)
                            ))

        # 英雄攻击（如果有装备武器）
        if player_state.hero.weapon is not None:
            enemy = state.players[1 - player]
            # 嘲讽随从强制优先攻击，但潜行随从即使有嘲讽也不会被强制攻击
            taunts = [j for j, m in enumerate(enemy.board)
                     if Attribute.TAUNT in m.attributes and Attribute.STEALTH not in m.attributes]

            if taunts:
                for t in taunts:
                    actions.append(AttackAction(
                        player=player,
                        attacker=TargetReference.hero(player),
                        defender=TargetReference.board(1 - player, t)
                    ))
            else:
                # 可以攻击敌方英雄
                actions.append(AttackAction(
                    player=player,
                    attacker=TargetReference.hero(player),
                    defender=TargetReference.hero(1 - player)
                ))
                # 可以攻击非潜行敌方随从
                for j, enemy_minion in enumerate(enemy.board):
                    if Attribute.STEALTH not in enemy_minion.attributes:
                        actions.append(AttackAction(
                            player=player,
                            attacker=TargetReference.hero(player),
                            defender=TargetReference.board(1 - player, j)
                        ))

        # 英雄技能（如果有且未使用且法力足够）
        if (player_state.hero.hero_power is not None and
            not player_state.hero_power_used and
            player_state.mana.current >= player_state.hero.hero_power.cost):

            hero_power = player_state.hero.hero_power
            enemy = state.players[1 - player]

            if hero_power.target_required:
                # 需要目标的英雄技能（如法师的火球术）
                # 可以目标敌方英雄
                actions.append(HeroPowerAction(
                    player=player,
                    target=TargetReference.hero(1 - player)
                ))
                # 可以目标非潜行敌方随从
                for j, enemy_minion in enumerate(enemy.board):
                    if Attribute.STEALTH not in enemy_minion.attributes:
                        actions.append(HeroPowerAction(
                            player=player,
                            target=TargetReference.board(1 - player, j)
                        ))
            else:
                # 不需要目标的英雄技能（如战士的护甲）
                actions.append(HeroPowerAction(
                    player=player,
                    target=None
                ))

        return actions

    @classmethod
    def _get_valid_targets(cls, state: GameState, player_idx: int, card) -> List[TargetReference]:
        """获取卡牌的有效目标列表"""
        from hearthstone_cli.cards.parser import EffectParser

        targets: List[TargetReference] = []
        target_type = EffectParser.get_target_type(card.text)
        enemy_idx = 1 - player_idx

        if target_type == "enemy_minion":
            # 敌方随从（不包括潜行随从）
            enemy = state.players[enemy_idx]
            for i, minion in enumerate(enemy.board):
                if Attribute.STEALTH not in minion.attributes:
                    targets.append(TargetReference.board(enemy_idx, i))

        elif target_type == "enemy_hero":
            # 敌方英雄
            targets.append(TargetReference.hero(enemy_idx))

        elif target_type == "any_minion":
            # 任意随从（友方和敌方）
            for i in range(len(state.players[player_idx].board)):
                targets.append(TargetReference.board(player_idx, i))
            for i in range(len(state.players[enemy_idx].board)):
                targets.append(TargetReference.board(enemy_idx, i))

        elif target_type == "any_character":
            # 任意角色（所有随从和英雄）
            # 友方
            targets.append(TargetReference.hero(player_idx))
            for i in range(len(state.players[player_idx].board)):
                targets.append(TargetReference.board(player_idx, i))
            # 敌方
            targets.append(TargetReference.hero(enemy_idx))
            for i in range(len(state.players[enemy_idx].board)):
                targets.append(TargetReference.board(enemy_idx, i))

        elif target_type == "friendly_minion":
            # 友方随从
            for i in range(len(state.players[player_idx].board)):
                targets.append(TargetReference.board(player_idx, i))

        else:
            # 默认：允许敌方英雄和随从
            targets.append(TargetReference.hero(enemy_idx))
            enemy = state.players[enemy_idx]
            for i in range(len(enemy.board)):
                targets.append(TargetReference.board(enemy_idx, i))

        return targets

    @classmethod
    def _can_attack(cls, minion: Minion, player: PlayerState, minion_idx: int) -> bool:
        """检查随从是否可以攻击"""
        if minion.attack <= 0:
            return False

        # 如果随从被标记为疲劳（向后兼容），不能攻击
        if minion.exhausted:
            return False

        # 冻结的随从不能攻击
        if Attribute.FROZEN in minion.attributes:
            return False

        # 获取本回合攻击次数
        attacks_dict = dict(player.attacks_this_turn)
        attacks_count = attacks_dict.get(minion_idx, 0)

        # 计算最大攻击次数（风怒=2，普通=1）
        max_attacks = 2 if Attribute.WINDFURY in minion.attributes else 1

        # 如果本回合召唤的随从，需要冲锋才能攻击
        if minion.summoned_this_turn:
            if Attribute.CHARGE not in minion.attributes:
                return False

        return attacks_count < max_attacks

    @classmethod
    def create_game(cls, deck1: Deck, deck2: Deck, seed: int = 42) -> GameState:
        """创建新游戏"""
        rng = DeterministicRNG(seed)

        player0 = cls._create_player(deck1, rng, goes_first=True)
        player1 = cls._create_player(deck2, rng, goes_first=False)

        return GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=rng.get_state(),
            phase_stack=()
        )

    @classmethod
    def _create_player(cls, deck: Deck, rng: DeterministicRNG, goes_first: bool) -> PlayerState:
        """创建玩家"""
        db = CardDatabase()

        cards = [db.get_card(cid) for cid in deck.card_ids]
        cards = [c for c in cards if c is not None]

        # 洗牌
        cards_list = list(cards)
        rng.shuffle(cards_list)
        cards = tuple(cards_list)

        # 抽初始手牌
        initial_hand_size = 3 if goes_first else 4
        hand = cards[:initial_hand_size]
        remaining_deck = cards[initial_hand_size:]

        # 先手：1费1水晶，后手：0费1水晶（但有硬币）
        starting_mana = 1 if goes_first else 0
        return PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=starting_mana, max_mana=1),
            deck=remaining_deck,
            hand=hand,
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )

    @classmethod
    def is_terminal(cls, state: GameState) -> bool:
        """检查游戏是否结束"""
        for player in state.players:
            if player.hero.health <= 0:
                return True
        return False

    @classmethod
    def get_winner(cls, state: GameState) -> Optional[int]:
        """获取获胜者（如果游戏结束）"""
        if not cls.is_terminal(state):
            return None

        p0_alive = state.players[0].hero.health > 0
        p1_alive = state.players[1].hero.health > 0

        if p0_alive and not p1_alive:
            return 0
        elif p1_alive and not p0_alive:
            return 1
        else:
            return -1  # 平局
