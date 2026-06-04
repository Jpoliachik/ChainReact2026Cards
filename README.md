# Chain React Cards

A deck of developer/attendee archetype cards for **Chain React 2026 (Portland)** —
tarot register, Pokémon mechanics. Handed out at the conference: _"which one are you?"_

**▶ Live deck: https://jpoliachik.github.io/ChainReact2026Cards/**

See [SPEC.md](SPEC.md) for the design north star and card schema, and
[GRAVEYARD.md](GRAVEYARD.md) for cut ideas.

## The cards

`cards.json` is the source of truth. Each card: `id`, `name`, `hp`, `type`, `saying`, two
`moves` (name + `type` + `damage` + `iconCount` + description), `backgroundColor`, a
`description` (character) and `imagePrompt` (internal), and an `image` (the generated
character art). See [SPEC.md](SPEC.md) for the full schema and type system.

## The rendered card

The written card renders to a 816×1110 Pokémon-style trading card (yellow border, gradient
frame, name plate, HP + type icon, framed art, saying, two moves with energy pips + damage).
One renderer — `render/card.js` (+ `public/card.css`, `public/icons/`) — feeds every view.

```bash
pnpm export       # render every card → card-exports/<id>.png  (300 DPI, print-ready)
pnpm export <id>  # just one card
```

## Entry points

- **`index.html`** (repo root) — the static, view-only showcase served by GitHub Pages.
  Shows the finished cards from `card-exports/`; auto-updates on every push.
- **`public/index.html`** — the interactive local gallery: renders the actual cards live
  (instant reflection of `cards.json` edits) and generates art. Needs the Node server:

  ```bash
  pnpm start        # → http://localhost:4317
  ```

  Edit `cards.json` directly to change a card. Art generation uses Google's
  `gemini-2.5-flash-image` ("Nano Banana") — copy `.env.example` to `.env` and add a
  `GEMINI_API_KEY`. The **Generate** buttons save PNGs to `public/art/` and write the
  `image` path back into `cards.json`. Re-run `pnpm export` to refresh the print PNGs.

## Sharing

- `pnpm build` → `dist/chain-react-cards.html`: one self-contained file with the finished
  card PNGs embedded — opens offline, no server. Run `pnpm export` first.
