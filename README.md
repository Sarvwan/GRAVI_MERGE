# Gravi‑Merge 2048 — The Labyrinth Codex

## Overview

**Gravi‑Merge 2048** is a gravity‑driven puzzle game inspired by the traditional 2048 concept, redesigned with falling mechanics, strategic reserve systems, chain reactions, and a dark labyrinth‑themed UI/UX aesthetic.

> Developed during **PixelSync 2026** at **NIT Jamshedpur**, where Gravi-Merge 2048 was recognized among the **Top 3 Projects**.

Unlike the classic 2048 game where tiles slide across a fixed board, Gravi‑Merge introduces:

* **Vertical gravity mechanics**
* **Real-time falling tile behavior**
* **Strategic merge chains**
* **Reserve-based gameplay**
* **Special emissary relics**
* **UI includes Mobile-responsive behavior**
* **Dark fantasy / codex-inspired visual design**



---

# Core Gameplay Concept

The game combines:

| Mechanic            | Inspiration              |
| ------------------- | ------------------------ |
| Tile Merging        | 2048                     |
| Gravity System      | Tetris                   |
| Chain Reactions     | Match Puzzle Systems     |
| Reserve Mechanic    | Competitive Puzzle Games |
| Emissary Power Tile | Custom Gameplay Design   |

Players must strategically place falling relic tiles to:

* Merge identical values
* Trigger chain reactions
* Manage board burden
* Use reserve mechanics wisely
* Maximize relic wealth

The game ends when the spawn area becomes blocked.

---

# Project Structure

```text
GRAVI-MERGE/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

# HTML Architecture

## Main Layout

The application is divided into:

* Header Section
* Game Grid
* HUD / Statistics Panel
* Final Overlay Screen
* Footer Section

### Header

Contains:

* Game title
* Subtitle / codex theme
* Help button
* Pause / Resume functionality
* Restart system

### Grid System

The game board is dynamically generated using JavaScript.

```html
<div id="grid" class="grid"></div>
```

The grid itself does not statically contain tiles.
Instead:

* JavaScript generates cells dynamically
* Tiles are rendered in real-time
* Active and settled relics are controlled through DOM manipulation

### HUD System

The HUD displays:

| HUD Component  | Purpose                  |
| -------------- | ------------------------ |
| Next Relic     | Upcoming falling tile    |
| Relic Wealth   | Player score             |
| Burden         | Total active tile weight |
| Reserved Relic | Temporary held tile      |

---

# CSS Design System

## Theme Design

The visual design follows a:

* Dark fantasy aesthetic
* Labyrinth-inspired UI
* Ancient codex styling
* Gold-accented interface

## Fonts Used

| Font     | Usage             |
| -------- | ----------------- |
| Cinzel   | Titles / headings |
| Spectral | Body text         |

Both fonts are imported from Google Fonts.

## CSS Variables

The project uses centralized CSS variables for:

* Colors
* Shadows
* Borders
* Typography consistency

Example:

```css
:root {
  --bg: #110b07;
  --gold: #d7b26a;
  --text-main: #f5e9cf;
}
```

This allows easy theme customization and scalable styling.

---

# JavaScript Architecture

## Game Initialization

The game begins using:

```javascript
init()
```

This function:

* Creates the empty grid
* Builds DOM cells
* Resets statistics
* Initializes the game loop
* Starts tile spawning

---

# Grid Logic

## Grid Representation

The board is represented using a 2D array:

```javascript
let grid = [];
```

The system dynamically stores:

* Empty spaces
* Number relics
* Emissary relics

Example structure:

```javascript
[
  [0,0,0,0,0,0],
  [0,0,2,0,0,0],
  [0,4,8,0,0,0]
]
```

---

# Gravity Engine

One of the main gameplay systems is the gravity mechanic.

Unlike classic 2048:

* Tiles do not slide freely
* Tiles fall vertically
* Movement is physics-inspired

The gravity system continuously compresses columns downward.

Implemented using:

```javascript
applyGravity()
```

This function:

* Collects existing values in each column
* Removes empty spaces
* Rebuilds the column from the bottom upward

This creates:

* Falling behavior
* Chain reaction possibilities
* Dynamic board restructuring

---

# Falling Relic System

The currently active tile is stored as:

```javascript
currentStone
```

This object tracks:

```javascript
{
  row,
  col,
  value
}
```

The active relic:

* Falls automatically
* Can move horizontally
* Can hard-drop
* Locks into the grid when blocked

---

# Collision Detection

Collision checking is handled using:

```javascript
canMoveTo()
```

This function validates:

* Grid boundaries
* Existing tile collisions
* Legal movement spaces

This prevents invalid movement.

---

# Merge Logic

## Forge Law

Vertical merges are controlled through:

```javascript
applyForgeLaw()
```

This system:

* Detects identical stacked values
* Merges vertically
* Doubles tile values
* Triggers gravity updates

Example:

```text
4
4
↓
8
```

This mechanic forms the core 2048 merge behavior.

---

# Chain Reaction System

Chain reactions are handled using:

```javascript
resolveChainReactions()
```

This repeatedly executes:

* Vertical merge resolution
* Horizontal phalanx resolution
* Gravity updates

until no further changes occur.

This creates:

* Cascading merges
* Combo systems
* Dynamic gameplay loops

---

# Phalanx Law

Horizontal interactions are handled using:

```javascript
applyPhalanxLaw()
```

This system supports:

## Horizontal Clear Mechanic

Three or more identical relics in a row are cleared.

Example:

```text
8 8 8
```

These relics are removed and converted into score.

## Horizontal Pair Merge

Two matching relics horizontally combine.

Example:

```text
4 4 → 8
```

This creates additional strategic depth.

---

# Emissary Relic System

One of the custom gameplay mechanics is the:

## Emissary Relic

Represented visually as:

```text
✧
```

Generated with a low spawn probability.

When locked into the board:

* It destroys surrounding relics
* Applies a 3×3 area effect
* Rewards relic wealth
* Restructures nearby columns

This introduces:

* Tactical recovery mechanics
* Board-clearing opportunities
* Risk management systems

---

# Reserve Mechanic

Players may temporarily store one relic.

Controlled using:

```javascript
handleReserveInvocation()
```

Features:

* Swap active relic
* Store future strategy
* Emergency recovery option
* One-use-per-drop limitation

This mechanic increases strategic depth significantly.

---

# Game Loop

The main game loop uses:

```javascript
setInterval()
```

with:

```javascript
gameTick()
```

The loop controls:

* Falling timing
* Spawn behavior
* Locking
* Gravity updates
* Rendering

---

# Rendering System

The rendering engine dynamically updates the DOM.

Implemented using:

```javascript
render()
```

This function:

* Clears previous visuals
* Renders settled relics
* Renders active relics
* Displays ghost positions
* Updates tile states

---

# Tile Rendering

Each tile is created dynamically using:

```javascript
createTile()
```

The system supports:

* Active relic styling
* Ghost relic previews
* Emissary styling
* Dynamic color assignment

Tile colors are applied using:

```javascript
div.classList.add(`tile-${value}`)
```

allowing different colors for:

* 2
* 4
* 8
* 16
* 32
* 64
* 128
* 256
* 512
* 1024
* 2048

---

# Pause & Resume System

The game includes:

* Pause functionality
* Resume functionality
* Keyboard shortcuts

Implemented using:

```javascript
togglePause()
```

This system:

* Stops the game loop
* Preserves current state
* Prevents input during pause
* Resumes seamlessly

---

# Responsive Design

The UI includes Mobile-responsive behavior using:

```css
@media (max-width: 900px)
```

Responsive features:

* Scaled game board
* Flexible layout stacking
* Adaptive HUD sizing
* Mobile-friendly spacing

---

## UI/UX Features

* Labyrinth-inspired theme
* Responsive layout
* Dynamic tile colors
* Fantasy codex typography
* Interactive controls
* Final overlay screen

---

# Technologies Used

| Technology   | Purpose          |
| ------------ | ---------------- |
| HTML5        | Structure        |
| CSS3         | Styling & layout |
| JavaScript   | Game logic       |
| Google Fonts | Typography       |
| Font Awesome | Icons            |

---

# Developer Notes

This project was developed by **SARVWAN** during **PixelSync 2026**, a UI/UX and development competition conducted as part of the **National Tech Fest at NIT Jamshedpur**.

Gravi‑Merge 2048 was recognized as one of the **Top 3 Projects** during the event.
The primary development focus included:
* Custom gameplay experimentation
* Clean UI architecture
* Gravity-based merge mechanics
* Modular JavaScript logic
* Thematic interface design

  The project was developed using:

* **HTML5**
* **CSS3**
* **Vanilla JavaScript**

No external game engine or framework was used.

---

# Author

**SARVWAN PILLA**

Inspired by:

* 2048
* Tetris
* Strategic puzzle systems
* Fantasy codex aesthetics

---

# License

This project is intended for educational, experimental, and portfolio purposes.
