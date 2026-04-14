// Round sequence per KOTO board specification
export const HALVE_IT_ROUNDS = [
  { label: "Target 20",      type: "number",      target: 20          },
  { label: "Target 19",      type: "number",      target: 19          },
  { label: "Target 18",      type: "number",      target: 18          },
  { label: "Target 17",      type: "number",      target: 17          },
  { label: "Target 16",      type: "number",      target: 16          },
  { label: "Target 15",      type: "number",      target: 15          },

  { label: "Rouge",          type: "color",       color: "red"        },
  { label: "3 Couleurs",     type: "threeColors"                      },
  { label: "Vert",           type: "color",       color: "green"      },
  { label: "Score Exact",    type: "exact"                            },
  { label: "Même Couleur",   type: "sameColor"                        },

  { label: "Bull",           type: "bull"                             }
];

// Fixed exact score targets per spec
export const EXACT_TARGETS = [41, 82, 123];

// KOTO board colour mapping
// "Even" board segments (black on single, red on double/triple)
export const EVEN_SEGS = new Set([20, 18, 13, 10, 2, 3, 7, 8, 14, 12]);

export function getSegmentColor(value, mult) {
  if (value === "bull") return mult === 2 ? "red" : "green";
  const v      = Number(value);
  const isEven = EVEN_SEGS.has(v);
  if (mult === 1) return isEven ? "black" : "white";
  return isEven ? "red" : "green";
}

export const COLOR_EMOJI = { black: "⬛", white: "⬜", red: "🔴", green: "🟢" };
