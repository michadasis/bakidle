#!/usr/bin/env node
// Clip mode tooling for Bakidle.
//
//   node tools/clips.mjs init [manifest]     scaffold a manifest listing every character
//   node tools/clips.mjs batch [manifest]    cut every clip in the manifest, then sync
//   node tools/clips.mjs cut <input> <start> <len> "<character>"
//   node tools/clips.mjs sync                rewrite data.js clip paths from clips/
//
// Sources are media files on your own disk. This tool never downloads anything.

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLIP_DIR = join(ROOT, "clips");
const DATA_FILE = join(ROOT, "data.js");
const DEFAULT_MANIFEST = join(ROOT, "clips.manifest.json");
const CLIP_EXTS = [".mp4", ".webm"];

// The clip is blurred for most of the round, so detail above this is bytes nobody sees.
const WIDTH = 640;
const HEIGHT = 360;

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function characterNames() {
  const src = readFileSync(DATA_FILE, "utf8");
  return [...src.matchAll(/\{\s*name:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function resolveCharacter(names, character) {
  return names.find(
    (n) => n.toLowerCase() === String(character).toLowerCase() || slugify(n) === slugify(String(character)),
  );
}

// Walks forward from the `{` at `start` to its matching `}`, skipping over string
// literals so a brace inside a quote can't throw off the depth count.
function objectSliceEnd(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"') {
      i++;
      while (i < src.length && src[i] !== '"') i += src[i] === "\\" ? 2 : 1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return i + 1;
  }
  throw new Error(`unterminated object literal at offset ${start}`);
}

// Center-crop to 16:9 at a small size, H.264 + AAC so every browser can play it.
// yuv420p and faststart are what make it work in browsers rather than just in VLC.
function cutOne(input, start, len, name) {
  mkdirSync(CLIP_DIR, { recursive: true });
  const out = join(CLIP_DIR, `${slugify(name)}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error",
    "-ss", String(start), "-t", String(len), "-i", input,
    "-vf", `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-pix_fmt", "yuv420p", "-profile:v", "main",
    "-c:a", "aac", "-b:a", "96k", "-ac", "2",
    "-movflags", "+faststart",
    out,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  return out;
}

function ffmpegError(err) {
  return String(err.stderr || "").trim() || err.message || "ffmpeg failed";
}

function cut(argv) {
  const [input, start, len, character] = argv;
  if (!input || !start || !len || !character) {
    console.error('usage: node tools/clips.mjs cut <input> <start> <len> "<character>"');
    process.exit(1);
  }
  if (!existsSync(input)) {
    console.error(`no such input file: ${input}`);
    process.exit(1);
  }
  const match = resolveCharacter(characterNames(), character);
  if (!match) {
    console.error(`"${character}" is not a character in data.js`);
    process.exit(1);
  }
  try {
    console.log(`wrote ${cutOne(input, start, len, match)}`);
  } catch (err) {
    console.error(ffmpegError(err));
    process.exit(1);
  }
  console.log("run `node tools/clips.mjs sync` to wire it into data.js");
}

function init(argv) {
  const file = argv[0] ? resolve(argv[0]) : DEFAULT_MANIFEST;
  if (existsSync(file)) {
    console.error(`${file} already exists — delete it first if you want a fresh scaffold`);
    process.exit(1);
  }
  const manifest = {
    _readme: [
      "Point 'sources' at video files on your own disk, then give each character a start",
      "time ('at', hh:mm:ss(.ms) or seconds) and a length in seconds ('len').",
      "Keep clips short -- 2 to 3 seconds is plenty. One clip per character.",
      "Delete the rows you don't want. Then: node tools/clips.mjs batch",
    ],
    sources: { ep1: "D:/path/to/your/episode.mkv" },
    clips: characterNames().map((character) => ({ character, source: "ep1", at: "00:00:00", len: 3 })),
  };
  writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${file} — ${manifest.clips.length} rows, one per character`);
  console.log("edit it, delete rows you don't need, then run: node tools/clips.mjs batch");
}

function batch(argv) {
  const file = argv[0] ? resolve(argv[0]) : DEFAULT_MANIFEST;
  if (!existsSync(file)) {
    console.error(`no manifest at ${file} — run \`node tools/clips.mjs init\` first`);
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    console.error(`${file} is not valid JSON: ${err.message}`);
    process.exit(1);
  }

  const sources = manifest.sources || {};
  const rows = Array.isArray(manifest.clips) ? manifest.clips : [];
  if (!rows.length) {
    console.error("manifest has no clips");
    process.exit(1);
  }

  const names = characterNames();
  const done = new Set();
  let made = 0;
  const problems = [];

  for (const [i, row] of rows.entries()) {
    const where = `row ${i + 1}${row.character ? ` (${row.character})` : ""}`;
    const match = resolveCharacter(names, row.character || "");
    if (!match) {
      problems.push(`${where}: not a character in data.js`);
      continue;
    }
    if (done.has(match)) {
      problems.push(`${where}: ${match} already has a clip from an earlier row — only one per character`);
      continue;
    }
    const input = sources[row.source] || row.source;
    if (!input || !existsSync(input)) {
      problems.push(`${where}: source not found — ${input || "(none given)"}`);
      continue;
    }
    if (row.at === undefined || row.len === undefined) {
      problems.push(`${where}: needs both "at" and "len"`);
      continue;
    }

    try {
      cutOne(input, row.at, row.len, match);
      done.add(match);
      made++;
      console.log(`${match} <- ${row.at} +${row.len}s`);
    } catch (err) {
      problems.push(`${where}: ${ffmpegError(err)}`);
    }
  }

  if (problems.length) {
    console.warn(`\n${problems.length} row(s) skipped:`);
    for (const p of problems) console.warn(`  ${p}`);
  }
  console.log(`\ncut ${made} clip(s)`);
  if (made) sync();
}

function sync() {
  const bySlug = new Map();
  if (existsSync(CLIP_DIR)) {
    for (const file of readdirSync(CLIP_DIR)) {
      const ext = CLIP_EXTS.find((e) => file.toLowerCase().endsWith(e));
      if (!ext) continue;
      bySlug.set(file.slice(0, -ext.length), `clips/${file}`);
    }
  }

  let src = readFileSync(DATA_FILE, "utf8");
  const EOL = src.includes("\r\n") ? "\r\n" : "\n";
  const names = characterNames();
  const seen = new Set();
  let changed = 0;

  for (const name of names) {
    const slug = slugify(name);
    const clip = bySlug.get(slug) || "";
    seen.add(slug);

    const anchor = src.indexOf(`{ name: "${name}",`);
    if (anchor === -1) {
      console.warn(`could not locate "${name}" in data.js — left untouched`);
      continue;
    }
    const end = objectSliceEnd(src, anchor);
    const block = src.slice(anchor, end);

    // Anchored to a line start via lookbehind so it can't latch onto the tail of some
    // other key, and so it never consumes the *previous* line's \r -- doing that in a
    // CRLF file leaves a bare \n behind and add/remove cycles mangle the line endings.
    const existing = block.match(/(?<=[\r\n])[ \t]*clip:\s*"[^"]*",?(\r?\n)?/);
    let next;

    if (!clip) {
      if (!existing) continue;
      next = block.replace(existing[0], "");
    } else if (existing) {
      next = block.replace(existing[0], `    clip: "${clip}",${existing[1] || ""}`);
    } else {
      const image = block.search(/\r?\n[ \t]*image:/);
      next = image === -1
        ? block.replace(/\s*\}$/, `,${EOL}    clip: "${clip}" }`)
        : block.slice(0, image) + `${EOL}    clip: "${clip}",` + block.slice(image);
    }

    if (next !== block) {
      src = src.slice(0, anchor) + next + src.slice(end);
      changed++;
      console.log(`${name}: ${clip || "no clip"}`);
    }
  }

  for (const slug of bySlug.keys()) {
    if (!seen.has(slug)) console.warn(`clips/${slug}.* matches no character in data.js`);
  }

  if (!changed) {
    console.log("data.js already up to date");
    return;
  }

  // Syntax-check the rewrite before letting it overwrite the real file.
  const probe = join(ROOT, ".clips-sync-probe.js");
  writeFileSync(probe, src);
  try {
    execFileSync(process.execPath, ["--check", probe], { stdio: ["ignore", "ignore", "inherit"] });
  } catch {
    console.error(`rewrite produced invalid JS — data.js untouched, bad output left at ${probe}`);
    process.exit(1);
  }
  unlinkSync(probe);

  writeFileSync(DATA_FILE, src);
  console.log(`updated ${changed} character${changed === 1 ? "" : "s"} in data.js`);
}

const [command, ...rest] = process.argv.slice(2);
if (command === "init") init(rest);
else if (command === "batch") batch(rest);
else if (command === "cut") cut(rest);
else if (command === "sync") sync();
else {
  console.error("usage: node tools/clips.mjs init [manifest]");
  console.error("       node tools/clips.mjs batch [manifest]");
  console.error('       node tools/clips.mjs cut <input> <start> <len> "<character>"');
  console.error("       node tools/clips.mjs sync");
  process.exit(1);
}
