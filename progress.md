Original prompt: 先将环境补齐将项目运行起来，再做更细的代码导览

- Environment setup completed using Node 22 from `~/.nvm/versions/node/v22.22.0/bin/node`.
- Installed dependencies with `npm ci`.
- Verified `tsc` build succeeds and `dist/demo.js` runs.
- Added selector compatibility so exported DSL selectors work as both callable functions and object-based `Selector` instances.
- Added controller inference in selectors so tests and lightweight setups work even when entities are inserted into zones without an explicit `controller`.
- Full verification is now green: `tsc` passes and Jest passes `36/36` suites (`372/372` tests).
- Next suggestion: inspect `actions`, `targeting`, and one representative card script end-to-end.
- Added `docs/project-guide.md`, a detailed architecture and execution-flow guide for future readers.
- Added `docs/plans/2026-03-08-webui-plan.md`, a staged Web UI plan for building a browser interface on top of the rules engine.
- Added `docs/plans/2026-03-08-webui-task-list.md`, an executable task breakdown with TDD-oriented agent prompts for Codex/Claude Code style automation.

## Web UI Phase 0 - 2026-03-08

### Task 0.1: Web 构建入口 ✅

Completed:
- Added Vite + React browser entry point
- Created `index.html`, `vite.config.ts`
- Created `src/ui/app/main.tsx`, `src/ui/app/App.tsx`, `src/ui/app/ui.css`
- Added npm scripts: `dev:web`, `build:web`, `preview:web`
- Updated `tsconfig.json` to exclude UI from Node build
- Created smoke test `src/ui/app/App.test.tsx`

Verification:
- `npm run build` passes (Node build)
- `npm run dev:web` starts successfully on port 3000
- All 380 tests pass (372 existing + 8 new UI tests)

### Task 0.2: UI 类型定义 ✅

Completed:
- Created `src/ui/types/ui-state.ts` - UI state snapshot types
- Created `src/ui/types/ui-commands.ts` - UI command types
- Created `src/ui/types/index.ts` - exports

Next: Task 1.1 - Implement `serializeGameState(game)`

### Task 1.1: 实现 serializeGameState ✅

Completed:
- Created `src/ui/engine-bridge/serializeGameState.ts`
- Serializes Game to UI-friendly read-only snapshot
- Added 10 tests for state serialization

### Task 1.2: 实现 createGameController ✅

Completed:
- Created `src/ui/engine-bridge/createGameController.ts`
- Provides stable API for UI: getState(), dispatch(), subscribe(), reset()
- Created `src/ui/engine-bridge/index.ts` for exports
- Added 9 tests for controller

Verification:
- All 399 tests pass (372 original + 27 new)

Next: Task 1.3 - 实现只读棋盘页面

### Task 1.3: 只读棋盘页面 ✅

Completed:
- Connected App.tsx to createGameController
- Display real game state (heroes, hand, field, mana)
- Add playable card highlighting
- Add game over overlay
- Update CSS with complete game board styling

Verification:
- All 399 tests pass
- UI shows real game data from engine

Next: Task 2.1 - 打通无目标出牌命令
