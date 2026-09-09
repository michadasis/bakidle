"use client";

import { useState } from "react";
import type { Character } from "@/data/characters";

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function initialsFor(name: string): string {
  const tokens = name.split(/\s+/).filter(Boolean);
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
}

/**
 * Art is hotlinked, so a dead link is a real possibility. Falling back to generated initials
 * keeps the row readable rather than leaving a broken image icon in the grid.
 */
export function Avatar({ character, size }: { character: Character; size?: number }) {
  const [failed, setFailed] = useState(false);
  const style: React.CSSProperties & Record<string, string | number> = {
    ["--hue"]: hashString(character.name) % 360,
  };
  if (size) {
    style.width = `${size}px`;
    style.height = `${size}px`;
    style.fontSize = `${Math.round(size * 0.38)}px`;
  }
  const showImage = character.image && !failed;
  return (
    <div className="avatar" title={character.name} style={style}>
      {showImage ? (
        <img
          className="avatar-img"
          src={character.image}
          alt={character.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        initialsFor(character.name)
      )}
    </div>
  );
}
