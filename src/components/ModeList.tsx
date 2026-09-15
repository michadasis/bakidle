"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GAME_MODES } from "@/game/modes";
import { answerPool } from "@/game/pools";
import { isArchiveModeFinished, isModeFinished, loadStreak } from "@/game/progress";
import { hydrateSettings, useSettings } from "@/game/store";
import { purgeLegacyStorage } from "@/game/storage";
import { dayIndexToDateSlug, globalDayIndex } from "@/game/time";
import { ArchiveNav, DayNumber, Toolbar } from "./Chrome";
import { Icon } from "./Icon";
import { HelpModal, SettingsModal, StatsModal } from "./Modals";

/** archiveDay renders this same screen scoped to one Replay round instead of the live day. */
export function ModeList({ archiveDay }: { archiveDay?: number } = {}) {
  const settings = useSettings();
  const router = useRouter();
  const isArchive = archiveDay !== undefined;
  const [today, setToday] = useState<number | null>(null);
  const [modal, setModal] = useState<null | "stats" | "settings" | "help">(null);

  useEffect(() => {
    hydrateSettings();
    const now = globalDayIndex();
    purgeLegacyStorage(now);
    setToday(now);
    if (isArchive) return;
    const id = setInterval(() => setToday(globalDayIndex()), 1000);
    return () => clearInterval(id);
  }, [isArchive]);

  // "Today" is only known once the clock has been read on the client, so a Replay date outside
  // [0, today] - typically someone editing the URL by hand - can only be caught here, not on the
  // server. A future date would otherwise reveal that day's answer early, so this redirects
  // rather than merely clamping the display.
  useEffect(() => {
    if (!isArchive || today === null) return;
    if (archiveDay < 0 || archiveDay > today) router.replace("/replay");
  }, [isArchive, archiveDay, today, router]);

  const day = isArchive ? archiveDay : today;
  // Always the real streak for today, never the Replay round in view.
  const streak = today === null ? 0 : loadStreak(today).currentStreak;
  const base = isArchive ? `/replay/${dayIndexToDateSlug(archiveDay)}` : "";

  // archiveDay is a prop, so day is known on the very first render - server included, where
  // localStorage does not exist. Without this, a finished Replay round's checkmark would be
  // absent from the server's HTML but present on the client's first render, a hydration
  // mismatch. today (the live path) is naturally safe already: it starts null on both sides.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <header>
        <h1>BAKIDLE</h1>
        <p className="subtitle">Guess the Baki character</p>
        <DayNumber archiveDay={archiveDay} />
      </header>

      {isArchive && today !== null && (
        <ArchiveNav archiveDay={archiveDay} today={today} />
      )}
      <Toolbar
        streak={streak}
        onStats={() => setModal("stats")}
        onSettings={() => setModal("settings")}
        onHelp={() => setModal("help")}
      />

      <div className="mode-select">
        <div className="mode-list">
          {GAME_MODES.map((mode) => {
            const empty = answerPool(mode.id, settings).length === 0;
            const done =
              mounted &&
              day !== null &&
              (isArchive
                ? isArchiveModeFinished(mode.id, day, settings)
                : isModeFinished(mode.id, day, settings));
            return (
              <Link
                key={mode.id}
                href={`${base}/${mode.id}`}
                className="mode-item"
                aria-disabled={empty || undefined}
                onClick={(e) => empty && e.preventDefault()}
              >
                <span className="mode-item-icon">
                  <Icon name={mode.icon} />
                </span>
                <span className="mode-item-text">
                  <span className="mode-item-title">{mode.label}</span>
                  <span className="mode-item-desc">{mode.blurb}</span>
                </span>
                <span className={`mode-item-status${done ? " status-won" : ""}`}>
                  {done ? <Icon name="check" /> : null}
                </span>
                <span className="mode-item-arrow">
                  <Icon name="chevronRight" />
                </span>
              </Link>
            );
          })}
        </div>

        {!isArchive && (
          <Link href="/replay" className="archive-link">
            <Icon name="calendar" />
            <span>Play a past day</span>
          </Link>
        )}
      </div>

      <SettingsModal open={modal === "settings"} onClose={() => setModal(null)} />
      <StatsModal open={modal === "stats"} onClose={() => setModal(null)} mode="classic" />
      <HelpModal open={modal === "help"} onClose={() => setModal(null)} />
    </>
  );
}
