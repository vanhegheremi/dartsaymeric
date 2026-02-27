// Around the World: 1 → 20 (no bull)
// Single = advance 1, Double = advance 2, Triple = advance 3
// First to reach or pass 20 wins

export const ATW_SEQUENCE = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
export const ATW_TOTAL = ATW_SEQUENCE.length; // 20

export function createATWGame(players) {
  return {
    players: players.map(p => ({
      ...p,
      currentIdx: 0,    // index in ATW_SEQUENCE (0 = targeting 1)
      lastDarts: ["-", "-", "-"]
    })),
    currentPlayer: 0,
    currentDart: 0,
    round: 1,
    history: [],
    finished: false
  };
}

// result: "miss" | { value: number, mult: 1|2|3 }
export function throwDart(game, result) {
  if (game.finished) return;

  const snap = structuredClone({ ...game, history: [] });
  game.history.push(snap);
  if (game.history.length > 15) game.history.shift();

  const player = game.players[game.currentPlayer];
  const targetValue = ATW_SEQUENCE[player.currentIdx];

  let display;

  if (result === "miss") {
    display = "✗";
  } else {
    const { value, mult } = result;
    const isOnTarget = Number(value) === targetValue;
    const multLabel = mult === 1 ? "" : mult === 2 ? "D" : "T";

    if (isOnTarget) {
      player.currentIdx = Math.min(player.currentIdx + mult, ATW_TOTAL);
      display = `${multLabel}${value} ✓`;

      if (player.currentIdx >= ATW_TOTAL) {
        // WIN
        player.lastDarts[game.currentDart] = display;
        game.finished = true;
        return;
      }
    } else {
      display = `${multLabel}${value} ✗`;
    }
  }

  player.lastDarts[game.currentDart] = display;
  game.currentDart++;

  if (game.currentDart >= 3) {
    _endTurn(game);
  }
}

function _endTurn(game) {
  game.currentPlayer++;
  if (game.currentPlayer >= game.players.length) {
    game.currentPlayer = 0;
    game.round++;
  }
  const p = game.players[game.currentPlayer];
  p.lastDarts = ["-", "-", "-"];
  game.currentDart = 0;
}

export function nextPlayer(game) {
  _endTurn(game);
}

export function undo(game) {
  if (!game.history.length) return;
  const prev = game.history.pop();
  const savedHistory = [...game.history];
  Object.assign(game, prev);
  game.history = savedHistory;
}
