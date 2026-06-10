# CARD-BACK.md — The shared card back

A **single image** used as the reverse face of all cards in the deck. Unlike the card
*fronts* (caricature heroes, see `meta.artDirection` in `cards.json`), the back's job is the
opposite: **no character, fully symmetrical, iconic, legible face-down** across the whole
stack. Think Pokémon's Poké Ball back or a tarot deck's patterned verso.

- **Aspect:** portrait, matches the deck's `816×1110` card dimensions.
- **Status:** v1 generated (too ornate / logo glow felt off-style); v2 prompt below.

## Style direction (must match the card fronts)

The back should feel like the **same deck** as the character cards: **painterly cartoon
illustration, bold simple shapes, vibrant flat color, clean dramatic lighting** (Pokémon
character-card energy — see the jester on a lamplit stage, the cowboy roping code-horses).
Lessons from v1:

- **Simplify** — fewer ornate hairline patterns; a few **large bold shapes** with breathing room.
- **One consistent painterly background texture**, not a busy starfield.
- **Logo lives *in* the art**, rendered as a clean flat emblem — **no neon glow / halo bloom**.
- Keep: symmetry, gold frame, two-line title, navy/aubergine + gold palette.

## Concept

Chain React logo as a **Pokémon-style center medallion**, sitting on a **tarot / mandala
background pattern**, inside an **ornate frame**, with a **two-line title** below.

```
┌──────────────────────────┐
│  ╔════ ornate frame ════╗ │  ← gold filigree border
│  ║  · mandala/tarot bg · ║ │  ← radial symmetric pattern
│  ║   ┌──────────────┐    ║ │
│  ║   │  CHAIN REACT │    ║ │  ← logo, centered,
│  ║   │     LOGO     │    ║ │     glowing medallion treatment
│  ║   └──────────────┘    ║ │
│  ║   CHAIN REACT         ║ │  ← two-line title,
│  ║   TRADING CARDS       ║ │     tarot-display font
│  ╚══════════════════════╝ │
└──────────────────────────┘
```

## The prompt — v2 (Nano Banana / Gemini)

Pass the **Chain React logo as a reference image** alongside this text prompt.

> A symmetrical trading-card BACK, portrait orientation, in the style of a **painterly cartoon
> illustration** — vibrant flat color, bold simple shapes, clean dramatic lighting, like a
> Pokémon-style character card. Cohesive and uncluttered, with generous negative space.
>
> **Center the provided Chain React logo** as a clean flat emblem integrated into the artwork —
> set inside a single bold circular medallion with a simple gold ring. Render it as part of the
> illustration, NOT a glowing neon overlay; no bright bloom or halo.
>
> Behind it, a **simple bold mandala** built from a few large concentric shapes — broad rings,
> big petal forms, clean radial geometry. Minimal fine detail. Perfectly symmetrical, calm,
> iconic.
>
> One **consistent painterly background texture** across the whole card — a smooth deep gradient
> with subtle hand-painted brush texture, like the backdrop of a character illustration. No busy
> starfields or scattered sparkles.
>
> Enclose in a **clean ornate gold frame** with simple corner flourishes.
>
> Two-line centered title below the medallion: "CHAIN REACT" / "TRADING CARDS" in an elegant
> tarot/fantasy display serif, gold.
>
> Palette: deep midnight navy and aubergine, antique gold, one subtle teal accent. Rich,
> collectible, cohesive with a vibrant illustrated character deck.

<details><summary>v1 prompt (archived — too ornate, logo glow felt off-style)</summary>

> A symmetrical trading-card BACK design, portrait orientation, ornate and premium. Center the
> provided Chain React logo as a glowing emblem — Pokémon-style medallion in a circular badge
> with a soft radial bloom. Surround it with a fourfold-symmetric mandala fusing tarot-arcana
> ornamentation with React-atom orbital motifs — concentric rings, fine filigree, tessellated
> detail. Ornate gold frame, decorative corners. Two-line title "CHAIN REACT" / "TRADING CARDS"
> in tarot display serif. Deep navy/aubergine, antique gold, teal/cyan glow.

</details>

## Open decisions

- **Text rendering risk.** Diffusion models often garble in-image text. Two paths:
  - **(a) Composite the title as real type** — generate pattern + frame + logo with blank
    space for the title, then overlay "CHAIN REACT / TRADING CARDS" as actual text. Guarantees
    crisp, on-brand lettering. *(preferred)*
  - **(b) Let the model render the text** and regenerate until clean.
- **Font vibe.** Prompt currently asks for engraved-serif / art-nouveau. Alternatives to try:
  blackletter-gothic, or clean art-deco.

## Notes

- This back is **not a card in `cards.json`** and is **not produced by `pnpm export`** — it's a
  standalone artifact. Decide a home for the final file (e.g. `public/art/` or a new
  `assets/`) when generated.
