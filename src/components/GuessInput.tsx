"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Character } from "@/data/characters";
import type { ModeId } from "@/game/modes";
import { guessPool } from "@/game/pools";
import type { Settings } from "@/game/settings";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";

export function GuessInput({
  mode,
  settings,
  guessed,
  disabled,
  status,
  onGuess,
}: {
  mode: ModeId;
  settings: Settings;
  guessed: string[];
  disabled: boolean;
  status: string;
  onGuess: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const pool = guessPool(mode, settings);

  // The original put the caret in the box as soon as a round was playable; losing that would
  // make every visit start with a click.
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled, mode]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Character[];
    const taken = new Set(guessed);
    return pool
      .filter((c) => !taken.has(c.name) && c.name.toLowerCase().split(/\s+/).some((t) => t.startsWith(q)))
      .sort((a, b) => {
        const aFirst = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bFirst = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aFirst - bFirst || a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [query, guessed, pool]);

  function submit(name: string) {
    onGuess(name);
    setQuery("");
    setHighlighted(-1);
  }

  // The send button and the Enter key do the same thing: take the highlighted suggestion, else
  // the first one, else whatever was typed.
  function submitCurrent() {
    const pick = highlighted >= 0 ? matches[highlighted] : matches[0];
    submit(pick ? pick.name : query.trim());
  }

  return (
    <>
      <div className="search-wrap">
        <div className="search-row">
          <input
            ref={inputRef}
            id="guessInput"
            type="text"
            placeholder="Enter a character name..."
            autoComplete="off"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlighted(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlighted((h) => Math.min(h + 1, matches.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlighted((h) => Math.max(h - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                submitCurrent();
              } else if (e.key === "Escape") {
                setQuery("");
                setHighlighted(-1);
              }
            }}
          />
          <button
            type="button"
            className="send-btn"
            aria-label="Submit guess"
            title="Submit guess"
            disabled={disabled || !query.trim()}
            onClick={submitCurrent}
          >
            <Icon name="play" filled />
          </button>
        </div>
        {matches.length > 0 && (
          <ul className="suggestions">
            {matches.map((c, i) => (
              <li
                key={c.name}
                className={i === highlighted ? "highlighted" : undefined}
                // mousedown fires before the input blurs, so the click is not lost.
                onMouseDown={(e) => {
                  e.preventDefault();
                  submit(c.name);
                }}
                onMouseEnter={() => setHighlighted(i)}
              >
                <Avatar character={c} size={26} />
                <span>{c.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="status-line">{status}</div>
      <div className="guesses-count">
        {guessed.length ? `${guessed.length} guess${guessed.length === 1 ? "" : "es"}` : ""}
      </div>
    </>
  );
}
