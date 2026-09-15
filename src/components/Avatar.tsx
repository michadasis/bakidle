"use client";

import { useState } from "react";
import type { Character } from "@/data/characters";
import { SecureImage } from "./SecureImage";

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
 *
 * conceal is for a clue meant to be recognized by sight before the answer is confirmed - the
 * portrait hint. Without it, this same component would hand the name away for free through
 * `title` (a hover tooltip, no click needed) and `alt` (shown as text in place of the image on
 * a slow connection) - both bypassing the entire point of a *visual* hint. conceal drops both,
 * draws the picture on canvas the same way SplashClue does, and never falls back to
 * name-derived initials either.
 */
export function Avatar({
  character,
  size,
  conceal,
}: {
  character: Character;
  size?: number;
  conceal?: boolean;
}) {
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
    <div className="avatar" title={conceal ? undefined : character.name} style={style}>
      {showImage ? (
        conceal ? (
          <SecureImage
            src={character.image!}
            size={size ?? 256}
            className="avatar-img"
            ariaLabel="Portrait hint"
            onError={() => setFailed(true)}
          />
        ) : (
          <img
            className="avatar-img"
            src={character.image}
            alt={character.name}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )
      ) : conceal ? (
        "?"
      ) : (
        initialsFor(character.name)
      )}
    </div>
  );
}
