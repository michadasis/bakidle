// Generated from the original data.js by scripts/convert-data.mjs. Values are unchanged.

export interface Saga {
  id: string;
  /** Display name, and the value every character's `saga` field refers to. */
  name: string;
  /** Publication order. The grid arrow on a wrong saga is derived from this. */
  order: number;
}

export const SAGAS: readonly Saga[] = [
  { id: "original", name: "Original Saga", order: 1 },
  { id: "underground", name: "Underground Arena Saga", order: 2 },
  { id: "deathrow", name: "Most Evil Death Row Convicts Saga", order: 3 },
  { id: "raitaisai", name: "Great Raitaisai Saga", order: 4 },
  { id: "prison", name: "Great Prison Battle Saga", order: 5 },
  { id: "pickle", name: "Southeast Asia (Pickle) Saga", order: 6 },
  { id: "sonofogre", name: "Son of Ogre Saga", order: 7 },
  { id: "musashi", name: "Musashi Saga", order: 8 }
];

export function sagaByName(name: string): Saga | undefined {
  return SAGAS.find((s) => s.name === name);
}
