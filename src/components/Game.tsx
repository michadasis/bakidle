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
import { hydrateSettings, useSettings } from "@/game/store";
import { purgeLegacyStorage } from "@/game/storage";
import { globalDayIndex } from "@/game/time";
import { Avatar } from "./Avatar";
import { ClassicBoard, SimpleBoard } from "./Boards";
import { Countdown, DayNumber, ModeRail, Toolbar } from "./Chrome";
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
  }, [day, mode, settings]);

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
      }
    },
    [answer, day, finished, guesses, mode, settings]
  );

  // Winning reveals the banner and re-renders the clue, both of which change the page height,
  // so wait for layout before scrolling or the banner ends up off screen. Only on a win made
  // here: reopening a round already finished should leave the page where it opened.
  useEffect(() => {
    if (!justWon) return;
    setJustWon(false);
    const bring = () => bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const raf = requestAnimationFrame(() => requestAnimationFrame(bring));
    return () => cancelAnimationFrame(raf);
  }, [justWon]);

  const streak = day === null ? 0 : loadStreak(day).currentStreak;
  const empty = pool.length === 0;
  const nextMode = day === null ? null : nextUnplayedMode(mode, day, settings);

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
      <Countdown show={finished} />

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

            {finished && (
              <div className="win-banner" ref={bannerRef}>
                <h2>Victory!</h2>
                <div className="result-avatar">
                  <Avatar character={answer} size={72} />
                </div>
                <div className="answer-name">{answer.name}</div>
                <div className="answer-alias">{answer.alias ? `"${answer.alias}"` : ""}</div>
                <p id="winTriesLine">
                  Guessed in {guesses.length} {guesses.length === 1 ? "try" : "tries"}.
                </p>
                <div className="win-streak-wrap">
                  {streak > 0 && (
                    <span className="streak-badge">
                      <span className="flame">
                        <Icon name="flame" />
                      </span>
                      <span className="streak-count">{streak}</span>
                    </span>
                  )}
                </div>
                <div className="action-row">
                  {nextMode ? (
                    <Link className="next-mode-btn" href={`/${nextMode.id}`}>
                      <Icon name={nextMode.icon} />
                      <span>{modeById(nextMode.id).label}</span>
                    </Link>
                  ) : (
                    <Link className="next-mode-btn" href="/">
                      <Icon name="chevronLeft" />
                      <span>Back to Modes</span>
                    </Link>
                  )}
                </div>
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