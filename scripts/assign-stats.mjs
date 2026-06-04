// One-off: inject the trading-card stat fields (hp, type, backgroundColor,
// per-move type/damage/iconCount) into cards.json without disturbing the
// existing text (saying, descriptions, prompts, art). First pass of the
// "decide types + damage" step — tuned for refinement, not gospel.
//
//   node scripts/assign-stats.mjs
//
// Safe to delete once the values live in cards.json.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "cards.json");

// id -> { hp, type, backgroundColor, moves: [{type, damage, iconCount}, …] }
// Move stats are positional (same order as cards.json).
const STATS = {
  "the-gesture-jester": {
    hp: 90, type: "psychic", backgroundColor: ["purple", "pink"],
    moves: [
      { type: "psychic", damage: "50", iconCount: 2 },
      { type: "psychic", damage: "60", iconCount: 3 }, // buttery 60fps
    ],
  },
  "the-bridge-troll": {
    hp: 130, type: "nature", backgroundColor: "green",
    moves: [
      { type: "nature", damage: "30", iconCount: 2 },
      { type: "strength", damage: "90", iconCount: 3 }, // flattens/crushes
    ],
  },
  "the-reanimated-wizard": {
    hp: 100, type: "cosmic", backgroundColor: ["indigo", "purple"],
    moves: [
      { type: "cosmic", damage: "16", iconCount: 2 },   // 16ms frame budget
      { type: "electric", damage: "120", iconCount: 3 }, // springy overshoot
    ],
  },
  "the-slop-sommelier": {
    hp: 110, type: "toxic", backgroundColor: ["green", "yellow"],
    moves: [
      { type: "toxic", damage: "70", iconCount: 2 },
      { type: "toxic", damage: "100", iconCount: 3 },
    ],
  },
  "the-rubber-duck": {
    hp: 80, type: "water", backgroundColor: "blue",
    moves: [
      { type: "water", damage: "0", iconCount: 1 },     // says nothing
      { type: "psychic", damage: "200", iconCount: 2 }, // quietly omniscient
    ],
  },
  "the-console-detective": {
    hp: 100, type: "electric", backgroundColor: "orange",
    moves: [
      { type: "electric", damage: "404", iconCount: 2 }, // console.log('here')
      { type: "electric", damage: "500", iconCount: 1 }, // log shipped to prod
    ],
  },
  "the-agent-wrangler": {
    hp: 120, type: "fire", backgroundColor: ["red", "orange"],
    moves: [
      { type: "fire", damage: "1M", iconCount: 4 },     // a million tokens ablaze
      { type: "electric", damage: "6", iconCount: 3 },  // six terminals
    ],
  },
  "the-context-hoarder": {
    hp: 90, type: "psychic", backgroundColor: "purple",
    moves: [
      { type: "psychic", damage: "∞", iconCount: 4 },   // the whole repo
      { type: "toxic", damage: "50", iconCount: 2 },    // unvetted MCP
    ],
  },
  "the-dependency-prepper": {
    hp: 140, type: "toxic", backgroundColor: "green",
    moves: [
      { type: "toxic", damage: "11", iconCount: 1 },    // 11 lines of left-pad
      { type: "strength", damage: "90", iconCount: 3 }, // vendor everything
    ],
  },
  "the-prompt-whisperer": {
    hp: 70, type: "psychic", backgroundColor: "purple",
    moves: [
      { type: "psychic", damage: "200", iconCount: 2 }, // a $200 tip
      { type: "psychic", damage: "40", iconCount: 1 },
    ],
  },
  "the-nights-watch": {
    hp: 160, type: "dream", backgroundColor: ["blue", "indigo"],
    moves: [
      { type: "dream", damage: "4K", iconCount: 3 },    // 4000-line diff
      { type: "dream", damage: "100", iconCount: 3 },   // hold the wall
    ],
  },
  "the-ai-triforce": {
    hp: 150, type: "crystal", backgroundColor: ["yellow", "green"],
    moves: [
      { type: "crystal", damage: "3", iconCount: 3 },   // power split 3 ways
      { type: "crystal", damage: "110", iconCount: 2 }, // guard the gates
    ],
  },
  "the-demo-illusionist": {
    hp: 90, type: "psychic", backgroundColor: "purple",
    moves: [
      { type: "psychic", damage: "80", iconCount: 2 },
      { type: "psychic", damage: "200", iconCount: 1 }, // stubbed 200 OK
    ],
  },
  "the-pixel-surgeon": {
    hp: 100, type: "crystal", backgroundColor: ["teal", "cyan"],
    moves: [
      { type: "crystal", damage: "1", iconCount: 2 },   // one point
      { type: "crystal", damage: "2", iconCount: 1 },   // two pixels off
    ],
  },
  "the-upgrade-monk": {
    hp: 130, type: "water", backgroundColor: ["orange", "yellow"],
    moves: [
      { type: "water", damage: "40", iconCount: 3 },    // forty breaking changes
      { type: "water", damage: "100", iconCount: 2 },   // bears the whole bump
    ],
  },
};

const doc = JSON.parse(await readFile(path, "utf-8"));

doc.cards = doc.cards.map((card) => {
  const s = STATS[card.id];
  if (!s) throw new Error(`No stats mapping for ${card.id}`);
  if (s.moves.length !== card.moves.length) {
    throw new Error(`Move count mismatch for ${card.id}`);
  }
  // Rebuild each card with a clean, stable key order.
  return {
    id: card.id,
    name: card.name,
    hp: s.hp,
    type: s.type,
    saying: card.saying,
    moves: card.moves.map((m, i) => ({
      name: m.name,
      type: s.moves[i].type,
      damage: s.moves[i].damage,
      iconCount: s.moves[i].iconCount,
      description: m.description,
    })),
    backgroundColor: s.backgroundColor,
    description: card.description,
    imagePrompt: card.imagePrompt,
    image: card.image,
  };
});

await writeFile(path, JSON.stringify(doc, null, 2) + "\n");
console.log(`Updated ${doc.cards.length} cards with stats.`);
