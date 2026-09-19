"use client";

import type { Character } from "@/data/characters";
import { computeComparisons, formatAge, type Cell } from "@/game/compare";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";

function Value({ text, arrow }: { text: string; arrow?: string }) {
  // The space sits between the text and the arrow, not inside the arrow span: .arrow has its
  // own sizing, so a space inside it measures differently and shifts every column width.
  return (
    <span className="cell-value">
      {text}
      {arrow ? (
        <>
          {" "}
          <span className="arrow">{arrow}</span>
        </>
      ) : null}
    </span>
  );
}

function StatCell({ label, text, cell }: { label: string; text: string; cell: Cell }) {
  return (
    <td className={cell.cls} data-label={label}>
      <Value text={text} arrow={cell.arrow} />
    </td>
  );
}

/**
 * onRevealed fires when the newest row (first, since the board lists newest on top) has finished
 * animating in, so a win can celebrate after the cells show up rather than while they still are.
 */
export function ClassicBoard({
  guesses,
  answer,
  onRevealed,
}: {
  guesses: Character[];
  answer: Character;
  onRevealed?: () => void;
}) {
  return (
    <div className="table-wrap">
      <table id="board">
        <thead>
          <tr>
            <th>Character</th>
            <th>Gender</th>
            <th>Origin</th>
            <th>Fighting Style</th>
            <th>Saga (Arc)</th>
            <th>Height</th>
            <th>Weight</th>
            <th>Age</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody
          onAnimationEnd={(e) => {
            const cell = e.target as HTMLElement;
            const newest = e.currentTarget.firstElementChild;
            if (cell.tagName === "TD" && cell.parentElement === newest && cell === newest?.lastElementChild) {
              onRevealed?.();
            }
          }}
        >
          {/* Newest guess on top, as the original board did. */}
          {[...guesses].reverse().map((g) => {
            const cmp = computeComparisons(g, answer);
            return (
              <tr key={g.name}>
                <td className="name-cell" data-label="Character">
                  <Avatar character={g} size={34} />
                  <span>{g.name}</span>
                </td>
                <td className={cmp.gender.cls} data-label="Gender">
                  <Value text={g.gender} />
                </td>
                <td className={cmp.origin.cls} data-label="Origin">
                  <Value text={g.origin} />
                </td>
                <td className={cmp.styles.cls} data-label="Fighting Style">
                  <Value text={g.styles.join(", ")} />
                </td>
                <StatCell label="Saga (Arc)" text={g.saga} cell={cmp.saga} />
                <StatCell label="Height" text={`${g.height} cm`} cell={cmp.height} />
                <StatCell label="Weight" text={`${g.weight} kg`} cell={cmp.weight} />
                <StatCell
                  label="Age"
                  text={Number.isFinite(g.age) ? formatAge(g.age!) : "?"}
                  cell={cmp.age}
                />
                <td className={cmp.status.cls} data-label="Status">
                  <Value text={g.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Every non-Classic mode shows the same thing: was that the character or not. */
export function SimpleBoard({
  guesses,
  answer,
  onRevealed,
}: {
  guesses: Character[];
  answer: Character;
  onRevealed?: () => void;
}) {
  return (
    <ul
      className="simple-board"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget.firstElementChild) onRevealed?.();
      }}
    >
      {[...guesses].reverse().map((g) => (
        <li key={g.name} className={`simple-row ${g.name === answer.name ? "correct" : "wrong"}`}>
          <Avatar character={g} size={32} />
          <span className="simple-name">{g.name}</span>
          <span className="simple-icon">
            <Icon name={g.name === answer.name ? "check" : "x"} />
          </span>
        </li>
      ))}
    </ul>
  );
}
