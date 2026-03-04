# web/backend/routers/game.py
"""Game API router."""
from fastapi import APIRouter, HTTPException
from web.backend.schemas import GameStateSchema, ActionSchema, StartGameSchema
from web.backend.services import game_service

router = APIRouter()


@router.post("/start", response_model=GameStateSchema)
async def start_game(request: StartGameSchema):
    """Start a new game."""
    try:
        game_id = game_service.start_game(request.deck1_id, request.deck2_id)
        return game_service.serialize_state(game_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{game_id}", response_model=GameStateSchema)
async def get_game_state(game_id: str):
    """Get current game state."""
    state = game_service.serialize_state(game_id)
    if not state:
        raise HTTPException(status_code=404, detail="Game not found")
    return state


@router.post("/{game_id}/action", response_model=GameStateSchema)
async def execute_action(game_id: str, action: ActionSchema):
    """Execute a game action."""
    controller = game_service.get_game(game_id)
    if not controller:
        raise HTTPException(status_code=404, detail="Game not found")

    if action.action_type == "play_card":
        engine_action = PlayCardAction(
            player_id=controller.get_state().current_player.name,
            card_index=action.card_index,
            target_id=action.target_id,
        )
    elif action.action_type == "attack":
        engine_action = AttackAction(
            player_id=controller.get_state().current_player.name,
            attacker_id=action.attacker_id,
            target_id=action.target_id,
        )
    elif action.action_type == "end_turn":
        engine_action = EndTurnAction(
            player_id=controller.get_state().current_player.name,
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid action type")

    # Execute
    result = controller.execute_action(engine_action)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return game_service.serialize_state(game_id)


@router.get("/{game_id}/valid-actions")
async def get_valid_actions(game_id: str):
    """Get list of valid actions."""
    controller = game_service.get_game(game_id)
    if not controller:
        raise HTTPException(status_code=404, detail="Game not found")

    actions = controller.get_valid_actions()
    return {
        "actions": [
            {
                "type": a.__class__.__name__,
                "card_index": getattr(a, 'card_index', None),
                "attacker_id": getattr(a, 'attacker_id', None),
                "target_id": getattr(a, 'target_id', None),
            }
            for a in actions
        ]
    }
