# Chain React Cards

A deck of ~30 developer/attendee archetype cards for **Chain React 2026 (Portland)** —
tarot register, Pokémon mechanics. Handed out at the conference: _"which one are you?"_

See [SPEC.md](SPEC.md) for the design north star and card schema.

## The ranking tool

`cards.json` is the source of truth (git-tracked). The web tool reads and writes it
directly, so edits in the browser and edits in the file stay in sync.

```bash
pnpm start        # → http://localhost:4317
```

- **Drag the ⠿ grip** to stack-rank (array order = rank, top = best).
- **★** favorite · **● ● ● ● ●** rate 1–5 · **locked / candidate / cut** status.
- Click the **domain tag** to cycle its domain.
- Edit **name** and **profile** inline; jot **notes** per card.
- Autosaves ~0.7s after a change. Backup written to `cards.json.bak`.

## Workflow

1. Rank & rate candidates, leave notes on what works.
2. Mark winners **locked**, kill the rest as **cut** (kept as a graveyard).
3. Drive toward 30 locked, with spread across domains (watch the coverage bar).
4. Phase 2: grow each locked card into the full Pokémon card (HP, type, two moves).
