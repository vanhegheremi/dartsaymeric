import { ATW_SEQUENCE, ATW_TOTAL, throwDart, nextPlayer, undo } from "../games/aroundTheWorld.js";

function progress(player) {
  return player.currentIdx; // 0-20
}

function currentTarget(player) {
  if (player.currentIdx >= ATW_TOTAL) return null;
  return ATW_SEQUENCE[player.currentIdx];
}

// What target would the player land on after advancing by mult
function previewTarget(player, mult) {
  const nextIdx = Math.min(player.currentIdx + mult, ATW_TOTAL);
  if (nextIdx >= ATW_TOTAL) return "WIN";
  return ATW_SEQUENCE[nextIdx];
}

export function renderATW(app, game) {
  if (game.finished) { renderWinner(app, game); return; }

  const current  = game.players[game.currentPlayer];
  const target   = currentTarget(current);
  const dartsUsed = game.currentDart >= 3;

  // Compute next targets for preview labels
  const nextSingle = previewTarget(current, 1);
  const nextDouble = previewTarget(current, 2);
  const nextTriple = previewTarget(current, 3);

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-btn" onclick="window.confirmExitATW()">← Exit</button>
      <div class="round-indicator">Round ${game.round}</div>
    </div>

    <div class="current-player-banner">
      🎯 ${current.name}
      <div style="font-size: 0.85rem; margin-top: 0.2rem; opacity: 0.9;">
        Fléchette ${game.currentDart + 1} / 3
      </div>
    </div>

    <!-- BIG TARGET -->
    <div style="text-align:center; margin: 0.5rem 0;">
      <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.2rem; letter-spacing: 0.05em; text-transform: uppercase;">Cible</div>
      <div style="font-size: 4.5rem; font-weight: 900; line-height: 1; color: #fbbf24;">
        ${target}
      </div>
      <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.2rem;">
        ${current.currentIdx + 1} / ${ATW_TOTAL}
      </div>
    </div>

    <!-- DART PILLS -->
    <div class="dart-row" style="justify-content:center; margin: 0.3rem 0;">
      ${current.lastDarts.map(d => `<span class="dart-pill">${d}</span>`).join("")}
    </div>

    <!-- HIT BUTTONS (Single / Double / Triple) -->
    <div class="control-section" style="gap: 0.5rem;">
      <div class="modifier-buttons" style="gap: 0.5rem;">
        <button
          class="next-btn"
          style="flex:1; display:flex; flex-direction:column; align-items:center; gap:0.15rem; padding: 0.9rem 0.4rem;"
          onclick="window.hitATW(1)"
          ${dartsUsed ? "disabled" : ""}>
          <span style="font-size:1.2rem; font-weight:900;">Simple</span>
          <span style="font-size:0.7rem; opacity:0.75;">→ ${nextSingle === "WIN" ? "🏆 WIN" : nextSingle}</span>
        </button>
        <button
          class="double-btn"
          style="flex:1; display:flex; flex-direction:column; align-items:center; gap:0.15rem; padding: 0.9rem 0.4rem;"
          onclick="window.hitATW(2)"
          ${dartsUsed ? "disabled" : ""}>
          <span style="font-size:1.2rem; font-weight:900;">Double</span>
          <span style="font-size:0.7rem; opacity:0.75;">→ ${nextDouble === "WIN" ? "🏆 WIN" : nextDouble}</span>
        </button>
        <button
          class="triple-btn"
          style="flex:1; display:flex; flex-direction:column; align-items:center; gap:0.15rem; padding: 0.9rem 0.4rem;"
          onclick="window.hitATW(3)"
          ${dartsUsed ? "disabled" : ""}>
          <span style="font-size:1.2rem; font-weight:900;">Triple</span>
          <span style="font-size:0.7rem; opacity:0.75;">→ ${nextTriple === "WIN" ? "🏆 WIN" : nextTriple}</span>
        </button>
      </div>

      <button
        class="miss-btn"
        style="width:100%; font-size:1.1rem; padding: 0.85rem;"
        onclick="window.missATW()"
        ${dartsUsed ? "disabled" : ""}>
        Miss
      </button>

      <div class="modifier-buttons" style="gap: 0.5rem;">
        <button class="undo-btn" style="flex:1;" onclick="window.undoATW()" ${game.history.length === 0 ? "disabled" : ""}>
          ↶ Undo
        </button>
        <button class="next-btn" style="flex:1;" onclick="window.nextATWPlayer()" ${!dartsUsed ? "disabled" : ""}>
          Suivant →
        </button>
      </div>
    </div>

    <!-- PROGRESS TABLE -->
    <table class="cricket-table" style="margin: 0.5rem 0;">
      <thead>
        <tr>
          <th style="text-align:left;">Joueur</th>
          <th>Cible</th>
          <th>Progression</th>
        </tr>
      </thead>
      <tbody>
        ${game.players.map((p, i) => {
          const done = progress(p);
          const pct  = Math.round((done / ATW_TOTAL) * 100);
          const tgt  = currentTarget(p);
          const isActive = i === game.currentPlayer;
          return `
            <tr class="${isActive ? "active-player" : ""}">
              <td style="text-align:left; font-weight:700; padding-left:0.5rem;">${p.name}</td>
              <td style="font-weight:800; color:${isActive ? "#fbbf24" : "#38bdf8"};">
                ${tgt ?? "✓"}
              </td>
              <td>
                <div style="background:#334155;border-radius:4px;height:8px;overflow:hidden;">
                  <div style="background:${isActive ? "#fbbf24" : "#38bdf8"};height:100%;width:${pct}%;transition:width 0.3s;"></div>
                </div>
                <div style="font-size:0.7rem;color:#64748b;margin-top:2px;">${done}/${ATW_TOTAL}</div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;

  window.hitATW = (mult) => {
    const t = game.players[game.currentPlayer].currentIdx;
    const value = ATW_SEQUENCE[t];
    throwDart(game, { value, mult });
    renderATW(app, game);
  };

  window.missATW = () => {
    throwDart(game, "miss");
    renderATW(app, game);
  };

  window.nextATWPlayer = () => {
    nextPlayer(game);
    renderATW(app, game);
  };

  window.undoATW = () => {
    undo(game);
    renderATW(app, game);
  };

  window.confirmExitATW = () => {
    if (confirm("Quitter la partie ? Toute progression sera perdue.")) {
      window.showHome();
    }
  };
}

function renderWinner(app, game) {
  const winner = game.players.find(p => p.currentIdx >= ATW_TOTAL)
    || [...game.players].sort((a, b) => progress(b) - progress(a))[0];

  const sorted = [...game.players].sort((a, b) => progress(b) - progress(a));

  app.innerHTML = `
    <div class="winner-screen">
      <h1 class="winner-title">🏆 Victoire !</h1>
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
        ${sorted.map((p, i) => {
          const tgt = currentTarget(p);
          return `
            <div class="player-result">
              <span class="rank">#${i + 1}</span>
              <span class="name">${p.name}</span>
              <span class="points">${progress(p)}/${ATW_TOTAL}${tgt ? ` — cible: ${tgt}` : " ✓"}</span>
            </div>
          `;
        }).join("")}
      </div>

      <button class="home-btn" onclick="window.showHome()">← Accueil</button>
    </div>
  `;
}
