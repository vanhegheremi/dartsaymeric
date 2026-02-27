export const ATW_SEQUENCE = [
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,"bull"
];

export function createATWGame(players) {
  return {
    players: players.map(p => ({
      ...p,
      current: 1,           // next number to hit
      lastDarts: ["-", "-", "-"]
    })),
    currentPlayer: 0,
    currentDart: 0,
    round: 1,
    history: [],
    finished: false
  };
}

export function throwDart(game, hit) {
  if (game.finished) return;

  const snap = structuredClone({ ...game, history: [] });
  game.history.push(snap);
  if (game.history.length > 15) game.history.shift();

  const player = game.players[game.currentPlayer];
  const target = player.current;
  const isHit  = hit !== "miss";

  let display;

  if (isHit) {
    const isOnTarget =
      target === "bull"
        ? (hit === "bull" || hit?.value === "bull")
        : (hit === target || Number(hit?.value ?? hit) === target);

    if (isOnTarget) {
      const idx     = ATW_SEQUENCE.indexOf(target);
      const nextIdx = idx + 1;

      if (nextIdx >= ATW_SEQUENCE.length) {
        // Hit bull — WIN
        display = "Bull ✓";
        player.lastDarts[game.currentDart] = display;
        game.finished = true;
        return;
      }

      player.current = ATW_SEQUENCE[nextIdx];
      display = `${target === "bull" ? "Bull" : target} ✓`;
    } else {
      display = `${typeof hit === "object" ? hit.value : hit} ✗`;
    }
  } else {
    display = "✗";
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

export function undo(game) {
  if (!game.history.length) return;
  const prev = game.history.pop();
  const savedHistory = [...game.history];
  Object.assign(game, prev);
  game.history = savedHistory;
}
