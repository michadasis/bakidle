/* ---------- icons (Lucide, inlined) ---------- */

const ICON_PATHS = {
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />',
  check: '<path d="M20 6 9 17l-5-5" />',
  x: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  flame: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />',
  grid: '<rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" />',
  quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />',
  smile: '<path d="M15 10V9" /><path d="M16.472 15a6 6 0 01-8.943 0" /><path d="M9 10V9" /><circle cx="12" cy="12" r="10" />',
  palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />',
  mic: '<path d="M12 19v3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><rect x="9" y="2" width="6" height="13" rx="3" />',
  chevronRight: '<path d="m9 18 6-6-6-6" />',
  chevronLeft: '<path d="m15 18-6-6 6-6" />',
};

function iconMarkup(name) {
  return `<svg class="icon icon-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

const GAME_MODES = [
  { id: "classic", label: "Classic", icon: "grid" },
  { id: "quote", label: "Quote", icon: "quote" },
  { id: "emoji", label: "Emoji", icon: "smile" },
  { id: "splash", label: "Splash Art", icon: "palette" },
  { id: "voice", label: "Voice Lines", icon: "mic" },
];

// Each mode has its own URL (/classic, /quote, ...) with the mode list at /. Vercel rewrites
// those paths to index.html; see vercel.json.
function modeFromPath() {
  const seg = location.pathname.replace(/\/+$/, "").split("/").pop();
  return GAME_MODES.some((m) => m.id === seg) ? seg : null;
}

function syncUrl(mode, replace) {
  const path = mode ? `/${mode}` : "/";
  if (location.pathname === path) return;
  try {
    history[replace ? "replaceState" : "pushState"]({ mode: mode || null }, "", path);
  } catch {
    // Opened straight off the filesystem, where pushState rejects the path. Routing is a
    // nicety here; the game itself keeps working.
  }
}

// The first mode still unsolved today, read top to bottom in the same order the mode list
// shows them. Skips the mode just finished (its record is not written yet) and any with an
// empty pool. Returns null when nothing is left, which turns the button into a way back to
// the list rather than a loop into an already-finished board.
function nextUnplayedMode(mode) {
  const today = globalDayIndex();
  return (
    GAME_MODES.find(
      (m) => m.id !== mode && answerPool(m.id).length > 0 && !isModeFinished(m.id, today)
    ) || null
  );
}

const els = {
  modeSelect: document.getElementById("modeSelect"),
  gameView: document.getElementById("gameView"),
  backToModesBtn: document.getElementById("backToModesBtn"),
  searchWrap: document.getElementById("searchWrap"),
  input: document.getElementById("guessInput"),
  suggestions: document.getElementById("suggestions"),
  classicBoardWrap: document.getElementById("classicBoardWrap"),
  board: document.getElementById("board").querySelector("tbody"),
  simpleBoard: document.getElementById("simpleBoard"),
  legend: document.getElementById("legend"),
  classicHints: document.getElementById("classicHints"),
  hintTile1: document.getElementById("hintTile1"),
  hint1Value: document.getElementById("hint1Value"),
  hintTile2: document.getElementById("hintTile2"),
  hint2Value: document.getElementById("hint2Value"),
  quoteClue: document.getElementById("quoteClue"),
  quoteText: document.getElementById("quoteText"),
  quoteNote: document.getElementById("quoteNote"),
  emojiClue: document.getElementById("emojiClue"),
  emojiText: document.getElementById("emojiText"),
  emojiHint: document.getElementById("emojiHint"),
  splashClue: document.getElementById("splashClue"),
  splashImage: document.getElementById("splashImage"),
  splashHint: document.getElementById("splashHint"),
  voiceClue: document.getElementById("voiceClue"),
  voicePlayBtn: document.getElementById("voicePlayBtn"),
  voiceProgressFill: document.getElementById("voiceProgressFill"),
  voiceClips: document.getElementById("voiceClips"),
  voiceHint: document.getElementById("voiceHint"),
  emptyModeMsg: document.getElementById("emptyModeMsg"),
  statusLine: document.getElementById("statusLine"),
  guessCount: document.getElementById("guessCount"),
  dayNumber: document.getElementById("dayNumber"),
  modeRail: document.getElementById("modeRail"),
  resetTimer: document.getElementById("resetTimer"),
  resetCountdown: document.getElementById("resetCountdown"),
  streakLine: document.getElementById("streakLine"),
  streakCount: document.getElementById("streakCount"),
  winBanner: document.getElementById("winBanner"),
  resultTitle: document.getElementById("resultTitle"),
  resultAvatarWrap: document.getElementById("resultAvatarWrap"),
  winAnswer: document.getElementById("winAnswer"),
  winAlias: document.getElementById("winAlias"),
  winTries: document.getElementById("winTries"),
  winTriesWord: document.getElementById("winTriesWord"),
  nextModeBtn: document.getElementById("nextModeBtn"),
  winStreakLine: document.getElementById("winStreakLine"),
  infoBtn: document.getElementById("infoBtn"),
  statsBtn: document.getElementById("statsBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsModal: document.getElementById("settingsModal"),
  modernOnlyToggle: document.getElementById("modernOnlyToggle"),
  mangaOnlyToggle: document.getElementById("mangaOnlyToggle"),
  settingsPoolNote: document.getElementById("settingsPoolNote"),
  infoModal: document.getElementById("infoModal"),
  statsModal: document.getElementById("statsModal"),
  statsContent: document.getElementById("statsContent"),
  confettiLayer: document.getElementById("confettiLayer"),
};

const TOLERANCE = { height: 5, weight: 8, age: 5 };
const SPLASH_BLUR_LEVELS = [20, 15, 11, 8, 5, 2, 0];
const CLASSIC_HINT_THRESHOLDS = { alias: 3, portrait: 6 };

let activeGameMode = "classic";
let highlightedIndex = -1;

let state = {
  gameMode: "classic",
  answer: null,
  guesses: [],
  finished: false,
  won: false,
  empty: false,
  day: null,
};

// Characters the anime has never adapted sit out unless they are switched on, and then they
// are in the game fully: answerable and guessable like everyone else.
function inPlay() {
  return settings.includeMangaOnly ? CHARACTERS : CHARACTERS.filter((c) => !c.mangaOnly);
}

function eligibleCharacters() {
  const pool = inPlay();
  return settings.modernOnly ? pool.filter((c) => !c.grapplerOnly) : pool;
}

// Published stats are patchy: some of the cast have a height and weight but no recorded age,
// and plenty have none of the three. Classic only ever answers with a character who has all
// three, so the board is always fully solvable.
function hasFullStats(c) {
  return Number.isFinite(c.height) && Number.isFinite(c.weight) && Number.isFinite(c.age);
}

// A guess only needs height and weight to be worth making — those two columns still narrow
// things down, and the age cell reads "?" instead of comparing.
function canCompareStats(c) {
  return Number.isFinite(c.height) && Number.isFinite(c.weight);
}

function answerPool(mode) {
  const pool = eligibleCharacters();
  if (mode === "classic") return pool.filter(hasFullStats);
  if (mode === "splash") return pool.filter((c) => c.image);
  if (mode === "voice") return pool.filter((c) => Array.isArray(c.voiceClips) && c.voiceClips.length > 0);
  return pool;
}

// Who you are allowed to type. Unlike the answer pool this ignores the era setting — every
// character stays guessable — but Classic still hides the ones with no stats to compare.
function guessPool(mode) {
  const pool = inPlay();
  return mode === "classic" ? pool.filter(canCompareStats) : pool;
}

/* ---------- date / seeding (shared answer for everyone, resets at 12 AM UTC) ---------- */

// The epoch is a UTC midnight, so every day boundary lands on 12:00 AM UTC. One clock for
// the whole site: the countdown, the puzzle rollover and the played-today markers all read
// from globalDayIndex() / msUntilGlobalReset(), so all modes reset together for everyone.
const EPOCH_MS = Date.UTC(2026, 8, 6);
const DAY_MS = 86400000;
// Bump this to wipe every player's saved progress, streaks and stats at once.
// Old keys are cleared on boot by purgeLegacyStorage().
const STORAGE_VERSION = "v2";

function globalDayIndex() {
  return Math.floor((Date.now() - EPOCH_MS) / DAY_MS);
}

function msUntilGlobalReset() {
  return DAY_MS - ((((Date.now() - EPOCH_MS) % DAY_MS) + DAY_MS) % DAY_MS);
}

function hashSeed(n) {
  let x = n | 0;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return x >>> 0;
}

// Fisher-Yates driven by a deterministic xorshift, so every client builds the same order.
function shuffledOrder(n, seed) {
  const order = Array.from({ length: n }, (_, i) => i);
  let s = (seed >>> 0) || 1;
  const next = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;  s >>>= 0;
    return s;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Deals the pool out in shuffled cycles instead of drawing independently each day, so every
// character appears once before any repeats and each cycle gets a fresh order. The previous
// scheme (hashSeed(day + offset) % poolSize) repeated characters inside the first week and
// let the small per-mode offsets alias, making classic day 7 identical to quote day 0.
// Each mode deals from its own shuffled deck, one card a day, so it works through the whole
// pool before any character comes round again.
const SEED_OFFSETS = { classic: 0, quote: 7, emoji: 13, splash: 19, voice: 23 };

const DECK_SALT = 2654435761;

// Modes are resolved in list order and each one only ever avoids the modes above it, so a
// deck can always be built by consulting decks that are already settled.
const MODE_RANK = GAME_MODES.map((m) => m.id);

// Decks are cached per pool variant, mode and cycle. Pools of different sizes roll over on
// different days, so a cycle number only means anything alongside the mode it belongs to.
const deckCache = new Map();
let deckCacheTag = null;

function modeDeck(modeId, cycle) {
  const tag = poolTag();
  if (deckCacheTag !== tag) {
    deckCacheTag = tag;
    deckCache.clear();
  }
  const key = `${modeId}:${cycle}`;
  const hit = deckCache.get(key);
  if (hit) return hit;

  const pool = answerPool(modeId);
  const size = pool.length;
  const deck = shuffledOrder(size, hashSeed(cycle * DECK_SALT + SEED_OFFSETS[modeId])).map((i) => pool[i]);
  // Cache before repairing: the repair only reads decks of earlier modes, but caching first
  // keeps a cycle from being built twice if one of those reads lands back on this mode.
  deckCache.set(key, deck);

  const earlier = MODE_RANK.slice(0, MODE_RANK.indexOf(modeId));
  if (earlier.length) {
    const startDay = cycle * size;
    const clashes = (day, card) => earlier.some((other) => {
      const taken = cardOn(other, day);
      return taken && taken.name === card.name;
    });
    // A card sharing a day with an earlier mode is swapped elsewhere in this same deck. The
    // whole cycle is in hand, so the swap can pick any slot rather than only the untouched
    // tail, and swapping two positions leaves the deck a permutation — the mode still answers
    // with every character exactly once before repeating.
    for (let slot = 0; slot < size; slot++) {
      if (!clashes(startDay + slot, deck[slot])) continue;
      for (let t = 0; t < size; t++) {
        if (t === slot) continue;
        if (clashes(startDay + slot, deck[t]) || clashes(startDay + t, deck[slot])) continue;
        [deck[slot], deck[t]] = [deck[t], deck[slot]];
        break;
      }
    }
  }
  return deck;
}

function cardOn(modeId, day) {
  const size = answerPool(modeId).length;
  if (size === 0) return null;
  return modeDeck(modeId, Math.floor(day / size))[day % size];
}

// Picking modes independently let one character be the answer in two of them at once, which
// happened on about 29% of days and handed a free win to anyone who solved one mode then
// opened another.
function answersForDay(day) {
  const target = Math.max(0, day);
  const picks = {};
  GAME_MODES.forEach((mode) => (picks[mode.id] = cardOn(mode.id, target)));
  return picks;
}

function answerForDay(mode, day) {
  return answersForDay(day)[mode];
}

function dailyKey(mode, day) {
  return `bakidle_daily_${STORAGE_VERSION}_${mode}_${poolTag()}_${day}`;
}

/* ---------- settings ---------- */

const SETTINGS_KEY = `bakidle_settings_${STORAGE_VERSION}`;
const DEFAULT_SETTINGS = { modernOnly: false, includeMangaOnly: false };

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

let settings = loadSettings();

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Each pool gets its own saved progress: the answer differs between them, so sharing a key
// would replay yesterday's guesses against a character they were never aimed at.
function poolTag() {
  return (settings.modernOnly ? "modern" : "all") + (settings.includeMangaOnly ? "+manga" : "");
}

/* ---------- per-day records ---------- */

function loadDaily(mode, day) {
  const raw = localStorage.getItem(dailyKey(mode, day));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Finishing a mode closes it for the current UTC day only; the next 12 AM UTC reopens every
// mode at the same instant for every player.
function isModeFinished(mode, day) {
  const rec = loadDaily(mode, day);
  return !!rec && rec.finished;
}

// Drops entries from earlier storage versions (including the retired per-mode 24h locks) and
// finished days that are behind us, so localStorage does not grow without bound.
function purgeLegacyStorage() {
  const today = globalDayIndex();
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("bakidle_")) continue;
    if (key.startsWith("bakidle_lock_")) {
      localStorage.removeItem(key);
      continue;
    }
    if (!key.includes(`_${STORAGE_VERSION}_`) && !key.endsWith(`_${STORAGE_VERSION}`)) {
      localStorage.removeItem(key);
      continue;
    }
    if (key.startsWith(`bakidle_daily_${STORAGE_VERSION}_`)) {
      const day = Number(key.slice(key.lastIndexOf("_") + 1));
      if (Number.isFinite(day) && day !== today) localStorage.removeItem(key);
    }
  }
}

/* ---------- global streak (spans all game modes) ---------- */

const GLOBAL_STREAK_KEY = `bakidle_streak_global_${STORAGE_VERSION}`;

function loadGlobalStreak() {
  const raw = localStorage.getItem(GLOBAL_STREAK_KEY);
  const g = raw ? JSON.parse(raw) : { currentStreak: 0, maxStreak: 0, lastWinDay: null };
  const today = globalDayIndex();
  if (g.lastWinDay !== null && g.lastWinDay !== today && g.lastWinDay !== today - 1) {
    g.currentStreak = 0;
    localStorage.setItem(GLOBAL_STREAK_KEY, JSON.stringify(g));
  }
  return g;
}

function recordGlobalWin() {
  const g = loadGlobalStreak();
  const today = globalDayIndex();
  if (g.lastWinDay !== today) {
    g.currentStreak = g.lastWinDay === today - 1 ? g.currentStreak + 1 : 1;
    g.lastWinDay = today;
    g.maxStreak = Math.max(g.maxStreak, g.currentStreak);
    localStorage.setItem(GLOBAL_STREAK_KEY, JSON.stringify(g));
  }
  return g;
}

/* ---------- avatars (real image if present, else generated initials) ---------- */

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function initialsFor(name) {
  const tokens = name.split(/\s+/).filter(Boolean);
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
}

function buildAvatar(char, sizePx) {
  const wrap = document.createElement("div");
  wrap.className = "avatar";
  wrap.title = char.name;
  if (sizePx) {
    wrap.style.width = `${sizePx}px`;
    wrap.style.height = `${sizePx}px`;
    wrap.style.fontSize = `${Math.round(sizePx * 0.38)}px`;
  }
  wrap.style.setProperty("--hue", hashString(char.name) % 360);
  if (char.image) {
    const img = document.createElement("img");
    img.className = "avatar-img";
    img.src = char.image;
    img.alt = char.name;
    img.loading = "lazy";
    img.onerror = () => {
      img.remove();
      wrap.textContent = initialsFor(char.name);
    };
    wrap.appendChild(img);
  } else {
    wrap.textContent = initialsFor(char.name);
  }
  return wrap;
}

/* ---------- comparisons ---------- */

// Pickle's age is ~200 million, which swamps the cell if printed in full. The stored value
// stays exact so the higher/lower comparison is still honest.
function formatAge(age) {
  return age >= 1000000 ? `~${Math.round(age / 1000000)}M` : `${age}`;
}

function numCompare(guessVal, answerVal, tolerance) {
  const diff = Math.abs(guessVal - answerVal);
  const cls = diff === 0 ? "correct" : diff <= tolerance ? "partial" : "wrong";
  const arrow = guessVal === answerVal ? "" : guessVal < answerVal ? "▲" : "▼";
  return { cls, arrow };
}

function styleCompare(guessArr, answerArr) {
  const g = new Set(guessArr);
  const a = new Set(answerArr);
  const same = g.size === a.size && [...g].every((x) => a.has(x));
  if (same) return "correct";
  return [...g].some((x) => a.has(x)) ? "partial" : "wrong";
}

function sagaCompare(guessSaga, answerSaga) {
  if (guessSaga === answerSaga) return { cls: "correct", arrow: "" };
  const gOrder = sagaByName(guessSaga)?.order ?? 0;
  const aOrder = sagaByName(answerSaga)?.order ?? 0;
  const diff = Math.abs(gOrder - aOrder);
  return { cls: diff === 1 ? "partial" : "wrong", arrow: gOrder < aOrder ? "▲" : "▼" };
}

function computeComparisons(g, a) {
  return {
    gender: { cls: g.gender === a.gender ? "correct" : "wrong" },
    origin: { cls: g.origin === a.origin ? "correct" : "wrong" },
    styles: { cls: styleCompare(g.styles, a.styles) },
    saga: sagaCompare(g.saga, a.saga),
    height: numCompare(g.height, a.height, TOLERANCE.height),
    weight: numCompare(g.weight, a.weight, TOLERANCE.weight),
    age: Number.isFinite(g.age) ? numCompare(g.age, a.age, TOLERANCE.age) : { cls: "unknown", arrow: "" },
    status: { cls: g.status === a.status ? "correct" : "wrong" },
  };
}

/* ---------- rendering: classic table ---------- */

function makeCell(label, text, cls, arrow) {
  const td = document.createElement("td");
  if (cls) td.className = cls;
  td.dataset.label = label;
  const value = document.createElement("span");
  value.className = "cell-value";
  value.innerHTML = arrow ? `${text} <span class="arrow">${arrow}</span>` : text;
  td.appendChild(value);
  return td;
}

function addClassicRow(guessChar) {
  const cmp = computeComparisons(guessChar, state.answer);
  const tr = document.createElement("tr");

  const nameTd = document.createElement("td");
  nameTd.className = "name-cell";
  nameTd.dataset.label = "Character";
  nameTd.appendChild(buildAvatar(guessChar, 34));
  const nameSpan = document.createElement("span");
  nameSpan.textContent = guessChar.name;
  nameTd.appendChild(nameSpan);
  tr.appendChild(nameTd);

  tr.appendChild(makeCell("Gender", guessChar.gender, cmp.gender.cls));
  tr.appendChild(makeCell("Origin", guessChar.origin, cmp.origin.cls));
  tr.appendChild(makeCell("Fighting Style", guessChar.styles.join(", "), cmp.styles.cls));
  tr.appendChild(makeCell("Saga (Arc)", guessChar.saga, cmp.saga.cls, cmp.saga.arrow));
  tr.appendChild(makeCell("Height", `${guessChar.height} cm`, cmp.height.cls, cmp.height.arrow));
  tr.appendChild(makeCell("Weight", `${guessChar.weight} kg`, cmp.weight.cls, cmp.weight.arrow));
  tr.appendChild(
    makeCell("Age", Number.isFinite(guessChar.age) ? formatAge(guessChar.age) : "?", cmp.age.cls, cmp.age.arrow)
  );
  tr.appendChild(makeCell("Status", guessChar.status, cmp.status.cls));

  els.board.prepend(tr);
}

/* ---------- rendering: simple list (quote / emoji) ---------- */

function addSimpleRow(guessChar) {
  const correct = guessChar.name === state.answer.name;
  const li = document.createElement("li");
  li.className = `simple-row ${correct ? "correct" : "wrong"}`;
  li.appendChild(buildAvatar(guessChar, 32));
  const nameSpan = document.createElement("span");
  nameSpan.className = "simple-name";
  nameSpan.textContent = guessChar.name;
  li.appendChild(nameSpan);
  const icon = document.createElement("span");
  icon.className = "simple-icon";
  icon.innerHTML = iconMarkup(correct ? "check" : "x");
  li.appendChild(icon);
  els.simpleBoard.prepend(li);
}

/* ---------- core render ---------- */

function updateDayNumber() {
  els.dayNumber.textContent = `Daily #${globalDayIndex() + 1}`;
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function playableModes() {
  return GAME_MODES.filter((m) => answerPool(m.id).length > 0);
}

function allModesFinishedToday() {
  const today = globalDayIndex();
  return playableModes().every((m) => isModeFinished(m.id, today));
}

// The countdown is only useful once there is nothing left to play: inside a mode that means
// you have solved it, and on the mode list it means every mode is done for the day.
function shouldShowCountdown() {
  if (els.gameView.hidden) return allModesFinishedToday();
  return !!state && !state.empty && state.finished;
}

// One countdown for every mode and every player: time left until 12 AM UTC.
function updateResetTimer() {
  els.resetTimer.hidden = !shouldShowCountdown();
  els.resetCountdown.textContent = formatCountdown(msUntilGlobalReset());
}

// Quick switcher shown once a mode is picked, so you can move between modes without
// going back to the list. Rebuilt on every render so the solved check marks stay current.
function renderModeRail() {
  const today = globalDayIndex();
  els.modeRail.innerHTML = "";
  GAME_MODES.forEach((mode) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `rail-btn${mode.id === activeGameMode ? " active" : ""}`;
    btn.dataset.railMode = mode.id;
    btn.title = mode.label;
    btn.setAttribute("aria-label", mode.label);
    if (mode.id === activeGameMode) btn.setAttribute("aria-current", "true");
    btn.disabled = answerPool(mode.id).length === 0;
    btn.innerHTML = iconMarkup(mode.icon);
    if (isModeFinished(mode.id, today)) {
      const check = document.createElement("span");
      check.className = "rail-check";
      check.innerHTML = iconMarkup("check");
      btn.appendChild(check);
    }
    btn.addEventListener("click", () => {
      if (mode.id !== activeGameMode) selectMode(mode.id);
    });
    els.modeRail.appendChild(btn);
  });
}

function updateStreakLine() {
  const g = loadGlobalStreak();
  els.streakCount.textContent = g.currentStreak;
  els.streakLine.classList.toggle("is-zero", g.currentStreak <= 0);
  els.streakLine.title = g.currentStreak > 0 ? `${g.currentStreak}-day win streak` : "No win streak yet";
}

function renderEmojiClue() {
  const total = state.answer.emoji.length;
  const revealed = state.finished ? total : Math.min(total, 1 + state.guesses.length);
  els.emojiText.innerHTML = state.answer.emoji
    .map((e, i) => `<span class="emoji-slot${i < revealed ? "" : " locked"}">${i < revealed ? e : iconMarkup("lock")}</span>`)
    .join(" ");
  els.emojiHint.textContent = state.finished ? "" : `${revealed}/${total} revealed — a wrong guess reveals another`;
}

function renderSplashClue() {
  els.splashImage.src = state.answer.image || "";
  const level = state.finished ? SPLASH_BLUR_LEVELS.length - 1 : Math.min(state.guesses.length, SPLASH_BLUR_LEVELS.length - 1);
  els.splashImage.style.filter = `blur(${SPLASH_BLUR_LEVELS[level]}px)`;
  els.splashHint.textContent = state.finished ? "" : `Guess ${state.guesses.length + 1} — a wrong guess sharpens the image`;
}

// One transport control drives whichever clip is selected; the numbered chips only
// choose between clips, so there's never more than one play button on screen.
// A single reusable element, never one per clip: with one element it is structurally
// impossible for two clips to sound at once, however the load/pause races fall out.
let clipAudio = null;
let playToken = 0;
let playingIndex = -1;
let selectedClip = 0;

function voiceClipList() {
  return (state.answer && state.answer.voiceClips) || [];
}

function unlockedClipCount() {
  const total = voiceClipList().length;
  return state.finished ? total : Math.min(total, 1 + state.guesses.length);
}

function setClipProgress(fraction) {
  const pct = Math.max(0, Math.min(1, fraction || 0)) * 100;
  els.voiceProgressFill.style.width = `${pct}%`;
}

function paintVoiceUI() {
  const playing = playingIndex !== -1;
  els.voicePlayBtn.innerHTML = iconMarkup(playing ? "stop" : "play");
  els.voicePlayBtn.title = playing ? "Stop" : `Play clip ${selectedClip + 1}`;
  els.voicePlayBtn.setAttribute("aria-label", els.voicePlayBtn.title);
  els.voicePlayBtn.classList.toggle("playing", playing);
  els.voicePlayBtn.disabled = voiceClipList().length === 0;

  [...els.voiceClips.children].forEach((chip, i) => {
    chip.classList.toggle("selected", i === selectedClip);
    chip.classList.toggle("playing", i === playingIndex);
  });
}

function clipPlayer() {
  if (clipAudio) return clipAudio;
  clipAudio = new Audio();
  clipAudio.addEventListener("timeupdate", () => {
    if (playingIndex !== -1 && clipAudio.duration) {
      setClipProgress(clipAudio.currentTime / clipAudio.duration);
    }
  });
  clipAudio.addEventListener("ended", () => stopClip());
  clipAudio.addEventListener("error", () => {
    if (playingIndex === -1) return;
    els.statusLine.textContent = "Couldn't play that clip — check the file exists in clips/.";
    stopClip();
  });
  return clipAudio;
}

function stopClip() {
  playToken++;
  if (clipAudio) clipAudio.pause();
  playingIndex = -1;
  setClipProgress(0);
  paintVoiceUI();
}

function playSelectedClip() {
  const src = voiceClipList()[selectedClip];
  if (!src) return;

  const audio = clipPlayer();
  audio.pause();
  // Assigning src reloads the element and resets currentTime, so switching clips
  // replaces the sound rather than layering a second one over it.
  audio.src = src;

  const token = ++playToken;
  playingIndex = selectedClip;
  setClipProgress(0);

  audio.play().catch(() => {
    // Switching clips aborts the previous play() promise. That rejection is expected
    // and must not report an error over the clip that superseded it.
    if (token !== playToken) return;
    els.statusLine.textContent = "Couldn't play that clip — check the file exists in clips/.";
    stopClip();
  });

  paintVoiceUI();
}

function selectClip(i) {
  const wasPlaying = playingIndex !== -1;
  selectedClip = i;
  // Switching while playing jumps straight to the new clip; otherwise just re-aim the
  // play button.
  if (wasPlaying) {
    playSelectedClip();
  } else {
    setClipProgress(0);
    paintVoiceUI();
  }
}

function renderVoiceClue() {
  const clips = voiceClipList();
  const unlocked = unlockedClipCount();
  // A newly locked selection can happen when the mode reloads with fewer guesses.
  if (selectedClip >= unlocked) selectedClip = Math.max(0, unlocked - 1);

  els.voiceClips.innerHTML = "";
  clips.forEach((_, i) => {
    const chip = document.createElement("button");
    const isUnlocked = i < unlocked;
    chip.type = "button";
    chip.className = `voice-chip${isUnlocked ? "" : " locked"}`;
    chip.disabled = !isUnlocked;
    if (isUnlocked) {
      chip.textContent = String(i + 1);
      chip.title = `Clip ${i + 1}`;
      chip.addEventListener("click", () => selectClip(i));
    } else {
      chip.innerHTML = iconMarkup("lock");
      chip.title = `Clip ${i + 1} locked`;
    }
    els.voiceClips.appendChild(chip);
  });
  // Nothing to choose between with a single clip.
  els.voiceClips.hidden = clips.length <= 1;

  // A guess rebuilds the chips while audio may still be running, so repaint rather than
  // assume a fresh state.
  paintVoiceUI();
  els.voiceHint.textContent = state.finished
    ? ""
    : `${unlocked}/${clips.length} clips unlocked — a wrong guess unlocks another`;
}

function renderClassicHints() {
  const guesses = state.guesses.length;
  const aliasUnlocked = state.finished || guesses >= CLASSIC_HINT_THRESHOLDS.alias;
  const portraitUnlocked = state.finished || guesses >= CLASSIC_HINT_THRESHOLDS.portrait;

  els.hintTile1.classList.toggle("unlocked", aliasUnlocked);
  els.hintTile1.classList.toggle("locked", !aliasUnlocked);
  els.hint1Value.innerHTML = aliasUnlocked
    ? `"${state.answer.alias}"`
    : `${iconMarkup("lock")} ${CLASSIC_HINT_THRESHOLDS.alias} guesses`;

  els.hintTile2.classList.toggle("unlocked", portraitUnlocked);
  els.hintTile2.classList.toggle("locked", !portraitUnlocked);
  els.hint2Value.innerHTML = "";
  if (portraitUnlocked) {
    els.hint2Value.appendChild(buildAvatar(state.answer, 56));
  } else {
    els.hint2Value.innerHTML = `${iconMarkup("lock")} ${CLASSIC_HINT_THRESHOLDS.portrait} guesses`;
  }
}

function renderClue() {
  els.classicHints.hidden = state.gameMode !== "classic";
  els.quoteClue.hidden = state.gameMode !== "quote";
  els.emojiClue.hidden = state.gameMode !== "emoji";
  els.splashClue.hidden = state.gameMode !== "splash";
  els.voiceClue.hidden = state.gameMode !== "voice";
  if (state.gameMode === "classic") renderClassicHints();
  if (state.gameMode === "quote") {
    els.quoteText.textContent = state.answer.quote;
    els.quoteNote.textContent = state.answer.quoteVerified ? "" : "Paraphrased line";
  }
  if (state.gameMode === "emoji") renderEmojiClue();
  if (state.gameMode === "splash") renderSplashClue();
  if (state.gameMode === "voice") renderVoiceClue();
  else stopClip();
}

function updateResultBanner() {
  els.winBanner.hidden = !state.finished;
  if (!state.finished) return;
  els.resultTitle.textContent = "Victory!";
  els.resultAvatarWrap.innerHTML = "";
  els.resultAvatarWrap.appendChild(buildAvatar(state.answer, 72));
  els.winAnswer.textContent = state.answer.name;
  els.winAlias.textContent = state.answer.alias ? `"${state.answer.alias}"` : "";
  els.winTries.textContent = state.guesses.length;
  els.winTriesWord.textContent = state.guesses.length === 1 ? "try" : "tries";
  const g = loadGlobalStreak();
  els.winStreakLine.innerHTML =
    g.currentStreak > 0
      ? `<span class="streak-badge"><span class="flame">${iconMarkup("flame")}</span><span class="streak-count">${g.currentStreak}</span></span>`
      : "";

  const next = nextUnplayedMode(state.gameMode);
  if (next) {
    els.nextModeBtn.dataset.nextMode = next.id;
    els.nextModeBtn.innerHTML = `${iconMarkup(next.icon)}<span>${next.label}</span>`;
  } else {
    els.nextModeBtn.dataset.nextMode = "";
    els.nextModeBtn.innerHTML = `${iconMarkup("chevronLeft")}<span>Back to Modes</span>`;
  }
}

// Winning reveals the banner, re-renders the clue and drops in the countdown, all of which
// change the page height. Scrolling in the same tick aimed at the pre-reveal offset and left
// the banner off screen, so wait two frames for layout to settle first.
function scrollToResult() {
  const bring = () => els.winBanner.scrollIntoView({ behavior: "smooth", block: "center" });
  requestAnimationFrame(() => requestAnimationFrame(bring));
  // The result avatar is an <img>: decoding it after the scroll starts pushes the banner
  // further down, so aim once more when it lands.
  els.winBanner.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", bring, { once: true });
  });
}

function render() {
  updateDayNumber();
  renderModeRail();
  updateResetTimer();
  updateStreakLine();
  els.emptyModeMsg.hidden = !state.empty;
  els.searchWrap.hidden = state.empty;
  els.legend.hidden = state.empty || state.gameMode !== "classic";
  els.classicBoardWrap.hidden = state.empty || state.gameMode !== "classic";
  els.simpleBoard.hidden = state.empty || state.gameMode === "classic";
  els.guessCount.textContent = "";
  if (state.empty) {
    els.classicHints.hidden = true;
    els.quoteClue.hidden = true;
    els.emojiClue.hidden = true;
    els.splashClue.hidden = true;
    els.voiceClue.hidden = true;
    stopClip();
    els.winBanner.hidden = true;
    return;
  }

  const isClassic = state.gameMode === "classic";
  els.board.innerHTML = "";
  els.simpleBoard.innerHTML = "";
  renderClue();

  state.guesses.forEach((name) => {
    const c = CHARACTERS.find((x) => x.name === name);
    if (!c) return;
    if (isClassic) addClassicRow(c);
    else addSimpleRow(c);
  });

  els.guessCount.textContent = state.guesses.length
    ? `${state.guesses.length} guess${state.guesses.length === 1 ? "" : "es"}`
    : "";
  els.input.disabled = state.finished;
  els.input.value = "";
  els.statusLine.textContent = "";
  closeSuggestions();
  updateResultBanner();
  if (!state.finished) els.input.focus();
}

/* ---------- state load / persist ---------- */

function persist() {
  localStorage.setItem(
    dailyKey(state.gameMode, state.day),
    JSON.stringify({ guesses: state.guesses, finished: state.finished, won: state.won })
  );
}

function loadState(gameMode) {
  const pool = answerPool(gameMode);
  if (pool.length === 0) {
    state = { gameMode, answer: null, guesses: [], finished: false, won: false, empty: true, day: null };
    render();
    return;
  }

  const day = globalDayIndex();
  const answer = answerForDay(gameMode, day);
  const saved = loadDaily(gameMode, day);
  state = saved
    ? { gameMode, answer, guesses: saved.guesses, finished: saved.finished, won: saved.won, empty: false, day }
    : { gameMode, answer, guesses: [], finished: false, won: false, empty: false, day };
  render();
}

function refresh() {
  loadState(activeGameMode);
}

function renderModeStatuses() {
  const today = globalDayIndex();
  document.querySelectorAll("[data-status-for]").forEach((el) => {
    const mode = el.dataset.statusFor;
    el.className = "mode-item-status";
    el.innerHTML = "";
    if (!isModeFinished(mode, today)) return;
    el.classList.add("status-won");
    el.innerHTML = iconMarkup("check");
  });
}

function showModeSelect({ fromHistory = false } = {}) {
  // Hiding the game view doesn't stop playback on its own, and a clip would keep playing
  // audio behind the mode list.
  stopClip();
  els.gameView.hidden = true;
  els.modeSelect.hidden = false;
  els.modeRail.hidden = true;
  if (!fromHistory) syncUrl(null);
  updateDayNumber();
  updateResetTimer();
  updateStreakLine();
  renderModeStatuses();
}

function selectMode(mode, { fromHistory = false } = {}) {
  activeGameMode = mode;
  els.modeSelect.hidden = true;
  els.gameView.hidden = false;
  els.modeRail.hidden = false;
  if (!fromHistory) syncUrl(mode);
  refresh();
}

function applyRoute() {
  const mode = modeFromPath();
  if (mode) selectMode(mode, { fromHistory: true });
  else showModeSelect({ fromHistory: true });
}

window.addEventListener("popstate", applyRoute);

/* ---------- guessing ---------- */

function submitGuess(rawName) {
  if (state.finished || state.empty) return;
  const char = guessPool(state.gameMode).find((c) => c.name.toLowerCase() === rawName.toLowerCase());
  if (!char) {
    // Naming a real character the mode cannot use reads as a typo unless we say why, and the
    // two reasons need different wording: held back by a setting, or missing the stats to compare.
    const known = CHARACTERS.find((c) => c.name.toLowerCase() === rawName.toLowerCase());
    if (!known) els.statusLine.textContent = "Pick a character from the list.";
    else if (known.mangaOnly && !settings.includeMangaOnly)
      els.statusLine.textContent = `${known.name} never appears in the anime. Settings can bring them in.`;
    else els.statusLine.textContent = `No height or weight on record for ${known.name}, so Classic leaves them out.`;
    return;
  }
  if (state.guesses.includes(char.name)) {
    els.statusLine.textContent = "Already guessed that one.";
    return;
  }

  state.guesses.push(char.name);
  if (state.gameMode === "classic") addClassicRow(char);
  else addSimpleRow(char);

  els.guessCount.textContent = `${state.guesses.length} guess${state.guesses.length === 1 ? "" : "es"}`;
  els.input.value = "";
  els.statusLine.textContent = "";
  closeSuggestions();

  if (char.name === state.answer.name) {
    state.finished = true;
    state.won = true;
    els.input.disabled = true;
    updateStats(true, state.guesses.length);
    recordGlobalWin();
    updateResultBanner();
    updateStreakLine();
    updateResetTimer();
    renderModeRail();
    launchConfetti();
  }
  renderClue();
  persist();
  if (state.finished) scrollToResult();
}

/* ---------- suggestions (with keyboard nav) ---------- */

function closeSuggestions() {
  els.suggestions.innerHTML = "";
  highlightedIndex = -1;
}

function setHighlighted(i) {
  const items = [...els.suggestions.children];
  items.forEach((el) => el.classList.remove("highlighted"));
  if (items[i]) {
    items[i].classList.add("highlighted");
    highlightedIndex = i;
    items[i].scrollIntoView({ block: "nearest" });
  }
}

function updateSuggestions() {
  const q = els.input.value.trim().toLowerCase();
  closeSuggestions();
  if (!q) return;
  const guessed = new Set(state.guesses);
  const matches = guessPool(state.gameMode).filter((c) => {
    if (guessed.has(c.name)) return false;
    return c.name.toLowerCase().split(/\s+/).some((token) => token.startsWith(q));
  })
    .sort((a, b) => {
      const aFirst = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bFirst = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aFirst - bFirst || a.name.localeCompare(b.name);
    })
    .slice(0, 8);
  matches.forEach((c, i) => {
    const li = document.createElement("li");
    li.className = "suggestion-item";
    li.appendChild(buildAvatar(c, 26));
    const span = document.createElement("span");
    span.textContent = c.name;
    li.appendChild(span);
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      submitGuess(c.name);
    });
    li.addEventListener("mouseenter", () => setHighlighted(i));
    els.suggestions.appendChild(li);
  });
}

els.input.addEventListener("input", updateSuggestions);
els.input.addEventListener("keydown", (e) => {
  const items = [...els.suggestions.children];
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (items.length) setHighlighted((highlightedIndex + 1) % items.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (items.length) setHighlighted((highlightedIndex - 1 + items.length) % items.length);
  } else if (e.key === "Enter") {
    if (highlightedIndex >= 0 && items[highlightedIndex]) {
      submitGuess(items[highlightedIndex].querySelector("span").textContent);
    } else if (items.length > 0) {
      submitGuess(items[0].querySelector("span").textContent);
    } else {
      submitGuess(els.input.value.trim());
    }
  } else if (e.key === "Escape") {
    closeSuggestions();
  }
});
document.addEventListener("click", (e) => {
  if (!els.suggestions.contains(e.target) && e.target !== els.input) closeSuggestions();
});

/* ---------- mode select wiring ---------- */

document.querySelectorAll(".mode-item").forEach((btn) => {
  btn.addEventListener("click", () => selectMode(btn.dataset.mode));
});
els.backToModesBtn.addEventListener("click", () => showModeSelect());
els.nextModeBtn.addEventListener("click", () => {
  if (els.nextModeBtn.dataset.nextMode) selectMode(els.nextModeBtn.dataset.nextMode);
  else showModeSelect();
});

/* ---------- voice player wiring ---------- */

els.voicePlayBtn.addEventListener("click", () => {
  if (playingIndex !== -1) stopClip();
  else playSelectedClip();
});

/* ---------- stats ---------- */

function statsKey(mode) {
  return `bakidle_stats_${STORAGE_VERSION}_${mode}`;
}

function loadStats(mode) {
  const raw = localStorage.getItem(statsKey(mode));
  return raw ? JSON.parse(raw) : { played: 0, wins: 0, distribution: {} };
}

function updateStats(won, tries) {
  const mode = state.gameMode;
  const s = loadStats(mode);
  s.played++;
  if (won) {
    s.wins++;
    const bucket = tries >= 7 ? "7+" : String(tries);
    s.distribution[bucket] = (s.distribution[bucket] || 0) + 1;
  }
  localStorage.setItem(statsKey(mode), JSON.stringify(s));
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderStatsModal() {
  const s = loadStats(activeGameMode);
  const g = loadGlobalStreak();
  const winPct = s.played ? Math.round((s.wins / s.played) * 100) : 0;
  const buckets = ["1", "2", "3", "4", "5", "6", "7+"];
  const maxDist = Math.max(1, ...buckets.map((b) => s.distribution[b] || 0));

  els.statsContent.innerHTML = `
    <div class="stats-grid">
      <div><div class="stat-value">${s.played}</div><div class="stat-label">Played</div></div>
      <div><div class="stat-value">${winPct}</div><div class="stat-label">Win %</div></div>
      <div><div class="stat-value">${g.currentStreak}</div><div class="stat-label">Streak</div></div>
      <div><div class="stat-value">${g.maxStreak}</div><div class="stat-label">Max Streak</div></div>
    </div>
    <div class="dist-title">Guess Distribution &mdash; ${capitalize(activeGameMode)} Daily</div>
    ${buckets
      .map((b) => {
        const count = s.distribution[b] || 0;
        const pct = count ? Math.max(6, Math.round((count / maxDist) * 100)) : 0;
        const style = count ? `width:${pct}%` : "width:0;min-width:0";
        return `<div class="dist-row"><span class="dist-label">${b}</span><div class="dist-bar-wrap"><div class="dist-bar" style="${style}">${
          count || ""
        }</div></div></div>`;
      })
      .join("")}
  `;
}

/* ---------- modals ---------- */

function openModal(el) {
  el.hidden = false;
}
function closeModal(el) {
  el.hidden = true;
}

function renderSettings() {
  els.modernOnlyToggle.checked = settings.modernOnly;
  els.mangaOnlyToggle.checked = settings.includeMangaOnly;
  const playable = inPlay().length;
  const eligible = eligibleCharacters().length;
  els.settingsPoolNote.textContent =
    eligible === playable
      ? `All ${playable} characters in play can be the answer.`
      : `${eligible} of the ${playable} characters in play can be the answer.`;
}

els.settingsBtn.addEventListener("click", () => {
  renderSettings();
  openModal(els.settingsModal);
});

// The pool just changed, so today's answer and the solved markers change with it.
function onSettingChanged() {
  saveSettings();
  renderSettings();
  if (els.gameView.hidden) {
    renderModeStatuses();
    updateResetTimer();
  } else {
    refresh();
  }
}

els.modernOnlyToggle.addEventListener("change", () => {
  settings.modernOnly = els.modernOnlyToggle.checked;
  onSettingChanged();
});

els.mangaOnlyToggle.addEventListener("change", () => {
  settings.includeMangaOnly = els.mangaOnlyToggle.checked;
  onSettingChanged();
});

els.infoBtn.addEventListener("click", () => openModal(els.infoModal));
els.statsBtn.addEventListener("click", () => {
  renderStatsModal();
  openModal(els.statsModal);
});
document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(document.getElementById(btn.dataset.close)));
});
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay").forEach((o) => {
      if (!o.hidden) closeModal(o);
    });
  }
});

/* ---------- confetti ---------- */

function launchConfetti() {
  const symbols = ["🥊", "💥", "🔥", "⭐", "👊"];
  for (let i = 0; i < 28; i++) {
    const span = document.createElement("span");
    span.className = "confetti-piece";
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.left = `${Math.random() * 100}vw`;
    span.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    span.style.fontSize = `${1 + Math.random() * 1.2}rem`;
    els.confettiLayer.appendChild(span);
    span.addEventListener("animationend", () => span.remove());
  }
}

/* ---------- boot ---------- */

purgeLegacyStorage();

let lastKnownDay = globalDayIndex();

function tickResetTimer() {
  updateResetTimer();
  const day = globalDayIndex();
  const dayChanged = day !== lastKnownDay;
  if (dayChanged) lastKnownDay = day;

  if (!dayChanged) return;

  // Every mode rolls over together at 12 AM UTC, so one day change refreshes whatever is shown.
  if (els.modeSelect.hidden) {
    refresh();
  } else {
    updateDayNumber();
    updateStreakLine();
    renderModeStatuses();
  }
}

setInterval(tickResetTimer, 1000);

applyRoute();
