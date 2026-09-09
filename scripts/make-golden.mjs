// Captures the behaviour of the pre-refactor script.js so the rewrite can be proved
// equivalent. Run once against legacy/, never again: the file it writes is the reference.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const legacy = (f) => fs.readFileSync(path.join(ROOT, "legacy", f), "utf8");

const dataSrc = legacy("data.js");
const scriptSrc = legacy("script.js");

// Pull a top-level function out of the legacy file by brace matching.
function grab(name) {
  const start = scriptSrc.indexOf(`function ${name}(`);
  if (start === -1) throw new Error(`missing ${name}`);
  let depth = 0;
  for (let i = scriptSrc.indexOf("{", start); i < scriptSrc.length; i++) {
    if (scriptSrc[i] === "{") depth++;
    else if (scriptSrc[i] === "}" && --depth === 0) return scriptSrc.slice(start, i + 1);
  }
  throw new Error(`unterminated ${name}`);
}

const CONSTS = ["GAME_MODES", "SEED_OFFSETS", "SAGAS"];
const preamble = `
${dataSrc};
const GAME_MODES = ${/const GAME_MODES = (\[[\s\S]*?\]);/.exec(scriptSrc)[1]};
const SEED_OFFSETS = ${/const SEED_OFFSETS = (\{.*?\});/.exec(scriptSrc)[1]};
const DECK_SALT = 2654435761;
const STORAGE_VERSION = ${JSON.stringify(/const STORAGE_VERSION = "(\w+)";/.exec(scriptSrc)[1])};
const EPOCH_MS = Date.UTC(2026, 8, 6);
const DAY_MS = 86400000;
const TOLERANCE = ${/const TOLERANCE = (\{.*?\});/.exec(scriptSrc)[1]};
const MODE_RANK = GAME_MODES.map((m) => m.id);
const deckCache = new Map();
let deckCacheTag = null;
let settings = { modernOnly: false, includeMangaOnly: false };
function poolTag() {
  return (settings.modernOnly ? "modern" : "all") + (settings.includeMangaOnly ? "+manga" : "");
}
`;

const fns = [
  "hashSeed", "shuffledOrder", "modeDeck", "cardOn", "answersForDay", "answerForDay",
  "inPlay", "eligibleCharacters", "hasFullStats", "canCompareStats", "answerPool", "guessPool",
  "numCompare", "styleCompare", "sagaCompare", "computeComparisons", "sagaByName",
  "formatAge", "formatCountdown", "globalDayIndex", "msUntilGlobalReset", "dailyKey",
  "statsKey", "nextUnplayedMode",
].filter((n) => scriptSrc.includes(`function ${n}(`));

const api = new Function(`
${preamble}
${fns.map(grab).join("\n")}
return {
  CHARACTERS, SAGAS, GAME_MODES,
  setSettings: (s) => { settings = s; deckCacheTag = null; deckCache.clear(); },
  answersForDay, answerPool, guessPool, computeComparisons, sagaByName,
  formatAge, formatCountdown, dailyKey, statsKey, nextUnplayedMode,
  hasFullStats, canCompareStats, inPlay, eligibleCharacters,
};
`)();

const COMBOS = [
  { modernOnly: false, includeMangaOnly: false },
  { modernOnly: true, includeMangaOnly: false },
  { modernOnly: false, includeMangaOnly: true },
  { modernOnly: true, includeMangaOnly: true },
];

const DAYS = 800;
const golden = { generatedFrom: "legacy/script.js", days: DAYS, combos: [] };

for (const combo of COMBOS) {
  api.setSettings({ ...combo });
  const label = `${combo.modernOnly ? "modern" : "all"}${combo.includeMangaOnly ? "+manga" : ""}`;
  const answers = [];
  for (let d = 0; d < DAYS; d++) {
    const picks = api.answersForDay(d);
    answers.push(api.GAME_MODES.map((m) => (picks[m.id] ? picks[m.id].name : null)));
  }
  golden.combos.push({
    label,
    settings: combo,
    pools: Object.fromEntries(
      api.GAME_MODES.map((m) => [m.id, { answer: api.answerPool(m.id).length, guess: api.guessPool(m.id).length }])
    ),
    keys: { daily: api.dailyKey("classic", 3), stats: api.statsKey("classic") },
    answers,
  });
}

// A cross-section of comparison results, so the grid logic is pinned too.
api.setSettings({ modernOnly: false, includeMangaOnly: true });
const sample = ["Baki Hanma", "Yujiro Hanma", "Mount Toba", "Pickle", "Kaiou Ryuu", "Reihou", "Jack Hanma"];
golden.comparisons = [];
for (const a of sample) {
  for (const b of sample) {
    const ca = api.CHARACTERS.find((c) => c.name === a);
    const cb = api.CHARACTERS.find((c) => c.name === b);
    golden.comparisons.push({ guess: a, answer: b, result: api.computeComparisons(ca, cb) });
  }
}

golden.roster = api.CHARACTERS.map((c) => ({
  name: c.name, height: c.height ?? null, weight: c.weight ?? null, age: c.age ?? null,
  saga: c.saga, grapplerOnly: !!c.grapplerOnly, mangaOnly: !!c.mangaOnly,
}));

golden.formats = {
  ages: [18, 99, 146, 200000000].map((a) => api.formatAge(a)),
  countdowns: [0, 1000, 61000, 3600000, 86399000].map((ms) => api.formatCountdown(ms)),
};

fs.mkdirSync(path.join(ROOT, "tests", "__golden__"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "tests", "__golden__", "legacy-behaviour.json"),
  JSON.stringify(golden, null, 1)
);
console.log(
  `wrote golden: ${DAYS} days x ${COMBOS.length} combos, ${golden.comparisons.length} comparisons, ${golden.roster.length} characters`
);
