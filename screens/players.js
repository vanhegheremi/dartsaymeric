import { loadPlayers, addPlayer, deletePlayer } from "../storage/storage.js";
import { createPlayer } from "../models/player.js";

export function showPlayers(app) {
  const players = loadPlayers();

  app.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto;">
      <h2>👥 Manage Players</h2>
      <p style="color: #94a3b8; margin-bottom: 1.5rem;">
        ${players.length === 0 ? 'Add your first player to get started!' : `${players.length} player${players.length !== 1 ? 's' : ''} registered`}
      </p>
      
      <div style="margin-bottom: 2rem;">
        <input 
          id="playerName" 
          type="text"
          placeholder="Enter player name" 
          maxlength="20"
          style="width: 100%; max-width: 300px;"
          onkeypress="if(event.key === 'Enter') window.addPlayer()"
        />
        <br>
        <button onclick="window.addPlayer()" style="background: #22c55e; margin-top: 0.5rem;">
          ➕ Add Player
        </button>
      </div>

      ${players.length > 0 ? `
        <ul class="player-list">
          ${players.map(p => `
            <li>
              <span style="font-size: 1.1rem; font-weight: 600;">${p.name}</span>
              <button 
                onclick="window.removePlayer('${p.id}')" 
                style="background: #ef4444; padding: 0.5rem 0.75rem; font-size: 0.9rem;">
                🗑️ Delete
              </button>
            </li>
          `).join("")}
        </ul>
      ` : `
        <div style="padding: 2rem; background: #1e293b; border-radius: 12px; border: 2px dashed #334155; margin: 1rem 0;">
          <p style="color: #94a3b8; font-size: 0.9rem;">
            No players yet. Add some players to start playing!
          </p>
        </div>
      `}

      <button onclick="window.showHome()" style="margin-top: 2rem; background: #64748b;">
        ← Back to Home
      </button>
    </div>
  `;

  // Focus the input field
  setTimeout(() => {
    document.getElementById("playerName")?.focus();
  }, 100);

  window.addPlayer = () => {
    const input = document.getElementById("playerName");
    const name = input.value.trim();
    
    if (!name) {
      alert("Please enter a player name");
      return;
    }

    if (name.length > 20) {
      alert("Player name must be 20 characters or less");
      return;
    }

    // Check for duplicate names
    const existingPlayers = loadPlayers();
    if (existingPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert("A player with this name already exists");
      return;
    }

    addPlayer(createPlayer(name));
    showPlayers(app);
  };

  window.removePlayer = id => {
    const player = loadPlayers().find(p => p.id === id);
    if (player && confirm(`Delete ${player.name}? This cannot be undone.`)) {
      deletePlayer(id);
      showPlayers(app);
    }
  };
}
