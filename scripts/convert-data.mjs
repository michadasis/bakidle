// One-shot conversion of legacy/data.js into typed modules. Mechanical on purpose: the
// character literals are copied verbatim so no value can be mistyped in transit.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "legacy", "data.js"), "utf8").replace(/\r\n/g, "\n");

const sagasLiteral = /const SAGAS = (\[[\s\S]*?\n\]);/.exec(src)[1];
const charsLiteral = /const CHARACTERS = (\[[\s\S]*\n\]);/.exec(src)[1];

const header = `// Generated from the original data.js by scripts/convert-data.mjs. Values are unchanged.
`;

fs.mkdirSync(path.join(ROOT, "src", "data"), { recursive: true });

fs.writeFileSync(
  path.join(ROOT, "src", "data", "sagas.ts"),
  `${header}
export interface Saga {
  id: string;
  /** Display name, and the value every character's \`saga\` field refers to. */
  name: string;
  /** Publication order. The grid arrow on a wrong saga is derived from this. */
  order: number;
}

export const SAGAS: readonly Saga[] = ${sagasLiteral};

export function sagaByName(name: string): Saga | undefined {
  return SAGAS.find((s) => s.name === name);
}
`
);

fs.writeFileSync(
  path.join(ROOT, "src", "data", "characters.ts"),
  `${header}
export interface Character {
  name: string;
  alias: string;
  gender: "Male" | "Female";
  origin: string;
  styles: string[];
  saga: string;
  /**
   * Height, weight and age are optional because the source material never published them for
   * part of the cast. Classic only answers with a character who has all three, and only
   * accepts a guess from one with a height and a weight.
   */
  height?: number;
  weight?: number;
  age?: number;
  status: "Alive" | "Deceased";
  quote: string;
  quoteVerified?: boolean;
  emoji: string[];
  image?: string;
  voiceClips?: string[];
  /** Never appears past the original Baki the Grappler run. */
  grapplerOnly?: boolean;
  /** No anime adaptation has ever included them; held back unless the setting is on. */
  mangaOnly?: boolean;
}

export const CHARACTERS: readonly Character[] = ${charsLiteral};
`
);

console.log("wrote src/data/sagas.ts and src/data/characters.ts");
