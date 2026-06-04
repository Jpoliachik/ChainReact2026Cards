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
- `cards.json` edits (new cards, rewrites, status changes) are commit-worthy on their own.
- Never commit `cards.json.bak` (gitignored — it's the server's local backup).

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

- **Phase 1 (current): selection.** Get to 30 locked cards. `cards.json` is the source of
  truth; **array order = stack rank** (top = best). `status` is `locked | candidate | cut`
  (cut cards stay as a graveyard so we don't regenerate them).
- **Phase 2 (not built):** grow each locked card into the full Pokémon card (HP, type,
  categories, two named moves w/ damage + flavor + art). Don't add those fields to the
  schema until the 30 are locked.

## The ranking tool

Zero-dependency. `cards.json` is read/written directly so file edits and browser edits stay
in sync.

```bash
pnpm start        # → http://localhost:4317
```

- `server.js` — zero-dep Node server: `GET/PUT /api/cards`, serves `public/`, backs up to
  `cards.json.bak` on each write.
- `public/index.html` — single-file UI: drag-to-rank, ★ favorite, 1–5 rating,
  status pills, inline name/profile edit, per-card notes, live domain coverage bar.

## Conventions

- Use **pnpm**, not npm.
- Keep it dependency-free unless there's a strong reason — this is a small personal tool.
- Card `id` is a stable kebab slug; `name` is high-register `The ___`.
