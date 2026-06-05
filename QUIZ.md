# QUIZ.md — "Which React Native Developer Are You?"

A decision tree that routes a person to one of the deck's archetype cards. Built on
`SPEC.md`'s first principle — **identity, not mechanism**. Every question asks about
*posture* (how you relate to the work), never file trivia, so people self-route on gut.

## How it routes

23 cards bucket into **5 postures** (the root question), then 1–2 follow-ups per branch.
Max depth is **3 questions**; every card is a reachable leaf. A 5-way "pick your vibe"
root maps onto the deck's curation domains (`ai · native · craft · process · conference`)
and reads as self-identification, not an interrogation. **Answer Q1 on instinct** — it's
the whole read.

```
Q1 — "Which is most you?"
├─ A · "It's me and the machines now."                → AI stance        (6 cards)
├─ B · "I live below the bridge."                     → Native depth     (4 cards)
├─ C · "It has to FEEL right or I can't ship."        → Craft & polish   (4 cards)
├─ D · "My real enemy is the gatekeeper."             → Past the gate    (3 cards)
└─ E · "Someone has to keep this from falling apart." → Order-keepers    (6 cards)
```

---

## Branch A — "Me and the machines" (AI stance)

```
Q2a · "Where do you actually stand on the AI?"
├─ "All in — let it cook."
│   └─ Q3a · "And your move is…"
│       ├─ "I run a whole stampede of agents at once."          → The Agent Wrangler
│       └─ "I coax it with the perfectly-worded prompt."        → The Prompt Whisperer
│
└─ "Trust, but verify — or don't trust at all."
    └─ Q3b · "How much do you let it in?"
        ├─ "Not at all — I grow my code by hand."               → The Organic Code Farmer
        └─ "I let it build, then I guard the gate."
            └─ Q4b · "How do you guard it?"
                ├─ "I read every overnight line myself, solo."        → The Night's Watch
                ├─ "I split the powers so no one ships unchecked."    → The Triforce Bearer
                └─ "I can taste which model wrote a PR — no slop passes." → The Slop Sommelier
```

## Branch B — "Below the bridge" (Native depth)

```
Q2b · "What's your world?"
├─ "A fresh app, all gas no brakes."                  → The Greenfield Speedster
├─ "An ancient ejected beast I keep alive by hand."   → The Brownfield Mechanic
└─ "The native layer itself."
    └─ Q3b · "When RN runs out of road, the bridge is…"
        ├─ "A toll booth — I guard what crosses (watch the payload)." → The Bridge Troll
        └─ "A back door — I drop into Swift/Kotlin and solve it below."→ The Native Ninja
```

## Branch C — "It has to feel right" (Craft & polish)

```
Q2c · "Static layout, or living motion?"
├─ Static
│   └─ Q3c · "The flaw you can't unsee is…"
│       ├─ "Two pixels of misalignment."              → The Pixel Surgeon
│       └─ "The keyboard covering the input field."   → The Keyboard Exorcist
└─ Motion
    └─ Q3c' · "What has to be perfect?"
        ├─ "The easing curve / the transition."       → The Reanimated Wizard
        └─ "The swipe — it has to be buttery."        → The Gesture Jester
```

## Branch D — "My enemy is the gatekeeper" (Past the gate)

*(These three reference each other in their bibles — the smuggler dodges, the enchantress
charms, the cop enforces.)*

```
Q2d · "The App Store stands between you and your users. You…"
├─ "Sneak a JS bundle over the wall — eas update, gone by morning." → The Over-the-Air Smuggler
├─ "Charm the reviewer into saying yes on the first pass."          → The App Store Enchantress
└─ "Wait — I AM the gate. I enforce the rules nobody loves."        → The Compliance Cop
```

## Branch E — "Keep it from falling apart" (Order-keepers)

```
Q2e · "Your true nemesis is…"
├─ A bug / the truth
│   ├─ "I hunt it with console.log and instinct."        → The Console Detective
│   └─ "I find the crash by doing what no sane user would." → The QA Phantom
├─ Chaos / ceremony
│   ├─ "I settle the merge-conflict standoff."           → The Merge Magistrate
│   └─ "I survive the live demo by sleight of hand."     → The Demo Illusionist
└─ Time / dependencies
    ├─ "I endure the SDK upgrade so the team never has to." → The Upgrade Monk
    └─ "I hoard vendored deps — the registry will betray us." → The Dependency Prepper
```

---

## Design notes & edge cases

- **Coverage:** 6 / 4 / 4 / 3 / 6 = 23. Every locked card is a leaf; nothing is unreachable.
- **Gut-first routing.** Q1 is the whole read — answer on instinct, not analysis. Many
  people are *both* a craft nerd and an AI person; "which is most you?" resolves it, which
  is the "that's me" snap the spec wants.
- **The three universal-guilt cards** (Console Detective, Demo Illusionist, Keyboard
  Exorcist) sit at branch *ends* as landing spots — good, because they're the "oh god
  that's all of us" reveals that bond the room.
- **Cross-domain tension to watch:** OTA Smuggler lives in Branch D (gate) but is also a
  native/managed call; Night's Watch and Triforce Bearer are AI *and* process. Each is
  placed by its strongest **emotional** posture, not its mechanism — per Principle 1.
- **The 30-card target:** when the remaining ~7 cards land (conference-meta slots are still
  open — Hallway Track Sage, First-Question Gladiator…), they'll likely want a **6th root
  branch: "I'm here for the room"** (conference posture). Root is left at 5 so that slots
  in cleanly later.
