# QUIZ.md — "Which React Native Developer Are You?"

A decision tree that routes a person to one of the deck's archetype cards. Built on
`SPEC.md`'s first principle — **identity, not mechanism**. Every question asks about
*posture* (how you relate to the work), never file trivia, so people self-route on gut.

The live tree is implemented as data in `index.html` (the `QUIZ` object) and rendered as a
step-by-step flow on the GitHub Pages site. **This doc and that object must stay in sync** —
edit both when a card is added, cut, or re-routed.

## How it routes

30 cards bucket into **5 postures** (the root question), then 1–2 follow-ups per branch.
Max depth is **3 questions**; every card is a reachable leaf. A 5-way "pick your vibe" root
maps onto the deck's curation domains (`ai · native · craft · motion · ship · process ·
debug · security`) and reads as self-identification, not an interrogation. **Answer Q1 on
instinct** — it's the whole read.

```
Q1 — "Which is most you?"
├─ A · "It's me and the machines now."                → AI stance        (7 cards)
├─ B · "I live down in the native layer."             → Native depth     (4 cards)
├─ C · "It has to FEEL right or I can't ship."        → Craft & motion   (6 cards)
├─ D · "Shipping is the whole game."                  → Past the gate    (4 cards)
└─ E · "Someone has to keep this from falling apart." → Order-keepers    (9 cards)
```

---

## Branch A — "Me and the machines" (AI stance · 7)

```
Q2a · "Where do you actually stand on the AI?"
├─ "All in — let it cook."
│   └─ Q3a · "And your move is…"
│       ├─ "I run a whole stampede of agents at once."           → The Agent Wrangler
│       ├─ "I coax it with the perfectly-worded prompt."         → The Prompt Whisperer
│       ├─ "I cue up exactly the right context, on demand."      → The Context DJ
│       └─ "I hand it a 10,000-line spec and hold it to all of it." → The Spec Tyrant
│
└─ "I keep AI on a short leash."
    └─ Q3a' · "How much do you let it in?"
        ├─ "Not at all — I grow my code by hand."               → The Organic Code Farmer
        ├─ "I read every overnight line myself, solo."          → The Night's Watch
        └─ "I can taste which model wrote a PR — no slop passes." → The Slop Sommelier
```

## Branch B — "Down in the native layer" (Native depth · 4)

```
Q2b · "What's your world?"
├─ "A giant legacy app I keep alive by hand."         → The Brownfield Mechanic
├─ "The line between JS and native — I own that crossing." → The Bridge Troll
├─ "When RN runs out of road, I drop into Swift/Kotlin." → The Native Ninja
└─ "The cursed native bug nobody else can reproduce." → The Keyboard Exorcist
```

## Branch C — "It has to feel right" (Craft & motion · 6)

```
Q2c · "Static layout, or living motion?"
├─ Static
│   └─ Q3c · "The flaw you can't unsee is…"
│       ├─ "Two pixels of misalignment."              → The Pixel Surgeon
│       ├─ "A light-mode screen searing my retinas."  → The Dark Mode Demon
│       └─ "A screen reader hitting an unlabeled button." → The A11y Paladin
└─ Motion
    └─ Q3c' · "What has to be perfect?"
        ├─ "The easing curve / the transition."       → The Reanimated Wizard
        ├─ "The swipe — it has to be buttery."        → The Gesture Jester
        └─ "Sixty frames. No dropped frames. Ever."   → The Render Drill Sergeant
```

## Branch D — "Shipping is the whole game" (Past the gate · 4)

*(The smuggler dodges, the enchantress charms, the cop enforces, the pope blesses —
they reference each other in their bibles.)*

```
Q2d · "The App Store stands between you and your users. You…"
├─ "Start fresh and sprint — faster to rewrite than to fix." → The Greenfield Speedster
├─ "Sneak a JS bundle over the wall — eas update, gone by morning." → The Over-the-Air Smuggler
├─ "Charm the reviewer into saying yes on the first pass."   → The App Store Enchantress
└─ "Deploy on Fridays and bless the build."                  → The Patch Pope
```

## Branch E — "Keep it from falling apart" (Order-keepers · 9)

```
Q2e · "In the chaos, you're the one who…"
├─ Hunts the bug / the hidden truth
│   └─ Q3e · "You corner it by…"
│       ├─ "console.log and instinct."                   → The Console Detective
│       ├─ "doing what no sane user would."              → The QA Phantom
│       └─ "chasing it all the way into prod."           → The Bug Bounty Hunter
├─ Tames the people / the ceremony
│   └─ Q3e' · "What do you wrangle?"
│       ├─ "The merge-conflict standoff."                → The Merge Magistrate
│       ├─ "The live demo, by sleight of hand."          → The Demo Illusionist
│       └─ "Scope — I'm the one going 'what if it also did this?'" → The Scope Siren
└─ Stands guard over time / threats / deps
    └─ Q3e'' · "Your watch is…"
        ├─ "The dreaded SDK upgrade — I endure it so the team won't." → The Upgrade Monk
        ├─ "A bunker of vendored deps — the registry will betray us." → The Dependency Prepper
        └─ "The build itself — I stop it when it's unsafe."  → The OpSec Cop
```

---

## Design notes & edge cases

- **Coverage:** 7 / 4 / 6 / 4 / 9 = 30. Every locked card is a leaf; nothing is unreachable.
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
