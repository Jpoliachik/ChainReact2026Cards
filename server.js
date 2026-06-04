// Zero-dependency local server for the Chain React Cards gallery.
// Read-only: serves the UI and the cards.json data.
//   node server.js   ->   http://localhost:4317

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
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
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === "/api/cards") {
      const data = await readFile(CARDS_PATH, "utf-8");
      return send(res, 200, data, MIME[".json"]);
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
  console.log(`\n  Chain React Cards  →  http://localhost:${PORT}\n`);
});
