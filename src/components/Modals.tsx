"use client";

import { useState } from "react";
import { CHARACTERS } from "@/data/characters";
import type { ModeId } from "@/game/modes";
import { eligibleCharacters, guessPool } from "@/game/pools";
import { loadStats, loadStreak } from "@/game/progress";
import { setSetting, useSettings } from "@/game/store";
import { globalDayIndex } from "@/game/time";
import {
  exportData,
  importData,
  parseTransferCode,
  summarize,
  type ParseResult,
} from "@/game/transfer";
import { Modal, useNow } from "./Chrome";
import { HINT_THRESHOLDS } from "./Clues";

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
  const average = s.wins ? (s.totalGuesses / s.wins).toFixed(1) : "-";
  const best = s.best === null ? "-" : String(s.best);
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
      <div className="dist-title">Guess Distribution - {label} Daily</div>
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
      <TransferData />
    </Modal>
  );
}

function TransferData() {
  const [view, setView] = useState<"closed" | "menu" | "export" | "import">("closed");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [checked, setChecked] = useState<ParseResult | null>(null);
  const [error, setError] = useState("");

  if (view === "closed") {
    return (
      <div className="transfer">
        <button type="button" className="transfer-btn" onClick={() => setView("menu")}>
          Transfer my data
        </button>
      </div>
    );
  }

  const openExport = () => {
    try {
      setCode(exportData(window.localStorage));
      setCopied(false);
      setError("");
      setView("export");
    } catch {
      setError("This browser is blocking storage, so there is nothing to export.");
    }
  };

  const openImport = () => {
    setPasted("");
    setChecked(null);
    setError("");
    setView("import");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // No clipboard access: select the code so it can be copied by hand.
      (document.getElementById("transfer-code") as HTMLTextAreaElement | null)?.select();
    }
  };

  const replace = () => {
    if (!checked?.ok) return;
    try {
      importData(window.localStorage, checked.keys);
      window.location.reload();
    } catch {
      setError("This browser is blocking storage, so the import could not be saved.");
    }
  };

  const back = (
    <button type="button" className="transfer-btn subtle" onClick={() => setView("menu")}>
      Back
    </button>
  );

  return (
    <div className="transfer">
      <div className="transfer-title">Transfer my data</div>

      {view === "menu" && (
        <>
          <p className="transfer-note">
            Move your streak, stats and today&apos;s progress to another browser or device.
          </p>
          <div className="transfer-actions">
            <button type="button" className="transfer-btn" onClick={openExport}>
              Export
            </button>
            <button type="button" className="transfer-btn" onClick={openImport}>
              Import
            </button>
          </div>
        </>
      )}

      {view === "export" && (
        <>
          <p className="transfer-note">
            Copy this code. On the other device, open Statistics, choose Transfer my data, then
            Import, and paste it in.
          </p>
          <textarea
            id="transfer-code"
            className="transfer-code"
            readOnly
            rows={4}
            value={code}
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className="transfer-actions">
            <button type="button" className="transfer-btn" onClick={copy}>
              {copied ? "Copied!" : "Copy code"}
            </button>
            {back}
          </div>
        </>
      )}

      {view === "import" && (
        <>
          <textarea
            className="transfer-code"
            rows={4}
            placeholder="Paste your transfer code here"
            value={pasted}
            onChange={(e) => {
              setPasted(e.target.value);
              setChecked(null);
            }}
          />
          {checked && !checked.ok && <p className="transfer-error">{checked.error}</p>}
          {checked?.ok ? (
            <TransferConfirm keys={checked.keys} onReplace={replace} onCancel={() => setChecked(null)} />
          ) : (
            <div className="transfer-actions">
              <button
                type="button"
                className="transfer-btn"
                disabled={!pasted.trim()}
                onClick={() => setChecked(parseTransferCode(pasted))}
              >
                Check code
              </button>
              {back}
            </div>
          )}
        </>
      )}

      {error && <p className="transfer-error">{error}</p>}
    </div>
  );
}

function TransferConfirm({
  keys,
  onReplace,
  onCancel,
}: {
  keys: Record<string, string>;
  onReplace: () => void;
  onCancel: () => void;
}) {
  const s = summarize(keys);
  return (
    <>
      <p className="transfer-note">
        This code has {s.played} {s.played === 1 ? "game" : "games"} played and a {s.currentStreak}
        -day streak (best {s.maxStreak}). Importing replaces the progress saved on this device.
      </p>
      <div className="transfer-actions">
        <button type="button" className="transfer-btn danger" onClick={onReplace}>
          Replace my progress
        </button>
        <button type="button" className="transfer-btn subtle" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </>
  );
}

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="How to Play">
      <p>
        <strong>Classic</strong> - guess the character. Every guess compares Gender, Origin,
        Fighting Style, Saga, Height, Weight, Age, and Status against the answer.
      </p>
      <p>
        Every mode has two hints, which appear after your first wrong guess. A nickname unlocks
        after {HINT_THRESHOLDS.first} guesses, and after {HINT_THRESHOLDS.second} you get a
        portrait - a full giveaway. Unlocked hints stay hidden until you click them. Splash Art
        shows the fighting style instead, since it is already showing you the picture.
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
        <strong>Quote</strong> - guess the character from a line they say.
      </p>
      <p>
        <strong>Emoji</strong> - guess the character from an emoji clue. A wrong guess reveals
        another emoji.
      </p>
      <p>
        <strong>Splash Art</strong> - guess the character from their heavily blurred portrait.
        A wrong guess sharpens the image.
      </p>
      <p>
        <strong>Voice Lines</strong> - guess the character from a short audio clip. A wrong
        guess unlocks another clip.
      </p>
      <p>
        Each mode has its own daily puzzle - same answer for everyone, and every mode resets
        together at 12 AM UTC. Progress is saved automatically. Win to keep your streak alive.
      </p>
    </Modal>
  );
}
