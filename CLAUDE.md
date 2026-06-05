# CLAUDE.md — Chain React Cards

Guidance for Claude Code when working in this repo.

## What this is

A deck of ~30 developer/attendee **archetype cards** for **Chain React 2026 (Portland)** —
a React Native / mobile dev conference. Register is **tarot meets Pokémon**: each card is a
character (mythic name + profile) that will grow into a Pokémon-style card (HP, type, two
named moves). They get handed to real attendees: _"which one are you?"_

This is a standalone git repo (extracted from the `jpmakesstuff` parent, which ignores it).

## Commit discipline (IMPORTANT)

**Commit on every set of changes.** After each logical, self-contained change — a tool
tweak, a batch of new cards, a spec edit — make a small, focused commit. Don't batch
unrelated work into one commit and don't wait to be asked. Prefer many small commits over
few large ones.

- Sign off commit messages with the standard `Co-Authored-By` trailer.
- `cards.json` edits (new cards, profile/visual rewrites) are commit-worthy on their own.

## The design north star

`SPEC.md` is the source of truth for what makes a good card — the **"that's me" test**
(recognition / delight / both; a shrug means it's dead) plus 7 principles. Read it before
writing, judging, or cutting cards. Key reminders:

- **Identity, not mechanism** — people self-identify with a posture, not file trivia.
- **The name does the comedy** — keep the high tarot register over mundane dev behavior.
- **Affectionate, never a sting** — except universal-guilt cards (everyone's guilty → bonds).
- **The posture must imply its moves** — if you can't picture two moves fast, it's too thin.
- **Curate for spread** across domains: `ai · native · motion · craft · process · conference`.
  Conference-meta cards land hardest in the room. Watch the coverage bar.

## Phases

- **Phase 1: selection + character design.** Get to a strong set of cards, each with a
  written identity (`name`, `saying`, two `moves`, a character `description`, an
  `imagePrompt`). Cut ideas go to `GRAVEYARD.md`, not `cards.json`. (15 cards locked so far;
  target 30.)
- **Phase 2 (in progress): the actual visual.** Each card now grows the full Pokémon card —
  `hp`, a Pokémon-elemental `type`, `backgroundColor`, and per-move `type` / `damage` /
  `iconCount` — and renders to a 816×1110 trading card. See SPEC.md for the schema + type
  system. The type/damage values are a **first pass tuned for refinement**, not final.

  - `render/card.js` — the shared `createCard` renderer (ported from the Bob Ross trading-card
    tool). `public/card.css` is its Tailwind stylesheet; `public/icons/` holds the type-icon
    SVGs. One renderer feeds the gallery, the PNG export, and the static showcase.
  - `pnpm export` (`export.js`, puppeteer + sharp) → `card-exports/<id>.png` at 300 DPI;
    `pnpm export <id>` for one. The PNGs are committed.

## The gallery tool

Viewing is the main use; edit `cards.json` directly to change a card, then reload.

```bash
pnpm start        # → http://localhost:4317  (set PORT to override)
```

- `server.js` — Node server: `GET /api/cards`, `POST /api/generate`, serves `/render/card.js`
  and `public/`. Itself still zero-dep (built-in `fetch` + a tiny `.env` parser).
- `public/index.html` — gallery: renders the **actual 816×1110 card** for each entry via the
  shared renderer, each in its own shadow root (so `card.css`'s Tailwind reset stays scoped
  and never leaks into the gallery's dark/gold theme). Keeps the regenerate-art button and an
  internal character/prompt expander.

### Art generation (Nano Banana / Gemini)

The gallery can generate card art via Google's `gemini-2.5-flash-image` ("Nano Banana").

- Copy `.env.example` → `.env` and add `GEMINI_API_KEY` (from https://aistudio.google.com/apikey).
  `.env` is gitignored; the loader no-ops if the file is absent.
- The **"Generate missing art"** header button fills every card without an image (sequential,
  stops on first failure); each card also has a **↻ regenerate** button.
- `POST /api/generate { id }` builds the prompt (`meta.artDirection` + the card's `imagePrompt`),
  calls Gemini, writes `public/art/<id>.png`, and persists `image: "art/<id>.png"` back into
  `cards.json` (with a `cards.json.bak` backup). Generated PNGs in `public/art/` are committed.

## Two art layers — re-export after every art change (IMPORTANT)

There are **two separate image artifacts per card**, and they do not update each other:

1. `public/art/<id>.png` — the **raw character art** (from Gemini, or hand-swapped). The
   gallery composites this live with the frame; changing it updates the gallery on reload.
2. `card-exports/<id>.png` — the **full rasterized trading card** (frame + art + text),
   produced only by `pnpm export`. **The published GitHub Pages site renders these**, not
   `public/art/`.

So whenever you **swap/regenerate art, rename a card `id`, or edit any visible field**
(`name`, `saying`, moves, `hp`, `type`, colors), you MUST re-run `pnpm export <id>` and commit
the new `card-exports/<id>.png` — otherwise the live site stays stale or shows the card broken.
When you **cut or rename** a card, delete its now-orphaned `card-exports/<id>.png` (and
`public/art/<id>.png`). `index.html` (the Pages entry point) reads `./cards.json` +
`./card-exports/<id>.png`, falling back to an "art pending" tile when an export is missing.

## Conventions

- Use **pnpm**, not npm.
- Keep it lean. The server/gallery stay dependency-free; the only npm deps are `puppeteer` +
  `sharp`, used solely by `pnpm export` to rasterize the cards (no zero-dep way to do that).
- Card `id` is a stable kebab slug; `name` is high-register `The ___`.
