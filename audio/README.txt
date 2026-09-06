Voice Lines mode reads its clips from this folder. Bakidle ships with none, because
there's no legitimate API/CDN for short anime voice-clip audio the way MyAnimeList and
AniList serve character portrait images -- so this mode stays empty until you add your
own clips (something you have the rights to use, e.g. ripped from media you own for a
personal fan project).

How to add a character's clips:

1. Drop 1-3 short audio files in this folder (mp3, ogg, or wav all work), e.g.:
     audio/baki-hanma-1.mp3
     audio/baki-hanma-2.mp3

2. Open data.js and add a voiceClips array to that character's entry:
     { name: "Baki Hanma", ..., voiceClips: ["audio/baki-hanma-1.mp3", "audio/baki-hanma-2.mp3"] }

3. Refresh the page. Voice Lines mode only includes characters that have a non-empty
   voiceClips array, so it activates automatically once at least one character has clips.

Clips are revealed progressively like Emoji mode: clip 1 is playable immediately, each
wrong guess unlocks the next one in the array.
