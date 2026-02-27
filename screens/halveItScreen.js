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

  // Determine display number
  let displayTarget = round.target ?? "";
  if (round.type === "bull") displayTarget = "Bull";

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-btn" onclick="window.confirmExit()">← Exit</button>
    </div>

    <div class="current-player-banner">
      🎯 ${currentPlayer.name}
      <div style="font-size:2rem; margin-top:0.25rem;">
        Round ${game.currentRound + 1} : ${round.label}
      </div>
    </div>

    <!-- SCORE TABLE -->
    <table class="cricket-table">
      <thead>
        <tr>
          ${game.players.map((p, i) => `
            <th class="${i === game.currentPlayer ? "active-header" : ""}">
              ${p.name}
            </th>
          `).join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${game.players.map((p, i) => `
            <td class="${i === game.currentPlayer ? "active-player" : ""}"
                style="font-size:1.6rem; font-weight:800;">
              ${p.score}
            </td>
          `).join("")}
        </tr>
        <div class="dart-status">
          <div style="font-size:0.85rem; opacity:0.7;">Current round darts</div>
          <div class="dart-row">
            ${currentPlayer.lastDarts.map(d => `<span class="dart-pill">${d}</span>`).join("")}
          </div>
        </div>
      </tbody>
    </table>

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
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n =>
          `<button class="modifier-btn" onclick="window.throwAnyDouble('${n}')" ${dartsUsed ? "disabled" : ""}>${n}</button>`
        ).join("")}
        <button class="bull-btn" onclick="window.throwAnyDouble('bull')" ${dartsUsed ? "disabled" : ""}>Bull</button>
      </div>
      ` : ""}

      ${round.type === "triple" ? `
      <div class="modifier-buttons">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n =>
          `<button class="modifier-btn" onclick="window.throwAnyTriple('${n}')" ${dartsUsed ? "disabled" : ""}>${n}</button>`
        ).join("")}
      </div>
      ` : ""}

      ${round.type === "exact" ? `
        <div class="modifier-buttons">
          ${game.exactTargets.map(v => `
            <button onclick="window.throwExact(${v})" ${dartsUsed ? "disabled" : ""}>${v}</button>
          `).join("")}
          <button class="miss-btn" onclick="window.throwMissExactScore()" ${dartsUsed ? "disabled" : ""}>Miss</button>
        </div>
      ` : ""}

      <div class="modifier-buttons" style="margin-top:1rem; visibility: ${round.type === "exact" ? "hidden" : "visible"};">
        <button class="miss-btn" onclick="window.throwMiss()" ${dartsUsed ? "disabled" : ""}>Miss</button>
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
    throwDart(game, { value: t, mult: 2 }); // value irrelevant, mult matters
    renderHalveIt(app, game);
  };

  window.throwAnyTriple = t => {
    throwDart(game, { value: t, mult: 3 });
    renderHalveIt(app, game);
  };

  window.throwExact = t => {
    throwDart(game, { value: t, mult: 1 });
    endTurn(game);
    game.lastDart = null;
    renderHalveIt(app, game);
  };

  window.throwMiss = () => {
    throwDart(game, "miss");
    renderHalveIt(app, game);
  };

  window.throwMissExactScore = () => {
    endTurn(game);
    game.lastDart = null;
    renderHalveIt(app, game);
  };

  window.undo = () => {
    undo(game);
    renderHalveIt(app, game);
  };

  window.nextPlayer = () => {
    endTurn(game);
    game.lastDart = null;
    renderHalveIt(app, game);
  };

  window.confirmExit = () => {
    if (confirm("Exit game? All progress will be lost.")) {
      window.showHome();
    }
  };
}

function renderWinner(app, game) {
  const winner = [...game.players].sort((a, b) => b.score - a.score)[0];

  app.innerHTML = `
    <div class="winner-screen">
      <h1 class="winner-title">🏆 Winner</h1>
      <h2 class="winner-message">${winner.name}</h2>
      <div style="font-size:2rem; font-weight:800;">${winner.score}</div>
      <button class="home-btn" onclick="window.showHome()">Back to Home</button>
    </div>
  `;
}
