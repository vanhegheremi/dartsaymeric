export function createX01Game(players, startScore = 501) {
  const game = {
    players: players.map(p => ({
      ...p,
      score: startScore,
      lastDarts: ["-", "-", "-"],
      dartsThrown: 0,
      checkout: null
    })),
    currentPlayer: 0,
    currentDart: 0,
    multiplier: 1,
    round: 1,
    startScore,
    history: [],
    finished: false,
    turnStartScore: startScore
  };
  return game;
}

export function throwDart(game, target) {
  if (game.finished) return;

  const snap = structuredClone({ ...game, history: [] });
  game.history.push(snap);
  if (game.history.length > 15) game.history.shift();

  const player = game.players[game.currentPlayer];
  let score = 0;
  let isBust = false;

  if (target !== "miss") {
    const isBull = target === "bull";
    if (isBull) {
      score = game.multiplier === 2 ? 50 : 25;
    } else {
      score = Number(target) * game.multiplier;
    }

    const remaining = player.score - score;

    if (remaining < 0) {
      isBust = true;
    } else {
      player.score = remaining;
    }
  }

  const raw =
    target === "miss" ? "0" :
    game.multiplier === 1 ? `${target}` :
    game.multiplier === 2 ? `D${target}` :
    `T${target}`;

  player.lastDarts[game.currentDart] = isBust ? `(${raw})` : raw;
  game.currentDart++;
  game.multiplier = 1;

  if (!isBust && player.score === 0) {
    player.dartsThrown += game.currentDart;
    game.finished = true;
    return;
  }

  if (isBust) {
    player.score = game.turnStartScore;
    _endTurn(game);
    return;
  }

  if (game.currentDart >= 3) {
    _endTurn(game);
  }
}

function _endTurn(game) {
  const player = game.players[game.currentPlayer];
  player.dartsThrown += game.currentDart;

  game.currentPlayer++;
  if (game.currentPlayer >= game.players.length) {
    game.currentPlayer = 0;
    game.round++;
  }

  _startTurn(game);
}

function _startTurn(game) {
  const player = game.players[game.currentPlayer];
  player.lastDarts = ["-", "-", "-"];
  game.turnStartScore = player.score;
  game.currentDart = 0;
  game.multiplier = 1;
}

export function undo(game) {
  if (!game.history.length) return;
  const prev = game.history.pop();
  const savedHistory = [...game.history];
  Object.assign(game, prev);
  game.history = savedHistory;
}

export function getWinner(game) {
  return game.players.find(p => p.score === 0) || null;
}
