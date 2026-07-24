// =============================================================
//  GUILD BOARD — seeded notes ("pins")
// -------------------------------------------------------------
//  These are content, not UI chrome: each note is a quote
//  attributed to a named person, so it lives here rather than in
//  the locale files (machine-translating someone's words would
//  misrepresent them). The section's own text — headings, button
//  labels, the empty state — IS translated via `guild.*` keys.
//
//  `color` maps to a pastel paper class (.guild-note--<color>);
//  `tape`  maps to a washi-tape colour  (.guild-note__tape--<tape>).
// =============================================================

export const GUILD_NOTES = [
  {
    id: "n1",
    message: "Good website I would say 🙌",
    author: "Rahul",
    date: "Sat Apr 04 2026",
    likes: 5,
    loved: true,
    color: "blue",
    tape: "teal",
  },
  {
    id: "n2",
    message:
      "Great UI/UX — the animations are really cool, and the whole thing feels highly interactive.",
    author: "Sayan Deb",
    date: "Tue Apr 07 2026",
    likes: 5,
    loved: true,
    color: "yellow",
    tape: "green",
  },
  {
    id: "n3",
    message: "One of the best portfolio websites I have seen so far.",
    author: "Vardaan Sharma",
    date: "Tue Apr 07 2026",
    likes: 4,
    loved: true,
    color: "pink",
    tape: "rose",
  },
];

// Deterministic pastel accent for a letter-avatar, keyed off the name so a
// given person always gets the same colour.
const AVATAR_COLORS = [
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#ea580c",
  "#059669",
  "#4f46e5",
];

export function avatarColor(name = "") {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function initialOf(name = "") {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}
