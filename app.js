import { showHome, showGameModes } from "./screens/home.js";
import { showPlayers }            from "./screens/players.js";
import { renderCricket }          from "./screens/cricketScreen.js";
import { renderHalveIt }          from "./screens/halveItScreen.js";
import { renderX01 }              from "./screens/x01Screen.js";
import { renderATW }              from "./screens/aroundTheWorldScreen.js";
import { loadPlayers }            from "./storage/storage.js";
import { createCricketGame }      from "./games/cricket.js";
import { createHalveItGame }      from "./games/halveIt.js";
import { createX01Game }          from "./games/x01.js";
import { createATWGame }          from "./games/aroundTheWorld.js";

const app = document.getElementById("app");
let currentGame = null;

window.showHome      = () => showHome(app);
window.showPlayers   = () => showPlayers(app);
window.showGameModes = () => showGameModes(app);

/* ─────────────────────────────────────────────────────────────────────────
   Shared player-selection helper
   ───────────────────────────────────────────────────────────────────────── */
function showPlayerSelection({ title, subtitle, minPlayers, maxPlayers, onStart }) {
  const players = loadPlayers();
  if (players.length < minPlayers) {
    alert(`Crée au moins ${minPlayers} joueur${minPlayers > 1 ? "s" : ""} d'abord !`);
    window.showPlayers();
    return;
  }

  app.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto;">
      <h2>🎯 ${title}</h2>
      <p style="color: #94a3b8; margin-bottom: 1rem;">${subtitle}</p>

      <div class="player-selection">
        ${players.map(p => `
          <label class="player-checkbox">
            <input type="checkbox" value="${p.id}" />
            <span>${p.name}</span>
          </label>
        `).join("")}
      </div>

      <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
        <button id="startBtn" style="background:#22c55e;font-size:1.1rem;padding:1rem 2rem;width:100%;">
          ▶ Démarrer
        </button>
        <button onclick="window.showHome()" style="background:#64748b;width:100%;">
          ← Annuler
        </button>
      </div>
    </div>

    <style>
      .player-selection { display:flex;flex-direction:column;gap:0.75rem;margin:1rem 0; }
      .player-checkbox  { display:flex;align-items:center;background:#1e293b;padding:1rem;border-radius:10px;border:2px solid #334155;cursor:pointer;transition:all 0.2s; }
      .player-checkbox:hover { border-color:#38bdf8; }
      .player-checkbox input[type="checkbox"] { width:24px;height:24px;margin:0 1rem 0 0;cursor:pointer;flex-shrink:0; }
      .player-checkbox span { font-size:1.1rem;font-weight:600; }
      .player-checkbox:has(input:checked) { background:rgba(56,189,248,0.2);border-color:#38bdf8; }
    </style>
  `;

  document.getElementById("startBtn").addEventListener("click", () => {
    const ids = [...document.querySelectorAll("input:checked")].map(i => i.value);
    if (ids.length < minPlayers) { alert(`Sélectionne au moins ${minPlayers} joueur${minPlayers > 1 ? "s" : ""}`); return; }
    if (ids.length > maxPlayers) { alert(`Maximum ${maxPlayers} joueurs`); return; }
    onStart(loadPlayers().filter(p => ids.includes(p.id)));
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   501
   ───────────────────────────────────────────────────────────────────────── */
window.newGameX01 = () => {
  showPlayerSelection({
    title: "501 — Sélection",
    subtitle: "Choisis 1 à 8 joueurs",
    minPlayers: 1, maxPlayers: 8,
    onStart: players => {
      currentGame = createX01Game(players, 501);
      renderX01(app, currentGame);
    }
  });
};

/* ─────────────────────────────────────────────────────────────────────────
   Cricket
   ───────────────────────────────────────────────────────────────────────── */
window.newGameCricket = () => {
  showPlayerSelection({
    title: "Cricket — Sélection",
    subtitle: "Choisis 2 à 6 joueurs",
    minPlayers: 2, maxPlayers: 6,
    onStart: players => {
      currentGame = createCricketGame(players);
      renderCricket(app, currentGame);
    }
  });
};

/* ─────────────────────────────────────────────────────────────────────────
   Halve It
   ───────────────────────────────────────────────────────────────────────── */
window.newGameHalveIt = () => {
  showPlayerSelection({
    title: "Halve It — Sélection",
    subtitle: "Choisis 1 à 6 joueurs",
    minPlayers: 1, maxPlayers: 6,
    onStart: players => {
      currentGame = createHalveItGame(players);
      renderHalveIt(app, currentGame);
    }
  });
};

/* ─────────────────────────────────────────────────────────────────────────
   Around the World
   ───────────────────────────────────────────────────────────────────────── */
window.newGameATW = () => {
  showPlayerSelection({
    title: "Around the World — Sélection",
    subtitle: "Choisis 1 à 8 joueurs",
    minPlayers: 1, maxPlayers: 8,
    onStart: players => {
      currentGame = createATWGame(players);
      renderATW(app, currentGame);
    }
  });
};

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

showHome(app);
