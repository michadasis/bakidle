Clip mode reads its videos from this folder. Bakidle ships with none, because there's no
legitimate API/CDN for short anime video clips the way MyAnimeList and AniList serve
character portrait images -- so this mode stays empty until you add your own clips, cut
from media you actually have the rights to use (e.g. a disc or a DRM-free file you own,
for a personal fan project).

Do not pull these from YouTube, soundboard sites, or other reuploads. Those hosts don't
own the footage and can't license it to you -- rehosting it on a public site is on you.

How to add clips:

1. Scaffold a manifest -- one row per character, prefilled from data.js:
     node tools/clips.mjs init

2. Open clips.manifest.json. Point "sources" at your own video files, set each
   character's start time ("at") and length in seconds ("len"), and delete the rows you
   don't want. Keep clips short; 2-3 seconds is plenty.

3. Cut them all and wire them up:
     node tools/clips.mjs batch

   This writes clips/<slug>.mp4 (640x360, H.264/AAC) and adds a clip: "clips/<slug>.mp4"
   field to each character in data.js.

For a one-off:
     node tools/clips.mjs cut <input> <start> <len> "Baki Hanma"
     node tools/clips.mjs sync

`sync` rebuilds every clip path in data.js from whatever is in this folder, so deleting a
file here and re-running it also removes the field. Clip mode only includes characters
that have a clip, so it activates automatically once at least one does, and hides itself
again if none do.

The clip starts heavily blurred and sharpens with each wrong guess (see CLIP_BLUR_LEVELS
in script.js). Audio plays when the player presses play.
