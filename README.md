# Chain React Cards

A deck of developer/attendee archetype cards for **Chain React 2026 (Portland)** —
tarot register, Pokémon mechanics. Handed out at the conference: _"which one are you?"_

See [SPEC.md](SPEC.md) for the design north star and card schema, and
[GRAVEYARD.md](GRAVEYARD.md) for cut ideas.

## The cards

`cards.json` is the source of truth — the working set, four fields each:

```jsonc
{ "id": "...", "name": "The ...", "profile": "who they are", "visual": "what they look like" }
```

`profile` is the character; `visual` is the look (an image-prompt seed for later art).

## The gallery tool

Zero-dependency, read-only. Just for eyeballing the cards.

```bash
pnpm start        # → http://localhost:4317
```

Each card shows its name, profile, "The Look," and an art slot (placeholder until art is
generated). To change a card, edit `cards.json` directly.
