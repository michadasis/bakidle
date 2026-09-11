export type ModeId = "classic" | "quote" | "emoji" | "splash" | "voice";

export interface GameMode {
  id: ModeId;
  label: string;
  icon: string;
  blurb: string;
}

/** Order matters: it drives the mode list, the rail, and which mode the next-mode button picks. */
export const GAME_MODES: readonly GameMode[] = [
  { id: "classic", label: "Classic", icon: "grid", blurb: "Compare stats guess by guess" },
  { id: "quote", label: "Quote", icon: "quote", blurb: "Guess from a line they say" },
  { id: "emoji", label: "Emoji", icon: "smile", blurb: "Guess from an emoji clue" },
  { id: "splash", label: "Splash Art", icon: "eye", blurb: "Guess from a blurred portrait" },
  { id: "voice", label: "Voice Lines", icon: "mic", blurb: "Guess from an audio clip" },
];

export const MODE_IDS: readonly ModeId[] = GAME_MODES.map((m) => m.id);

/** Each mode shuffles its deck with its own salt so the five never march in step. */
export const SEED_OFFSETS: Record<ModeId, number> = {
  classic: 0,
  quote: 7,
  emoji: 13,
  splash: 19,
  voice: 23,
};

export function isModeId(value: string): value is ModeId {
  return (MODE_IDS as readonly string[]).includes(value);
}

export function modeById(id: ModeId): GameMode {
  const mode = GAME_MODES.find((m) => m.id === id);
  if (!mode) throw new Error(`unknown mode: ${id}`);
  return mode;
}
