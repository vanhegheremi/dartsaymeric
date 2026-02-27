import {
  HALVE_IT_ROUNDS,
  EXACT_TARGETS,
  getSegmentColor,
  COLOR_EMOJI
} from "../models/halveIt.js";

// Round types where we auto-accumulate darts + validate at endTurn
const ACCUMULATE_TYPES = new Set(["exact", "sameColor", "threeColors"]);

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function multLabel(m) {
  return m === 1 ? "" : m === 2 ? "D" : "T";
}

// ── History helpers: avoid O(N²) clone growth ──────────────────────────────
function pushHistory(game) {
  const snap = structuredClone({ ...game, history: [] });
  game.history.push(snap);
  if (game.history.length > 12) game.history.shift(); // hard cap
}

function restoreHistory(game) {
  if (!game.history.length) return;
  const prev = game.history.pop();
  const savedHistory = [...game.history];
  Object.assign(game, prev);
  game.history = savedHistory;
}

// ─────────────────────────────────────────────────────────────────────────────

export function createHalveItGame(players) {
  return {
    players: players.map(p => ({
      ...p,
      score: 0,
      lastDarts: ["-", "-", "-"],
      hitThisRound: false,
      roundScore: 0,
      roundDarts: []        // [{value, mult, color}] for colour-based rounds
    })),
    currentPlayer: 0,
    currentRound: 0,
    currentDart: 0,
    exactMultiplier: 1,
    history: [],
    finished: false,
    lastDart: null
  };
}

export function throwDart(game, hit) {
  if (game.finished) return;
  pushHistory(game);

  const player = game.players[game.currentPlayer];
  const round  = HALVE_IT_ROUNDS[game.currentRound];

  let validHit = false;
  let score    = 0;

  game.lastDart = hit === "miss"
    ? { label: "Miss", value: 0 }
    : {
        label: `${multLabel(hit.mult)}${hit.value}`,
        value: hit.value, mult: hit.mult
      };

  if (hit !== "miss") {
    const { value, mult } = hit;

    // ── accumulate-type rounds ──────────────────────────────────────────
    if (ACCUMULATE_TYPES.has(round.type)) {
      score = value === "bull" ? 25 * mult : Number(value) * mult;
      player.roundScore += score;
      player.score      += score;
      player.hitThisRound = true;

      const color  = getSegmentColor(value, mult);
      const emoji  = COLOR_EMOJI[color];
      player.roundDarts.push({ value, mult, color });
      player.lastDarts[game.currentDart] = `${multLabel(mult)}${value}${emoji}`;
      game.currentDart++;
      return;
    }

    // ── colour-target round (red / green) ───────────────────────────────
    if (round.type === "color") {
      const dartColor = getSegmentColor(value, mult);
      validHit = dartColor === round.color;
      if (validHit) {
        score = value === "bull" ? 25 * mult : Number(value) * mult;
      }
      const emoji = COLOR_EMOJI[dartColor];
      player.lastDarts[game.currentDart] = `${multLabel(mult)}${value}${emoji}`;
      if (validHit) { player.score += score; player.hitThisRound = true; }
      game.currentDart++;
      return;
    }

    // ── standard rounds ─────────────────────────────────────────────────
    switch (round.type) {
      case "number": validHit = value === round.target; break;
      case "double": validHit = mult  === 2;            break;
      case "triple": validHit = mult  === 3;            break;
      case "bull":   validHit = value === "bull";       break;
    }

    if (validHit) {
      score = value === "bull" ? 25 * mult : Number(value) * mult;
      player.score += score;
      player.hitThisRound = true;
    }
  } else {
    // miss in accumulate / colour round: track for colour logic
    if (ACCUMULATE_TYPES.has(round.type) || round.type === "color") {
      player.roundDarts.push({ value: 0, mult: 0, color: "none" });
    }
  }

  player.lastDarts[game.currentDart] =
    hit === "miss" ? "0" : `${multLabel(hit.mult)}${hit.value}`;
  game.currentDart++;
}

export function endTurn(game) {
  const player = game.players[game.currentPlayer];
  const round  = HALVE_IT_ROUNDS[game.currentRound];

  // ── exact score validation ──────────────────────────────────────────────
  if (round.type === "exact") {
    const hit = EXACT_TARGETS.includes(player.roundScore || 0);
    if (!hit) { player.score -= (player.roundScore || 0); player.hitThisRound = false; }
    else        player.hitThisRound = true;
  }

  // ── three-colours validation ────────────────────────────────────────────
  if (round.type === "threeColors") {
    const realColors = new Set(
      (player.roundDarts || []).filter(d => d.color !== "none").map(d => d.color)
    );
    const hit = realColors.size >= 3;
    if (!hit) { player.score -= (player.roundScore || 0); player.hitThisRound = false; }
    else        player.hitThisRound = true;
  }

  // ── same-colour validation ──────────────────────────────────────────────
  if (round.type === "sameColor") {
    const darts     = (player.roundDarts || []);
    const hasMiss   = darts.some(d => d.color === "none");
    const realColors = new Set(darts.filter(d => d.color !== "none").map(d => d.color));
    const hit = !hasMiss && realColors.size === 1 && darts.length > 0;
    if (!hit) { player.score -= (player.roundScore || 0); player.hitThisRound = false; }
    else        player.hitThisRound = true;
  }

  _finalizeAndAdvance(game);
}

function _finalizeAndAdvance(game) {
  const player = game.players[game.currentPlayer];

  if (!player.hitThisRound) {
    player.score = Math.ceil(player.score / 2);
  }

  player.hitThisRound  = false;
  player.roundScore    = 0;
  player.roundDarts    = [];
  player.lastDarts     = ["-", "-", "-"];
  game.currentDart     = 0;
  game.exactMultiplier = 1;
  game.lastDart        = null;

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
  restoreHistory(game);
}
