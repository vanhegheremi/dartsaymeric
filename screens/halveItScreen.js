import { HALVE_IT_ROUNDS } from "../models/halveIt.js";
import { throwDart, undo, endTurn } from "../games/halveIt.js";

export function renderHalveIt(app, game) {
  if (game.finished) {
    renderWinner(app, game);
    return;
  }

  const round = HALVE_IT_ROUNDS[game.currentRound];
  const currentPlayer = game.players[game.currentPlayer];
  const dartsUsed = game.currentDart >= 3;

  let displayTarget = round.target ?? "";
  if (round.type === "bull") displayTarget = "Bull";

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-btn" onclick="window.confirmExit()">← Exit</button>
      <div class="round-indicator">Round ${game.currentRound + 1} / ${HALVE_IT_ROUNDS.length}</div>
    </div>

    <div class="current-player-banner">
      🎯 ${currentPlayer.name}
      <div style="font-size: 1.1rem; margin-top: 0.25rem; opacity: 0.9;">
        ${round.label}${round.type === "exact" ? ` — <span style="color:#fbbf24;">Target: ${game.exactTarget}</span>` : ""}
      </div>
    </div>

    <!-- SCORE TABLE -->
    <table class="cricket-table">
      <thead>
        <tr>
          ${game.players.map((p, i) => `
            <th class="${i === game.currentPlayer ? "active-header" : ""}">
              <div class="player-name">${p.name}</div>
              <div class="player-points">${p.score}</div>
            </th>
          `).join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${game.players.map((p, i) => `
            <td class="${i === game.currentPlayer ? "active-player" : ""}"
                style="font-size: 0.8rem; color: #94a3b8; padding: 0.4rem;">
              ${i === game.currentPlayer ? currentPlayer.lastDarts.join(" | ") : "—"}
            </td>
          `).join("")}
        </tr>
      </tbody>
    </table>

    ${round.type === "exact" ? `
    <div style="text-align:center; margin: 0.5rem 0; padding: 0.5rem 1rem; background: #1e293b; border-radius: 8px;">
      <span style="color: #94a3b8; font-size: 0.85rem;">Round total: </span>
      <span style="font-size: 1.3rem; font-weight: 800; color: ${(currentPlayer.roundScore || 0) === game.exactTarget ? '#22c55e' : '#f8fafc'};">
        ${currentPlayer.roundScore || 0}
      </span>
      <span style="color: #94a3b8; font-size: 0.85rem;"> / ${game.exactTarget}</span>
      <span style="margin-left: 0.5rem; font-size: 0.85rem; color: #64748b;">Dart ${game.currentDart + 1} of 3</span>
    </div>
    ` : `
    <div class="dart-status">
      <div style="font-size: 0.85rem; opacity: 0.7;">Dart ${game.currentDart + 1} of 3</div>
      <div class="dart-row">
        ${currentPlayer.lastDarts.map(d => `<span class="dart-pill">${d}</span>`).join("")}
      </div>
    </div>
    `}

    <!-- THROW CONTROLS -->
    <div class="control-section">

      ${round.type === "number" || round.type === "bull" ? `
        <div class="modifier-buttons">
          <button onclick="window.throwHit(1)" ${dartsUsed ? "disabled" : ""}>S ${displayTarget}</button>
          <button onclick="window.throwHit(2)" ${dartsUsed ? "disabled" : ""}>D ${displayTarget}</button>
          ${round.type !== "bull" ? `<button onclick="window.throwHit(3)" ${dartsUsed ? "disabled" : ""}>T ${displayTarget}</button>` : ""}
        </div>
      ` : ""}

      ${round.type === "double" ? `
      <div class="modifier-buttons">
        ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n =>
          `<button onclick="window.throwAnyDouble(${n})" ${dartsUsed ? "disabled" : ""}>${n}</button>`
        ).join("")}
        <button class="bull-btn" onclick="window.throwAnyDouble('bull')" ${dartsUsed ? "disabled" : ""}>Bull</button>
      </div>
      ` : ""}

      ${round.type === "triple" ? `
      <div class="modifier-buttons">
        ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n =>
          `<button onclick="window.throwAnyTriple(${n})" ${dartsUsed ? "disabled" : ""}>${n}</button>`
        ).join("")}
      </div>
      ` : ""}

      ${round.type === "exact" ? `
        <div class="number-buttons" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 0.5rem;">
          ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n =>
            `<button class="number-btn" onclick="window.throwExactDart(${n})" ${dartsUsed ? "disabled" : ""}>${n}</button>`
          ).join("")}
          <button class="bull-btn" style="grid-column: span 2;" onclick="window.throwExactDart('bull')" ${dartsUsed ? "disabled" : ""}>Bull</button>
        </div>
        <div class="modifier-buttons" style="margin-bottom: 0.5rem;">
          <button class="multiplier-btn ${game.exactMultiplier === 1 ? 'active' : ''}" onclick="window.setExactMult(1)">x1</button>
          <button class="multiplier-btn ${game.exactMultiplier === 2 ? 'active' : ''}" onclick="window.setExactMult(2)">x2</button>
          <button class="multiplier-btn ${game.exactMultiplier === 3 ? 'active' : ''}" onclick="window.setExactMult(3)">x3</button>
        </div>
      ` : ""}

      <div class="modifier-buttons" style="margin-top: 0.75rem;">
        ${round.type !== "exact" ? `<button class="miss-btn" onclick="window.throwMiss()" ${dartsUsed ? "disabled" : ""}>Miss</button>` : ""}
        <button class="undo-btn" onclick="window.undo()">↶ Undo</button>
        <button class="next-btn" onclick="window.nextPlayer()" ${dartsUsed ? "" : "disabled"}>Next ➜</button>
      </div>
    </div>
  `;

  // ===== Event handlers =====

  window.throwHit = mult => {
    const value = round.type === "bull" ? "bull" : round.target;
    throwDart(game, { value, mult });
    renderHalveIt(app, game);
  };

  window.throwAnyDouble = t => {
    throwDart(game, { value: t, mult: 2 });
    renderHalveIt(app, game);
  };

  window.throwAnyTriple = t => {
    throwDart(game, { value: t, mult: 3 });
    renderHalveIt(app, game);
  };

  window.throwExactDart = n => {
    throwDart(game, { value: n, mult: game.exactMultiplier });
    game.exactMultiplier = 1;
    renderHalveIt(app, game);
  };

  window.setExactMult = m => {
    game.exactMultiplier = game.exactMultiplier === m ? 1 : m;
    renderHalveIt(app, game);
  };

  window.throwMiss = () => {
    throwDart(game, "miss");
    renderHalveIt(app, game);
  };

  window.undo = () => {
    undo(game);
    renderHalveIt(app, game);
  };

  window.nextPlayer = () => {
    endTurn(game);
    renderHalveIt(app, game);
  };

  window.confirmExit = () => {
    if (confirm("Exit game? All progress will be lost.")) {
      window.showHome();
    }
  };
}

function renderWinner(app, game) {
  const sorted = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isTie = sorted.filter(p => p.score === winner.score).length > 1;

  app.innerHTML = `
    <div class="winner-screen">
      <h1 class="winner-title">🏆 Game Over!</h1>

      ${isTie
        ? `<h2 class="tie-message">It's a Tie!</h2>`
        : `<h2 class="winner-message">Winner!</h2>`
      }

      <div class="winner-list">
        ${sorted.filter(p => p.score === winner.score).map(p => `
          <div class="winner-card">
            <div class="winner-name">${p.name}</div>
            <div class="winner-stats">
              <div class="stat">
                <span class="stat-label">Score</span>
                <span class="stat-value">${p.score}</span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>

      <h3 style="margin-top: 2rem;">All Players</h3>
      <div class="all-players-list">
        ${sorted.map((p, idx) => `
          <div class="player-result">
            <span class="rank">#${idx + 1}</span>
            <span class="name">${p.name}</span>
            <span class="points">${p.score} pts</span>
          </div>
        `).join("")}
      </div>

      <button class="home-btn" onclick="window.showHome()">Back to Home</button>
    </div>
  `;
}
