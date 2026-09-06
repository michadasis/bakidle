const els = {
  searchWrap: document.getElementById("searchWrap"),
  input: document.getElementById("guessInput"),
  suggestions: document.getElementById("suggestions"),
  classicBoardWrap: document.getElementById("classicBoardWrap"),
  board: document.getElementById("board").querySelector("tbody"),
  simpleBoard: document.getElementById("simpleBoard"),
  legend: document.getElementById("legend"),
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
  streakLine: document.getElementById("streakLine"),
  streakCount: document.getElementById("streakCount"),
  winBanner: document.getElementById("winBanner"),
  resultTitle: document.getElementById("resultTitle"),
  resultAvatarWrap: document.getElementById("resultAvatarWrap"),
  winAnswer: document.getElementById("winAnswer"),
  winAlias: document.getElementById("winAlias"),
  winTries: document.getElementById("winTries"),
  winTriesWord: document.getElementById("winTriesWord"),
  giveUpRow: document.getElementById("giveUpRow"),
  giveUpBtn: document.getElementById("giveUpBtn"),
  shareBtn: document.getElementById("shareBtn"),
  statsFromWinBtn: document.getElementById("statsFromWinBtn"),
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
const EMOJI_MAP = { correct: "🟩", partial: "🟨", wrong: "🟥" };
const SPLASH_BLUR_LEVELS = [20, 15, 11, 8, 5, 2, 0];
const EPOCH = new Date(2026, 8, 6);

let activeGameMode = "classic";
let highlightedIndex = -1;

let state = {
  gameMode: "classic",
  answer: null,
  guesses: [],
  finished: false,
  won: false,
  empty: false,
};

function answerPool(mode) {
  if (mode === "splash") return CHARACTERS.filter((c) => c.image);
  if (mode === "voice") return CHARACTERS.filter((c) => Array.isArray(c.voiceClips) && c.voiceClips.length > 0);
  return CHARACTERS;
}

/* ---------- date / seeding ---------- */

function daysSinceEpoch() {
  const now = new Date();
  return Math.floor((now.setHours(0, 0, 0, 0) - new Date(EPOCH).setHours(0, 0, 0, 0)) / 86400000);
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function hashSeed(n) {
  let x = n | 0;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return x >>> 0;
}

function dayIndexSeed(offset, poolSize) {
  const days = daysSinceEpoch() + offset;
  return hashSeed(days) % poolSize;
}

function dailyKey(mode) {
  return `bakidle_daily_${mode}_${todayKey()}`;
}

/* ---------- global streak (spans all game modes) ---------- */

const GLOBAL_STREAK_KEY = "bakidle_streak_global";

function loadGlobalStreak() {
  const raw = localStorage.getItem(GLOBAL_STREAK_KEY);
  const g = raw ? JSON.parse(raw) : { currentStreak: 0, maxStreak: 0, lastWinDay: null };
  const today = daysSinceEpoch();
  if (g.lastWinDay !== null && g.lastWinDay !== today && g.lastWinDay !== today - 1) {
    g.currentStreak = 0;
    localStorage.setItem(GLOBAL_STREAK_KEY, JSON.stringify(g));
  }
  return g;
}

function recordGlobalWin() {
  const g = loadGlobalStreak();
  const today = daysSinceEpoch();
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
  icon.textContent = correct ? "✔" : "✘";
  li.appendChild(icon);
  els.simpleBoard.prepend(li);
}

/* ---------- core render ---------- */

function updateDayNumber() {
  els.dayNumber.textContent = `Daily #${daysSinceEpoch() + 1}`;
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
    .map((e, i) => `<span class="emoji-slot${i < revealed ? "" : " locked"}">${i < revealed ? e : "❓"}</span>`)
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
    btn.textContent = unlocked ? "▶" : "🔒";
    btn.title = `Clip ${i + 1}`;
    btn.disabled = !unlocked;
    if (unlocked) btn.addEventListener("click", () => playVoiceClip(src));
    els.voiceClips.appendChild(btn);
  });
  els.voiceHint.textContent = state.finished ? "" : `${revealed}/${total} clips unlocked — a wrong guess unlocks another`;
}

function renderClue() {
  els.quoteClue.hidden = state.gameMode !== "quote";
  els.emojiClue.hidden = state.gameMode !== "emoji";
  els.splashClue.hidden = state.gameMode !== "splash";
  els.voiceClue.hidden = state.gameMode !== "voice";
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
  els.resultTitle.textContent = state.won ? "Victory!" : "Nice Try!";
  els.resultAvatarWrap.innerHTML = "";
  els.resultAvatarWrap.appendChild(buildAvatar(state.answer, 72));
  els.winAnswer.textContent = state.answer.name;
  els.winAlias.textContent = state.answer.alias ? `"${state.answer.alias}"` : "";
  els.winTries.textContent = state.guesses.length;
  els.winTriesWord.textContent = state.guesses.length === 1 ? "try" : "tries";
  const g = loadGlobalStreak();
  els.winStreakLine.innerHTML =
    g.currentStreak > 0
      ? `<span class="streak-badge"><span class="flame">🔥</span><span class="streak-count">${g.currentStreak}</span></span>`
      : "";
}

function render() {
  updateDayNumber();
  updateStreakLine();
  els.emptyModeMsg.hidden = !state.empty;
  els.searchWrap.hidden = state.empty;
  els.legend.hidden = state.empty || state.gameMode !== "classic";
  els.classicBoardWrap.hidden = state.empty || state.gameMode !== "classic";
  els.simpleBoard.hidden = state.empty || state.gameMode === "classic";
  els.giveUpRow.hidden = state.empty || state.finished;
  els.guessCount.textContent = "";
  if (state.empty) {
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
  els.giveUpRow.hidden = state.finished;
  updateResultBanner();
  if (!state.finished) els.input.focus();
}

/* ---------- state load / persist ---------- */

function persist() {
  localStorage.setItem(
    dailyKey(state.gameMode),
    JSON.stringify({ guesses: state.guesses, finished: state.finished, won: state.won })
  );
}

function loadState(gameMode) {
  const pool = answerPool(gameMode);
  if (pool.length === 0) {
    state = { gameMode, answer: null, guesses: [], finished: false, won: false, empty: true };
    render();
    return;
  }

  const answer = pool[dayIndexSeed(SEED_OFFSETS[gameMode], pool.length)];
  const saved = localStorage.getItem(dailyKey(gameMode));
  if (saved) {
    const parsed = JSON.parse(saved);
    state = { gameMode, answer, guesses: parsed.guesses, finished: parsed.finished, won: parsed.won, empty: false };
  } else {
    state = { gameMode, answer, guesses: [], finished: false, won: false, empty: false };
  }
  render();
}

function refresh() {
  loadState(activeGameMode);
}

function setGameMode(mode) {
  activeGameMode = mode;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
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
    els.giveUpRow.hidden = true;
    updateStats(true, state.guesses.length);
    recordGlobalWin();
    updateResultBanner();
    updateStreakLine();
    launchConfetti();
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

/* ---------- give up ---------- */

els.giveUpBtn.addEventListener("click", () => {
  if (state.finished || state.empty) return;
  state.finished = true;
  state.won = false;
  state.guesses.push(state.answer.name);
  if (state.gameMode === "classic") addClassicRow(state.answer);
  else addSimpleRow(state.answer);
  els.input.disabled = true;
  els.giveUpRow.hidden = true;
  updateStats(false, state.guesses.length);
  updateResultBanner();
  renderClue();
  updateStreakLine();
  persist();
});

/* ---------- tabs wiring ---------- */

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => setGameMode(btn.dataset.mode));
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

/* ---------- share ---------- */

function buildShareText() {
  const dayNum = daysSinceEpoch() + 1;
  const modeLabel = capitalize(activeGameMode);
  const triesLabel = state.won ? state.guesses.length : "X";
  let lines;
  if (activeGameMode === "classic") {
    const order = ["gender", "origin", "styles", "saga", "height", "weight", "age", "status"];
    lines = state.guesses.map((name) => {
      const c = CHARACTERS.find((x) => x.name === name);
      const cmp = computeComparisons(c, state.answer);
      return order.map((k) => EMOJI_MAP[cmp[k].cls]).join("");
    });
  } else {
    lines = state.guesses.map((name) => (name === state.answer.name ? "🟩" : "🟥"));
  }
  return `Bakidle #${dayNum} [${modeLabel}] ${triesLabel}/∞\n\n${lines.join("\n")}`;
}

els.shareBtn.addEventListener("click", async () => {
  const text = buildShareText();
  try {
    await navigator.clipboard.writeText(text);
    const original = els.shareBtn.textContent;
    els.shareBtn.textContent = "Copied!";
    setTimeout(() => {
      els.shareBtn.textContent = original;
    }, 1500);
  } catch {
    els.statusLine.textContent = "Could not copy — clipboard blocked.";
  }
});

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
els.statsFromWinBtn.addEventListener("click", () => {
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

refresh();
