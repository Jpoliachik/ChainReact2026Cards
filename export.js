// Render every card to a print-ready PNG (816×1110 @ 300 DPI) using the
// shared renderer (render/card.js) + the card stylesheet (public/card.css).
//
//   node export.js          -> card-exports/<id>.png for all cards
//   node export.js <id> …   -> only the given card ids
//
// Needs puppeteer (headless Chromium) + sharp. A temp HTML page is written
// into public/ so card.css, icons/, and art/ all resolve relatively, then
// removed.

import puppeteer from "puppeteer";
import sharp from "sharp";
import { readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cardRenderHash } from "./render-hash.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CARDS_PATH = join(__dirname, "cards.json");
const RENDERER_PATH = join(__dirname, "render", "card.js");
const PUBLIC_DIR = join(__dirname, "public");
const TEMP_HTML = join(PUBLIC_DIR, "__export.html");
const OUT_DIR = join(__dirname, "card-exports");
// Per-card hash of the rendered text fields, so check:exports can detect when
// cards.json text drifts from what was last exported (not just stale art).
const MANIFEST_PATH = join(OUT_DIR, ".manifest.json");

const WIDTH = 816;
const HEIGHT = 1110;

async function main() {
  const only = process.argv.slice(2);
  const doc = JSON.parse(await readFile(CARDS_PATH, "utf-8"));
  const cards = only.length
    ? doc.cards.filter((c) => only.includes(c.id))
    : doc.cards;
  if (!cards.length) {
    console.error(only.length ? `No cards matched: ${only.join(", ")}` : "No cards.");
    process.exit(1);
  }

  // render/card.js declares createCard as a top-level function, so loading it
  // as a page <script> exposes it globally. Inline the source + card data so
  // we don't depend on cross-directory file:// paths for the JS.
  const rendererSrc = await readFile(RENDERER_PATH, "utf-8");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
<link rel="stylesheet" href="card.css" />
<style>body{margin:0;padding:0;background:transparent} .rounded-3xl{border-radius:0 !important}</style>
<script>${rendererSrc}</script>
</head><body><div id="stage"></div>
<script>
  window.__CARDS = ${JSON.stringify(cards)};
  window.renderById = function (id) {
    const card = window.__CARDS.find((c) => c.id === id);
    if (!card) return false;
    document.getElementById("stage").innerHTML = createCard(card);
    return true;
  };
</script></body></html>`;

  await writeFile(TEMP_HTML, html);
  await mkdir(OUT_DIR, { recursive: true });

  const exported = [];
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });
    await page.goto(`file://${TEMP_HTML}`, { waitUntil: "networkidle0" });

    for (const card of cards) {
      await page.evaluate((id) => window.renderById(id), card.id);
      // Wait for the character art to fully decode before the screenshot.
      await page.evaluate(async () => {
        const img = document.querySelector(".card-root img");
        if (img && !img.complete) {
          await new Promise((res) => {
            img.onload = img.onerror = res;
          });
        }
      });

      const el = await page.$(".card-root");
      if (!el) {
        console.warn(`! skipped ${card.id} (no card element)`);
        continue;
      }
      const raw = await el.screenshot({ omitBackground: true });
      const out = join(OUT_DIR, `${card.id}.png`);
      await sharp(raw)
        .resize(WIDTH, HEIGHT, { fit: "fill", kernel: sharp.kernel.lanczos3 })
        .withMetadata({ density: 300 })
        .png({ compressionLevel: 9 })
        .toFile(out);
      exported.push(card);
      console.log(`✓ ${card.id}.png  (${WIDTH}×${HEIGHT} @ 300dpi)`);
    }
  } finally {
    await browser.close();
    await unlink(TEMP_HTML).catch(() => {});
  }

  // Record the rendered-text hash of every card we exported (merging into any
  // existing manifest so a single-card export doesn't drop the other entries).
  let manifest = {};
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8"));
  } catch {
    /* no manifest yet — start fresh */
  }
  for (const card of exported) manifest[card.id] = cardRenderHash(card);
  const ordered = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
  await writeFile(MANIFEST_PATH, JSON.stringify(ordered, null, 2) + "\n");

  console.log(`\n  Exported ${exported.length} card(s) to card-exports/\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
