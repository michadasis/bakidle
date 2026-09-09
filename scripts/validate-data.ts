/**
 * Every invariant here is one that was broken at least once by hand-editing data.js: a missing
 * comma, a saga that did not exist, a clip file deleted from under a character, a character
 * with no anime appearance. Run from `npm run validate`, which `build` and `test` both depend
 * on, so these fail the build instead of reaching players.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { CHARACTERS } from "../src/data/characters";
import { SAGAS } from "../src/data/sagas";

const ROOT = path.resolve(import.meta.dirname, "..");
const sagaNames = new Set(SAGAS.map((s) => s.name));

const characterSchema = z
  .object({
    name: z.string().min(1),
    alias: z.string().min(1),
    gender: z.enum(["Male", "Female"]),
    origin: z.string().min(1),
    styles: z.array(z.string().min(1)).min(1),
    saga: z.string().refine((s) => sagaNames.has(s), { message: "saga is not in SAGAS" }),
    height: z.number().int().positive().optional(),
    weight: z.number().int().positive().optional(),
    age: z.number().int().positive().optional(),
    status: z.enum(["Alive", "Deceased"]),
    quote: z.string().min(1),
    quoteVerified: z.boolean().optional(),
    emoji: z.array(z.string().min(1)).min(1),
    image: z.string().url().optional(),
    voiceClips: z.array(z.string()).optional(),
    grapplerOnly: z.boolean().optional(),
    mangaOnly: z.boolean().optional(),
  })
  .strict();

const errors: string[] = [];
const warnings: string[] = [];

for (const c of CHARACTERS) {
  const parsed = characterSchema.safeParse(c);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${c.name ?? "<unnamed>"}: ${issue.path.join(".")} ${issue.message}`);
    }
  }
}

// Names are the identity used by saved progress and by the search, so they must be unique.
const seen = new Map<string, number>();
for (const c of CHARACTERS) seen.set(c.name, (seen.get(c.name) ?? 0) + 1);
for (const [name, n] of seen) if (n > 1) errors.push(`duplicate character name: ${name} (x${n})`);

// Saga order drives the grid arrow, so it has to be a clean sequence.
const orders = SAGAS.map((s) => s.order);
if (new Set(orders).size !== orders.length) errors.push("SAGAS contains duplicate order values");
if (orders.some((o, i) => i > 0 && o <= orders[i - 1])) errors.push("SAGAS orders are not ascending");

// Voice clips must exist on disk, and no clip should be left behind by a removed character.
const clipDir = path.join(ROOT, "public", "clips");
const onDisk = new Set(fs.existsSync(clipDir) ? fs.readdirSync(clipDir).filter((f) => f.endsWith(".mp3")) : []);
const referenced = new Set<string>();
for (const c of CHARACTERS) {
  for (const clip of c.voiceClips ?? []) {
    const file = clip.replace(/^clips\//, "");
    referenced.add(file);
    if (!onDisk.has(file)) errors.push(`${c.name}: voice clip missing on disk: ${clip}`);
  }
}
for (const file of onDisk) {
  if (!referenced.has(file)) warnings.push(`orphaned clip, no character references it: clips/${file}`);
}

// A character with no stats at all can never be an answer in Classic; that is allowed, but a
// mode has to have someone to draw from.
const stat = (c: (typeof CHARACTERS)[number]) =>
  Number.isFinite(c.height) && Number.isFinite(c.weight) && Number.isFinite(c.age);
if (!CHARACTERS.some(stat)) errors.push("no character has a full stat line; Classic would be empty");
if (!CHARACTERS.some((c) => c.image)) errors.push("no character has art; Splash would be empty");
if (!CHARACTERS.some((c) => c.voiceClips?.length)) errors.push("no character has a clip; Voice would be empty");

// The roster rule: anything the anime never adapted has to be flagged, because it is held back
// behind a setting rather than shipped as a normal character.
const mangaOnly = CHARACTERS.filter((c) => c.mangaOnly).length;
if (mangaOnly === 0) warnings.push("no character is flagged mangaOnly; verify against the wiki's Anime row");

console.log(
  `validated ${CHARACTERS.length} characters across ${SAGAS.length} sagas ` +
    `(${mangaOnly} manga-only, ${CHARACTERS.filter((c) => c.grapplerOnly).length} grappler-only, ` +
    `${CHARACTERS.filter(stat).length} with a full stat line)`
);
for (const w of warnings) console.warn(`  warning: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("data ok");
