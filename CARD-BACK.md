# CARD-BACK.md — The shared card back

A **single image** used as the reverse face of all cards in the deck. Unlike the card
*fronts* (caricature heroes, see `meta.artDirection` in `cards.json`), the back's job is the
opposite: **no character, fully symmetrical, iconic, legible face-down** across the whole
stack. Think Pokémon's Poké Ball back or a tarot deck's patterned verso.

- **Aspect:** portrait, matches the deck's `816×1110` card dimensions.
- **Status:** prompt drafted; not yet generated.

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

## The prompt (Nano Banana / Gemini)

Pass the **Chain React logo as a reference image** alongside this text prompt.

> A symmetrical trading-card BACK design, portrait orientation, ornate and premium. **Center
> the provided Chain React logo as a glowing emblem** — treat it like a Pokémon-style
> medallion: set it inside a circular badge with a soft radial bloom behind it, raised and
> luminous, the unmistakable hero of the composition.
>
> Surround it with a **fourfold-symmetric mandala** that fuses tarot-arcana ornamentation with
> React-atom orbital motifs — concentric rings, fine filigree, tessellated repeating detail
> radiating outward from the central emblem. Dense, hypnotic, perfectly mirrored.
>
> Enclose everything in an **ornate gold frame** with decorative corner flourishes, like the
> border of a tarot card.
>
> Below the central emblem, render the title on **two lines, centered**: "CHAIN REACT" /
> "TRADING CARDS" — in an elegant high-fantasy / tarot display typeface (think engraved serif
> or art-nouveau lettering), gold, crisp and legible.
>
> Palette: deep midnight navy and aubergine background, antique-gold linework, subtle
> teal/cyan accent glow from the central atom. Rich, mystical, collectible. No characters, no
> scattered objects — pure symmetric emblem-and-pattern. High detail, clean rendering.

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
