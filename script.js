// script.js

(() => {
  const ROWS = 10;
  const COLS = 6;
  const TICK_MS = 550;

  // DOM references
  const gridEl = document.getElementById("grid");
  const livingEl = document.getElementById("living-tally");
  const treasuryEl = document.getElementById("treasury");
  const previewValueEl = document.getElementById("preview-value");

  const reserveValueEl = document.getElementById("reserve-value");
  const reserveBoxEl = document.getElementById("reserve-box");
  const reserveLabelEl = document.getElementById("reserve-label");

  const finalScreenEl = document.getElementById("final-screen");
  const finalTreasuryEl = document.getElementById("final-treasury");
  const finalLivingEl = document.getElementById("final-living");

  const restartHeaderBtn = document.getElementById("restart-header");
  const restartFinalBtn = document.getElementById("restart-final");
  const pauseBtn = document.getElementById("pause-btn");

  // Grid state
  let grid = [];
  let livingTally = 0;
  let treasury = 0;

  // Falling stone
  let currentStone = null;
  let nextValue = null;

  // Reserve
  let reserveValue = null;
  let reserveUsedThisDrop = false;

  let tickId = null;
  let gameOver = false;
  let paused = false;

  // --- Setup ---------------------------------------------------------------

  function init() {
    createEmptyGrid();
    buildGridDOM();
    livingTally = 0;
    treasury = 0;
    nextValue = randomStoneValue();
    reserveValue = null;
    reserveUsedThisDrop = false;
    currentStone = null;
    gameOver = false;

    updateHUD();
    hideFinalScreen();

    if (tickId) clearInterval(tickId);
    tickId = setInterval(gameTick, TICK_MS);
  }

  function createEmptyGrid() {
    grid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => 0),
    );
  }

  function buildGridDOM() {
    gridEl.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        gridEl.appendChild(cell);
      }
    }
  }

  // --- Game loop -----------------------------------------------------------

  function gameTick() {
    if (gameOver) return;
    if (!currentStone) {
      spawnStone();
      return;
    }
    moveDownOrLock();
  }

  function spawnStone() {
    const spawnCol = Math.floor(COLS / 2);

    if (grid[0][spawnCol] !== 0) {
      endGame();
      return;
    }

    currentStone = { row: 0, col: spawnCol, value: nextValue };
    nextValue = randomStoneValue();
    reserveUsedThisDrop = false;

    render();
    updateHUD();
  }

  function moveDownOrLock() {
    if (!currentStone) return;

    if (canMoveTo(currentStone.row + 1, currentStone.col)) {
      currentStone.row++;
    } else {
      lockStone();
    }
    render();
    updateHUD();
  }

  function lockStone() {
    const { row, col, value } = currentStone;

    // Emissary action: If it's the emissary "E", destroy surrounding 3x3
    if (value === "E") {
      let destroyedValue = 0;
      for (
        let r = Math.max(0, row - 1);
        r <= Math.min(ROWS - 1, row + 1);
        r++
      ) {
        for (
          let c = Math.max(0, col - 1);
          c <= Math.min(COLS - 1, col + 1);
          c++
        ) {
          if (grid[r][c] !== 0 && grid[r][c] !== "E") {
            destroyedValue += grid[r][c];
            grid[r][c] = 0;
          }
        }
      }
      treasury += destroyedValue; // Optional: reward for destruction
      currentStone = null;
      applyGravity();
    } else {
      grid[row][col] = value;
      currentStone = null;
    }

    resolveChainReactions();
    recomputeLivingTally();
  }

  // --- Movement & collisions -----------------------------------------------

  function canMoveTo(targetRow, targetCol) {
    if (targetRow < 0 || targetRow >= ROWS) return false;
    if (targetCol < 0 || targetCol >= COLS) return false;
    if (grid[targetRow][targetCol] !== 0) return false;
    return true;
  }

  function hardDrop() {
    if (!currentStone || gameOver) return;
    while (canMoveTo(currentStone.row + 1, currentStone.col)) {
      currentStone.row++;
    }
    lockStone();
    render();
    updateHUD();
  }

  // --- Chain reactions -----------------------------------------------------

  function resolveChainReactions() {
    let changed;
    do {
      changed = false;
      if (applyForgeLaw()) changed = true;
      if (applyPhalanxLaw()) changed = true;
    } while (changed);
  }

  function applyForgeLaw() {
    let mergedAtLeastOnce = false;
    let changedInPass;

    do {
      changedInPass = false;
      for (let c = 0; c < COLS; c++) {
        for (let r = ROWS - 1; r > 0; r--) {
          const lower = grid[r][c];
          const upper = grid[r - 1][c];

          // Cannot merge Emissaries (E)
          if (lower !== 0 && lower !== "E" && lower === upper) {
            grid[r][c] = lower * 2;
            grid[r - 1][c] = 0;
            changedInPass = true;
            mergedAtLeastOnce = true;
          }
        }
      }
      if (changedInPass) applyGravity();
    } while (changedInPass);

    return mergedAtLeastOnce;
  }

  function applyPhalanxLaw() {
    let changedOverall = false;
    let passChanged;

    do {
      passChanged = false;
      let marked = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      let anyMarked = false;

      // 1) 3+ in a row clears
      for (let r = 0; r < ROWS; r++) {
        let runStart = 0;
        let runVal = grid[r][0];

        for (let c = 1; c <= COLS; c++) {
          const v = c < COLS ? grid[r][c] : null;

          if (v === runVal && v !== 0 && v !== "E") {
            continue;
          } else {
            const runEnd = c - 1;
            const length =
              runVal === 0 || runVal === "E" ? 0 : runEnd - runStart + 1;

            if (length >= 3) {
              for (let k = runStart; k <= runEnd; k++) marked[r][k] = true;
              anyMarked = true;
            }
            runStart = c;
            runVal = v;
          }
        }
      }

      if (anyMarked) {
        let toTreasury = 0;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (marked[r][c]) {
              toTreasury += grid[r][c];
              grid[r][c] = 0;
            }
          }
        }
        treasury += toTreasury;
        applyGravity();
        passChanged = true;
        changedOverall = true;
      }

      // 2) Pairs (2) in a row merges horizontally
      let pairMerged = false;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const v = grid[r][c];
          if (v !== 0 && v !== "E" && grid[r][c + 1] === v) {
            grid[r][c + 1] = v * 2;
            grid[r][c] = 0;
            pairMerged = true;
          }
        }
      }

      if (pairMerged) {
        applyGravity();
        passChanged = true;
        changedOverall = true;
      }
    } while (passChanged);

    if (changedOverall) recomputeLivingTally();
    return changedOverall;
  }

  function applyGravity() {
    for (let c = 0; c < COLS; c++) {
      const vals = [];
      for (let r = 0; r < ROWS; r++) {
        if (grid[r][c] !== 0) vals.push(grid[r][c]);
      }
      const newCol = Array(ROWS).fill(0);
      const startRow = ROWS - vals.length;
      for (let i = 0; i < vals.length; i++) {
        newCol[startRow + i] = vals[i];
      }
      for (let r = 0; r < ROWS; r++) {
        grid[r][c] = newCol[r];
      }
    }
  }

  function recomputeLivingTally() {
    let sum = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Emissaries have no burden, don't count towards tally.
        if (grid[r][c] !== "E" && grid[r][c] > 0) sum += grid[r][c];
      }
    }
    livingTally = sum;
  }

  // --- Reserve & Utilities -------------------------------------------------

  function handleReserveInvocation() {
    if (!currentStone || gameOver || reserveUsedThisDrop) return;
    if (reserveValue === null) {
      reserveValue = currentStone.value;
      currentStone.value = nextValue;
      nextValue = randomStoneValue();
    } else {
      const temp = currentStone.value;
      currentStone.value = reserveValue;
      reserveValue = temp;
    }
    reserveUsedThisDrop = true;
    render();
    updateHUD();
  }

  // The Four Gifts of Prometheus + The Emissary
  function randomStoneValue() {
    // 1-in-20 chance for an Emissary
    if (Math.random() < 0.05) return "E";

    // Otherwise, the 4 Gifts: 2, 4, 8, 16
    const roll = Math.random();
    if (roll < 0.5) return 2; // 50%
    if (roll < 0.8) return 4; // 30%
    if (roll < 0.95) return 8; // 15%
    return 16; // 5%
  }

  // --- Rendering -----------------------------------------------------------

  function render() {
    const cells = gridEl.children;
    for (let i = 0; i < cells.length; i++) cells[i].innerHTML = "";

    // Settled
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== 0) {
          getCell(r, c).appendChild(createTile(grid[r][c], false));
        }
      }
    }

    // Active + Ghost
    if (currentStone) {
      let ghostRow = currentStone.row;
      while (canMoveTo(ghostRow + 1, currentStone.col)) ghostRow++;

      if (ghostRow !== currentStone.row) {
        getCell(ghostRow, currentStone.col).appendChild(
          createTile(currentStone.value, false, true),
        );
      }
      getCell(currentStone.row, currentStone.col).appendChild(
        createTile(currentStone.value, true, false),
      );
    }
  }

  function getCell(r, c) {
    return gridEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
  }

  function createTile(value, active = false, ghost = false) {
    const div = document.createElement("div");
    div.className = "tile";
    if (active) div.classList.add("tile-active");
    if (ghost) div.classList.add("tile-ghost");
    if (value === "E") {
      div.classList.add("tile-emissary");
      div.innerHTML = "✧"; // Emissary symbol
    } else {
      div.textContent = value;
    }
    return div;
  }

  function updateHUD() {
    livingEl.textContent = livingTally;
    treasuryEl.textContent = treasury;

    previewValueEl.innerHTML = nextValue === "E" ? "✧" : nextValue;
    if (nextValue === "E") {
      previewValueEl.style.color = "#f3e1a3";
      previewValueEl.parentElement.style.background =
        "linear-gradient(145deg, #463025, #1e120d)";
    } else {
      previewValueEl.style.color = "#f9f0d2";
      previewValueEl.parentElement.style.background = "#140d09";
    }

    if (reserveValue === null) {
      reserveValueEl.textContent = "⨉";
      reserveValueEl.style.color = "";
      reserveBoxEl.style.opacity = "1";
      reserveLabelEl.textContent = "Reserve Awaits";
    } else {
      reserveValueEl.innerHTML = reserveValue === "E" ? "✧" : reserveValue;
      reserveBoxEl.style.opacity = "1";
      reserveLabelEl.textContent = "Reserve Ready";
    }
  }

  // --- End Game & Input ----------------------------------------------------
  function togglePause() {
    if (gameOver) return;

    paused = !paused;

    if (paused) {
      clearInterval(tickId);
      pauseBtn.textContent = "Resume Trial";
    } else {
      tickId = setInterval(gameTick, TICK_MS);
      pauseBtn.textContent = "Pause Trial";
    }
  }

  function endGame() {
    gameOver = true;
    if (tickId) clearInterval(tickId);
    recomputeLivingTally();
    updateHUD();
    finalTreasuryEl.textContent = treasury;
    finalLivingEl.textContent = livingTally;
    finalScreenEl.classList.remove("hidden");
  }

  function hideFinalScreen() {
    finalScreenEl.classList.add("hidden");
  }
  function restartGame() {
  paused = false;
  pauseBtn.textContent = "Pause Trial";
  init();
}

  function handleKeydown(e) {
    if (e.repeat || gameOver) return;

    if (paused && e.key.toLowerCase() !== "p") return;

    if (e.key.toLowerCase() === "r") {
      restartGame();
      return;
    }
    if (e.key.toLowerCase() === "p") {
      togglePause();
      return;
    }
    switch (e.key) {
      case "ArrowLeft":
      case "a":
        if (currentStone && canMoveTo(currentStone.row, currentStone.col - 1)) {
          currentStone.col--;
          render();
        }
        break;
      case "ArrowRight":
      case "d":
        if (currentStone && canMoveTo(currentStone.row, currentStone.col + 1)) {
          currentStone.col++;
          render();
        }
        break;
      case "ArrowDown":
      case "s":
        if (currentStone && canMoveTo(currentStone.row + 1, currentStone.col)) {
          currentStone.row++;
          render();
        } else if (currentStone) lockStone();
        break;
      case "ArrowUp":
      case " ":
        hardDrop();
        break;
      case "Enter":
        handleReserveInvocation();
        break;
    }
  }

window.addEventListener("keydown", handleKeydown);

pauseBtn.addEventListener("click", togglePause);

restartHeaderBtn.addEventListener("click", restartGame);
restartFinalBtn.addEventListener("click", restartGame);

  init();
})();
