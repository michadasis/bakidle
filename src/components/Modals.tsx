"use client";

import { CHARACTERS } from "@/data/characters";
import type { ModeId } from "@/game/modes";
import { eligibleCharacters, guessPool } from "@/game/pools";
import { loadStats, loadStreak } from "@/game/progress";
import { setSetting, useSettings } from "@/game/store";
import { globalDayIndex } from "@/game/time";
import { Modal, useNow } from "./Chrome";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useSettings();
  const eligible = eligibleCharacters(settings).length;
  const classic = guessPool("classic", settings).length;

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <label className="setting-row" htmlFor="modernOnlyToggle">
        <span className="setting-text">
          <span className="setting-title">Modern era only</span>
          <span className="setting-desc">
            Leave out characters who never appear past the original Baki the Grappler run. They
            stop being the answer and stop appearing in the search.
          </span>
        </span>
        <input
          type="checkbox"
          id="modernOnlyToggle"
          className="setting-switch"
          checked={settings.modernOnly}
          onChange={(e) => setSetting("modernOnly", e.target.checked)}
        />
        <span className="setting-track" aria-hidden="true" />
      </label>

      <label className="setting-row" htmlFor="mangaOnlyToggle">
        <span className="setting-text">
          <span className="setting-title">Include manga-only characters</span>
          <span className="setting-desc">
            Bring in the fighters no anime has adapted, chiefly the Baki Dou sumo tournament. Off
            by default, so the roster matches what you can watch. While off they are absent from
            the search too.
          </span>
        </span>
        <input
          type="checkbox"
          id="mangaOnlyToggle"
          className="setting-switch"
          checked={settings.includeMangaOnly}
          onChange={(e) => setSetting("includeMangaOnly", e.target.checked)}
        />
        <span className="setting-track" aria-hidden="true" />
      </label>

      <p className="settings-note">
        {eligible} of {CHARACTERS.length} characters are in play. Classic uses the {classic} with a
        recorded height and weight.
      </p>
    </Modal>
  );
}

const BUCKETS = ["1", "2", "3", "4", "5", "6", "7+"];

export function StatsModal({
  open,
  onClose,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  mode: ModeId;
}) {
  const now = useNow(open);
  if (!open || now === null) return <Modal open={open} onClose={onClose} title="Statistics" children={null} />;

  const s = loadStats(mode);
  const g = loadStreak(globalDayIndex(now));
  // There is no way to lose a round, so a win rate would read 100% forever. How many guesses it
  // took is the thing that actually moves.
  const average = s.wins ? (s.totalGuesses / s.wins).toFixed(1) : "—";
  const best = s.best === null ? "—" : String(s.best);
  const maxDist = Math.max(1, ...BUCKETS.map((b) => s.distribution[b] || 0));
  const label = mode.charAt(0).toUpperCase() + mode.slice(1);

  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <div className="stats-grid">
        <div>
          <div className="stat-value">{s.played}</div>
          <div className="stat-label">Played</div>
        </div>
        <div>
          <div className="stat-value">{average}</div>
          <div className="stat-label">Avg Tries</div>
        </div>
        <div>
          <div className="stat-value">{best}</div>
          <div className="stat-label">Best</div>
        </div>
        <div>
          <div className="stat-value">{g.currentStreak}</div>
          <div className="stat-label">Streak</div>
        </div>
        <div>
          <div className="stat-value">{g.maxStreak}</div>
          <div className="stat-label">Max Streak</div>
        </div>
      </div>
      <div className="dist-title">Guess Distribution &mdash; {label} Daily</div>
      {BUCKETS.map((b) => {
        const count = s.distribution[b] || 0;
        const pct = count ? Math.max(6, Math.round((count / maxDist) * 100)) : 0;
        return (
          <div className="dist-row" key={b}>
            <span className="dist-label">{b}</span>
            <div className="dist-bar-wrap">
              <div
                className="dist-bar"
                style={count ? { width: `${pct}%` } : { width: 0, minWidth: 0 }}
              >
                {count || ""}
              </div>
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="How to Play">
      <p>
        <strong>Classic</strong> &mdash; guess the character. Every guess compares Gender, Origin,
        Fighting Style, Saga, Height, Weight, Age, and Status against the answer.
      </p>
      <p>
        Every mode has two hints. A nickname unlocks after 3 guesses, and after 6 you get a
        portrait &mdash; a full giveaway. Splash Art shows the fighting style instead, since it
        is already showing you the picture.
      </p>
      <ul className="rules-list">
        <li>
          <span className="dot correct" /> Green = exact match.
        </li>
        <li>
          <span className="dot partial" /> Yellow = close (Height &plusmn;5cm, Weight &plusmn;8kg,
          Age &plusmn;5yrs, neighboring Saga, or a partial Fighting Style overlap).
        </li>
        <li>
          <span className="dot wrong" /> Red = no match. Height/Weight/Age/Saga also show
          &#9650;/&#9660; hinting whether the answer is higher or lower.
        </li>
      </ul>
      <p>
        <strong>Quote</strong> &mdash; guess the character from a line they say.
      </p>
      <p>
        <strong>Emoji</strong> &mdash; guess the character from an emoji clue. A wrong guess reveals
        another emoji.
      </p>
      <p>
        <strong>Splash Art</strong> &mdash; guess the character from their heavily blurred portrait.
        A wrong guess sharpens the image.
      </p>
      <p>
        <strong>Voice Lines</strong> &mdash; guess the character from a short audio clip. A wrong
        guess unlocks another clip.
      </p>
      <p>
        Each mode has its own daily puzzle &mdash; same answer for everyone, and every mode resets
        together at 12 AM UTC. Progress is saved automatically. Win to keep your streak alive.
      </p>
    </Modal>
  );
}
