// Catch the #1 trap in this repo: raw art changed (public/art/<id>.png) but the
// rasterized card (card-exports/<id>.png) was never re-exported, so the published
// GitHub Pages site keeps showing the OLD art. (See the two-art-layers note in
// CLAUDE.md — `pnpm export <id>` is mandatory after any art swap or visible edit.)
//
//   pnpm check:exports     -> report stale / missing exports; exit 1 if any
//
// Staleness signals, because each alone misses cases:
//   • committed:    public/art/<id>.png has a newer last-commit than its export
//                   (this is exactly what shipped stale to the live site).
//   • working tree: public/art/<id>.png has a newer mtime on disk than its export
//                   (art edited/regenerated locally, export not yet re-run).
//   • TEXT drift:   a card's rendered fields (name/hp/type/saying/moves/colors)
//                   changed in cards.json since its last export, so the baked-in
//                   text is stale. Detected via card-exports/.manifest.json, the
//                   per-card hash written by `pnpm export`. (Timestamps can't see
//                   this — cards.json is one file shared by all cards.)
// Plus: a card whose `image` is set but has no export at all.

import { readFile, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { cardRenderHash } from "./render-hash.js";

const run = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const CARDS_PATH = join(__dirname, "cards.json");
const MANIFEST_PATH = join(__dirname, "card-exports", ".manifest.json");

/** Last-commit ISO date for a path, or null if never committed / untracked. */
async function lastCommit(relPath) {
  try {
    const { stdout } = await run("git", ["log", "-1", "--format=%cI", "--", relPath], {
      cwd: __dirname,
    });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

/** File mtime in ms, or null if the file is absent. */
async function mtime(absPath) {
  try {
    return (await stat(absPath)).mtimeMs;
  } catch {
    return null;
  }
}

async function main() {
  const doc = JSON.parse(await readFile(CARDS_PATH, "utf-8"));
  const issues = [];

  let manifest = {};
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8"));
  } catch {
    /* no manifest yet — text-drift check is skipped until first `pnpm export` */
  }

  for (const card of doc.cards) {
    const { id, image } = card;
    const artRel = `public/art/${id}.png`;
    const expRel = `card-exports/${id}.png`;
    const expAbs = join(__dirname, expRel);
    const artAbs = join(__dirname, artRel);

    const expMtime = await mtime(expAbs);

    // A card with art but no rendered export at all.
    if (image && expMtime === null) {
      issues.push(`${id} — MISSING export (card has art; run \`pnpm export ${id}\`)`);
      continue;
    }
    if (expMtime === null) continue; // no export and no art — nothing to compare

    // TEXT drift: rendered fields changed in cards.json since the last export.
    const recorded = manifest[id];
    if (recorded !== undefined && recorded !== cardRenderHash(card)) {
      issues.push(
        `${id} — STALE text (name/hp/type/saying/moves/colors changed since export; run \`pnpm export ${id}\`)`,
      );
      continue;
    }

    // On-disk mtime is authoritative when it's decisive: a few seconds of slack
    // (SKEW) absorbs clone/checkout jitter where every file lands at ~the same time.
    const SKEW = 2000;
    const artMtime = await mtime(artAbs);

    // 1) working-tree staleness: art is clearly newer on disk than its export.
    if (artMtime !== null && artMtime - expMtime > SKEW) {
      issues.push(`${id} — STALE export (art newer on disk; run \`pnpm export ${id}\` and commit)`);
      continue;
    }
    // 2) export clearly newer on disk → genuinely fresh (e.g. just re-exported,
    //    even if not yet committed). git history can't override that.
    if (artMtime !== null && expMtime - artMtime > SKEW) continue;

    // 3) mtimes inconclusive (fresh clone, equal timestamps): fall back to git —
    //    art committed after its export is the staleness that shipped to the site.
    const [artCommit, expCommit] = await Promise.all([lastCommit(artRel), lastCommit(expRel)]);
    if (artCommit && expCommit && artCommit > expCommit) {
      issues.push(
        `${id} — STALE export (art committed ${artCommit.slice(0, 19)} AFTER export ${expCommit.slice(0, 19)}; run \`pnpm export ${id}\`)`,
      );
    }
  }

  if (issues.length) {
    console.error(`✗ ${issues.length} export(s) out of sync with their art:\n`);
    for (const i of issues) console.error(`  • ${i}`);
    console.error(`\nThe live site renders card-exports/, so these show OLD art until re-exported.`);
    process.exit(1);
  }
  console.log(`✓ All ${doc.cards.length} exports are in sync with their art.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
