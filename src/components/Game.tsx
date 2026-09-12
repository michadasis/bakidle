"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHARACTERS, type Character } from "@/data/characters";
import { answerForDay } from "@/game/deck";
import { GAME_MODES, modeById, type ModeId } from "@/game/modes";
import { answerPool, findCharacter, guessPool, rejectionReason } from "@/game/pools";
import {
  loadDaily,
  loadStreak,
  nextUnplayedMode,
  recordStreakWin,
  recordWin,
  saveDaily,
} from "@/game/progress";
import { fetchSolvedCount, formatCount, ordinal, reportSolved } from "@/game/solved";
import { hydrateSettings, useSettings } from "@/game/store";
import { purgeLegacyStorage } from "@/game/storage";
import { formatCountdown, globalDayIndex, msUntilGlobalReset } from "@/game/time";
import { Avatar } from "./Avatar";
import { ClassicBoard, SimpleBoard } from "./Boards";
import { DayNumber, ModeRail, Toolbar, useNow } from "./Chrome";
import { EmojiClue, Hints, QuoteClue, SplashClue, VoiceClue } from "./Clues";
import { Confetti, type ConfettiHandle } from "./Confetti";
import { GuessInput } from "./GuessInput";
import { Icon } from "./Icon";
import { HelpModal, SettingsModal, StatsModal } from "./Modals";

const REJECTION_MESSAGE = {
  unknown: () => "Pick a character from the list.",
  mangaOnly: (n: string) => `${n} never appears in the anime. Settings can bring them in.`,
  grapplerOnly: (n: string) => `${n} does not appear past Baki the Grappler. Settings can bring them in.`,
  noStats: (n: string) => `No height or weight on record for ${n}, so Classic leaves them out.`,
};

export function Game({ mode }: { mode: ModeId }) {
  const settings = useSettings();
  const [ready, setReady] = useState(false);
  const [day, setDay] = useState<number | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [status, setStatus] = useState("");
  const [justWon, setJustWon] = useState(false);
  const [modal, setModal] = useState<null | "stats" | "settings" | "help">(null);
  // How many people have solved this mode today, and where this player came in. Both stay
  // null whenever the counter is unavailable, and the game plays the same without them.
  const [solvedCount, setSolvedCount] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<ConfettiHandle>(null);

  // Storage and the clock are client-only; reading either during render would desync the
  // server-rendered markup from the first client paint.
  useEffect(() => {
    hydrateSettings();
    const today = globalDayIndex();
    purgeLegacyStorage(today);
    setDay(today);
    setReady(true);
  }, []);

  // Every mode rolls over together at 12 AM UTC.
  useEffect(() => {
    const id = setInterval(() => {
      const today = globalDayIndex();
      setDay((d) => (d === today ? d : today));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pool = answerPool(mode, settings);
  const answer: Character | null = day === null ? null : answerForDay(mode, day, settings);

  // Reload saved progress whenever the day or the pool underneath it changes.
  useEffect(() => {
    if (day === null) return;
    const saved = loadDaily(mode, day, settings);
    setGuesses(saved?.guesses ?? []);
    setFinished(saved?.finished ?? false);
    setStatus("");
    setRank(saved?.rank ?? null);
  }, [day, mode, settings]);

  // The counter is per mode and per day rather than per settings: it answers how many people
  // solved this mode today, which is the same question whichever pool a player is on.
  useEffect(() => {
    if (day === null) return;
    const abort = new AbortController();
    void fetchSolvedCount(mode, abort.signal).then((count) => {
      if (count !== null) setSolvedCount(count);
    });
    return () => abort.abort();
  }, [day, mode]);

  const guessed = useMemo(
    () => guesses.map((n) => CHARACTERS.find((c) => c.name === n)).filter(Boolean) as Character[],
    [guesses]
  );

  const submit = useCallback(
    (rawName: string) => {
      if (!answer || day === null || finished) return;
      const name = rawName.trim();
      if (!name) return;
      const char = guessPool(mode, settings).find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (!char) {
        // Naming a real character the mode cannot use reads as a typo unless we say why.
        const known = findCharacter(name);
        const reason = rejectionReason(name, mode, settings);
        setStatus(REJECTION_MESSAGE[reason](known?.name ?? name));
        return;
      }
      if (guesses.includes(char.name)) {
        setStatus("Already guessed that one.");
        return;
      }

      const next = [...guesses, char.name];
      const won = char.name === answer.name;
      setGuesses(next);
      setStatus("");
      setFinished(won);
      saveDaily(mode, day, settings, { guesses: next, finished: won, won });
      if (won) {
        recordWin(mode, next.length);
        recordStreakWin(day);
        confettiRef.current?.fire();
        setJustWon(true);
        // Decoration only: a counter that fails, or was never configured, leaves the win alone.
        void reportSolved(mode).then((result) => {
          if (typeof result.count === "number") setSolvedCount(result.count);
          if (typeof result.rank === "number") {
            setRank(result.rank);
            saveDaily(mode, day, settings, {
              guesses: next,
              finished: true,
              won: true,
              rank: result.rank,
            });
          }
        });
      }
    },
    [answer, day, finished, guesses, mode, settings]
  );

  // Winning reveals the banner and re-renders the clue, both of which change the page height,
  // so wait for layout before scrolling or the banner ends up off screen. Only on a win made
  // here: reopening a round already finished should leave the page where it opened.
  useEffect(() => {
    if (!justWon) return;
    // The winning guess reveals one cell at a time, so the page waits for that to finish before
    // travelling: Classic runs nine cells a quarter second apart at 0.55s each, the other modes
    // reveal a single row. The flag is cleared after the scroll is asked for, not before, since
    // clearing it first re-runs this effect and the cleanup cancels the pending frame.
    const revealMs = mode === "classic" ? 2650 : 500;
    // Scrolled straight from the timer rather than from an animation frame: a tab in the
    // background pauses frames altogether, which would leave the page sitting where it was.
    const timer = setTimeout(() => {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setJustWon(false);
    }, revealMs);
    return () => clearTimeout(timer);
  }, [justWon, mode]);

  const streak = day === null ? 0 : loadStreak(day).currentStreak;
  // Only ticks once the round is over, which is the only place the countdown is shown.
  const now = useNow(finished);
  const empty = pool.length === 0;
  const nextMode = day === null ? null : nextUnplayedMode(mode, day, settings);
  // Yesterday's answer for this mode, drawn from the pool the player is currently on.
  const yesterday = day === null || day <= 0 ? null : answerForDay(mode, day - 1, settings);

  return (
    <>
      <header>
        <h1>BAKIDLE</h1>
        <p className="subtitle">Guess the Baki character</p>
        <DayNumber />
      </header>

      <ModeRail active={mode} />
      <Toolbar
        streak={streak}
        onStats={() => setModal("stats")}
        onSettings={() => setModal("settings")}
        onHelp={() => setModal("help")}
      />

      <div id="gameView">
        <Link href="/" className="back-btn">
          <Icon name="chevronLeft" /> Modes
        </Link>

        {!ready || !answer ? (
          empty ? (
            <div className="clue-card empty-mode-msg">
              <p>No characters available for this mode yet.</p>
            </div>
          ) : null
        ) : (
          <>
            <Hints mode={mode} answer={answer} guesses={guesses.length} finished={finished} />
            {mode === "quote" && <QuoteClue answer={answer} />}
            {mode === "emoji" && (
              <EmojiClue answer={answer} guesses={guesses.length} finished={finished} />
            )}
            {mode === "splash" && (
              <SplashClue answer={answer} guesses={guesses.length} finished={finished} />
            )}
            {mode === "voice" && (
              <VoiceClue answer={answer} guesses={guesses.length} finished={finished} />
            )}

            <GuessInput
              mode={mode}
              settings={settings}
              guessed={guesses}
              disabled={finished}
              status={status}
              onGuess={submit}
            />

            {solvedCount !== null && solvedCount > 0 && (
              <p className="solved-count">
                <span>{formatCount(solvedCount)}</span>{" "}
                {solvedCount === 1 ? "person has" : "people have"} already found out
              </p>
            )}

            {mode === "classic" ? (
              <>
                <div className="legend">
                  <span className="legend-item">
                    <span className="dot correct" />
                    Correct
                  </span>
                  <span className="legend-item">
                    <span className="dot partial" />
                    Close
                  </span>
                  <span className="legend-item">
                    <span className="dot wrong" />
                    Wrong
                  </span>
                </div>
                <ClassicBoard guesses={guessed} answer={answer} />
              </>
            ) : (
              <SimpleBoard guesses={guessed} answer={answer} />
            )}

            {yesterday && (
              <p className="yesterday">
                Yesterday&apos;s answer was <span>{yesterday.name}</span>
              </p>
            )}

            {finished && (
              <div className="win-banner" ref={bannerRef}>
                <h2>Victory!</h2>
                <div className="result-avatar">
                  <Avatar character={answer} size={72} />
                </div>
                <div className="answer-name">{answer.name}</div>
                <div className="answer-alias">{answer.alias ? `"${answer.alias}"` : ""}</div>

                {rank !== null && (
                  <p className="win-rank">
                    You are the <span>{ordinal(rank)}</span> to find the answer today
                  </p>
                )}

                <p className="win-tries">
                  Number of tries: <span>{guesses.length}</span>
                </p>

                <button type="button" className="stats-btn" onClick={() => setModal("stats")}>
                  <Icon name="stats" />
                  <span>Stats</span>
                </button>

                <div className="win-countdown">
                  <div className="win-countdown-label">Next answer in</div>
                  <div className="win-countdown-time">
                    {now === null ? "" : formatCountdown(msUntilGlobalReset(now))}
                  </div>
                  <div className="win-countdown-zone">Every mode resets at midnight UTC</div>
                </div>

                <hr className="win-divider" />

                <div className="next-mode-label">{nextMode ? "Next mode:" : "Nothing left today:"}</div>
                <div className="action-row">
                  {nextMode ? (
                    <Link className="next-mode-btn" href={`/${nextMode.id}`}>
                      <Icon name={nextMode.icon} />
                      <span className="next-mode-text">
                        <span className="next-mode-name">{modeById(nextMode.id).label}</span>
                        <span className="next-mode-blurb">{modeById(nextMode.id).blurb}</span>
                      </span>
                    </Link>
                  ) : (
                    <Link className="next-mode-btn" href="/">
                      <Icon name="chevronLeft" />
                      <span className="next-mode-text">
                        <span className="next-mode-name">Back to Modes</span>
                        <span className="next-mode-blurb">Every mode is solved today</span>
                      </span>
                    </Link>
                  )}
                </div>

                <ModeRail active={mode} />
              </div>
            )}
          </>
        )}
      </div>

      <Confetti ref={confettiRef} />
      <SettingsModal open={modal === "settings"} onClose={() => setModal(null)} />
      <StatsModal open={modal === "stats"} onClose={() => setModal(null)} mode={mode} />
      <HelpModal open={modal === "help"} onClose={() => setModal(null)} />
    </>
  );
}