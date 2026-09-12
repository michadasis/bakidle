"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAME_MODES, type ModeId } from "@/game/modes";
import { answerPool } from "@/game/pools";
import { isModeFinished } from "@/game/progress";
import { useSettings } from "@/game/store";
import { globalDayIndex } from "@/game/time";
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

export function DayNumber() {
  const now = useNow();
  return <div className="day-number">{now === null ? "" : `Daily #${globalDayIndex(now) + 1}`}</div>;
}

/** Quick switcher shown once a mode is picked. Solved modes carry a check. */
export function ModeRail({ active }: { active: ModeId }) {
  const settings = useSettings();
  const now = useNow();
  const today = now === null ? null : globalDayIndex(now);
  return (
    <nav className="mode-rail" aria-label="Switch game mode">
      {GAME_MODES.map((mode) => {
        const empty = answerPool(mode.id, settings).length === 0;
        const done = today !== null && isModeFinished(mode.id, today, settings);
        return (
          <Link
            key={mode.id}
            href={`/${mode.id}`}
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
