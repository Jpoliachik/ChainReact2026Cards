# CARD-BACK.md — The shared card back

A **single image** used as the reverse face of all cards in the deck. Unlike the card
*fronts* (caricature heroes, see `meta.artDirection` in `cards.json`), the back's job is the
opposite: **no character, fully symmetrical, iconic, legible face-down** across the whole
stack — Pokémon Poké-Ball-back / tarot-verso energy, in the same painterly illustrated style
as the character cards.

## Files

- `card-back.png` — **full-res master** (1054×1492). Source of truth; use for **print**.
- `card-back-web.png` — downscaled web copy (420×595, ~150KB). Used on the site.

## Where it's used

- **Home page floating deck** — the three fanned `.mini` cards in `index.html` use
  `card-back-web.png` as their face.

## The prompt (Nano Banana / Gemini)

Pass the **Chain React logo as a reference image** alongside this prompt.

```
A symmetrical trading-card BACK, portrait orientation, in the style of a painterly cartoon
illustration — vibrant flat color, bold simple shapes, clean dramatic lighting, like a
Pokémon-style character card. Cohesive and uncluttered, with generous negative space.

Center the provided Chain React logo as a clean flat emblem integrated into the artwork —
set inside a single bold circular medallion with a simple gold ring. Render it as part of
the illustration, NOT a glowing neon overlay; no bright bloom or halo.

Behind it, a simple bold mandala built from a few large concentric shapes — broad rings,
big petal forms, clean radial geometry. Minimal fine detail. Perfectly symmetrical, calm,
iconic.

One consistent painterly background texture across the whole card — a smooth deep gradient
with subtle hand-painted brush texture, like the backdrop of a character illustration. No
busy starfields or scattered sparkles.

Enclose in a clean ornate gold frame with simple corner flourishes.

Two-line centered title below the medallion: "CHAIN REACT" / "TRADING CARDS" in an elegant
tarot/fantasy display serif, gold.

Palette: deep midnight navy and aubergine, antique gold, one subtle teal accent. Rich,
collectible, cohesive with a vibrant illustrated character deck.
```

> **Title text:** diffusion models often garble in-image lettering. If a regeneration ever
> botches "CHAIN REACT / TRADING CARDS", the fallback is to generate with a blank title area
> and composite the text as real type.
