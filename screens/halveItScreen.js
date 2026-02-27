import { HALVE_IT_ROUNDS, EVEN_SEGS, getSegmentColor, COLOR_EMOJI, EXACT_TARGETS } from "../models/halveIt.js";
import { throwDart, undo, endTurn } from "../games/halveIt.js";

const NUMS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
const COLOUR_ROUNDS = new Set(["color", "sameColor", "threeColors", "exact"]);

// Segment color lookup with current multiplier
function btnColor(n, mult) {
  return getSegmentColor(n, mult);
}

// Which numbers yield a specific color at a given multiplier
function targetNums(targetColor, mult) {
  return NUMS.filter(n => getSegmentColor(n, mult) === targetColor);
}

// Live status line for colour-accumulate rounds
function colourStatus(player, round) {
  const darts = player.roundDarts || [];
  if (!darts.length) return "";

  if (round.type === "threeColors") {
    const real = darts.filter(d => d.color !== "none");
    const uniq = new Set(real.map(d => d.color));
    const icons = [...uniq].map(c => COLOR_EMOJI[c]).join(" ");
    const need  = Math.max(0, 3 - uniq.size);
    return need === 0
      ? `<span style="color:#22c55e;">✓ 3 couleurs — Bien !</span>`
      : `${icons} — encore <strong>${need}</strong> couleur(s) différente(s)`;
  }
  if (round.type === "sameColor") {
    const real = darts.filter(d => d.color !== "none");
    const uniq = new Set(real.map(d => d.color));
    if (darts.some(d => d.color === "none")) {
      return `<span style="color:#ef4444;">✗ Miss brise la condition</span>`;
    }
    if (uniq.size === 1) {
      return `<span style="color:#22c55e;">${COLOR_EMOJI[[...uniq][0]]} Même couleur !</span>`;
    }
    return `<span style="color:#ef4444;">${[...uniq].map(c => COLOR_EMOJI[c]).join(" ")} ✗ Couleurs mélangées</span>`;
  }
  if (round.type === "exact") {
    const total = player.roundScore || 0;
    const match = EXACT_TARGETS.includes(total);
    return match
      ? `<span style="color:#22c55e;">✓ Score exact : ${total} !</span>`
      : `Total : <strong>${total}</strong> — Cibles : ${EXACT_TARGETS.join(", ")}`;
  }
  return "";
}

// Round-specific banner color
const ROUND_COLORS = {
  number:      "#38bdf8",
  double:      "#22d3ee",
  triple:      "#a78bfa",
  bull:        "#ef4444",
  color:       "#f59e0b",
  threeColors: "#f59e0b",
  sameColor:   "#fbbf24",
  exact:       "#22c55e"
};

export function renderHalveIt(app, game) {
  if (game.finished) { renderWinner(app, game); return; }

  const round         = HALVE_IT_ROUNDS[game.currentRound];
  const cur           = game.players[game.currentPlayer];
  const dartsUsed     = game.currentDart >= 3;
  const isColorRound  = COLOUR_ROUNDS.has(round.type);
  const bannerColor   = ROUND_COLORS[round.type] || "#38bdf8";

  let displayTarget = round.target ?? "";
  if (round.type === "bull")   displayTarget = "Bull";
  if (round.type === "color")  displayTarget = round.color === "red" ? "🔴 Rouge" : "🟢 Vert";

  const mult = game.exactMultiplier;

  // For colour-grid rounds: highlight which numbers yield the target
  const highlightSet = new Set(
    round.type === "color" ? targetNums(round.color, mult) : []
  );

  // Colour legend for grid rounds
  function btnStyle(n) {
    const col = btnColor(n, mult);
    const isTarget = highlightSet.has(n);
    const bg = isTarget
      ? (col === "red" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)")
      : "";
    const border = isTarget
      ? (col === "red" ? "#ef4444" : "#22c55e")
      : "#334155";
    return `background:${bg || "#1e293b"};border-color:${border};`;
  }

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-btn" onclick="window.confirmExitHI()">← Exit</button>
      <div class="round-indicator">Round ${game.currentRound + 1} / ${HALVE_IT_ROUNDS.length}</div>
    </div>

    <div class="current-player-banner" style="background:linear-gradient(135deg,${bannerColor},${bannerColor}cc);">
      🎯 ${cur.name}
      <div style="font-size:0.95rem;margin-top:0.2rem;opacity:0.95;">
        ${round.label}
        ${round.type === "exact" ? `<span style="opacity:0.85;font-size:0.85rem;"> — ${EXACT_TARGETS.join(" / ")}</span>` : ""}
        ${round.type === "color" ? `<span style="opacity:0.85;font-size:0.85rem;"> — tout segment ${displayTarget}</span>` : ""}
      </div>
    </div>

    <!-- SCORES -->
    <table class="cricket-table">
      <thead>
        <tr>
          ${game.players.map((p, i) => `
            <th class="${i === game.currentPlayer ? "active-header" : ""}">
              <div class="player-name">${p.name}</div>
              <div class="player-points">${p.score}</div>
            </th>`).join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${game.players.map((p, i) => `
            <td class="${i === game.currentPlayer ? "active-player" : ""}"
                style="font-size:0.75rem;color:#94a3b8;padding:0.35rem;">
              ${i === game.currentPlayer ? cur.lastDarts.join(" | ") : "—"}
            </td>`).join("")}
        </tr>
      </tbody>
    </table>

    <!-- INFO BAR -->
    <div style="text-align:center;padding:0.4rem 0.75rem;background:#1e293b;border-radius:8px;margin:0.4rem 0;display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;">
      <span style="color:#94a3b8;">Dart ${game.currentDart + 1}/3</span>
      <span style="color:#f8fafc;">${colourStatus(cur, round)}</span>
      <span style="color:#64748b;">${dartsUsed ? "✓ Terminé" : ""}</span>
    </div>

    <!-- CONTROLS -->
    <div class="control-section">

      ${round.type === "number" || round.type === "bull" ? `
        <div class="modifier-buttons">
          <button onclick="window.throwHIHit(1)" ${dartsUsed ? "disabled" : ""}>S ${displayTarget}</button>
          <button onclick="window.throwHIHit(2)" ${dartsUsed ? "disabled" : ""}>D ${displayTarget}</button>
          ${round.type !== "bull" ? `<button onclick="window.throwHIHit(3)" ${dartsUsed ? "disabled" : ""}>T ${displayTarget}</button>` : ""}
        </div>
      ` : ""}

      ${round.type === "double" ? `
        <div class="modifier-buttons">
          ${NUMS.map(n => `<button onclick="window.throwHIDouble(${n})" ${dartsUsed ? "disabled" : ""}>${n}</button>`).join("")}
          <button class="bull-btn" onclick="window.throwHIDouble('bull')" ${dartsUsed ? "disabled" : ""}>Bull</button>
        </div>
      ` : ""}

      ${round.type === "triple" ? `
        <div class="modifier-buttons">
          ${NUMS.map(n => `<button onclick="window.throwHITriple(${n})" ${dartsUsed ? "disabled" : ""}>${n}</button>`).join("")}
        </div>
      ` : ""}

      ${isColorRound ? `
        ${round.type === "color" ? `
          <div style="font-size:0.8rem;color:#94a3b8;text-align:center;margin-bottom:0.3rem;">
            ${round.color === "red"
              ? "🔴 Rouge = D/T des pairs : 2,3,7,8,10,12,13,14,18,20 + D-Bull"
              : "🟢 Vert = D/T des impairs : 1,4,5,6,9,11,15,16,17,19 + S-Bull"}
          </div>
        ` : ""}
        <div class="number-buttons" style="grid-template-columns:repeat(5,1fr);margin-bottom:0.4rem;">
          ${NUMS.map(n => `
            <button class="number-btn"
              style="${btnStyle(n)}"
              onclick="window.throwHIGrid(${n})"
              ${dartsUsed ? "disabled" : ""}>${n}</button>
          `).join("")}
          <button class="bull-btn" style="grid-column:span 2;"
            onclick="window.throwHIGrid('bull')"
            ${dartsUsed ? "disabled" : ""}>Bull</button>
        </div>
        <div class="modifier-buttons" style="margin-bottom:0.4rem;">
          <button class="multiplier-btn ${mult === 1 ? "active" : ""}" onclick="window.setHIMult(1)">x1</button>
          <button class="multiplier-btn ${mult === 2 ? "active" : ""}" onclick="window.setHIMult(2)">x2</button>
          <button class="multiplier-btn ${mult === 3 ? "active" : ""}" onclick="window.setHIMult(3)">x3</button>
        </div>
      ` : ""}

      <div class="modifier-buttons" style="margin-top:0.5rem;">
        <button class="miss-btn" onclick="window.throwHIMiss()" ${dartsUsed ? "disabled" : ""}>Miss</button>
        <button class="undo-btn" onclick="window.undoHI()" ${game.history.length === 0 ? "disabled" : ""}>↶ Undo</button>
        <button class="next-btn" onclick="window.nextHIPlayer()" ${dartsUsed ? "" : "disabled"}>Next ➜</button>
      </div>
    </div>
  `;

  // ── event handlers ──────────────────────────────────────────────────────

  window.throwHIHit = mult => {
    const value = round.type === "bull" ? "bull" : round.target;
    throwDart(game, { value, mult });
    renderHalveIt(app, game);
  };

  window.throwHIDouble = t => {
    throwDart(game, { value: t, mult: 2 });
    renderHalveIt(app, game);
  };

  window.throwHITriple = t => {
    throwDart(game, { value: t, mult: 3 });
    renderHalveIt(app, game);
  };

  window.throwHIGrid = n => {
    throwDart(game, { value: n, mult: game.exactMultiplier });
    game.exactMultiplier = 1;
    renderHalveIt(app, game);
  };

  window.setHIMult = m => {
    game.exactMultiplier = game.exactMultiplier === m ? 1 : m;
    renderHalveIt(app, game);
  };

  window.throwHIMiss = () => {
    throwDart(game, "miss");
    renderHalveIt(app, game);
  };

  window.undoHI = () => {
    undo(game);
    renderHalveIt(app, game);
  };

  window.nextHIPlayer = () => {
    endTurn(game);
    renderHalveIt(app, game);
  };

  window.confirmExitHI = () => {
    if (confirm("Exit game? All progress will be lost.")) window.showHome();
  };
}

function renderWinner(app, game) {
  const sorted = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isTie  = sorted.filter(p => p.score === winner.score).length > 1;

  app.innerHTML = `
    <div class="winner-screen">
      <h1 class="winner-title">🏆 Game Over!</h1>
      ${isTie ? `<h2 class="tie-message">Égalité !</h2>` : `<h2 class="winner-message">Gagnant !</h2>`}
      <div class="winner-list">
        ${sorted.filter(p => p.score === winner.score).map(p => `
          <div class="winner-card">
            <div class="winner-name">${p.name}</div>
            <div class="winner-stats">
              <div class="stat"><span class="stat-label">Score</span><span class="stat-value">${p.score}</span></div>
            </div>
          </div>`).join("")}
      </div>
      <h3 style="margin-top:1.5rem;">Classement</h3>
      <div class="all-players-list">
        ${sorted.map((p, i) => `
          <div class="player-result">
            <span class="rank">#${i + 1}</span>
            <span class="name">${p.name}</span>
            <span class="points">${p.score} pts</span>
          </div>`).join("")}
      </div>
      <button class="home-btn" onclick="window.showHome()">← Accueil</button>
    </div>
  `;
}
