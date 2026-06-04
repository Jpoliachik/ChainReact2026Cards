/**
 * Chain React trading-card renderer.
 *
 * Ported from the Bob Ross trading-card tool (the "actual visual"): a
 * Pokémon-style card at 816×1110 built from Tailwind classes (see
 * public/card.css) — thick yellow border, gradient background, name plate,
 * HP + type icon, framed character art, saying, and two named moves with
 * damage values.
 *
 * Field mapping (our cards.json -> this renderer):
 *   name              -> name plate
 *   hp                -> HP value
 *   image             -> framed character art (e.g. "art/<id>.png")
 *   saying            -> italic tagline under the art
 *   moves[].name      -> move title (with the move's type icon inline beside it)
 *   moves[].type, .description, .damage -> move row
 *   type              -> card's headline type (HP icon) — falls back to move 1
 *   backgroundColor   -> "green" | ["purple","pink"] | …  (palette below)
 *
 * Pure presentation: internal fields (description, imagePrompt) are ignored.
 * Works in the browser and under Node (module.exports) so the gallery,
 * export.js, and build.js all share one source of truth.
 */

// Pokémon-elemental type system. Each type -> circular icon badge + color.
// Icons live in public/icons/ and are rendered white via a CSS invert filter.
const TYPE_CONFIG = {
  nature: { icon: "tree.svg", color: "#16a34a", name: "Nature" },
  fire: { icon: "flame.svg", color: "#dc2626", name: "Fire" },
  psychic: { icon: "eye.svg", color: "#9333ea", name: "Psychic" },
  water: { icon: "droplet.svg", color: "#2563eb", name: "Water" },
  electric: { icon: "bolt.svg", color: "#eab308", name: "Electric" },
  cosmic: { icon: "spiral.svg", color: "#ec4899", name: "Cosmic" },
  toxic: { icon: "biohazard.svg", color: "#84cc16", name: "Toxic" },
  dream: { icon: "moon.svg", color: "#4f46e5", name: "Dream" },
  crystal: { icon: "gem.svg", color: "#06b6d4", name: "Crystal" },
  sound: { icon: "music.svg", color: "#ea580c", name: "Sound" },
  strength: { icon: "dumbbell.svg", color: "#dc2626", name: "Strength" },
};

const COLOR_MAP = {
  indigo: "#4c1d95",
  purple: "#6b21a8",
  green: "#166534",
  blue: "#1e3a8a",
  red: "#991b1b",
  yellow: "#a16207",
  pink: "#be185d",
  orange: "#c2410c",
  teal: "#115e59",
  cyan: "#155e75",
};

function typeOf(key) {
  return TYPE_CONFIG[key] || TYPE_CONFIG.nature;
}

// Resolve backgroundColor into a CSS background — single solid or a left→right
// two-color gradient.
function backgroundStyle(backgroundColor) {
  if (Array.isArray(backgroundColor) && backgroundColor.length >= 2) {
    const c1 = COLOR_MAP[backgroundColor[0]] || COLOR_MAP.indigo;
    const c2 = COLOR_MAP[backgroundColor[1]] || COLOR_MAP.purple;
    return `linear-gradient(to right, ${c1}, ${c2})`;
  }
  return COLOR_MAP[backgroundColor] || COLOR_MAP.indigo;
}

function moveHtml(move) {
  const { name, type, description, damage } = move;
  const t = typeOf(type);
  return `
    <div class="flex items-center justify-between gap-4 w-full p-1">
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full flex items-center justify-center" style="background-color: ${t.color}; flex-shrink: 0;">
            <img src="icons/${t.icon}" class="w-6 h-6 filter brightness-0 invert" />
          </div>
          <span class="font-bold text-3xl">${name}</span>
        </div>
        <div class="mt-1 leading-snug" style="font-size: 1.625rem;">${description}</div>
      </div>
      <div class="text-4xl font-bold text-yellow-400">${damage ?? ""}</div>
    </div>`;
}

function createCard(cardData) {
  const { name, hp, image, saying, moves = [], backgroundColor = "indigo" } = cardData;
  // Card headline type: explicit `type`, else the first move's type.
  const headlineType = typeOf(cardData.type || (moves[0] && moves[0].type));

  return `
    <div class="card-root w-[816px] h-[1110px] text-white rounded-3xl overflow-hidden relative border-[12px] border-yellow-500" style="background: ${backgroundStyle(backgroundColor)};">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 via-60% to-black pointer-events-none"></div>
      <div class="relative z-10 flex flex-col px-12 py-14 h-full">
        <div class="flex flex-row justify-between">
          <div class="px-6 py-2 bg-black border-4 border-yellow-500 rounded-xl font-extrabold text-3xl">
            ${name}
          </div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-2xl">${hp} HP</span>
            <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: ${headlineType.color};">
              <img src="icons/${headlineType.icon}" class="w-6 h-6 filter brightness-0 invert" />
            </div>
          </div>
        </div>

        <img src="${image}" class="mt-2 w-full object-cover rounded-xl border-4 border-yellow-500" style="height: 520px;" />

        <div class="mt-1 py-6 text-center border-y border-slate-500 text-3xl italic">
          "${saying}"
        </div>

        <div class="mt-2 flex flex-1 flex-col gap-4 justify-center">
          ${moves.map(moveHtml).join("")}
        </div>
      </div>
    </div>`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { createCard, TYPE_CONFIG, COLOR_MAP };
}
