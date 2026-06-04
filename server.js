// Zero-dependency local server for the Chain React Cards ranking tool.
// Serves the UI and reads/writes cards.json (the git-tracked source of truth).
//   node server.js   ->   http://localhost:4317

import { createServer } from "node:http";
import { readFile, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4317;
const CARDS_PATH = join(__dirname, "cards.json");
const PUBLIC_DIR = join(__dirname, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString("utf-8");
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === "/api/cards" && req.method === "GET") {
      const data = await readFile(CARDS_PATH, "utf-8");
      return send(res, 200, data, MIME[".json"]);
    }

    if (url.pathname === "/api/cards" && req.method === "PUT") {
      const raw = await readBody(req);
      const parsed = JSON.parse(raw); // validate it's JSON before touching disk
      await copyFile(CARDS_PATH, CARDS_PATH + ".bak").catch(() => {});
      await writeFile(CARDS_PATH, JSON.stringify(parsed, null, 2) + "\n", "utf-8");
      return send(res, 200, JSON.stringify({ ok: true }), MIME[".json"]);
    }

    // static files
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
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
  console.log(`\n  Chain React Cards  →  http://localhost:${PORT}\n`);
});
