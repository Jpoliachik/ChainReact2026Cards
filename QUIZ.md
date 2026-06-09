# QUIZ.md — "Which React Native Developer Are You?"

The design doc for the deck's decision tree: the **why** behind the quiz, not its exact
wording. Built on `SPEC.md`'s first principle — **identity, not mechanism**. Every question
asks about *posture* (how you relate to the work), never file trivia, so people self-route
on gut.

> **Source of truth.** The live tree — exact question text, answer labels, and routing —
> is the `QUIZ` object in `index.html`. Edit *there*. This doc explains the shape and the
> placement logic; it is intentionally not a line-by-line mirror, so don't try to keep the
> wording in sync. Update this doc only when the *structure* changes (a branch added, a
> card re-routed, the coverage count shifts).

## How it routes

30 cards bucket into **5 postures** (the root question), then 1–2 follow-ups per branch.
Max depth is **3 questions**; every card is a reachable leaf. A 5-way "pick your vibe" root
maps onto the deck's curation domains (`ai · native · craft · motion · ship · process ·
debug · security`) and reads as self-identification, not an interrogation. **Answer Q1 on
instinct** — it's the whole read.

```
Q1 — "Which is most you?"
├─ A · me + the machines        → AI stance        (7 cards)
├─ B · down in the native layer → Native depth     (4 cards)
├─ C · it has to FEEL right     → Craft & motion    (6 cards)
├─ D · shipping is the game     → Past the gate     (4 cards)
└─ E · keep it from falling apart → Order-keepers   (9 cards)
```

## The branches & their cards

Each branch narrows by *felt role*, not tech. (Sub-question groupings shown to explain how
cards cluster — the exact prompts live in code.)

- **A · AI stance (7).** Splits on trust. *All-in:* Agent Wrangler, Prompt Whisperer,
  Context DJ, Spec Tyrant. *AI on a short leash:* Organic Code Farmer (doesn't use it),
  Night's Watch, Slop Sommelier.
- **B · Native depth (4).** Brownfield Mechanic, Bridge Troll, Native Ninja,
  Keyboard Exorcist.
- **C · Craft & motion (6).** Splits static vs. motion. *Static:* Pixel Surgeon,
  Dark Mode Demon, A11y Paladin. *Motion:* Reanimated Wizard, Gesture Jester,
  Render Drill Sergeant.
- **D · Past the gate (4).** Greenfield Speedster, Over-the-Air Smuggler,
  App Store Enchantress, Patch Pope. *(The smuggler dodges, the enchantress charms, the cop
  enforces, the pope blesses — they reference each other in their bibles.)*
- **E · Order-keepers (9).** Splits three ways. *Hunts the bug:* Console Detective,
  QA Phantom, Bug Bounty Hunter. *Tames the people/ceremony:* Merge Magistrate,
  Demo Illusionist, Scope Siren. *Stands guard (time/threats/deps):* Upgrade Monk,
  Dependency Prepper, OpSec Cop.

---

## Design notes & edge cases

- **Coverage:** 7 / 4 / 6 / 4 / 9 = 30. Every locked card is a leaf; nothing is unreachable.
- **Answers are person-voice, not card-voice.** The card *name* carries the high tarot
  register (the reveal); the quiz answer is the on-ramp, so each one reads as a plain
  first-person posture someone nods at — "that's me" — never a riddle or a put-down.
- **Gut-first routing.** Q1 is the whole read — answer on instinct, not analysis. Many
  people are *both* a craft nerd and an AI person; "which is most you?" resolves it, which
  is the "that's me" snap the spec wants.
- **Affectionate exceptions sit at branch ends as landing spots** — Console Detective, Demo
  Illusionist, Keyboard Exorcist are the "oh god that's all of us" reveals that bond the
  room. The Scope Siren is the one self-identified *chaos-maker* on the board; she's framed
  as honest confession ("scope is my love language"), not a sting — per SPEC.
- **Placed by strongest emotional posture, not mechanism** — e.g. Greenfield Speedster is
  `ship`-typed but lands in the shipping/gate branch; OpSec Cop and Dependency Prepper
  (security) live under Order-keepers because that's the *felt* role. Per Principle 1.
- **The 6th branch, held in reserve:** when conference-meta cards land (Hallway Track Sage,
  First-Question Gladiator…), add a 6th root — **"I'm here for the room"** (conference
  posture). The root is kept at 5 so that slots in cleanly.
