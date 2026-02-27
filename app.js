import { showHome, showGameModes } from "./screens/home.js";
import { showPlayers } from "./screens/players.js";
import { renderCricket } from "./screens/cricketScreen.js";
import { renderHalveIt } from "./screens/halveItScreen.js";
import { loadPlayers } from "./storage/storage.js";
import { createCricketGame } from "./games/cricket.js";
import { createHalveItGame } from "./games/halveIt.js";
import { getWinner } from "./games/cricket.js";
import { undo } from "./games/cricket.js";

const app = document.getElementById("app");
let currentGame = null;

// Global navigation functions
window.showHome = () => showHome(app);
window.showPlayers = () => showPlayers(app);
window.showGameModes = () => showGameModes(app);

/* ===============================
   Cricket
   =============================== */
window.newGameCricket = () => {
  const players = loadPlayers();
  if (players.length < 2) {
    alert("Create at least 2 players first!");
    window.showPlayers();
    return;
  }

  app.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto;">
      <h2>🎯 Select Players</h2>
      <p style="color: #94a3b8; margin-bottom: 1rem;">Choose 2-6 players for the game</p>
      
      <div class="player-selection">
        ${players.map(p => `
          <label class="player-checkbox">
            <input type="checkbox" value="${p.id}" />
            <span>${p.name}</span>
          </label>
        `).join("")}
      </div>
      
      <div style="margin-top: 2rem;">
        <button onclick="window.startCricket()" style="background: #22c55e; font-size: 1.1rem; padding: 1rem 2rem;">
          Start Cricket Game
        </button>
        <br>
        <button onclick="window.showHome()" style="background: #64748b; margin-top: 0.5rem;">
          Cancel
        </button>
      </div>
    </div>
    
    <style>
      .player-selection {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin: 1rem 0;
      }
      
      .player-checkbox {
        display: flex;
        align-items: center;
        background: #1e293b;
        padding: 1rem;
        border-radius: 10px;
        border: 2px solid #334155;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .player-checkbox:hover {
        border-color: #38bdf8;
      }
      
      .player-checkbox input[type="checkbox"] {
        width: 24px;
        height: 24px;
        margin: 0 1rem 0 0;
        cursor: pointer;
      }
      
      .player-checkbox span {
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .player-checkbox:has(input:checked) {
        background: rgba(56, 189, 248, 0.2);
        border-color: #38bdf8;
      }
    </style>
  `;
};

window.startCricket = () => {
  const ids = [...document.querySelectorAll("input:checked")].map(i => i.value);
  
  if (ids.length < 2) {
    alert("Select at least 2 players");
    return;
  }
  
  if (ids.length > 6) {
    alert("Maximum 6 players allowed");
    return;
  }

  const players = loadPlayers().filter(p => ids.includes(p.id));
  currentGame = createCricketGame(players);
  renderCricket(app, currentGame);
};

/* ===============================
   Halve It
   =============================== */
window.newGameHalveIt = () => {
  const players = loadPlayers();
  if (players.length < 1) {
    alert("Create at least 1 players first!");
    window.showPlayers();
    return;
  }

  app.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto;">
      <h2>🎯 Select Players</h2>
      <p style="color: #94a3b8; margin-bottom: 1rem;">Choose 2-6 players for the game</p>
      
      <div class="player-selection">
        ${players.map(p => `
          <label class="player-checkbox">
            <input type="checkbox" value="${p.id}" />
            <span>${p.name}</span>
          </label>
        `).join("")}
      </div>
      
      <div style="margin-top: 2rem;">
        <button onclick="window.startHalveIt()" style="background: #22c55e; font-size: 1.1rem; padding: 1rem 2rem;">
          Start Halve It
        </button>
        <br>
        <button onclick="window.showHome()" style="background: #64748b; margin-top: 0.5rem;">
          Cancel
        </button>
      </div>
    </div>
    
    <style>
      .player-selection {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin: 1rem 0;
      }
      
      .player-checkbox {
        display: flex;
        align-items: center;
        background: #1e293b;
        padding: 1rem;
        border-radius: 10px;
        border: 2px solid #334155;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .player-checkbox:hover {
        border-color: #38bdf8;
      }
      
      .player-checkbox input[type="checkbox"] {
        width: 24px;
        height: 24px;
        margin: 0 1rem 0 0;
        cursor: pointer;
      }
      
      .player-checkbox span {
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .player-checkbox:has(input:checked) {
        background: rgba(56, 189, 248, 0.2);
        border-color: #38bdf8;
      }
    </style>
  `;
};

window.startHalveIt = () => {
  const ids = [...document.querySelectorAll("input:checked")].map(i => i.value);
  
  if (ids.length < 1) {
    alert("Select at least 1 players");
    return;
  }
  
  if (ids.length > 6) {
    alert("Maximum 6 players allowed");
    return;
  }

  const players = loadPlayers().filter(p => ids.includes(p.id));
  currentGame = createHalveItGame(players);
  renderHalveIt(app, currentGame);
};


// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(err => {
    console.log("Service Worker registration failed:", err);
  });
}

// Start the app
showHome(app);
