"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHARACTERS, type Character } from "@/data/characters";
import { answerForDay } from "@/game/deck";
import { GAME_MODES, modeById, type ModeId } from "@/game/modes";
import { answerPool, findCharacter, guessPool, rejectionReason } from "@/game/pools";
import {
  loadArchiveDaily,
  loadDaily,
  loadStreak,
  nextUnplayedArchiveMode,
  nextUnplayedMode,
  recordStreakWin,
  recordWin,
  saveArchiveDaily,
  saveDaily,
} from "@/game/progress";
import { fetchSolvedCount, formatCount, ordinal, reportSolved } from "@/game/solved";
import { smoothScrollToCenter } from "@/game/scroll";
import { hydrateSettings, useSettings } from "@/game/store";
import { purgeLegacyStorage } from "@/game/storage";
import {
  dayIndexToDateSlug,
  formatArchiveDate,
  formatCountdown,
  globalDayIndex,
  msUntilGlobalReset,
} from "@/game/time";
import { Avatar } from "./Avatar";
import { ClassicBoard, SimpleBoard } from "./Boards";
import { ArchiveNav, DayNumber, ModeRail, Toolbar, useNow } from "./Chrome";
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

export function Game({ mode, archiveDay }: { mode: ModeId; archiveDay?: number }) {
  const settings = useSettings();
  const router = useRouter();
  const isArchive = archiveDay !== undefined;
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<number | null>(null);
  const [liveDay, setLiveDay] = useState<number | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [status, setStatus] = useState("");
  const [justWon, setJustWon] = useState(false);
  const [modal, setModal] = useState<null | "stats" | "settings" | "help">(null);
  // How many people have solved this mode today, and where this player came in. Both stay
  // null whenever the counter is unavailable (always true in Replay, which has no live counter).
  const [solvedCount, setSolvedCount] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<ConfettiHandle>(null);
  // Set while a fresh win is waiting for its guess row to finish revealing; the board calls it.
  const celebrateRef = useRef<(() => void) | null>(null);

  const day = isArchive ? archiveDay : liveDay;

  // Storage and the clock are client-only; reading either during render would desync the
  // server-rendered markup from the first client paint. The real "today" is tracked even on a
  // Replay page: the streak shown in the toolbar is always the live one, never the round in view.
  useEffect(() => {
    hydrateSettings();
    const now = globalDayIndex();
    purgeLegacyStorage(now);
    setToday(now);
    if (!isArchive) setLiveDay(now);
    setReady(true);
  }, [isArchive]);

  // Every mode rolls over together at 12 AM UTC. A Replay round is pinned to its own day and
  // never rolls, so this only needs to run for the live game.
  useEffect(() => {
    if (isArchive) return;
    const id = setInterval(() => {
      const now = globalDayIndex();
      setToday((d) => (d === now ? d : now));
      setLiveDay((d) => (d === now ? d : now));
    }, 1000);
    return () => clearInterval(id);
  }, [isArchive]);

  // Same reasoning as the mode-select screen: an out-of-range Replay date can only be caught
  // once "today" is known client-side, and today itself is not a past day yet, so it and
  // anything later send the visitor to the live page rather than rendering the archive around
  // an answer that is still today's live one.
  useEffect(() => {
    if (!isArchive || today === null) return;
    if (archiveDay < 0 || archiveDay >= today) router.replace("/");
  }, [isArchive, archiveDay, today, router]);

  const pool = answerPool(mode, settings);
  const answer: Character | null = day === null ? null : answerForDay(mode, day, settings);

  // Reload saved progress whenever the day or the pool underneath it changes. A Replay round
  // reads and writes its own separate record, so it can never touch a real daily result.
  useEffect(() => {
    if (day === null) return;
    const saved = isArchive
      ? loadArchiveDaily(mode, day, settings)
      : loadDaily(mode, day, settings);
    setGuesses(saved?.guesses ?? []);
    setFinished(saved?.finished ?? false);
    setStatus("");
    setRank(saved?.rank ?? null);
  }, [day, mode, settings, isArchive]);

  // The counter is per mode and per day rather than per settings: it answers how many people
  // solved this mode today, which is the same question whichever pool a player is on. Replay
  // rounds have no live counter to ask.
  useEffect(() => {
    if (day === null || isArchive) return;
    const abort = new AbortController();
    void fetchSolvedCount(mode, abort.signal).then((count) => {
      if (count !== null) setSolvedCount(count);
    });
    return () => abort.abort();
  }, [day, mode, isArchive]);

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
      if (isArchive) {
        saveArchiveDaily(mode, day, settings, { guesses: next, finished: won, won });
      } else {
        saveDaily(mode, day, settings, { guesses: next, finished: won, won });
      }
      if (won && isArchive) {
        setJustWon(true);
      } else if (won) {
        recordWin(mode, next.length);
        recordStreakWin(day);
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
    [answer, day, finished, guesses, mode, settings, isArchive]
  );

  // Winning reveals the banner and re-renders the clue, both of which change the page height,
  // so wait for layout before scrolling or the banner ends up off screen. Only on a win made
  // here: reopening a round already finished should leave the page where it opened.
  useEffect(() => {
    if (!justWon) return;
    // The winning guess reveals one cell at a time, so the confetti and the page travel wait for
    // that to finish: Classic runs nine cells a quarter second apart at 0.55s each, the other
    // modes reveal a single row. The flag is cleared after the scroll is asked for, not before,
    // since clearing it first re-runs this effect and the cleanup cancels the pending work.
    const revealMs = mode === "classic" ? 2650 : 500;
    let timer: ReturnType<typeof setTimeout>;
    const celebrate = () => {
      clearTimeout(timer);
      celebrateRef.current = null;
      confettiRef.current?.fire();
      // The scroll itself is hand-rolled (see smoothScrollToCenter) rather than the browser's
      // native smooth scroll, whose duration and easing aren't controllable and vary noticeably
      // between browsers.
      if (bannerRef.current) smoothScrollToCenter(bannerRef.current);
      setJustWon(false);
    };
    // The board calls this from the newest row's real animationend, so the celebration lands
    // after the cells have actually shown up; the row's paint time varies by a few hundred ms,
    // which a fixed delay alone kept getting wrong. The timer is only the fallback for when that
    // event never comes: a tab in the background pauses animations (and frames) altogether,
    // which would otherwise leave the page sitting where it was.
    celebrateRef.current = celebrate;
    timer = setTimeout(celebrate, revealMs + 500);
    return () => {
      clearTimeout(timer);
      celebrateRef.current = null;
    };
  }, [justWon, mode]);

  // Always the real streak for today, never the Replay round in view - the toolbar is the same
  // on every page for exactly that reason.
  const streak = today === null ? 0 : loadStreak(today).currentStreak;
  // Only ticks once the round is over, which is the only place the countdown is shown.
  const now = useNow(finished);
  const empty = pool.length === 0;
  const nextMode =
    day === null
      ? null
      : isArchive
        ? nextUnplayedArchiveMode(mode, day, settings)
        : nextUnplayedMode(mode, day, settings);
  // Yesterday's answer for this mode, drawn from the pool the player is currently on.
  const yesterday = day === null || day <= 0 ? null : answerForDay(mode, day - 1, settings);
  // Bounds for the victory card's day-hop buttons, shown once every mode is solved for this
  // Replay day: never before day 0, never as far as today - today is the live puzzle, not an
  // archived one.
  const hasPrevDay = isArchive && archiveDay! > 0;
  const hasNextDay = isArchive && today !== null && archiveDay! < today - 1;

  return (
    <>
      <header>
        <h1>BAKIDLE</h1>
        <p className="subtitle">Guess the Baki character</p>
        <DayNumber archiveDay={archiveDay} />
      </header>

      <ModeRail active={mode} archiveDay={archiveDay} />
      {isArchive && today !== null && archiveDay !== undefined && (
        <ArchiveNav archiveDay={archiveDay} today={today} mode={mode} />
      )}
      <Toolbar
        streak={streak}
        onStats={() => setModal("stats")}
        onSettings={() => setModal("settings")}
        onHelp={() => setModal("help")}
      />

      <div id="gameView">
        <Link href={isArchive ? `/replay/${dayIndexToDateSlug(archiveDay!)}` : "/"} className="back-btn">
          <Icon name="chevronLeft" /> {isArchive ? "This day" : "Modes"}
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

            {solvedCount ? (
              <p className={`solved-count${mode === "classic" ? " before-table" : ""}`}>
                <span>{formatCount(solvedCount)}</span>{" "}
                {solvedCount === 1 ? "person has" : "people have"} already found out
              </p>
            ) : null}

            {mode === "classic" ? (
              <ClassicBoard guesses={guessed} answer={answer} onRevealed={() => celebrateRef.current?.()} />
            ) : (
              <SimpleBoard guesses={guessed} answer={answer} onRevealed={() => celebrateRef.current?.()} />
            )}

            {yesterday && (
              <p className="yesterday">
                Yesterday&apos;s answer was <span>{yesterday.name}</span>
              </p>
            )}

            {finished && (
              <div className="win-banner" ref={bannerRef}>
                <h2>gg ez</h2>
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

                {isArchive ? (
                  <div className="win-countdown archive-win-note">
                    <div className="win-countdown-label">Replay round</div>
                    <div className="win-countdown-zone">
                      This is a past day from the archive - it doesn&apos;t count toward your streak
                      or stats.
                    </div>
                  </div>
                ) : (
                  <div className="win-countdown">
                    <div className="win-countdown-label">Next answer in</div>
                    <div className="win-countdown-time">
                      {now === null ? "" : formatCountdown(msUntilGlobalReset(now))}
                    </div>
                    <div className="win-countdown-zone">Every mode resets at midnight UTC</div>
                  </div>
                )}

                <hr className="win-divider" />

                <div className="next-mode-label">
                  {nextMode
                    ? "Next mode:"
                    : isArchive
                      ? "Every mode is solved for this day:"
                      : "Nothing left today:"}
                </div>
                <div className="action-row">
                  {nextMode ? (
                    <Link
                      className="next-mode-btn"
                      href={
                        isArchive
                          ? `/replay/${dayIndexToDateSlug(archiveDay!)}/${nextMode.id}`
                          : `/${nextMode.id}`
                      }
                    >
                      <Icon name={nextMode.icon} />
                      <span className="next-mode-text">
                        <span className="next-mode-name">{modeById(nextMode.id).label}</span>
                        <span className="next-mode-blurb">{modeById(nextMode.id).blurb}</span>
                      </span>
                    </Link>
                  ) : isArchive ? (
                    <>
                      {hasPrevDay ? (
                        <Link
                          className="next-mode-btn"
                          href={`/replay/${dayIndexToDateSlug(archiveDay! - 1)}/${mode}`}
                        >
                          <Icon name="chevronLeft" />
                          <span className="next-mode-text">
                            <span className="next-mode-name">Previous day</span>
                            <span className="next-mode-blurb">{formatArchiveDate(archiveDay! - 1)}</span>
                          </span>
                        </Link>
                      ) : (
                        <span className="next-mode-btn is-disabled">
                          <Icon name="chevronLeft" />
                          <span className="next-mode-text">
                            <span className="next-mode-name">Previous day</span>
                            <span className="next-mode-blurb">This is day 0</span>
                          </span>
                        </span>
                      )}
                      {hasNextDay ? (
                        <Link
                          className="next-mode-btn"
                          href={`/replay/${dayIndexToDateSlug(archiveDay! + 1)}/${mode}`}
                        >
                          <span className="next-mode-text">
                            <span className="next-mode-name">Next day</span>
                            <span className="next-mode-blurb">{formatArchiveDate(archiveDay! + 1)}</span>
                          </span>
                          <Icon name="chevronRight" />
                        </Link>
                      ) : (
                        <span className="next-mode-btn is-disabled">
                          <span className="next-mode-text">
                            <span className="next-mode-name">Next day</span>
                            <span className="next-mode-blurb">This is today</span>
                          </span>
                          <Icon name="chevronRight" />
                        </span>
                      )}
                    </>
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

                <ModeRail active={mode} archiveDay={archiveDay} />
              </div>
            )}
          </>
        )}
      </div>

      <Confetti ref={confettiRef} />
      <SettingsModal
        open={modal === "settings"}
        onClose={() => setModal(null)}
        midRound={guesses.length > 0 && !finished}
      />
      <StatsModal open={modal === "stats"} onClose={() => setModal(null)} mode={mode} />
      <HelpModal open={modal === "help"} onClose={() => setModal(null)} />
    </>
  );
}