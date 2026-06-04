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

- **Phase 1 (current): selection + character design.** Get to a strong set of cards, each
  with a `profile` (who) and a `visual` (the look). `cards.json` holds the working set only,
  four fields per card: `id`, `name`, `profile`, `visual`. Cut ideas go to `GRAVEYARD.md`,
  not `cards.json`.
- **Phase 2 (not built):** grow each card into the full Pokémon card (HP, type, categories,
  two named moves w/ damage + flavor) and add generated art (`image` field). Don't add those
  fields to the schema until the working set is locked.

## The gallery tool

Zero-dependency (built-in `fetch` + a tiny `.env` parser, no npm packages). Viewing is the
main use; edit `cards.json` directly to change card text.

```bash
pnpm start        # → http://localhost:4317  (set PORT to override)
```

- `server.js` — zero-dep Node server: `GET /api/cards`, `POST /api/generate`, serves `public/`.
- `public/index.html` — single-file gallery: each card shows name, saying, moves, and an art
  slot (placeholder until an `image` is generated).

### Art generation (Nano Banana / Gemini)

The gallery can generate card art via Google's `gemini-2.5-flash-image` ("Nano Banana").

- Copy `.env.example` → `.env` and add `GEMINI_API_KEY` (from https://aistudio.google.com/apikey).
  `.env` is gitignored; the loader no-ops if the file is absent.
- The **"Generate missing art"** header button fills every card without an image (sequential,
  stops on first failure); each card also has a **↻ regenerate** button.
- `POST /api/generate { id }` builds the prompt (`meta.artDirection` + the card's `imagePrompt`),
  calls Gemini, writes `public/art/<id>.png`, and persists `image: "art/<id>.png"` back into
  `cards.json` (with a `cards.json.bak` backup). Generated PNGs in `public/art/` are committed.

## Conventions

- Use **pnpm**, not npm.
- Keep it dependency-free unless there's a strong reason — this is a small personal tool.
- Card `id` is a stable kebab slug; `name` is high-register `The ___`.
