"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAME_MODES, type ModeId } from "@/game/modes";
import { answerPool } from "@/game/pools";
import { isArchiveModeFinished, isModeFinished } from "@/game/progress";
import { useSettings } from "@/game/store";
import { dayIndexToDateSlug, formatArchiveDate, globalDayIndex } from "@/game/time";
import { Icon } from "./Icon";

/** Ticks once a second on the client only; the server has no meaningful "now". */
export function useNow(active = true): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

/** Plain "Daily #N" for the live game; a dated Replay badge when browsing a past round. */
export function DayNumber({ archiveDay }: { archiveDay?: number } = {}) {
  const now = useNow(archiveDay === undefined);
  if (archiveDay !== undefined) {
    return (
      <div className="day-number archive-day-number">
        <span className="replay-tag">Replay</span>
        {formatArchiveDate(archiveDay)}
      </div>
    );
  }
  return <div className="day-number">{now === null ? "" : `Daily #${globalDayIndex(now) + 1}`}</div>;
}

/**
 * Quick switcher shown once a mode is picked. Solved modes carry a check. Passing archiveDay
 * points every link at that Replay round instead of today's, and checks that round's own record.
 */
export function ModeRail({ active, archiveDay }: { active: ModeId; archiveDay?: number }) {
  const settings = useSettings();
  const now = useNow(archiveDay === undefined);
  const today = now === null ? null : globalDayIndex(now);
  const day = archiveDay ?? today;
  const base = archiveDay === undefined ? "" : `/replay/${dayIndexToDateSlug(archiveDay)}`;
  // archiveDay is a prop, so day is known on the very first render - server included, where
  // localStorage does not exist. Gating the read on a post-mount flag keeps that first render
  // (and the client's matching hydration pass) agreeing with the server: never checked yet.
  // The live path stays safe without this too, since `now` starts null either way, but the flag
  // costs nothing there and keeps both paths reasoning about hydration the same way.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <nav className="mode-rail" aria-label="Switch game mode">
      {GAME_MODES.map((mode) => {
        const empty = answerPool(mode.id, settings).length === 0;
        const done =
          mounted &&
          day !== null &&
          (archiveDay === undefined
            ? isModeFinished(mode.id, day, settings)
            : isArchiveModeFinished(mode.id, day, settings));
        return (
          <Link
            key={mode.id}
            href={`${base}/${mode.id}`}
            className={`rail-btn${mode.id === active ? " active" : ""}`}
            title={mode.label}
            aria-label={mode.label}
            aria-current={mode.id === active ? "true" : undefined}
            aria-disabled={empty || undefined}
            onClick={(e) => empty && e.preventDefault()}
          >
            <Icon name={mode.icon} />
            {done && (
              <span className="rail-check">
                <Icon name="check" />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Previous/Next day plus a way out, shown on every Replay screen. mode is omitted on the
 * day's mode-select page and present once a specific round is open, so the arrows always land
 * on the same kind of page you're already looking at.
 */
export function ArchiveNav({
  archiveDay,
  today,
  mode,
}: {
  archiveDay: number;
  today: number;
  mode?: ModeId;
}) {
  const suffix = mode ? `/${mode}` : "";
  const hasPrev = archiveDay > 0;
  // today itself is the live puzzle, not an archived day, so the last day this can step to is
  // today - 1.
  const hasNext = archiveDay < today - 1;
  return (
    <nav className="archive-nav" aria-label="Browse other days">
      {hasPrev ? (
        <Link href={`/replay/${dayIndexToDateSlug(archiveDay - 1)}${suffix}`} className="archive-nav-btn">
          <Icon name="chevronLeft" /> Previous day
        </Link>
      ) : (
        <span className="archive-nav-btn is-disabled">
          <Icon name="chevronLeft" /> Previous day
        </span>
      )}
      <Link href="/replay" className="archive-nav-btn archive-nav-all">
        All days
      </Link>
      {hasNext ? (
        <Link href={`/replay/${dayIndexToDateSlug(archiveDay + 1)}${suffix}`} className="archive-nav-btn">
          Next day <Icon name="chevronRight" />
        </Link>
      ) : (
        <span className="archive-nav-btn is-disabled">
          Next day <Icon name="chevronRight" />
        </span>
      )}
    </nav>
  );
}

export function Toolbar({
  onStats,
  onSettings,
  onHelp,
  streak,
}: {
  onStats: () => void;
  onSettings: () => void;
  onHelp: () => void;
  streak: number;
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-btn" title="Statistics" aria-label="Statistics" onClick={onStats}>
          <Icon name="stats" />
        </button>
        <div
          className={`streak-flame${streak <= 0 ? " is-zero" : ""}`}
          title={streak > 0 ? `${streak}-day win streak` : "No win streak yet"}
        >
          <Icon name="flame" filled />
          <span className="streak-count">{streak}</span>
          <span className="sr-only">win streak</span>
        </div>
      </div>
      <button className="toolbar-btn" title="Settings" aria-label="Settings" onClick={onSettings}>
        <Icon name="settings" />
      </button>
      <button className="toolbar-btn" title="How to play" aria-label="How to play" onClick={onHelp}>
        <Icon name="help" />
      </button>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          &times;
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
