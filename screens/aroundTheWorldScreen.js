import { ATW_SEQUENCE, throwDart, undo } from "../games/aroundTheWorld.js";

const TOTAL = ATW_SEQUENCE.length; // 21

function progress(player) {
  const idx = ATW_SEQUENCE.indexOf(player.current);
  return idx; // 0 = hasn't hit 1 yet, 20 = needs bull
}

export function renderATW(app, game) {
  if (game.finished) { renderWinner(app, game); return; }

  const current    = game.players[game.currentPlayer];
  const target     = current.current;
  const dartsUsed  = game.currentDart >= 3;
  const targetLabel = target === "bull" ? "Bull" : target;

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-btn" onclick="window.confirmExitATW()">← Exit</button>
      <div class="round-indicator">Round ${game.round}</div>
    </div>

    <div class="current-player-banner">
      🎯 ${current.name}
      <div style="font-size: 0.85rem; margin-top: 0.2rem; opacity: 0.9;">
        Dart ${game.currentDart + 1} of 3
      </div>
    </div>

    <!-- BIG TARGET -->
    <div style="text-align:center; margin: 0.5rem 0;">
      <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.2rem;">Target</div>
      <div style="font-size: 4.5rem; font-weight: 900; line-height: 1; color: #fbbf24;">
        ${targetLabel}
      </div>
    </div>

    <!-- DART PILLS -->
    <div class="dart-row" style="justify-content:center; margin: 0.4rem 0;">
      ${current.lastDarts.map(d => `<span class="dart-pill">${d}</span>`).join("")}
    </div>

    <!-- PROGRESS TABLE -->
    <table class="cricket-table" style="margin: 0.5rem 0;">
      <thead>
        <tr>
          <th style="text-align:left; width: 40%;">Joueur</th>
          <th>Cible</th>
          <th>Avancement</th>
        </tr>
      </thead>
      <tbody>
        ${game.players.map((p, i) => {
          const done = progress(p);
          const pct  = Math.round((done / TOTAL) * 100);
          return `
            <tr class="${i === game.currentPlayer ? "active-player" : ""}">
              <td style="text-align:left; font-weight:700; padding-left:0.5rem;">${p.name}</td>
              <td style="font-weight:800; color: ${i === game.currentPlayer ? "#fbbf24" : "#38bdf8"};">
                ${p.current === "bull" ? "Bull" : p.current}
              </td>
              <td>
                <div style="background:#334155;border-radius:4px;height:8px;overflow:hidden;">
                  <div style="background:${i === game.currentPlayer ? "#fbbf24" : "#38bdf8"};height:100%;width:${pct}%;transition:width 0.3s;"></div>
                </div>
                <div style="font-size:0.7rem;color:#64748b;margin-top:2px;">${done}/${TOTAL}</div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>

    <!-- CONTROLS -->
    <div class="control-section">
      <div class="modifier-buttons">
        <button
          class="next-btn"
          style="flex: 2; font-size: 1.3rem; padding: 1.25rem;"
          onclick="window.hitATW()"
          ${dartsUsed ? "disabled" : ""}>
          HIT ${targetLabel}
        </button>
        <button
          class="miss-btn"
          style="flex: 1; font-size: 1.1rem; padding: 1.25rem;"
          onclick="window.missATW()"
          ${dartsUsed ? "disabled" : ""}>
          Miss
        </button>
      </div>

      <div class="modifier-buttons" style="margin-top: 0.5rem;">
        <button class="undo-btn" onclick="window.undoATW()" ${game.history.length === 0 ? "disabled" : ""}>
          ↶ Undo
        </button>
      </div>
    </div>
  `;

  window.hitATW = () => {
    const t = game.players[game.currentPlayer].current;
    throwDart(game, t === "bull" ? "bull" : t);
    renderATW(app, game);
  };

  window.missATW = () => {
    throwDart(game, "miss");
    renderATW(app, game);
  };

  window.undoATW = () => {
    undo(game);
    renderATW(app, game);
  };

  window.confirmExitATW = () => {
    if (confirm("Exit game? All progress will be lost.")) {
      window.showHome();
    }
  };
}

function renderWinner(app, game) {
  // The winner is the player whose current === beyond sequence (hit bull)
  const winner = game.players.find(p => {
    const idx = ATW_SEQUENCE.indexOf(p.current);
    // If finished is true, the last player to have thrown the winning dart
    return idx === ATW_SEQUENCE.length - 1 &&
           p.lastDarts.some(d => d.includes("Bull") && d.includes("✓"));
  }) || game.players.reduce((best, p) => {
    return progress(p) >= progress(best) ? p : best;
  }, game.players[0]);

  const sorted = [...game.players].sort((a, b) => progress(b) - progress(a));

  app.innerHTML = `
    <div class="winner-screen">
      <h1 class="winner-title">🏆 Game Over!</h1>
      <h2 class="winner-message">Gagnant !</h2>

      <div class="winner-list">
        <div class="winner-card">
          <div class="winner-name">${winner.name}</div>
          <div class="winner-stats">
            <div class="stat">
              <span class="stat-label">Round</span>
              <span class="stat-value">${game.round}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 style="margin-top: 1.5rem;">Classement</h3>
      <div class="all-players-list">
        ${sorted.map((p, i) => `
          <div class="player-result">
            <span class="rank">#${i + 1}</span>
            <span class="name">${p.name}</span>
            <span class="points">${progress(p)}/${TOTAL} — cible: ${p.current === "bull" ? "Bull" : p.current}</span>
          </div>
        `).join("")}
      </div>

      <button class="home-btn" onclick="window.showHome()">← Accueil</button>
    </div>
  `;
}
