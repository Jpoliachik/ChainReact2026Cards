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
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4317;
const CARDS_PATH = join(__dirname, "cards.json");
const PUBLIC_DIR = join(__dirname, "public");
const ART_DIR = join(PUBLIC_DIR, "art");

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
  const fileName = `${id}.${ext}`;
  await writeFile(join(ART_DIR, fileName), Buffer.from(img.data, "base64"));

  // Persist the image path back into cards.json. persistImage re-reads the
  // file fresh under a write lock and touches only this card, so a concurrent
  // generate or manual edit made during the (slow) Gemini call above survives.
  const image = `art/${fileName}`;
  await persistImage(id, image);

  return { status: 200, body: { ok: true, id, image } };
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

    if (url.pathname === "/api/generate" && req.method === "POST") {
      const body = JSON.parse((await readBody(req)) || "{}");
      if (!body.id) return sendJson(res, 400, { ok: false, error: "Missing id" });
      const { status, body: out } = await generateCard(body.id);
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
