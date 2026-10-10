/**
 * Derive a friendly template NAME from the builder's one-sentence intent.
 * Used by the "Describe your agent" create flow so a generated agent gets a
 * sensible name without a second prompt. Pure (no DB) so it's unit-testable.
 *
 * Takes the first ~5 words, title-cases them, strips trailing punctuation, and
 * caps the length. Empty / wordless prompts fall back to "New agent".
 */
export function deriveName(prompt: string): string {
  const words = (prompt ?? "")
    .trim()
    // Split on whitespace; drop empties from leading/collapsed spaces.
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    // Strip punctuation so "phone," / "quote…" read cleanly as a name.
    .map((w) => w.replace(/[^\p{L}\p{N}'-]/gu, ""))
    .filter(Boolean);

  if (words.length === 0) return "New agent";

  const titled = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Keep the name within the column width the editors/list render.
  return titled.slice(0, 60);
}
