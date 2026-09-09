import type { Character } from "@/data/characters";
import { sagaByName } from "@/data/sagas";

export type CellState = "correct" | "partial" | "wrong" | "unknown";

export interface Cell {
  cls: CellState;
  arrow: "" | "▲" | "▼";
}

export const TOLERANCE = { height: 5, weight: 8, age: 5 } as const;

/** Pickle's age is ~200 million, which swamps the cell if printed in full. */
export function formatAge(age: number): string {
  return age >= 1_000_000 ? `~${Math.round(age / 1_000_000)}M` : `${age}`;
}

function numCompare(guessVal: number, answerVal: number, tolerance: number): Cell {
  const diff = Math.abs(guessVal - answerVal);
  const cls: CellState = diff === 0 ? "correct" : diff <= tolerance ? "partial" : "wrong";
  const arrow = guessVal === answerVal ? "" : guessVal < answerVal ? "▲" : "▼";
  return { cls, arrow };
}

function styleCompare(guessArr: string[], answerArr: string[]): CellState {
  const g = new Set(guessArr);
  const a = new Set(answerArr);
  const same = g.size === a.size && [...g].every((x) => a.has(x));
  if (same) return "correct";
  return [...g].some((x) => a.has(x)) ? "partial" : "wrong";
}

/** An arc either side of the answer counts as partial, so the arrow has something to say. */
function sagaCompare(guessSaga: string, answerSaga: string): Cell {
  if (guessSaga === answerSaga) return { cls: "correct", arrow: "" };
  const gOrder = sagaByName(guessSaga)?.order ?? 0;
  const aOrder = sagaByName(answerSaga)?.order ?? 0;
  const diff = Math.abs(gOrder - aOrder);
  return { cls: diff === 1 ? "partial" : "wrong", arrow: gOrder < aOrder ? "▲" : "▼" };
}

export interface Comparison {
  gender: { cls: CellState };
  origin: { cls: CellState };
  styles: { cls: CellState };
  saga: Cell;
  height: Cell;
  weight: Cell;
  age: Cell;
  status: { cls: CellState };
}

export function computeComparisons(g: Character, a: Character): Comparison {
  return {
    gender: { cls: g.gender === a.gender ? "correct" : "wrong" },
    origin: { cls: g.origin === a.origin ? "correct" : "wrong" },
    styles: { cls: styleCompare(g.styles, a.styles) },
    saga: sagaCompare(g.saga, a.saga),
    height: numCompare(g.height!, a.height!, TOLERANCE.height),
    weight: numCompare(g.weight!, a.weight!, TOLERANCE.weight),
    // A stat the source material never recorded is shown, but not compared.
    age: Number.isFinite(g.age)
      ? numCompare(g.age!, a.age!, TOLERANCE.age)
      : { cls: "unknown", arrow: "" },
    status: { cls: g.status === a.status ? "correct" : "wrong" },
  };
}
