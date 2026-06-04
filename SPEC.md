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

### Domains (for coverage)

`ai` · `native` · `motion` · `craft` · `process` · `conference`

Conference-meta cards (Hallway Track Sage, First-Question Gladiator…) land _harder_ in
the room because the context is live. Reserve ~5–6 slots.

## Card data — current schema (Phase 1: selection + character design)

Stored in `cards.json`.

```jsonc
{
  "id": "the-bridge-keeper",      // kebab slug, stable
  "name": "The Bridge Keeper",    // high-register, "The ___" — what the user sees first
  "domain": "native",             // one of the domains above
  "status": "locked | cut",       // locked = a current pick; cut = graveyard
  "profile": "2–3 sentences...",  // WHO they are — the posture; sets up the eventual moves
  "visual": "vivid look...",      // WHAT they look like — the image-prompt seed (see below)
  "image": "",                    // path to generated art, once it exists
  "notes": ""                     // working notes / why kept or cut
}
```

- **locked** — a current pick (the working set we're developing).
- **cut** — killed, kept in the graveyard so we don't regenerate it. `visual` left empty
  for cut cards; we only design the look for picks.

### The `visual` field

The look carries the gag as much as the name does — they're a team. A good `visual` is a
**specific, whimsical, made-up character** with concrete costume, props, setting, and mood,
written so it can be handed almost verbatim to an image generator. Lean into the joke
(Bridge Keeper = an actual barnacled troll at an actual bridge). Keep characters visually
distinct from each other — watch for collisions (e.g. don't make three serene robed
figures, or two gladiators).

## Phase 2: the full Pokémon card (not built yet)

Once the 30 are locked, each card grows:

```jsonc
{
  "hp": 90,
  "type": "...",                  // playful energy type (maps loosely to domain)
  "categories": [],               // the little stat row
  "moves": [
    { "name": "Toll Collection", "type": "...", "damage": 30, "text": "one sentence" },
    { "name": "Cross the Threshold", "type": "...", "damage": 60, "text": "one sentence" }
  ],
  "flavor": "italic bottom-of-card line",
  "art": "path or prompt"
}
```

Don't add these knobs to the schema until Phase 1 (the 30) is locked.
