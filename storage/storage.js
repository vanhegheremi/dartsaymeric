const KEY = "dart_players";

export function loadPlayers() {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to load players:", err);
    return [];
  }
}

export function savePlayers(players) {
  try {
    localStorage.setItem(KEY, JSON.stringify(players));
  } catch (err) {
    console.error("Failed to save players:", err);
    alert("Failed to save players. Storage may be full.");
  }
}

export function addPlayer(player) {
  const players = loadPlayers();
  players.push(player);
  savePlayers(players);
}

export function deletePlayer(id) {
  const players = loadPlayers().filter(p => p.id !== id);
  savePlayers(players);
}
