import { HALVE_IT_ROUNDS } from "../models/halveIt.js";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createHalveItGame(players) {
  return {
    players: players.map(p => ({
      ...p,
      score: 0,
      lastDarts: ["-", "-", "-"],
      hitThisRound: false,
      roundScore: 0
    })),
    currentPlayer: 0,
    currentRound: 0,
    currentDart: 0,
    exactMultiplier: 1,
    history: [],
    finished: false,
    exactTarget: rand(26, 45),
    lastDart: null
  };
}

function multLabel(m) {
  return m === 1 ? "" : m === 2 ? "D" : "T";
}

export function throwDart(game, hit) {
  if (game.finished) return;

  game.history.push(structuredClone(game));

  const player = game.players[game.currentPlayer];
  const round = HALVE_IT_ROUNDS[game.currentRound];

  let score = 0;
  let validHit = false;

  game.lastDart = hit === "miss"
    ? { label: "Miss", value: 0 }
    : {
        label: hit.mult === 1 ? `S${hit.value}` :
               hit.mult === 2 ? `D${hit.value}` :
               `T${hit.value}`,
        value: hit.value,
        mult: hit.mult
      };

  if (hit !== "miss") {
    const { value, mult } = hit;

    switch (round.type) {
      case "number":
        validHit = value === round.target;
        break;

      case "double":
        validHit = mult === 2;
        break;

      case "triple":
        validHit = mult === 3;
        break;

      case "bull":
        validHit = value === "bull";
        break;

      case "exact":
        // Accumulate round score — validated at endTurn
        score = value === "bull" ? 25 * mult : value * mult;
        player.roundScore += score;
        player.score += score;
        player.hitThisRound = true; // prevent premature halving during turn
        player.lastDarts[game.currentDart] = `${multLabel(mult)}${value}`;
        game.currentDart++;
        return;

      default:
        break;
    }

    if (validHit) {
      score = value === "bull" ? 25 * mult : value * mult;
      player.score += score;
      player.hitThisRound = true;
    }
  }

  player.lastDarts[game.currentDart] =
    hit === "miss" ? "0" : `${multLabel(hit.mult)}${hit.value}`;
  game.currentDart++;
}

export function endTurn(game) {
  const player = game.players[game.currentPlayer];
  const round = HALVE_IT_ROUNDS[game.currentRound];

  // Special validation for exact score round
  if (round.type === "exact") {
    const roundScore = player.roundScore || 0;
    if (roundScore === game.exactTarget) {
      // Exact hit! Keep the accumulated score
      player.hitThisRound = true;
    } else {
      // Miss — undo accumulated round score, then halve
      player.score -= roundScore;
      player.hitThisRound = false;
    }
  }

  if (!player.hitThisRound) {
    player.score = Math.ceil(player.score / 2);
  }

  player.hitThisRound = false;
  player.roundScore = 0;
  player.lastDarts = ["-", "-", "-"];
  game.currentDart = 0;
  game.exactMultiplier = 1;
  game.lastDart = null;

  game.currentPlayer++;

  if (game.currentPlayer >= game.players.length) {
    game.currentPlayer = 0;
    game.currentRound++;

    if (game.currentRound >= HALVE_IT_ROUNDS.length) {
      game.finished = true;
    }
  }
}

export function undo(game) {
  game.lastDart = null;
  if (!game.history.length) return;
  Object.assign(game, game.history.pop());
}