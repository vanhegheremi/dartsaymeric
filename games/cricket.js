import { CRICKET_NUMBERS } from "../models/cricket.js";

const MAX_ROUNDS = 20;

export function createCricketGame(players) {
  return {
    players: players.map(p => ({
      ...p,
      hits: Object.fromEntries(CRICKET_NUMBERS.map(n => [n, 0])),
      points: 0,
      marks: 0,
      rounds: 0,
      lastDarts: ["-", "-", "-"]
    })),
    currentPlayer: 0,
    currentDart: 0,
    multiplier: 1,
    round: 1,
    history: [],
    finished: false
  };
}

  export function startTurn(game) {
    const p = game.players[game.currentPlayer];
    p.lastDarts = ["-", "-", "-"];
    game.currentDart = 0;
    game.multiplier = 1;
    game.currentTarget = null; // reset selected number
  }

export function throwDart(game, target) {
  if (game.finished) return;

  // Save game state for undo
  game.history.push(structuredClone(game));

  const player = game.players[game.currentPlayer];
  let effectiveMarksThisDart = 0;

  if (target !== "miss") {
    const key = target === "bull" ? "bull" : Number(target);
    const before = player.hits[key];
    let totalHits = before + game.multiplier;

    // Enforce Bull rules: no triple
    if (key === "bull" && totalHits > 6) {
      totalHits = before + 2; // max double for bull
    }

    player.hits[key] = totalHits;

    // Effective marks count: closing marks
    const closeMarks = Math.min(totalHits, 3) - Math.min(before, 3);

    // Overflow points to opponents
    let pointMarks = 0;
    if (totalHits > 3) {
      const overflowHits = totalHits - 3;
      const previousOverflow = Math.max(0, before - 3);
      const newOverflow = overflowHits - previousOverflow;

      game.players.forEach((opponent, i) => {
        if (i !== game.currentPlayer && opponent.hits[key] < 3 && newOverflow > 0) {
          pointMarks += newOverflow;
          const pointValue = key === "bull" ? 25 : key;
          opponent.points += pointValue * newOverflow;
        }
      });
    }

    // Only count effective marks
    effectiveMarksThisDart = closeMarks + pointMarks;
    player.marks += effectiveMarksThisDart;
  }

  // Update last dart display
  const display =
    target === "miss" ? "0" :
    game.multiplier === 1 ? `${target}` :
    game.multiplier === 2 ? `D${target}` :
    `T${target}`;

  player.lastDarts[game.currentDart] = display;

  game.currentDart++;
  game.multiplier = 1; // reset after each dart

  if (game.currentDart >= 3) {
    endTurn(game);
  } else {
    const hasClosedAll = CRICKET_NUMBERS.every(n => player.hits[n] >= 3);
    if (hasClosedAll) {
      const lowestScore = Math.min(...game.players.map(p => p.points));
      if (player.points <= lowestScore) {
        game.finished = true;
        return;
      }
    }
  }
}

function endTurn(game) {
  const player = game.players[game.currentPlayer];
  player.rounds++;

  const hasClosedAll = CRICKET_NUMBERS.every(n => player.hits[n] >= 3);
  if (hasClosedAll) {
    const lowestScore = Math.min(...game.players.map(p => p.points));
    if (player.points <= lowestScore) {
      game.finished = true;
      return;
    }
  }

  game.currentPlayer++;
  if (game.currentPlayer >= game.players.length) {
    game.currentPlayer = 0;
    game.round++;
    if (game.round > MAX_ROUNDS) {
      game.finished = true;
      return;
    }
  }

  startTurn(game);
}

export function undo(game) {
  if (!game.history.length) return;
  Object.assign(game, game.history.pop());
}

export function getWinner(game) {
  const sorted = [...game.players].sort((a, b) => {
    if (a.points !== b.points) return a.points - b.points;
    const mprA = a.rounds ? a.marks / a.rounds : 0;
    const mprB = b.rounds ? b.marks / b.rounds : 0;
    return mprB - mprA;
  });

  const best = sorted[0];
  const bestMPR = best.rounds ? best.marks / best.rounds : 0;

  return sorted.filter(p => {
    const pMPR = p.rounds ? p.marks / p.rounds : 0;
    return p.points === best.points && Math.abs(pMPR - bestMPR) < 0.001;
  });
}