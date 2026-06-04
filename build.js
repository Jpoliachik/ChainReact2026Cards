// Build a single self-contained, view-only HTML file of the whole deck —
// the finished card PNGs (from `pnpm export`) embedded as base64, no server /
// no API key / no JS. Internal fields are never included.
//
//   pnpm export   ->  card-exports/<id>.png   (render the cards first)
//   node build.js ->  dist/chain-react-cards.html
//
// Send that one file over Slack; it opens offline anywhere. Cards without an
// export yet fall back to an "art pending" placeholder.

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CARDS_PATH = join(__dirname, "cards.json");
const EXPORT_DIR = join(__dirname, "card-exports");
const OUT_DIR = join(__dirname, "dist");
const OUT_FILE = join(OUT_DIR, "chain-react-cards.html");

const esc = (s) =>
  (s || "").replace(
    /[&<>"]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]),
  );

// Read a card's exported PNG and return a base64 data URI, or null if missing.
async function exportUri(id) {
  try {
    const buf = await readFile(join(EXPORT_DIR, `${id}.png`));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function cardHtml(card, src) {
  if (src) {
    return `<div class="card"><img src="${src}" alt="${esc(card.name)}" /></div>`;
  }
  return `<div class="card placeholder">
      <span class="glyph">✦</span>
      <span class="pending">${esc(card.name)} — art pending</span>
    </div>`;
}

const STYLE = `
  :root { --bg: #14131a; --ink: #ece9f5; --muted: #9b96b0; --faint: #5d5872;
    --line: #2f2c3d; --gold: #d9b35e; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink);
    font: 15px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .wrap { max-width: 1280px; margin: 0 auto; padding: 32px 24px 120px; }
  header { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
  h1 { font: 600 28px/1 "Iowan Old Style", Georgia, serif; letter-spacing: .2px; margin: 0; }
  .sub { color: var(--muted); font-size: 13px; }
  .count { margin-left: auto; font-size: 13px; color: var(--muted); }
  .count b { color: var(--ink); }
  .grid { display: grid; gap: 26px; margin-top: 28px; justify-items: center;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
  .card { width: 340px; border-radius: 14px; overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.4); background: #000; }
  .card img { display: block; width: 100%; height: auto; }
  .card.placeholder { aspect-ratio: 816 / 1110; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
    border: 1px solid var(--line); background: #1d1b26; }
  .glyph { font-size: 32px; color: var(--gold); opacity: .85; }
  .pending { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--faint); }
`;

async function main() {
  const doc = JSON.parse(await readFile(CARDS_PATH, "utf-8"));
  const cards = doc.cards || [];

  const cardsHtml = [];
  let withArt = 0;
  for (const card of cards) {
    const src = await exportUri(card.id);
    if (src) withArt++;
    cardsHtml.push(cardHtml(card, src));
  }

  const event = esc(doc.meta?.event || "Chain React Cards");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Chain React Cards</title>
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Chain React Cards</h1>
    <span class="sub">${event}</span>
    <span class="count"><b>${cards.length}</b> cards</span>
  </header>
  <div class="grid">${cardsHtml.join("")}</div>
</div>
</body>
</html>
`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, html);
  const { size } = await stat(OUT_FILE);
  const mb = (size / 1024 / 1024).toFixed(1);
  console.log(`\n  Built ${OUT_FILE}`);
  console.log(`  ${cards.length} cards (${withArt} with art) · ${mb} MB`);
  if (withArt < cards.length) {
    console.log(`  ⚠ ${cards.length - withArt} missing an export — run "pnpm export" first.`);
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
