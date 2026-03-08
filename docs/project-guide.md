# JS Fireplace Project Guide

## 1. What This Project Is

`js-fireplace` is a TypeScript rewrite of the Python project `fireplace`, which is a Hearthstone simulator.

This repository is not primarily a frontend game client. Its main value is the game-rule engine:

- load Hearthstone card definitions from XML
- build runtime entities such as players, cards, heroes, minions, and weapons
- validate whether a card can be played and whether a target is legal
- execute actions such as damage, summon, draw, morph, buff, destroy, and heal
- register and run card scripts for many sets and classes

The project already has a large amount of game content and many tests, but its engine completeness is uneven. Some subsystems are mature enough for scripting and testing; others are still simplified compared with full official Hearthstone rules.

## 2. High-Level Architecture

The codebase is easiest to understand as five layers.

### 2.1 Data Layer

This layer loads static card data.

Key files:

- `src/cards/CardDefs.xml`
- `src/cards/xmlparser.ts`
- `src/cards/loader.ts`
- `src/i18n/*`

Responsibilities:

- parse Blizzard-style XML card definitions
- map XML tags to internal enums and card fields
- build `CardDefinition` objects
- load localized names and descriptions

The XML file is large and acts as the source of truth for base card metadata such as cost, attack, health, class, type, rarity, and race.

### 2.2 Runtime Model Layer

This layer represents the current state of a match.

Key files:

- `src/core/entity.ts`
- `src/core/card.ts`
- `src/core/player.ts`
- `src/core/game.ts`

Responsibilities:

- define common runtime entities
- represent zone state such as hand, deck, field, graveyard, and secrets
- track mana, damage, hero state, and board state
- own the game loop skeleton: setup, turn begin, turn end, death processing

Core object hierarchy:

- `Entity`
- `Card extends Entity`
- `PlayableCard extends Card`
- `Minion`, `Spell`, `Weapon`, `Hero`, `HeroPower`, `Secret`
- `Player extends Entity`
- `Game extends Entity`

### 2.3 Rule Primitive Layer

This layer contains the atomic operations that mutate game state.

Key files:

- `src/actions/*`

Examples:

- `Damage`
- `Draw`
- `Summon`
- `Morph`
- `Destroy`
- `Heal`
- `Play`
- `Attack`
- `BeginTurn`
- `EndTurn`

These actions are the basic units of rule execution. Card scripts generally do not directly rewrite the entire game flow; they create or trigger these actions.

### 2.4 Validation and DSL Layer

This layer helps the engine decide what is legal and how to describe effects.

Key files:

- `src/targeting/targetvalidator.ts`
- `src/targeting/targeting.ts`
- `src/dsl/selector.ts`
- `src/dsl/lazynum.ts`
- `src/dsl/conditions.ts`
- `src/dsl/cardscripts.ts`

Responsibilities:

- validate play requirements such as friendly target, enemy target, damaged target, minion target, taunt target
- expose reusable selectors like `ALL_MINIONS`, `FRIENDLY_MINIONS`, `ENEMY_CHARACTERS`
- provide small DSL helpers for conditional effects and value calculation

This layer is important because it is where declarative mechanics can be expressed without every card script reinventing basic selection and filtering logic.

### 2.5 Card Script Layer

This is where card-specific effects live.

Key files:

- `src/cards/mechanics/index.ts`
- `src/cards/mechanics/*`

Responsibilities:

- register card behavior by card ID
- attach `play`, `deathrattle`, `events`, and other effect handlers
- encode set-specific and class-specific mechanics

This is the biggest content area in the repository. Many tests assert that these scripts exist and expose the expected shape.

## 3. Important Directories

### 3.1 `src/core`

The engine backbone.

- `game.ts`: orchestrates setup, turns, action blocks, event dispatch, aura refresh, death handling
- `player.ts`: owns deck, hand, field, mana, hero, draw logic, summon logic
- `card.ts`: runtime card classes and card-level helper methods such as `isPlayable()` and `canTarget()`
- `entity.ts`: shared base type with damage and buff hooks

### 3.2 `src/actions`

State mutation primitives.

These are effectively the "instruction set" of the simulator.

Examples:

- `damage.ts`: adds damage to a target after passing through `getDamage()`
- `summon.ts`: creates or inserts a minion onto the board
- `draw.ts`: moves cards from deck to hand
- `morph.ts`: applies transformation semantics
- `play.ts`: performs the base act of playing a card from hand

### 3.3 `src/cards`

Static and scripted card logic.

- `loader.ts`: converts parsed XML into internal card definitions
- `xmlparser.ts`: reads the XML file
- `mechanics/*`: per-set or per-class script registration files

### 3.4 `src/targeting`

Legality checks for playing cards and choosing targets.

The most important file is `targetvalidator.ts`, which answers:

- does this card require a target?
- is there any valid target?
- is this specific target valid?

### 3.5 `src/dsl`

Reusable logic for selectors, lazy values, conditions, and effect helpers.

This area is useful when card effects are encoded more declaratively. It is also one of the places where API evolution has happened, so compatibility matters.

### 3.6 `tests`

Automated validation.

The tests are broad rather than deeply integrated:

- many tests verify script registration or effect shape
- core engine tests exist for `Game`, `Player`, `Entity`, `Manager`, selectors, targeting, aura, and actions
- current coverage is good for regression detection, but not yet a full "real match simulation" guarantee

## 4. Main Runtime Objects

### 4.1 `Entity`

Defined in `src/core/entity.ts`.

This is the base class for almost everything in the match. It provides:

- a UUID
- a runtime type
- generic event/buff hooks
- `getDamage()` and `getHeal()` extension points

Conceptually, `Entity` exists so higher-level systems can operate on a common type without caring whether the object is a hero, minion, spell, or player.

### 4.2 `Card`

Defined in `src/core/card.ts`.

This wraps a `CardDefinition` into a runtime object. It adds:

- name and description lookup through i18n
- cost calculation hooks
- controller lookup
- `isPlayable()`
- `canTarget()`
- `getValidTargets()`

`Card` is the bridge between raw data and live gameplay rules.

### 4.3 `Player`

Defined in `src/core/player.ts`.

This class owns:

- all zones
- mana and overload-related state
- hero and hero power references
- turn counters
- helper methods such as `draw()`, `give()`, `discard()`, `summon()`, `shuffleDeck()`

It is the main container of per-player game state.

### 4.4 `Game`

Defined in `src/core/game.ts`.

This is the match coordinator. It owns:

- the two players
- random seed and RNG
- current player and turn number
- event manager
- aura refresh timing
- death processing
- action queue entry points

Even though the current implementation is lighter than a full official engine, `Game` is already the central orchestration point.

## 5. How a Match Starts

The startup flow is:

1. card XML is loaded through `CardLoader.loadFromXml(...)`
2. players are created with decklists
3. heroes are assigned via `startingHero`
4. `new Game({ players, seed })` is created
5. `game.start()` is called
6. `Game.setup()` links players, assigns order, prepares zones, summons heroes, shuffles decks
7. `GameStart` and turn-begin actions are queued
8. the first active turn begins

The interactive runner in `src/play.ts` demonstrates this flow in a CLI setting.

## 6. How an Active Spell Is Supposed to Work

The cleanest way to understand the architecture is to trace one active spell from hand to effect. A typical example is `Fireball`.

### 6.1 Step 1: A Spell Card Exists in Hand

The current player has a runtime `Card` object inside `player.hand`.

That object already knows:

- its `id`
- its cost
- its type
- its controller

### 6.2 Step 2: The Engine Checks Whether the Card Is Playable

`Card.isPlayable()` is the key entry point.

It checks:

- the card is in hand
- the controller exists
- the controller has enough mana
- player-level requirements pass
- target requirements pass if the card needs a target

The last two checks call `TargetValidator`.

### 6.3 Step 3: The Engine Determines Legal Targets

`TargetValidator` examines the script requirements attached to the card.

Examples of supported requirements:

- target required
- minion target required
- friendly target required
- enemy target required
- damaged target required
- taunt target required
- race-specific target required

It gathers candidate targets from the current game state and filters them.

This is the legality layer. It decides what the player is allowed to do before any effect fires.

### 6.4 Step 4: Base Play Action Happens

`src/actions/play.ts` handles the act of playing the card:

- remove the card from hand
- subtract mana
- increment play counters
- if minion, move to field
- if spell, move to graveyard after casting

This action does not fully encode the specific effect of every card. It only performs the generic "play a card" state transition.

### 6.5 Step 5: Card Script Executes

The card-specific effect should be resolved by the script registry in `src/cards/mechanics/index.ts`.

`executePlay(card, target)`:

- looks up the script by card ID
- builds an `ActionContext`
- invokes the script's `play` handler

That script then uses action primitives to mutate the board.

### 6.6 Step 6: Primitive Actions Apply the Effect

Examples:

- `Damage` increases the target's `damage`
- `Morph` changes a target into another card form
- `Summon` creates a board entity
- `Draw` moves cards from deck to hand

These actions are where the actual state mutation happens.

### 6.7 Step 7: Post-Resolution Cleanup Runs

Once an action block ends, `Game` performs cleanup such as:

- refreshing auras
- processing deaths
- checking for end-game conditions

This is how a spell can indirectly cause additional rule consequences beyond its immediate effect.

## 7. Important Reality Check: Intended Flow vs Current Flow

The architecture is set up for a clean pipeline:

`legality check -> base play -> script execution -> primitive actions -> cleanup`

However, the repository is still partially in transition.

What is already present:

- target legality layer
- card script registry
- action primitives
- game skeleton and turn flow
- many card scripts and tests

What is still uneven:

- not every user-facing entry point fully wires together target selection and script execution
- some actions are simplified compared with Hearthstone's full official timing model
- some mechanics are encoded imperatively in scripts instead of being fully routed through a unified DSL

This is the most important conceptual takeaway when reading the code: the design direction is clear, but some integration points are still being completed.

## 8. Events, Auras, and Passive Effects

The project also contains infrastructure for effects that are not simple one-shot spells.

Relevant files:

- `src/events/*`
- `src/aura/aura.ts`
- `src/cards/mechanics/index.ts`

There are effectively two passive-effect ideas in the codebase:

- a formal event manager in `src/events`
- script-level event registration helpers in the card mechanics registry

This means passive effects are supported, but the implementation style is not perfectly unified yet.

For future maintenance, this is one of the most important areas to normalize.

## 9. DSL Status

The DSL layer supports:

- selectors
- conditions
- lazy values
- reusable spell/effect helpers

Examples:

- `ALL_MINIONS`
- `FRIENDLY_MINIONS`
- `TARGET`
- `Count`
- `Attr`
- `IF`
- `FOR`

Recent compatibility work made selectors usable in both object-style and function-style forms. This matters because some older tests and helpers still expect callable selectors, while newer code prefers `selector.eval(...)`.

In practice, the DSL is best thought of as a convenience and normalization layer for mechanics, not yet the only way mechanics are implemented.

## 10. Testing Strategy

The test suite is broad and currently green.

Typical test categories:

- core object tests
- targeting tests
- aura tests
- action tests
- DSL tests
- large groups of card-effect registration tests

What the tests are strong at:

- catching API regressions
- verifying that scripts remain registered
- validating many low-level invariants

What they are weaker at:

- simulating full match-length real gameplay with complex timing chains
- proving that every mechanic exactly matches official Hearthstone behavior

So the tests provide strong engineering confidence, but not perfect rules-parity confidence.

## 11. How to Read the Code Efficiently

If you are new to the repository, the best reading order is:

1. `src/index.ts`
2. `src/core/entity.ts`
3. `src/core/card.ts`
4. `src/core/player.ts`
5. `src/core/game.ts`
6. `src/targeting/targetvalidator.ts`
7. `src/actions/play.ts`
8. `src/actions/damage.ts`, `src/actions/summon.ts`, `src/actions/morph.ts`
9. `src/cards/mechanics/index.ts`
10. one representative mechanics file such as `src/cards/mechanics/classic/mage.ts`

That order mirrors the actual execution path of a card more closely than reading by folders alone.

## 12. Recommended Mental Model

When thinking about the repository, use this model:

- `CardLoader` answers: what is this card statically?
- `Card` answers: what is this card right now in the match?
- `TargetValidator` answers: is this move legal?
- `Play` answers: what does it mean to play this card at a generic level?
- mechanics scripts answer: what special effect does this specific card have?
- action classes answer: how do we mutate state to realize that effect?
- `Game` answers: when do all these things happen, and what cleanup follows?

If you keep that separation in mind, the code becomes much easier to navigate.

## 13. Current Strengths

- clear layering between data, runtime model, actions, targeting, and mechanics
- large amount of card script content already present
- good breadth of automated tests
- multiple expansion folders already wired into the index
- practical TypeScript rewrite foundation is already in place

## 14. Current Risks and Technical Debt

- some engine paths are still simplified relative to full Hearthstone rules
- the event/passive-effect story is split across more than one abstraction
- not every entry point fully uses the intended legality -> executePlay pipeline
- DSL usage is mixed with direct imperative scripting
- documentation in `README.md` lags behind actual code coverage in some places

## 15. Best Next Improvements

If the goal is to strengthen the project, the highest-value next steps are:

1. unify the active-card execution pipeline so every play path consistently uses legality checks plus script execution
2. normalize passive-effect handling so events and secrets use one clear mechanism
3. add more true integration tests that simulate realistic turns and multi-step interactions
4. reduce direct imperative duplication in scripts by pushing more logic into shared primitives or DSL helpers
5. refresh top-level documentation so it matches the actual state of implemented mechanics

## 16. Practical Commands

Typical local workflow:

```bash
npm ci
npm run build
npm test -- --runInBand
node dist/demo.js
```

If your default system Node is too old, use the project-compatible Node version explicitly.

## 17. Summary

This repository is best understood as a rule-engine-first Hearthstone simulator written in TypeScript.

Its core architecture is already solid:

- static card data
- runtime entities
- action primitives
- targeting validation
- card scripts
- game-level orchestration

The project is already useful for engine work, scripting, and regression testing. The main remaining work is not inventing the architecture, but finishing the integration details and pushing more of the content through the same consistent execution model.
