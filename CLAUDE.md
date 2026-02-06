# CLAUDE.md - AI Assistant Guide for Arcade-Game

## Project Overview

A **Frogger-style arcade game** built with vanilla JavaScript and HTML5 Canvas. The player navigates a character across lanes of traffic (enemy bugs) to reach the water on the opposite side. Players have 3 lives (displayed as stars) before game over.

**Tech stack:** Vanilla JavaScript (ES5), HTML5 Canvas, CSS. No frameworks, no build tools, no package manager.

## Repository Structure

```
Arcade-Game/
├── index.html          # Entry point - loads all scripts and creates canvas
├── Readme.md           # User-facing documentation
├── CLAUDE.md           # This file
├── css/
│   ├── css.css         # Main stylesheet (background, layout)
│   ├── s.css           # Alternative stylesheet
│   └── style.css       # Additional stylesheet
├── js/
│   ├── resources.js    # Image asset loader with caching (loaded 1st)
│   ├── js.js           # Game entities: Enemy, Player, Game classes (loaded 2nd)
│   └── engine.js       # Game loop, rendering, canvas setup (loaded 3rd)
└── images/             # All game sprites and textures (19 files)
    ├── Terrain:        water-block.png, stone-block.png, grass-block.png
    ├── Player:         char-cat-girl.png (active), + 4 unused variants
    ├── Enemy:          enemy-bug.png
    ├── UI:             Star.png, Heart.png, Selector.png
    ├── Collectibles:   Gem Blue/Green/Orange.png, Key.png, Rock.png (unused)
    └── Background:     BG.jpg, icon.png
```

## How to Run

Open `index.html` directly in a browser. No build step, no server required.

## Script Loading Order (Critical)

Scripts must load in this exact order (defined in `index.html`):

1. **`js/resources.js`** - Asset loading system. Exposes `window.Resources`.
2. **`js/js.js`** - Game entity constructors (`Enemy`, `Player`, `Game`) and global instances (`allEnemies`, `player`, `game`).
3. **`js/engine.js`** - Game loop and renderer. Calls `Resources.onReady(init)` to start the game after assets are loaded.

## Architecture

### Global Objects

| Object | Source | Purpose |
|--------|--------|---------|
| `Resources` | resources.js | Image loader with caching (`load`, `get`, `isReady`, `onReady`) |
| `ctx` | engine.js | Canvas 2D rendering context (505x606 canvas) |
| `allEnemies` | js.js | Array of active `Enemy` instances |
| `player` | js.js | Single `Player` instance |
| `game` | js.js | Single `Game` instance (tracks level, lives, score, state) |

### Core Classes (Prototype-based)

**`Enemy(x, y, speed)`** - Enemy bugs that move horizontally.
- Spawns off-screen left with random speed (200-400 px/s)
- Occupies one of 3 stone rows (random y from `[60, 145, 230]`)
- `update(dt)` moves position; `render()` draws sprite

**`Player()`** - The player character (cat-girl sprite).
- Arrow key controlled; movement is direction-based with speed
- `enemyCollision()` - AABB collision detection against all enemies
- `waterCollision()` - Win condition when player reaches top row (y < 20)
- `respawn()` - Resets to starting position
- `handleInput(key)` - Only accepts input when direction is `'stop'`

**`Game()`** - Game state manager.
- `Stars` property tracks lives (starts at 3)
- `state`: 0 = playing, 1 = game over
- `levelUp()` - Increments level/score on reaching water
- `death()` - Decrements lives; triggers `gameOver()` at 0
- `handleInput(key)` - Enter key resets game from game-over state

### Game Loop (engine.js)

- Uses `requestAnimationFrame` for 60fps rendering
- Delta-time based movement (frame-rate independent)
- **Update phase**: Move enemies, check collisions, handle player movement
- **Render phase**: Draw 6x5 tile grid (water/stone/grass), then entities, then UI overlay
- Enemies that leave screen are respawned; pool maintains ~6 enemies

### Tile Grid Layout

The game renders a 6-column x 6-row grid:
- Row 0: Water (win zone)
- Rows 1-3: Stone (enemy lanes)
- Row 4: Grass (safe zone, top)
- Row 5: Grass (safe zone, player start area)

Tile dimensions: 101px wide, 83px tall (with 171px sprite height).

## Input Handling

- **Arrow keys** (keycodes 37-40): Move player left/up/right/down
- **Enter key**: Restart game after game over
- Input is captured via `document.addEventListener('keyup', ...)` in engine.js

## Key Constants and Magic Numbers

| Value | Meaning |
|-------|---------|
| 505 x 606 | Canvas dimensions |
| 101 | Tile width (horizontal step) |
| 83 | Tile height (vertical step) |
| 200-400 | Enemy speed range (px/s) |
| `[60, 145, 230]` | Enemy spawn Y positions (3 stone rows) |
| 200, 400 | Player start position (x, y) |
| 3 | Starting lives (Stars) |
| 10 | Score per level-up |
| 85, 110 | Collision box offsets |

## Code Conventions

- **ES5 style**: Constructor functions with `prototype` methods (not ES6 classes)
- **IIFEs**: `resources.js` and `engine.js` wrap code in immediately-invoked function expressions
- **Naming**: PascalCase for constructors, camelCase for methods/properties
- **No modules**: All communication via global `window` properties
- **No semicolons**: Inconsistent usage throughout
- **Indentation**: Spaces (inconsistent width)

## Known TODOs in Code

- `js/js.js:22` - `// TODO: determian the player posistion`
- `js/js.js:101` - `//TODO : control the counter of level`

## What Does NOT Exist

- No package.json / npm dependencies
- No build system (webpack, vite, etc.)
- No linter or formatter config
- No tests of any kind
- No TypeScript
- No .gitignore
- No CI/CD configuration

## Development Guidelines

1. **No build step needed** - Edit JS/HTML/CSS files directly and refresh the browser.
2. **Respect script load order** - If adding new JS files, place the `<script>` tag in `index.html` respecting dependency order.
3. **Global namespace** - All inter-file communication uses global variables. Be careful about naming collisions.
4. **Canvas coordinate system** - Origin (0,0) is top-left. Y increases downward. Tile positions use multiples of 101 (x) and 83 (y).
5. **Collision detection** - Uses simple AABB (axis-aligned bounding box) with offset thresholds in `enemyCollision()`.
6. **Unused assets** - Several image assets (gems, key, rock, heart, selector, alternate characters) exist but are not implemented in game logic. These are available for feature expansion.
7. **No error handling** - The codebase has no try/catch blocks or input validation. Add defensive checks when modifying code.
