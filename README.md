# Bakidle

**[bakidle.vercel.app](https://bakidle.vercel.app)**

A daily guessing game about the *Baki* cast, in the shape LoLdle made
familiar: five puzzles, one set of answers a day, everyone gets the same ones.

- **Classic** - guess a fighter, get a grid back telling you whether their
  height, weight, age, saga and so on are higher, lower or a match.
- **Quote** - a line they say.
- **Emoji** - a handful of emoji that, in hindsight, obviously meant them.
- **Splash Art** - a portrait, blurred, sharpening as you guess.
- **Voice Lines** - an audio clip.

All five reset together at 00:00 UTC. There is no server and no account;
progress, streaks and stats live in `localStorage`.

## How the daily answer works

The naive version - hash the day, index into the list - has two problems, and
both of them turned up in play.

The first is repeats. Random indexing gives you the same character twice in a
month while a third of the roster never appears. So each mode instead shuffles
the whole pool into a deck and deals one card a day; you see everyone exactly
once before anyone comes round again. The shuffle is a seeded Fisher-Yates, so
every browser builds the identical deck without being told anything.

The second is collisions. Five modes drawing independently put the same
character in two of them on roughly 29% of days, which hands you a free win the
moment you solve one and open another. The decks for a cycle are now built
together, and a card that would clash with an earlier mode is swapped with
another slot in its own deck. Swapping two positions leaves it a permutation,
so the once-each guarantee survives. That's in `src/game/deck.ts`.

Two settings narrow the pools: **modern era only**, which drops characters who
never appear past the original *Baki the Grappler* run, and **include
manga-only characters**, which brings in the fighters no anime has adapted.
Both change the search box as well as the answers - being offered a guess that
can't possibly be right is worse than not being offered it. Saved progress is
keyed by which pool you played, so flipping a setting mid-round doesn't replay
your guesses against a character they were never aimed at.

## File structure

```
src/game/        the rules. No DOM, no React, no module-level settings -
                 everything takes what it needs as an argument, which is
                 mostly why it's testable.
src/data/        90 characters and 8 sagas as typed modules.
src/components/  the UI.
src/app/         a static page per mode, so /classic is a real URL.
scripts/         data validation and the golden capture.
tools/clips.mjs  cuts Voice Lines clips from media on your own disk.
legacy/          backup from before refactoring
```