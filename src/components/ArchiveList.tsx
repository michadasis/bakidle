"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isArchiveModeFinished, loadStreak } from "@/game/progress";
import { GAME_MODES } from "@/game/modes";
import { hydrateSettings, useSettings } from "@/game/store";
import { dayIndexToDateSlug, formatArchiveDate, globalDayIndex } from "@/game/time";
import { DayNumber, Toolbar } from "./Chrome";
import { Icon } from "./Icon";
import { HelpModal, SettingsModal, StatsModal } from "./Modals";
import { SiteLogo } from "./SiteLogo";

/** Every completed mode for a day, out of every mode that day could actually be played in. */
function archiveDayProgress(day: number, settings: ReturnType<typeof useSettings>) {
  let played = 0;
  let total = 0;
  for (const mode of GAME_MODES) {
    total++;
    if (isArchiveModeFinished(mode.id, day, settings)) played++;
  }
  return { played, total };
}

export function ArchiveList() {
  const settings = useSettings();
  const [today, setToday] = useState<number | null>(null);
  const [modal, setModal] = useState<null | "stats" | "settings" | "help">(null);

  useEffect(() => {
    hydrateSettings();
    setToday(globalDayIndex());
  }, []);

  const streak = today === null ? 0 : loadStreak(today).currentStreak;
  // today itself is excluded: it is the live puzzle, not a past day yet. Empty once today is 0,
  // since day 0 launched today and has no predecessor to replay.
  const days = today === null ? [] : Array.from({ length: today }, (_, i) => today - 1 - i);

  return (
    <>
      <header>
        <SiteLogo />
        <p className="subtitle">Guess the Baki character</p>
        <DayNumber />
      </header>

      <Toolbar
        streak={streak}
        onStats={() => setModal("stats")}
        onSettings={() => setModal("settings")}
        onHelp={() => setModal("help")}
      />

      <div className="mode-select">
        <Link href="/" className="back-btn">
          <Icon name="chevronLeft" /> Modes
        </Link>

        <div className="archive-header">
          <h2 className="archive-title">
            <Icon name="calendar" /> Replay
          </h2>
          <p className="archive-blurb">
            Play any past day&apos;s puzzles. Replay rounds are saved on their own and never
            touch your streak or stats.
          </p>
        </div>

        {today !== null && days.length === 0 && (
          <p className="archive-blurb">Day 0 launched today - there is nothing to replay yet.</p>
        )}

        <div className="archive-list">
          {days.map((day) => {
            const { played, total } = archiveDayProgress(day, settings);
            return (
              <Link key={day} href={`/replay/${dayIndexToDateSlug(day)}`} className="archive-item">
                <span className="archive-item-num">#{day + 1}</span>
                <span className="archive-item-date">{formatArchiveDate(day)}</span>
                <span
                  className={`archive-item-progress${played === total ? " archive-item-done" : ""}`}
                >
                  {played === total ? <Icon name="check" /> : `${played}/${total}`}
                </span>
                <span className="archive-item-arrow">
                  <Icon name="chevronRight" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <SettingsModal open={modal === "settings"} onClose={() => setModal(null)} />
      <StatsModal open={modal === "stats"} onClose={() => setModal(null)} mode="classic" />
      <HelpModal open={modal === "help"} onClose={() => setModal(null)} />
    </>
  );
}
