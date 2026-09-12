"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAME_MODES } from "@/game/modes";
import { answerPool } from "@/game/pools";
import { isModeFinished, loadStreak } from "@/game/progress";
import { hydrateSettings, useSettings } from "@/game/store";
import { purgeLegacyStorage } from "@/game/storage";
import { globalDayIndex } from "@/game/time";
import { DayNumber, Toolbar } from "./Chrome";
import { Icon } from "./Icon";
import { HelpModal, SettingsModal, StatsModal } from "./Modals";

export function ModeList() {
  const settings = useSettings();
  const [day, setDay] = useState<number | null>(null);
  const [modal, setModal] = useState<null | "stats" | "settings" | "help">(null);

  useEffect(() => {
    hydrateSettings();
    const today = globalDayIndex();
    purgeLegacyStorage(today);
    setDay(today);
    const id = setInterval(() => setDay(globalDayIndex()), 1000);
    return () => clearInterval(id);
  }, []);

  const streak = day === null ? 0 : loadStreak(day).currentStreak;

  return (
    <>
      <header>
        <h1>BAKIDLE</h1>
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
        <div className="mode-list">
          {GAME_MODES.map((mode) => {
            const empty = answerPool(mode.id, settings).length === 0;
            const done = day !== null && isModeFinished(mode.id, day, settings);
            return (
              <Link
                key={mode.id}
                href={`/${mode.id}`}
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
      </div>

      <SettingsModal open={modal === "settings"} onClose={() => setModal(null)} />
      <StatsModal open={modal === "stats"} onClose={() => setModal(null)} mode="classic" />
      <HelpModal open={modal === "help"} onClose={() => setModal(null)} />
    </>
  );
}
