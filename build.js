// Build a single self-contained, view-only HTML file of the whole deck —
// card data inlined, art embedded as base64, no server / no API key / no JS.
// Internal fields (character description, image prompt) are dropped.
//
//   node build.js   ->   dist/chain-react-cards.html
//
// Send that one file over Slack; it opens offline anywhere.

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CARDS_PATH = join(__dirname, "cards.json");
const PUBLIC_DIR = join(__dirname, "public");
const OUT_DIR = join(__dirname, "dist");
const OUT_FILE = join(OUT_DIR, "chain-react-cards.html");

const IMG_MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const esc = (s) =>
  (s || "").replace(
    /[&<>"]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]),
  );

// Read an art file and return a base64 data URI, or null if it's missing.
async function dataUri(imageRel) {
  const rel = imageRel.split("?")[0]; // strip any cache-bust query
  const file = join(PUBLIC_DIR, rel);
  try {
    const buf = await readFile(file);
    const mime = IMG_MIME[extname(file).toLowerCase()] || "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null; // file gone -> fall back to placeholder
  }
}

function cardHtml(card, imgSrc) {
  const art = imgSrc
    ? `<div class="art"><img src="${imgSrc}" alt="${esc(card.name)}"/></div>`
    : `<div class="art">
         <div class="placeholder"><span class="glyph">✦</span><span class="pending">art pending</span></div>
         <div class="frame"></div>
       </div>`;
  const moves = (card.moves || [])
    .map(
      (m) => `
      <div class="move">
        <div class="mname">${esc(m.name)}</div>
        <div class="mdesc">${esc(m.description)}</div>
      </div>`,
    )
    .join("");
  return `
    <div class="card">
      ${art}
      <div class="meta">
        <div class="name">${esc(card.name)}</div>
        <div class="saying">“${esc(card.saying)}”</div>
        <div class="moves">${moves}</div>
      </div>
    </div>`;
}

const STYLE = `
  :root {
    --bg: #14131a; --panel: #1d1b26; --panel-2: #252330; --ink: #ece9f5;
    --muted: #9b96b0; --faint: #5d5872; --line: #2f2c3d; --gold: #d9b35e;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink);
    font: 15px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .wrap { max-width: 1200px; margin: 0 auto; padding: 32px 24px 120px; }
  header { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
  h1 { font: 600 28px/1 "Iowan Old Style", Georgia, serif; letter-spacing: .2px; margin: 0; }
  .sub { color: var(--muted); font-size: 13px; }
  .count { margin-left: auto; font-size: 13px; color: var(--muted); }
  .count b { color: var(--ink); }
  .grid { display: grid; gap: 20px; margin-top: 24px;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); }
  .card { background: var(--panel); border: 1px solid var(--line); border-radius: 16px;
    overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
  .art { aspect-ratio: 5 / 4; position: relative; display: flex; align-items: center;
    justify-content: center; border-bottom: 1px solid var(--line);
    background: radial-gradient(120% 90% at 50% 0%, #d9b35e1f, transparent 70%),
      repeating-linear-gradient(45deg, #00000000 0 14px, #ffffff06 14px 15px); }
  .art img { width: 100%; height: 100%; object-fit: cover; }
  .art .placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .art .glyph { font-size: 32px; color: var(--gold); opacity: .85; }
  .art .pending { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--faint); }
  .art .frame { position: absolute; inset: 10px; border: 1px solid #d9b35e44; border-radius: 10px; }
  .meta { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
  .name { font: 600 22px/1.2 "Iowan Old Style", Georgia, serif; }
  .saying { font-size: 15px; font-style: italic; color: var(--gold);
    padding-left: 11px; border-left: 2px solid #d9b35e66; }
  .moves { display: flex; flex-direction: column; gap: 9px; }
  .move { background: var(--panel-2); border: 1px solid var(--line); border-radius: 10px; padding: 9px 11px; }
  .move .mname { font-weight: 700; font-size: 13.5px; }
  .move .mname::before { content: "⟡ "; color: var(--gold); }
  .move .mdesc { color: var(--muted); font-size: 13px; margin-top: 2px; }
`;

async function main() {
  const doc = JSON.parse(await readFile(CARDS_PATH, "utf-8"));
  const cards = doc.cards || [];

  const cardsHtml = [];
  let withArt = 0;
  for (const card of cards) {
    const src = card.image ? await dataUri(card.image) : null;
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
  console.log(`  ${cards.length} cards (${withArt} with art) · ${mb} MB\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
