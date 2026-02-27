import { CRICKET_NUMBERS, HIT_DISPLAY } from "../models/cricket.js";
import { throwDart, undo, getWinner } from "../games/cricket.js";

const safeMPR = p => p.rounds === 0 ? "0.00" : (p.marks / p.rounds).toFixed(2);

export function renderCricket(app, game) {
  if (game.finished) {
    renderWinner(app, game);
    return;
  }

  const current = game.players[game.currentPlayer];

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-btn" onclick="window.confirmExit()">← Exit</button>
      <div class="round-indicator">Round ${game.round} / 20</div>
    </div>

    <div class="current-player-banner">
      🎯 ${current.name}'s Turn
      <div style="font-size: 0.85rem; margin-top: 0.2rem; opacity: 0.9;">
        Dart ${game.currentDart + 1} of 3
      </div>
    </div>

    <table class="cricket-table">
      <thead>
        <tr>
          <th>Number</th>
          ${game.players.map((p, i) => `
            <th class="${i === game.currentPlayer ? 'active-header' : ''}">
              <div class="player-name">${p.name}</div>
              <div class="player-points">${p.points}</div>
              <div class="player-meta">
                <div class="mpr">MPR: ${safeMPR(p)}</div>
                <div class="last-darts">${p.lastDarts.join(" | ")}</div>
              </div>
            </th>
          `).join("")}
        </tr>
      </thead>

      <tbody>
        ${CRICKET_NUMBERS.map(n => {
          const allClosed = game.players.every(p => p.hits[n] >= 3);
          return `
            <tr class="${allClosed ? 'all-closed' : ''}">
              <td><strong>${n === "bull" ? "Bull" : n}</strong></td>
              ${game.players.map((p, i) => {
                const isClosed = p.hits[n] >= 3;
                const displayHits = p.hits[n] >= 3 ? 3 : p.hits[n];

                return `
                  <td class="${i === game.currentPlayer ? 'active-player' : ''} ${isClosed ? 'closed' : ''}">
                    ${HIT_DISPLAY[displayHits]}
                  </td>
                `;
              }).join("")}
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>

    <div class="control-section">
      <div class="number-buttons">
        <button class="number-btn" onclick="window.hit('15')">15</button>
        <button class="number-btn" onclick="window.hit('16')">16</button>
        <button class="number-btn" onclick="window.hit('17')">17</button>
        <button class="number-btn" onclick="window.hit('18')">18</button>
        <button class="number-btn" onclick="window.hit('19')">19</button>
        <button class="number-btn" onclick="window.hit('20')">20</button>
        <button class="bull-btn" onclick="window.hit('bull')" ${game.multiplier === 3 ? 'disabled' : ''}>Bull</button>
      </div>

      <div class="modifier-buttons">
        <button class="miss-btn" onclick="window.throwMiss()">Miss</button>

        <button
          class="multiplier-btn ${game.multiplier === 2 ? "active" : ""}"
          onclick="window.toggleMult(2)">
          Double
        </button>

        <button
          class="multiplier-btn ${game.multiplier === 3 ? "active" : ""}"
          onclick="window.toggleMult(3)">
          Triple
        </button>

        <button class="undo-btn" onclick="window.undo()" ${game.history.length === 0 ? 'disabled' : ''}>
          ↶ Undo
        </button>
      </div>
    </div>
  `;

  window.hit = t => {
    throwDart(game, t);
    renderCricket(app, game);
  };

  window.throwMiss = () => {
    throwDart(game, "miss");
    renderCricket(app, game);
  };

  window.toggleMult = m => {
    game.multiplier = game.multiplier === m ? 1 : m;
    renderCricket(app, game);
  };

  window.undo = () => {
    undo(game);
    renderCricket(app, game);
  };

  window.confirmExit = () => {
    if (confirm("Exit game? All progress will be lost.")) {
      window.showHome();
    }
  };
}

function renderWinner(app, game) {
  const winners = getWinner(game);
  const isTie = winners.length > 1;

  const sorted = [...game.players].sort((a, b) => {
    if (a.points !== b.points) return a.points - b.points;
    return (b.rounds > 0 ? b.marks / b.rounds : 0) - (a.rounds > 0 ? a.marks / a.rounds : 0);
  });

  app.innerHTML = `
    <div class="winner-screen">
      <h1 class="winner-title">🏆 Game Over!</h1>

      ${isTie ?
        '<h2 class="tie-message">It\'s a Tie!</h2>' :
        '<h2 class="winner-message">Winner!</h2>'
      }

      <div class="winner-list">
        ${winners.map(p => `
          <div class="winner-card">
            <div class="winner-name">${p.name}</div>
            <div class="winner-stats">
              <div class="stat">
                <span class="stat-label">Points</span>
                <span class="stat-value">${p.points}</span>
              </div>
              <div class="stat">
                <span class="stat-label">MPR</span>
                <span class="stat-value">${safeMPR(p)}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Rounds</span>
                <span class="stat-value">${p.rounds}</span>
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
            <span class="points">${p.points} pts</span>
            <span class="mpr">${safeMPR(p)} MPR</span>
          </div>
        `).join("")}
      </div>

      <button class="home-btn" onclick="window.showHome()">Back to Home</button>
    </div>
  `;
}
