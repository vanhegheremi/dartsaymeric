import { throwDart, undo, getWinner } from "../games/x01.js";

export function renderX01(app, game) {
  if (game.finished) {
    renderWinner(app, game);
    return;
  }

  const current = game.players[game.currentPlayer];
  const dartsUsed = game.currentDart >= 3;

  // Checkout suggestions for common finishes
  const checkout = getCheckoutHint(current.score);

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-btn" onclick="window.confirmExit()">← Exit</button>
      <div class="round-indicator">Round ${game.round}</div>
    </div>

    <div class="current-player-banner">
      🎯 ${current.name}
      <div style="font-size: 0.85rem; margin-top: 0.2rem; opacity: 0.9;">
        Dart ${game.currentDart + 1} of 3
      </div>
    </div>

    <!-- BIG SCORE -->
    <div style="text-align: center; margin: 0.5rem 0;">
      <div style="font-size: 4rem; font-weight: 900; line-height: 1; color: #f8fafc;">
        ${current.score}
      </div>
      ${checkout ? `<div style="font-size: 0.85rem; color: #fbbf24; margin-top: 0.25rem;">💡 ${checkout}</div>` : ""}
    </div>

    <!-- DART PILLS -->
    <div class="dart-row" style="justify-content: center; margin: 0.5rem 0;">
      ${current.lastDarts.map(d => `<span class="dart-pill">${d}</span>`).join("")}
    </div>

    <!-- ALL PLAYERS TABLE -->
    <table class="cricket-table" style="margin: 0.5rem 0;">
      <thead>
        <tr>
          ${game.players.map((p, i) => `
            <th class="${i === game.currentPlayer ? 'active-header' : ''}">
              <div class="player-name">${p.name}</div>
              <div class="player-points">${p.score}</div>
            </th>
          `).join("")}
        </tr>
      </thead>
    </table>

    <!-- CONTROLS -->
    <div class="control-section">
      <div class="number-buttons">
        ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n =>
          `<button class="number-btn" onclick="window.hitX01(${n})" ${dartsUsed ? "disabled" : ""}>${n}</button>`
        ).join("")}
        <button class="bull-btn" onclick="window.hitX01('bull')" ${dartsUsed || game.multiplier === 3 ? "disabled" : ""}>Bull</button>
      </div>

      <div class="modifier-buttons" style="margin-top: 0.5rem;">
        <button class="miss-btn" onclick="window.missX01()" ${dartsUsed ? "disabled" : ""}>Miss</button>

        <button
          class="multiplier-btn ${game.multiplier === 2 ? 'active' : ''}"
          onclick="window.toggleMultX01(2)">
          Double
        </button>

        <button
          class="multiplier-btn ${game.multiplier === 3 ? 'active' : ''}"
          onclick="window.toggleMultX01(3)">
          Triple
        </button>

        <button class="undo-btn" onclick="window.undoX01()" ${game.history.length === 0 ? "disabled" : ""}>
          ↶ Undo
        </button>
      </div>
    </div>
  `;

  window.hitX01 = t => {
    throwDart(game, t);
    renderX01(app, game);
  };

  window.missX01 = () => {
    throwDart(game, "miss");
    renderX01(app, game);
  };

  window.toggleMultX01 = m => {
    game.multiplier = game.multiplier === m ? 1 : m;
    renderX01(app, game);
  };

  window.undoX01 = () => {
    undo(game);
    renderX01(app, game);
  };

  window.confirmExit = () => {
    if (confirm("Exit game? All progress will be lost.")) {
      window.showHome();
    }
  };
}

function getCheckoutHint(score) {
  const hints = {
    170: "T20 T20 Bull",
    167: "T20 T19 Bull",
    164: "T20 T18 Bull",
    161: "T20 T17 Bull",
    160: "T20 T20 D20",
    158: "T20 T20 D19",
    157: "T20 T19 D20",
    156: "T20 T20 D18",
    155: "T20 T19 D19",
    154: "T20 T18 D20",
    153: "T20 T19 D18",
    152: "T20 T20 D16",
    151: "T20 T17 D20",
    150: "T20 T18 D18",
    149: "T20 T19 D16",
    148: "T20 T16 D20",
    147: "T20 T17 D18",
    146: "T20 T18 D16",
    145: "T20 T15 D20",
    144: "T20 T20 D12",
    143: "T20 T17 D16",
    142: "T20 T14 D20",
    141: "T20 T19 D12",
    140: "T20 T20 D10",
    139: "T20 T13 D20",
    138: "T20 T18 D12",
    137: "T20 T19 D10",
    136: "T20 T20 D8",
    135: "T20 T17 D12",
    134: "T20 T14 D16",
    133: "T20 T19 D8",
    132: "T20 T16 D12",
    131: "T20 T13 D16",
    130: "T20 T18 D8",
    121: "T20 T11 D14",
    120: "T20 S20 D20",
    110: "T20 D20 D20",
    100: "T20 D20",
    99:  "T19 D21",
    98:  "T20 D19",
    97:  "T19 D20",
    96:  "T20 D18",
    95:  "T19 D19",
    50:  "Bull",
    40:  "D20",
    36:  "D18",
    32:  "D16",
    24:  "D12",
    20:  "D10",
    16:  "D8",
    8:   "D4",
    4:   "D2",
    2:   "D1"
  };
  return hints[score] || null;
}

function renderWinner(app, game) {
  const winner = getWinner(game);

  const sorted = [...game.players].sort((a, b) => {
    if (a.score === 0) return -1;
    if (b.score === 0) return 1;
    return a.score - b.score;
  });

  app.innerHTML = `
    <div class="winner-screen">
      <h1 class="winner-title">🏆 Game Over!</h1>
      <h2 class="winner-message">Winner!</h2>

      ${winner ? `
        <div class="winner-list">
          <div class="winner-card">
            <div class="winner-name">${winner.name}</div>
            <div class="winner-stats">
              <div class="stat">
                <span class="stat-label">Darts</span>
                <span class="stat-value">${winner.dartsThrown}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Avg/dart</span>
                <span class="stat-value">${winner.dartsThrown > 0 ? (game.startScore / winner.dartsThrown).toFixed(1) : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      ` : ""}

      <h3 style="margin-top: 2rem;">All Players</h3>
      <div class="all-players-list">
        ${sorted.map((p, idx) => `
          <div class="player-result">
            <span class="rank">#${idx + 1}</span>
            <span class="name">${p.name}</span>
            <span class="points">${p.score === 0 ? "✓ Finished" : p.score + " left"}</span>
          </div>
        `).join("")}
      </div>

      <button class="home-btn" onclick="window.showHome()">Back to Home</button>
    </div>
  `;
}
