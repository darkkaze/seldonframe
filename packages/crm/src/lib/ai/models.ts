/**
 * Shared default Anthropic model ids for Seldon's internal generation calls
 * (Seldon-It, block generation, soul compiler, soul wiki, public URL analysis).
 *
 * WHY THIS EXISTS: `claude-sonnet-4-20250514` (Sonnet 4) was copy-pasted as the
 * hardcoded default across ~10 call sites. It is now deprecated and 404s in
 * production (`personality_generator_model_fallback` fires on it). Centralizing
 * the default here means the next model retirement is a one-line change, not
 * another repo-wide sweep.
 *
 * `claude-sonnet-4-5-20250929` (Sonnet 4.5) is the current GA Sonnet — the same
 * id the personality generator falls back to and the agent runtime defaults to.
 * It is in the same pre-4.6 API family as Sonnet 4, so this is a true drop-in
 * (identical thinking / sampling / token surface — no request-shape changes).
 *
 * Call sites keep their own env override (`SELDON_MODEL`, `SOUL_COMPILER_MODEL`,
 * `ANTHROPIC_MODEL`); this constant only supplies the fallback default.
 */
export const DEFAULT_SONNET_MODEL = "claude-sonnet-4-5-20250929";

/**
 * Model id actually sent to the LLM provider. When `LLM_MODEL` is set, every
 * call uses it instead of the model the caller requested — this is how the app
 * runs on an Anthropic-compatible provider (e.g. MiniMax via
 * `ANTHROPIC_BASE_URL`) whose model ids differ from Claude's.
 */
export function resolveModel(requested: string): string {
  return process.env.LLM_MODEL?.trim() || requested;
}
