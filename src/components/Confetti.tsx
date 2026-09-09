"use client";

import { forwardRef, useImperativeHandle, useState } from "react";

export interface ConfettiHandle {
  fire: () => void;
}

interface Piece {
  id: number;
  symbol: string;
  left: number;
  duration: number;
  size: number;
}

const SYMBOLS = ["🥊", "💥", "🔥", "⭐", "👊"];
let nextId = 0;

export const Confetti = forwardRef<ConfettiHandle>(function Confetti(_props, ref) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useImperativeHandle(ref, () => ({
    fire() {
      setPieces(
        Array.from({ length: 28 }, () => ({
          id: nextId++,
          symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          left: Math.random() * 100,
          duration: 2 + Math.random() * 1.5,
          size: 1 + Math.random() * 1.2,
        }))
      );
    },
  }));

  return (
    <div className="confetti-layer">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{ left: `${p.left}vw`, animationDuration: `${p.duration}s`, fontSize: `${p.size}rem` }}
          // Each piece removes itself, so the layer does not accumulate across wins.
          onAnimationEnd={() => setPieces((cur) => cur.filter((x) => x.id !== p.id))}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
});
