# Hearthstone CLI

A CLI-based Hearthstone game engine with AI training support via Gymnasium.

## About Hearthstone

Hearthstone is a free-to-play online digital collectible card game developed and published by Blizzard Entertainment. Players choose a hero and build a deck of cards to battle against opponents. This project implements Hearthstone's game mechanics in a CLI environment, enabling both human play and AI training.

## Features

- **Full Game Engine**: Complete Hearthstone rules implementation
- **Gymnasium Environment**: Train AI agents using reinforcement learning
- **CLI Interface**: Play games directly in the terminal
- **Deck Management**: Load, save, and validate custom decks

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd hs_glm

# Install in development mode
pip install -e ".[dev]"
```

## Quick Start

### CLI Mode (Human Play)

Run the game directly:

```bash
python main.py
```

Or use the installed script:

```bash
hearthstone-cli
```

### AI Training Mode

Use the Gymnasium environment to train AI agents:

```python
import gymnasium as gym
from hearthstone.ai.gym_env import HearthstoneEnv

# Create environment
env = HearthstoneEnv()

# Standard Gymnasium API
obs, info = env.reset()
done = False

while not done:
    action = env.action_space.sample()  # Replace with your policy
    obs, reward, done, truncated, info = env.step(action)
```

## Project Structure

```
hs_glm/
├── main.py                    # CLI entry point
├── hearthstone/              # Core game engine
│   ├── ai/                   # AI-related code
│   │   └── gym_env.py        # Gymnasium environment
│   ├── cards/                # Card definitions and loader
│   ├── decks/                # Deck management
│   ├── engine/               # Game engine and actions
│   │   ├── game_controller.py # Central game loop manager
│   │   ├── game_engine.py    # Core game logic
│   │   └── action.py         # Action definitions
│   └── models/               # Data models
│       ├── card.py           # Card types
│       ├── deck.py           # Deck model
│       ├── game_state.py     # Game state
│       ├── hero.py           # Hero model
│       └── player.py         # Player model
├── cli/                      # CLI interface
│   ├── display/              # Display rendering
│   ├── input/                # Input handling
│   ├── menu/                 # Menu system
│   │   └── menu_system.py    # Main menu
│   └── game_loop.py          # CLI game loop
├── data/                     # Game data
│   ├── cards/                # Card definitions (JSON)
│   └── decks/                # Deck files (JSON)
└── tests/                    # Test suite
    ├── unit/                 # Unit tests
    └── integration/          # Integration tests
```

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=hearthstone --cov=cli

# Run specific test file
pytest tests/unit/test_game_controller.py -v

# Run integration tests only
pytest tests/integration/ -v
```

## Creating Custom Decks

Decks are defined in JSON format in `data/decks/`:

```json
{
  "name": "Custom Deck",
  "hero_class": "MAGE",
  "cards": [
    "CS2_142", "CS2_142",
    "CS2_168", "CS2_168"
  ]
}
```

Card IDs reference cards defined in `data/cards/`.

## Available Decks

- `test_deck` - Basic test deck
- `basic_mage` - Basic Mage deck
- `basic_warrior` - Basic Warrior deck

## Development

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run linting
ruff check .

# Format code
ruff format .
```

## Architecture

### GameController

The `GameController` is the central game loop manager that provides:
- `start_game()` - Initialize a new game
- `get_valid_actions()` - Get legal actions for current player
- `execute_action()` - Execute an action and return result
- `get_state()` - Get current game state
- `is_game_over()` - Check if game ended
- `get_winner()` - Get winner if game is over

### Gymnasium Environment

The `HearthstoneEnv` wraps the GameController with the standard Gymnasium API:
- Observation space: Dict with player/opponent stats
- Action space: Discrete with action masking
- Reward: Positive for winning, negative for losing, small positive for valid actions

## Goals

- 100% accurate game rules
- OpenAI Gymnasium interface for AI training
- CLI interface for human play

## License

License information to be determined.
