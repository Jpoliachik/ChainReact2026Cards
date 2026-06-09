# Chain React Cards

A deck of developer/attendee archetype cards for **Chain React 2026 (Portland)** —
tarot register, Pokémon mechanics. Handed out at the conference: _"which one are you?"_

**▶ Live deck: https://jpoliachik.github.io/ChainReact2026Cards/**

See [SPEC.md](SPEC.md) for the design north star and card schema, and
[QUIZ.md](QUIZ.md) for the "which one are you?" decision-tree design.

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
pnpm export        # render every card → card-exports/<id>.png  (300 DPI, print-ready)
pnpm export <id>   # just one card
pnpm check:exports # flag any card-exports/ out of date with its public/art/ — run before committing art / publishing
```

> **Two image layers, easy to desync.** `public/art/<id>.png` is the raw art; `card-exports/<id>.png`
> is the rendered card the live site actually serves, and it only refreshes when you run `pnpm export`.
> Change art without re-exporting and the site silently shows the old card. `pnpm check:exports`
> catches exactly that — on-disk and in git history — and exits non-zero, so it fits a pre-commit hook or CI.

## Entry points

- **`index.html`** (repo root) — the static site served by GitHub Pages. Opens with the
  **"which one are you?" quiz** (a decision tree that routes you to one card; see
  [QUIZ.md](QUIZ.md)), then the full gallery of finished cards from `card-exports/`.
  No build, no server; auto-updates on every push.
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
