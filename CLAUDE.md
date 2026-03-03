# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hearthstone-style CLI card game built with Node.js and blessed (terminal UI framework). It features single-player mode against AI, with plans for local multiplayer and online play.

## Commands

```bash
npm start       # Start the game
npm run dev     # Start with nodemon for development
```

Note: No test framework is configured yet.

## Architecture

The project uses a 4-layer architecture:

- **UI Layer** (`src/ui/`): Terminal UI screens using blessed (MainMenu, GameScreen, BattleScreen)
- **Game Logic Layer** (`src/game/`): Core game systems
  - `GameEngine.js`: Main game state and flow
  - `TurnManager.js`: Turn phase management
  - `BattleCalculator.js`: Combat resolution
  - `CardEffect.js`: Card ability implementation
  - `RuleEngine.js`: Game rules validation
  - `AIEngine.js`: AI opponent logic
- **Data Layer** (`src/data/`): JSON-based data management (cards, profiles, config)
- **Network Layer** (`src/network/`): WebSocket server for online play (RLServer.js)

## Key Patterns

- Game state is managed through `GameEngine` which coordinates all subsystems
- Card effects are defined in `CardEffect.js` using an effect system
- UI updates are driven by blessed screen rendering after state changes
- The project uses Chinese comments and variable names throughout

## Development Notes

- Entry point is `index.js` which sets up the blessed screen and starts the MainMenu
- All game rules and mechanics are being expanded - check `docs/plans/` for implementation status
- The `docs/plans/` directory contains design documents and implementation plans
