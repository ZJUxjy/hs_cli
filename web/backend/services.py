# web/backend/services.py
"""Business logic services."""
import uuid
from typing import Dict, Optional
from hearthstone.engine.game_controller import GameController
from hearthstone.decks.deck_manager import DeckManager
from web.backend.schemas import GameStateSchema, PlayerStateSchema, MinionSchema, CardSchema


class GameService:
    """Service for managing game sessions."""

    def __init__(self):
        self.sessions: Dict[str, GameController] = {}
        self.deck_manager = DeckManager()

    def start_game(self, deck1_id: str, deck2_id: str) -> str:
        """Start a new game and return game_id."""
        game_id = str(uuid.uuid4())[:8]

        # Load decks
        try:
            deck1 = self.deck_manager.load_deck(deck1_id)
        except FileNotFoundError:
 e:
            raise ValueError(f"Deck '{deck1_id}' not found")
        try:
            deck2 = self.deck_manager.load_deck(deck2_id)
        except FileNotFoundError as e:
            raise ValueError(f"Deck '{deck2_id}' not found")

        # Create controller
        controller = GameController(deck1, deck2)
        controller.start_game()

        self.sessions[game_id] = controller
        return game_id

    def get_game(self, game_id: str) -> Optional[GameController]:
        """Get game controller by ID."""
        return self.sessions.get(game_id)

    def serialize_state(self, game_id: str) -> Optional[GameStateSchema]:
        """Serialize game state to schema."""
        controller = self.sessions.get(game_id)
        if not controller:
            return None

        state = controller.get_state()

        return GameStateSchema(
            game_id=game_id,
            turn=state.turn,
            current_player=state.current_player.name,
            player1=self._serialize_player(state.player1),
            player2=self._serialize_player(state.player2),
            is_game_over=state.is_game_over(),
            winner=state.get_winner().name if state.get_winner() else None,
        )

    def _serialize_player(self, player) -> PlayerStateSchema:
        """Serialize player state."""
        return PlayerStateSchema(
            name=player.name,
            hero_class=player.hero.hero_class.value,
            health=player.hero.health,
            armor=player.hero.armor,
            mana=player.mana,
            max_mana=player.max_mana,
            hand=[self._serialize_card(c) for c in player.hand],
            board=[self._serialize_minion(m) for m in player.board],
            deck_size=len(player.deck),
        )

    def _serialize_card(self, card) -> CardSchema:
        """Serialize a card."""
        abilities = [a.value for a in card.abilities] if hasattr(card, 'abilities') else []
        return CardSchema(
            id=card.id,
            name=card.name,
            cost=card.cost,
            card_type=card.card_type.value,
            description=card.description,
            hero_class=card.hero_class.value if card.hero_class else None,
            attack=getattr(card, 'attack', None),
            health=getattr(card, 'health', None),
            abilities=abilities,
        )

    def _serialize_minion(self, minion) -> MinionSchema:
        """Serialize a minion."""
        abilities = [a.value for a in minion.abilities] if hasattr(minion, 'abilities') else []
        return MinionSchema(
            instance_id=minion.instance_id or minion.id,
            card_id=minion.id,
            name=minion.name,
            attack=minion.attack,
            health=minion.health,
            max_health=minion.max_health,
            can_attack=minion.can_attack,
            abilities=abilities,
        )


# Global service instance
game_service = GameService()
