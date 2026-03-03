"""Game logic for Hearthstone CLI game."""

from dataclasses import replace
from typing import List, Optional

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
        else:
            return state

    @classmethod
    def _apply_end_turn(cls, state: GameState, action: EndTurnAction) -> GameState:
        """应用结束回合"""
        new_active = 1 - state.active_player
        new_turn = state.turn + (1 if new_active == 0 else 0)

        players = list(state.players)
        current = players[new_active]

        # 重置水晶
        new_max = min(10, current.mana.max_mana + 1)
        new_mana = ManaState(current=new_max, max_mana=new_max, overload=0, locked=0)

        # 重置随从状态
        new_board = tuple(
            replace(m, exhausted=False, summoned_this_turn=False)
            for m in current.board
        )

        players[new_active] = replace(
            current,
            mana=new_mana,
            hero_power_used=False,
            exhausted_minions=frozenset(),
            board=new_board
        )

        return replace(
            state,
            turn=new_turn,
            active_player=new_active,
            players=tuple(players)
        )

    @classmethod
    def _apply_attack(cls, state: GameState, action: AttackAction) -> GameState:
        """应用攻击（简化版）"""
        players = list(state.players)
        attacker_player = players[action.player]
        defender_player = players[1 - action.player]

        # 获取攻击者和防御者
        if action.attacker.zone == Zone.BOARD:
            attacker_idx = action.attacker.index
            attacker = attacker_player.board[attacker_idx]
        else:
            return state  # 英雄攻击稍后实现

        if action.defender.zone == Zone.BOARD:
            defender_idx = action.defender.index
            defender = defender_player.board[defender_idx]
        elif action.defender.zone == Zone.HERO:
            defender = None
            defender_health = defender_player.hero.health
        else:
            return state

        attacker_attack = attacker.attack
        defender_attack = defender.attack if defender else 0

        # 更新攻击者（受到反击伤害，仅当攻击随从时）
        if defender:
            new_attacker = replace(attacker, damage_taken=attacker.damage_taken + defender_attack)
        else:
            new_attacker = attacker  # 攻击英雄不受反击伤害
        new_board = list(attacker_player.board)
        new_board[attacker_idx] = new_attacker
        attacker_player = replace(attacker_player, board=tuple(new_board))

        # 更新防御者
        if defender:
            new_defender = replace(defender, damage_taken=defender.damage_taken + attacker_attack)
            new_board = list(defender_player.board)
            new_board[defender_idx] = new_defender
            defender_player = replace(defender_player, board=tuple(new_board))
        else:
            new_hero = replace(defender_player.hero, health=defender_health - attacker_attack)
            defender_player = replace(defender_player, hero=new_hero)

        # 标记攻击者已疲劳
        exhausted = set(attacker_player.exhausted_minions)
        exhausted.add(attacker_idx)
        attacker_player = replace(attacker_player, exhausted_minions=frozenset(exhausted))

        players[action.player] = attacker_player
        players[1 - action.player] = defender_player

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

        # 处理随从牌
        if card.card_type.value == "MINION":
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
                state = cls._apply_battlecry(state, action.player, card)

        # 处理法术牌
        elif card.card_type.value == "SPELL":
            # 解析并执行法术效果
            state = cls._apply_spell(state, action.player, card)

        return state

    @classmethod
    def _apply_spell(cls, state: GameState, player_idx: int, card) -> GameState:
        """应用法术效果"""
        from hearthstone_cli.cards.parser import EffectParser

        players = list(state.players)
        player = players[player_idx]
        enemy = players[1 - player_idx]

        # 解析效果
        effects = EffectParser.parse_text(card.text)

        for effect in effects:
            # 伤害效果
            if hasattr(effect, 'amount') and 'damage' in str(type(effect)).lower():
                # 对敌方英雄造成伤害
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
                new_health = min(30, player.hero.health + effect.amount)
                player = replace(player, hero=replace(player.hero, health=new_health))
                players[player_idx] = player
                state = replace(state, players=tuple(players))

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

        return state

    @classmethod
    def _apply_battlecry(cls, state: GameState, player_idx: int, card) -> GameState:
        """应用战吼效果"""
        from hearthstone_cli.cards.parser import EffectParser

        players = list(state.players)
        player = players[player_idx]
        enemy = players[1 - player_idx]

        # 解析战吼效果
        effects = EffectParser.parse_text(card.text)

        for effect in effects:
            # 伤害效果（如：战吼：造成1点伤害）
            if hasattr(effect, 'amount') and 'damage' in str(type(effect)).lower():
                # 对敌方英雄造成伤害
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
                if card.card_type.value == "MINION":
                    if len(player_state.board) < 7:  # 场上最多7个随从
                        # 简化：总是放在最右边
                        actions.append(PlayCardAction(
                            player=player,
                            card_index=i,
                            target=None,
                            board_position=len(player_state.board)
                        ))
                else:
                    # 法术/武器等其他卡牌
                    actions.append(PlayCardAction(
                        player=player,
                        card_index=i,
                        target=None,
                        board_position=0
                    ))

        # 可以攻击的随从
        for i, minion in enumerate(player_state.board):
            if cls._can_attack(minion, player_state):
                enemy = state.players[1 - player]
                taunts = [j for j, m in enumerate(enemy.board) if Attribute.TAUNT in m.attributes]

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
                    for j, _ in enumerate(enemy.board):
                        actions.append(AttackAction(
                            player=player,
                            attacker=TargetReference.board(player, i),
                            defender=TargetReference.board(1 - player, j)
                        ))

        return actions

    @classmethod
    def _can_attack(cls, minion: Minion, player: PlayerState) -> bool:
        """检查随从是否可以攻击"""
        if minion.attack <= 0:
            return False
        if Attribute.CHARGE in minion.attributes:
            return not minion.exhausted
        if minion.summoned_this_turn:
            return False
        return not minion.exhausted

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
            exhausted_minions=frozenset(),
            hero_power_used=False
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
