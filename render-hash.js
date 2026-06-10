// A stable hash of ONLY the card fields that render/card.js draws onto the
// exported PNG (see that file's header contract): name, hp, type, image,
// saying, backgroundColor, and each move's name/type/description/damage.
//
// Internal fields (card-level `description`, `imagePrompt`, `character`) are
// deliberately excluded — editing them must NOT force a re-export, since they
// never appear on the rasterized card.
//
// export.js records this hash per card in card-exports/.manifest.json; check-
// exports.js recomputes it and flags any card whose rendered text drifted from
// what was last exported. This is what catches stale moves/sayings — the
// timestamp checks only catch stale ART.

import { createHash } from "node:crypto";

export function cardRenderHash(card) {
  const rendered = {
    name: card.name ?? null,
    hp: card.hp ?? null,
    type: card.type ?? null,
    image: card.image ?? null,
    saying: card.saying ?? null,
    backgroundColor: card.backgroundColor ?? null,
    moves: (card.moves || []).map((m) => ({
      name: m.name ?? null,
      type: m.type ?? null,
      description: m.description ?? null,
      damage: m.damage ?? null,
    })),
  };
  return createHash("sha256").update(JSON.stringify(rendered)).digest("hex").slice(0, 16);
}
