// Local server for the Chain React Cards gallery.
// Zero-dependency (built-in fetch + a tiny .env parser).
//   node server.js   ->   http://localhost:4317
//
// Endpoints:
//   GET  /api/cards      -> the cards.json payload
//   POST /api/generate   -> { id }  generate art for one card via Gemini
//                           ("Nano Banana" = gemini-2.5-flash-image)
//
// Needs a GEMINI_API_KEY (see .env.example). Grab one at
//   https://aistudio.google.com/apikey

import { createServer } from "node:http";
import { readFile, writeFile, mkdir, rename, unlink } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4317;
const CARDS_PATH = join(__dirname, "cards.json");
const PUBLIC_DIR = join(__dirname, "public");
const ART_DIR = join(PUBLIC_DIR, "art");

// Non-destructive art slots per card live side by side in ART_DIR:
//   <id>.png        canonical  — the chosen art (gallery + export read this)
//   <id>.new.png    candidate  — a fresh regeneration awaiting keep/discard
//   <id>.prev.png   previous   — one-deep undo, the last canonical before a keep
// Regenerate writes the candidate and never touches canonical/cards.json until
// you keep it. The .new/.prev slots are gitignored — only canonical is committed.
const ART_EXTS = ["png", "jpg", "jpeg", "webp"];
function slotFile(id, suffix = "") {
  for (const ext of ART_EXTS) {
    const name = `${id}${suffix}.${ext}`;
    if (existsSync(join(ART_DIR, name))) return name;
  }
  return null;
}

// ── tiny .env loader (no dependency) ────────────────────────────────────────
function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf-8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && !(key in process.env)) process.env[key] = val;
  }
}
loadEnv(join(__dirname, ".env"));

const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
// Matches the gallery's 5:4 card art slot so the art is composed, not cropped.
const ASPECT_RATIO = process.env.GEMINI_ASPECT_RATIO || "5:4";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}
const sendJson = (res, status, obj) =>
  send(res, status, JSON.stringify(obj), MIME[".json"]);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// Combine shared art direction with the card's own prompt — same shape the
// gallery shows under "copy full".
function buildPrompt(meta, card) {
  const dir = meta.artDirection || "";
  const tail =
    "\n\nReminder: output the character illustration ONLY — no card frame, border, text, or stat boxes.";
  return dir
    ? `${dir}\n\nCharacter — ${card.name}: ${card.imagePrompt}${tail}`
    : card.imagePrompt;
}

// Pull the first inline image out of a Gemini generateContent response.
function extractImage(json) {
  const parts = json?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const inline = p.inlineData || p.inline_data;
    if (inline?.data) {
      return { data: inline.data, mime: inline.mimeType || inline.mime_type };
    }
  }
  return null;
}

// Serialize cards.json writes so concurrent generates can't clobber each
// other, and re-read the file fresh on every persist so we only ever change
// this one card's image — never write back a stale whole-doc snapshot.
let writeChain = Promise.resolve();
function persistImage(id, image) {
  const task = async () => {
    const raw = await readFile(CARDS_PATH, "utf-8");
    const doc = JSON.parse(raw);
    const card = doc.cards.find((c) => c.id === id);
    if (!card) return;
    await writeFile(`${CARDS_PATH}.bak`, raw);
    card.image = image;
    await writeFile(CARDS_PATH, JSON.stringify(doc, null, 2) + "\n");
  };
  writeChain = writeChain.then(task, task);
  return writeChain;
}

async function generateCard(id) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      status: 400,
      body: {
        ok: false,
        error:
          "No GEMINI_API_KEY set. Copy .env.example to .env and add your key (https://aistudio.google.com/apikey).",
      },
    };
  }

  const raw = await readFile(CARDS_PATH, "utf-8");
  const doc = JSON.parse(raw);
  const card = doc.cards.find((c) => c.id === id);
  if (!card) return { status: 404, body: { ok: false, error: `No card "${id}"` } };

  const prompt = buildPrompt(doc.meta || {}, card);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  let resp;
  try {
    resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { imageConfig: { aspectRatio: ASPECT_RATIO } },
      }),
    });
  } catch (err) {
    return { status: 502, body: { ok: false, error: `Network error: ${err}` } };
  }

  const json = await resp.json().catch(() => null);
  if (!resp.ok) {
    const msg = json?.error?.message || `Gemini returned ${resp.status}`;
    return { status: 502, body: { ok: false, error: msg } };
  }

  const img = extractImage(json);
  if (!img) {
    const finish = json?.candidates?.[0]?.finishReason;
    return {
      status: 502,
      body: {
        ok: false,
        error: `No image in response${finish ? ` (finishReason: ${finish})` : ""}. The prompt may have been blocked.`,
      },
    };
  }

  await mkdir(ART_DIR, { recursive: true });
  const ext = img.mime?.includes("jpeg") ? "jpg" : "png";
  const buf = Buffer.from(img.data, "base64");

  // If this card already has canonical art, this is a REGENERATE: write a pending
  // candidate (.new) and leave the canonical + cards.json untouched so the old
  // art survives for an A/B compare. Otherwise it's a first generation: write the
  // canonical directly and persist, the original behavior.
  if (slotFile(id, "")) {
    const stale = slotFile(id, ".new");
    if (stale) await unlink(join(ART_DIR, stale));
    const fileName = `${id}.new.${ext}`;
    await writeFile(join(ART_DIR, fileName), buf);
    const current = card.image || `art/${slotFile(id, "")}`;
    return { status: 200, body: { ok: true, id, pending: true, candidate: `art/${fileName}`, current } };
  }

  const fileName = `${id}.${ext}`;
  await writeFile(join(ART_DIR, fileName), buf);
  // persistImage re-reads the file fresh under a write lock and touches only this
  // card, so a concurrent generate or manual edit during the slow call survives.
  const image = `art/${fileName}`;
  await persistImage(id, image);
  return { status: 200, body: { ok: true, id, pending: false, image } };
}

// Promote the pending candidate to canonical, demoting the old canonical to the
// one-deep undo slot (.prev). Persists the new canonical path into cards.json.
async function keepCandidate(id) {
  const cand = slotFile(id, ".new");
  if (!cand) return { status: 400, body: { ok: false, error: "No pending art to keep" } };
  const current = slotFile(id, "");
  if (current) {
    const oldPrev = slotFile(id, ".prev");
    if (oldPrev) await unlink(join(ART_DIR, oldPrev));
    const curExt = current.split(".").pop();
    await rename(join(ART_DIR, current), join(ART_DIR, `${id}.prev.${curExt}`));
  }
  const ext = cand.split(".").pop();
  const fileName = `${id}.${ext}`;
  await rename(join(ART_DIR, cand), join(ART_DIR, fileName));
  const image = `art/${fileName}`;
  await persistImage(id, image);
  return { status: 200, body: { ok: true, id, image } };
}

// Drop the pending candidate, keeping the current canonical as-is.
async function discardCandidate(id) {
  const cand = slotFile(id, ".new");
  if (cand) await unlink(join(ART_DIR, cand));
  return { status: 200, body: { ok: true, id } };
}

// One-deep undo: restore the .prev canonical, discarding the current one.
async function revertCanonical(id) {
  const prev = slotFile(id, ".prev");
  if (!prev) return { status: 400, body: { ok: false, error: "No previous art to revert to" } };
  const current = slotFile(id, "");
  if (current) await unlink(join(ART_DIR, current));
  const ext = prev.split(".").pop();
  const fileName = `${id}.${ext}`;
  await rename(join(ART_DIR, prev), join(ART_DIR, fileName));
  const image = `art/${fileName}`;
  await persistImage(id, image);
  return { status: 200, body: { ok: true, id, image } };
}

// Report which cards have a pending candidate and/or an undo slot, so the gallery
// can show the A/B compare and revert affordances on load.
async function artState() {
  const doc = JSON.parse(await readFile(CARDS_PATH, "utf-8"));
  const state = {};
  for (const c of doc.cards) {
    const cand = slotFile(c.id, ".new");
    const prev = slotFile(c.id, ".prev");
    if (cand || prev) state[c.id] = { candidate: cand ? `art/${cand}` : null, prev: !!prev };
  }
  return state;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === "/api/cards") {
      const data = await readFile(CARDS_PATH, "utf-8");
      return send(res, 200, data, MIME[".json"]);
    }

    // Serve the shared card renderer (lives outside public/ so export.js and
    // the gallery share one source of truth).
    if (url.pathname === "/render/card.js") {
      const data = await readFile(join(__dirname, "render", "card.js"));
      return send(res, 200, data, MIME[".js"]);
    }

    if (url.pathname === "/api/art/state") {
      return sendJson(res, 200, await artState());
    }

    // generate / keep / discard / revert all take { id } and return { status, body }.
    const idActions = {
      "/api/generate": generateCard,
      "/api/art/keep": keepCandidate,
      "/api/art/discard": discardCandidate,
      "/api/art/revert": revertCanonical,
    };
    if (idActions[url.pathname] && req.method === "POST") {
      const body = JSON.parse((await readBody(req)) || "{}");
      if (!body.id) return sendJson(res, 400, { ok: false, error: "Missing id" });
      const { status, body: out } = await idActions[url.pathname](body.id);
      return sendJson(res, status, out);
    }

    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = join(PUBLIC_DIR, path);
    if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, "forbidden");
    const file = await readFile(filePath);
    return send(res, 200, file, MIME[extname(filePath)] || "application/octet-stream");
  } catch (err) {
    if (err.code === "ENOENT") return send(res, 404, "not found");
    return send(res, 500, String(err));
  }
});

server.listen(PORT, () => {
  const keyState = process.env.GEMINI_API_KEY ? "✓ key loaded" : "✗ no GEMINI_API_KEY";
  console.log(`\n  Chain React Cards  →  http://localhost:${PORT}`);
  console.log(`  Gemini: ${GEMINI_MODEL}  (${keyState})\n`);
});
