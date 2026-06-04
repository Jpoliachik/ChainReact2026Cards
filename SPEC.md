# Chain React Cards — Spec

A deck of ~30 developer/attendee archetype cards for **Chain React 2026 (Portland)**.
Tarot register, Pokémon mechanics. Handed to real people: _"which one are you?"_

## North star — the "that's me" test

A good card produces one of three reactions on the draw: **recognition** ("that's SO
me"), **delight** (funny/surprising), or **both**. A shrug means the card is dead.

### Principles

1. **Identity, not mechanism.** People self-identify with a _posture_ — how they relate
   to the work — not with trivia about a file. (Bridge Keeper = worldview ✓.
   node_modules Oracle = clever observation about a lockfile, nobody _is_ that ✗.)
2. **Specific enough to feel seen, broad enough that several people fit.** The bullseye
   is a card multiple different attendees each claim as theirs. Too narrow → fits four
   people. Too wide → fits everyone, means nothing (the "AI Summoner" sin).
3. **Affectionate, never a sting** — _with one exception: universal guilt._ A roast
   aimed at a _type of person_ stings. A roast aimed at _all of us_ (Console.log
   Detective) bonds. Cursed cards are allowed when the sin is shared.
4. **The name does the comedy.** Dressing mundane dev behavior in mythic/tarot robes
   (Keeper, Monk, Mystic, Supplicant) — that contrast IS the joke. Keep the high register.
5. **Reward the insider, keep a human truth underneath.** RN/mobile/AI in-jokes make the
   right people light up; the underlying human pattern still reads to anyone.
6. **The posture must imply its moves.** These are Pokémon cards — if you can't imagine
   two moves in five seconds, the archetype is too thin to be a card.
7. **Curate the deck for spread.** 30 great cards all about "me and the AI" is a worse
   deck than 30 spanning the domains below. Watch the distribution.

### Domains (a curation lens, not a card field)

`ai` · `native` · `motion` · `craft` · `process` · `conference`

Used only to reason about spread when choosing cards — not stored in `cards.json`.
Conference-meta cards (Hallway Track Sage, First-Question Gladiator…) land _harder_ in
the room because the context is live. Reserve ~5–6 slots.

## Card data — current schema

`cards.json` holds the working set. `meta.artDirection` is the shared composition (below);
each card has these fields:

```jsonc
{
  "id": "the-bridge-troll",         // kebab slug, stable
  "name": "The Bridge Troll",       // VISIBLE — high-register "The ___", the headline
  "hp": 130,                        // VISIBLE — flavor stat (no real balance)
  "type": "nature",                 // VISIBLE — Pokémon-elemental type; sets the HP icon
  "saying": "Crossing to native? That'll cost ya.", // VISIBLE — the one line they'd say
  "moves": [                        // VISIBLE — exactly two; where the personality lives
    { "name": "Riddle of the Crossing", "type": "nature",   "damage": "30", "description": "≤ 2 lines (~95 chars)" },
    { "name": "Flattened to Fit",       "type": "strength", "damage": "90", "description": "≤ 2 lines (~95 chars)" }
  ],
  "backgroundColor": "green",       // VISIBLE — frame color: a string or ["a","b"] gradient
  "description": "character bible", // INTERNAL — traits/personality/vibe, never shown
  "imagePrompt": "Nano Banana prompt", // INTERNAL — the per-character generation prompt
  "image": "art/the-bridge-troll.png"  // the generated character art (the card's hero shot)
}
```

- **Visible on the card:** `name`, `hp`, `type`, `saying`, the two `moves`
  (each a `name` / `type` / `damage` / `description`), the art, and `backgroundColor`.
- **Internal (building + generation only):** `description` (a short character bible so we
  reason about who they are) and `imagePrompt`.
- Cut ideas live in [GRAVEYARD.md](GRAVEYARD.md), not in `cards.json`.

### `saying`

Incredibly short (< 60 chars), in their voice — the line you'd hear them say. Punchy.

### `moves`

Exactly two. Each is a `name` (punny/thematic) + a one-sentence effect. This is the comedy
engine — quirks, sins, and signature behaviors land here, Pokémon-style. Keep each
`description` to **two lines on the card (~95 characters) — a hard limit**; trim the line,
never let it wrap to a third. Each move also carries its own `type` (below), shown as a
single type icon inline beside the move name.

### `imagePrompt` + `meta.artDirection`

`meta.artDirection` fixes the shared **Pokémon hero-shot composition** for the whole deck:
one character as the clear, centered focal point, shown mid-action with only a few small
supporting props. It's prepended to every card's `imagePrompt` at generation time, so each
`imagePrompt` only describes the character — their distinct art-style flavor, costume,
props, and action. Keep characters visually distinct (no two near-identical figures).

### Type system

Each card and each move carries a Pokémon-elemental `type` — one of:
`nature · fire · psychic · water · electric · cosmic · toxic · dream · crystal · sound · strength`.
Icon + color for each live in `render/card.js`; the card's `type` drives the HP badge, and each
move's `type` shows as a single circular icon inline beside the move name. (This replaced the
old 1–4 energy-cost pips — one clean icon per move, not a count.) The deck skews `psychic`
(the AI/mind cards cluster there). These are flavor, not balance.

### Stats: `hp`, `damage`

`hp` and `damage` are pure flavor — lean into dev gags (`"60"` for 60fps, `"16"` for the
frame budget, `"404"`/`"500"`, `"4K"` for a giant diff, `"∞"`, `"1M"`). `damage` is a
**string** so non-numeric jokes render.

## The rendered card (the "actual visual")

The written card becomes a 816×1110 Pokémon-style trading card (yellow border, gradient
frame, name plate, HP + type icon, framed art, saying, two moves — each with its type icon
and damage).

- `render/card.js` — the shared renderer (`createCard`), used by the gallery and the export.
- `public/card.css` — the card stylesheet; `public/icons/` — the type-icon SVGs.
- `pnpm export` → `card-exports/<id>.png` (300 DPI, print-ready); `pnpm start` shows them
  live in the gallery; `pnpm build` bundles them into one shareable file.
