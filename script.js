/* ---------- icons (Lucide, inlined) ---------- */

const ICON_PATHS = {
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />',
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

function nextGameMode(mode) {
  const idx = GAME_MODES.findIndex((m) => m.id === mode);
  return GAME_MODES[(idx + 1) % GAME_MODES.length];
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
  voiceClips: document.getElementById("voiceClips"),
  voiceHint: document.getElementById("voiceHint"),
  emptyModeMsg: document.getElementById("emptyModeMsg"),
  statusLine: document.getElementById("statusLine"),
  guessCount: document.getElementById("guessCount"),
  dayNumber: document.getElementById("dayNumber"),
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
  infoModal: document.getElementById("infoModal"),
  statsModal: document.getElementById("statsModal"),
  statsContent: document.getElementById("statsContent"),
  confettiLayer: document.getElementById("confettiLayer"),
};

const TOLERANCE = { height: 5, weight: 8, age: 5 };
const SEED_OFFSETS = { classic: 0, quote: 7, emoji: 13, splash: 19, voice: 23 };
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
  locked: false,
  unlockAt: null,
};

function answerPool(mode) {
  if (mode === "splash") return CHARACTERS.filter((c) => c.image);
  if (mode === "voice") return CHARACTERS.filter((c) => Array.isArray(c.voiceClips) && c.voiceClips.length > 0);
  return CHARACTERS;
}

/* ---------- date / seeding (shared answer for everyone, resets at midnight UTC) ---------- */

const EPOCH_MS = Date.UTC(2026, 8, 6);
const PERSONAL_LOCK_MS = 86400000;

function globalDayIndex() {
  return Math.floor((Date.now() - EPOCH_MS) / 86400000);
}

function msUntilGlobalReset() {
  return 86400000 - (((Date.now() - EPOCH_MS) % 86400000) + 86400000) % 86400000;
}

function hashSeed(n) {
  let x = n | 0;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return x >>> 0;
}

function seedForDay(day, offset, poolSize) {
  return hashSeed(day + offset) % poolSize;
}

function dailyKey(mode, day) {
  return `bakidle_daily_${mode}_${day}`;
}

/* ---------- personal per-mode lock (24h cooldown after finishing a mode) ---------- */

function lockKey(mode) {
  return `bakidle_lock_${mode}`;
}

function getModeLock(mode) {
  const raw = localStorage.getItem(lockKey(mode));
  return raw ? JSON.parse(raw) : null;
}

function setModeLock(mode, day) {
  localStorage.setItem(lockKey(mode), JSON.stringify({ day, unlockAt: Date.now() + PERSONAL_LOCK_MS }));
}

/* ---------- global streak (spans all game modes) ---------- */

const GLOBAL_STREAK_KEY = "bakidle_streak_global";

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
    age: numCompare(g.age, a.age, TOLERANCE.age),
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
  tr.appendChild(makeCell("Age", `${guessChar.age}`, cmp.age.cls, cmp.age.arrow));
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

function updateResetTimer() {
  const inGame = !els.gameView.hidden;
  const showPersonal = inGame && state && !state.empty && state.locked;
  const ms = showPersonal ? state.unlockAt - Date.now() : msUntilGlobalReset();
  els.resetCountdown.textContent = formatCountdown(ms);
}

function updateStreakLine() {
  const g = loadGlobalStreak();
  els.streakLine.hidden = g.currentStreak <= 0;
  if (g.currentStreak > 0) els.streakCount.textContent = g.currentStreak;
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

function playVoiceClip(src) {
  const audio = new Audio(src);
  audio.play().catch(() => {
    els.statusLine.textContent = "Couldn't play that clip — check the file exists in audio/.";
  });
}

function renderVoiceClue() {
  const clips = state.answer.voiceClips || [];
  const total = clips.length;
  const revealed = state.finished ? total : Math.min(total, 1 + state.guesses.length);
  els.voiceClips.innerHTML = "";
  clips.forEach((src, i) => {
    const btn = document.createElement("button");
    const unlocked = i < revealed;
    btn.type = "button";
    btn.className = `voice-clip-btn${unlocked ? "" : " locked"}`;
    btn.innerHTML = iconMarkup(unlocked ? "play" : "lock");
    btn.title = `Clip ${i + 1}`;
    btn.disabled = !unlocked;
    if (unlocked) btn.addEventListener("click", () => playVoiceClip(src));
    els.voiceClips.appendChild(btn);
  });
  els.voiceHint.textContent = state.finished ? "" : `${revealed}/${total} clips unlocked — a wrong guess unlocks another`;
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

  const next = nextGameMode(state.gameMode);
  if (answerPool(next.id).length > 0) {
    els.nextModeBtn.dataset.nextMode = next.id;
    els.nextModeBtn.innerHTML = `${iconMarkup(next.icon)}<span>${next.label}</span>`;
  } else {
    els.nextModeBtn.dataset.nextMode = "";
    els.nextModeBtn.innerHTML = `${iconMarkup("chevronLeft")}<span>Back to Modes</span>`;
  }
}

function scrollToResult() {
  els.winBanner.scrollIntoView({ behavior: "smooth", block: "center" });
}

function render() {
  updateDayNumber();
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
    state = { gameMode, answer: null, guesses: [], finished: false, won: false, empty: true, day: null, locked: false, unlockAt: null };
    render();
    return;
  }

  const lock = getModeLock(gameMode);
  const locked = !!lock && Date.now() < lock.unlockAt;
  const day = locked ? lock.day : globalDayIndex();
  const answer = pool[seedForDay(day, SEED_OFFSETS[gameMode], pool.length)];
  const saved = localStorage.getItem(dailyKey(gameMode, day));
  if (saved) {
    const parsed = JSON.parse(saved);
    state = { gameMode, answer, guesses: parsed.guesses, finished: parsed.finished, won: parsed.won, empty: false, day, locked, unlockAt: locked ? lock.unlockAt : null };
  } else {
    state = { gameMode, answer, guesses: [], finished: false, won: false, empty: false, day, locked, unlockAt: locked ? lock.unlockAt : null };
  }
  render();
}

function refresh() {
  loadState(activeGameMode);
}

function renderModeStatuses() {
  document.querySelectorAll("[data-status-for]").forEach((el) => {
    const mode = el.dataset.statusFor;
    const lock = getModeLock(mode);
    el.className = "mode-item-status";
    el.innerHTML = "";
    if (!lock || Date.now() >= lock.unlockAt) return;
    el.classList.add("status-won");
    el.innerHTML = iconMarkup("check");
  });
}

function showModeSelect() {
  els.gameView.hidden = true;
  els.modeSelect.hidden = false;
  updateDayNumber();
  updateResetTimer();
  updateStreakLine();
  renderModeStatuses();
}

function selectMode(mode) {
  activeGameMode = mode;
  els.modeSelect.hidden = true;
  els.gameView.hidden = false;
  refresh();
}

/* ---------- guessing ---------- */

function submitGuess(rawName) {
  if (state.finished || state.empty) return;
  const char = CHARACTERS.find((c) => c.name.toLowerCase() === rawName.toLowerCase());
  if (!char) {
    els.statusLine.textContent = "Pick a character from the list.";
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
    setModeLock(state.gameMode, state.day);
    state.locked = true;
    state.unlockAt = getModeLock(state.gameMode).unlockAt;
    updateStats(true, state.guesses.length);
    recordGlobalWin();
    updateResultBanner();
    updateStreakLine();
    updateResetTimer();
    launchConfetti();
    scrollToResult();
  }
  renderClue();
  persist();
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
  const matches = CHARACTERS.filter((c) => {
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
els.backToModesBtn.addEventListener("click", showModeSelect);
els.nextModeBtn.addEventListener("click", () => {
  if (els.nextModeBtn.dataset.nextMode) selectMode(els.nextModeBtn.dataset.nextMode);
  else showModeSelect();
});

/* ---------- stats ---------- */

function statsKey(mode) {
  return `bakidle_stats_${mode}`;
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

let lastKnownDay = globalDayIndex();

function tickResetTimer() {
  updateResetTimer();
  const day = globalDayIndex();
  const dayChanged = day !== lastKnownDay;
  if (dayChanged) lastKnownDay = day;

  const inGame = els.modeSelect.hidden;
  if (inGame) {
    const lockExpired = state && !state.empty && state.locked && Date.now() >= state.unlockAt;
    if (lockExpired || (dayChanged && state && !state.locked)) refresh();
  } else if (dayChanged) {
    updateDayNumber();
    updateStreakLine();
    renderModeStatuses();
  }
}

setInterval(tickResetTimer, 1000);

showModeSelect();
