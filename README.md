# Chain React Cards

A deck of developer/attendee archetype cards for **Chain React 2026 (Portland)** —
tarot register, Pokémon mechanics. Handed out at the conference: _"which one are you?"_

**▶ Live deck: https://jpoliachik.github.io/ChainReact2026Cards/**

See [SPEC.md](SPEC.md) for the design north star and card schema, and
[GRAVEYARD.md](GRAVEYARD.md) for cut ideas.

## The cards

`cards.json` is the source of truth. Each card: `id`, `name`, `saying`, two `moves`
(name + description), a `description` (character), an `imagePrompt`, and an `image` once art
is generated.

## Entry points

- **`index.html`** (repo root) — the static, view-only showcase served by GitHub Pages.
  Fetches `cards.json` and the art in `public/art/`; auto-updates on every push.
- **`public/index.html`** — the interactive local gallery, including art generation. Needs
  the Node server:

  ```bash
  pnpm start        # → http://localhost:4317
  ```

  Edit `cards.json` directly to change a card. Art generation uses Google's
  `gemini-2.5-flash-image` ("Nano Banana") — copy `.env.example` to `.env` and add a
  `GEMINI_API_KEY`. The **Generate** buttons save PNGs to `public/art/` and write the
  `image` path back into `cards.json`.

## Sharing

- `pnpm build` → `dist/chain-react-cards.html`: one self-contained file (art embedded,
  view-only) you can send over Slack — opens offline, no server.
