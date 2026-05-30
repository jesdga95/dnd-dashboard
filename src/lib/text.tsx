import type { ReactNode } from "react";

// Bold D&D dice notation (e.g. 2d6+3, 1d20, d8-1) wherever it appears in free text.
// \b boundaries keep it from matching inside words (e.g. the "d20" in "Wand20").
export const DICE_RE = /(\b\d*d\d+(?:\s*[+-]\s*\d+)?\b)/gi;

export function withDice(text: string): ReactNode {
  // Splitting on a single capture group puts the dice tokens on the odd indices.
  return text.split(DICE_RE).map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
  );
}
