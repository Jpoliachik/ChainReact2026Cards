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

Zero-dependency, **read-only** — just for viewing the cards. Edit `cards.json` directly to
change them.

```bash
pnpm start        # → http://localhost:4317
```

- `server.js` — zero-dep Node server: `GET /api/cards`, serves `public/`.
- `public/index.html` — single-file gallery: each card shows name, profile, "The Look"
  (visual), and an art slot (placeholder until an `image` is added).

## Conventions

- Use **pnpm**, not npm.
- Keep it dependency-free unless there's a strong reason — this is a small personal tool.
- Card `id` is a stable kebab slug; `name` is high-register `The ___`.
