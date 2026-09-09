export interface Settings {
  /** Leave out characters who never appear past the original Baki the Grappler run. */
  modernOnly: boolean;
  /** Bring in the fighters no anime has adapted. */
  includeMangaOnly: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  modernOnly: false,
  includeMangaOnly: false,
};

/**
 * Identifies the pool a round was played against. Saved progress is keyed by it, so switching
 * a setting starts a separate record instead of replaying guesses against a character they
 * were never aimed at.
 */
export function poolTag(settings: Settings): string {
  return (settings.modernOnly ? "modern" : "all") + (settings.includeMangaOnly ? "+manga" : "");
}
