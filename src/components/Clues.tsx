"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { Character } from "@/data/characters";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";

export const SPLASH_BLUR_LEVELS = [20, 15, 11, 8, 5, 2, 0];
export const CLASSIC_HINT_THRESHOLDS = { alias: 3, portrait: 6 };

export function ClassicHints({ answer, guesses, finished }: { answer: Character; guesses: number; finished: boolean }) {
  const aliasUnlocked = finished || guesses >= CLASSIC_HINT_THRESHOLDS.alias;
  const portraitUnlocked = finished || guesses >= CLASSIC_HINT_THRESHOLDS.portrait;
  return (
    <div className="clue-card hints-card">
      <div className="hint-tiles">
        <div className={`hint-tile ${aliasUnlocked ? "unlocked" : "locked"}`}>
          <div className="hint-icon">
            <Icon name="tag" />
          </div>
          <div className="hint-title">Nickname</div>
          <div className="hint-body">
            {aliasUnlocked ? (
              answer.alias ? `"${answer.alias}"` : "—"
            ) : (
              <>
                <Icon name="lock" /> {CLASSIC_HINT_THRESHOLDS.alias} guesses
              </>
            )}
          </div>
        </div>
        <div className={`hint-tile ${portraitUnlocked ? "unlocked" : "locked"}`}>
          <div className="hint-icon">
            <Icon name="image" />
          </div>
          <div className="hint-title">Portrait</div>
          <div className="hint-body">
            {portraitUnlocked ? (
              <Avatar character={answer} size={56} />
            ) : (
              <>
                <Icon name="lock" /> {CLASSIC_HINT_THRESHOLDS.portrait} guesses
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuoteClue({ answer }: { answer: Character }) {
  return (
    <div className="clue-card">
      <p id="quoteText">{answer.quote}</p>
      <span className="quote-note">{answer.quoteVerified ? "" : "Paraphrased line"}</span>
    </div>
  );
}

export function EmojiClue({ answer, guesses, finished }: { answer: Character; guesses: number; finished: boolean }) {
  const total = answer.emoji.length;
  const revealed = finished ? total : Math.min(total, 1 + guesses);
  return (
    <div className="clue-card emoji-clue">
      {/* Slots are separated by a real space: the container is not flex, so the gap between
          them comes from that space plus letter-spacing. */}
      <div className="emoji-display">
        {answer.emoji.map((e, i) => (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <span className={`emoji-slot${i < revealed ? "" : " locked"}`}>
              {i < revealed ? e : <Icon name="lock" />}
            </span>
          </Fragment>
        ))}
      </div>
      <div className="emoji-hint">
        {finished ? "" : `${revealed}/${total} revealed — a wrong guess reveals another`}
      </div>
    </div>
  );
}

export function SplashClue({ answer, guesses, finished }: { answer: Character; guesses: number; finished: boolean }) {
  const level = finished
    ? SPLASH_BLUR_LEVELS.length - 1
    : Math.min(guesses, SPLASH_BLUR_LEVELS.length - 1);
  return (
    <div className="clue-card splash-clue">
      <div className="splash-frame">
        <img
          src={answer.image}
          alt="Mystery character"
          style={{ filter: `blur(${SPLASH_BLUR_LEVELS[level]}px)` }}
        />
      </div>
      <div className="emoji-hint">
        {finished ? "" : `Guess ${guesses + 1} — a wrong guess sharpens the image`}
      </div>
    </div>
  );
}

export function VoiceClue({ answer, guesses, finished }: { answer: Character; guesses: number; finished: boolean }) {
  const clips = answer.voiceClips ?? [];
  const unlocked = finished ? clips.length : Math.min(clips.length, 1 + guesses);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // A newly locked selection can happen when the mode reloads with fewer guesses.
  useEffect(() => {
    if (selected >= unlocked) setSelected(Math.max(0, unlocked - 1));
  }, [selected, unlocked]);

  // Leaving the mode must not leave audio playing behind a hidden view.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
    setProgress(0);
  }, [selected]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  return (
    <div className="clue-card voice-clue">
      <audio
        ref={audioRef}
        src={clips[selected] ? `/${clips[selected]}` : undefined}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
      />
      <button className="voice-play-btn" type="button" aria-label="Play clip" onClick={toggle}>
        <Icon name={playing ? "stop" : "play"} filled={playing} />
      </button>
      <div className="voice-progress">
        <div className="voice-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {/* Nothing to choose between with a single clip. */}
      <div className="voice-clips" hidden={clips.length <= 1}>
        {clips.map((_, i) => {
          const isUnlocked = i < unlocked;
          return (
            <button
              key={i}
              className={`voice-chip${isUnlocked ? "" : " locked"}${i === selected ? " selected" : ""}`}
              disabled={!isUnlocked}
              title={isUnlocked ? `Clip ${i + 1}` : `Clip ${i + 1} locked`}
              onClick={() => setSelected(i)}
            >
              {isUnlocked ? i + 1 : <Icon name="lock" />}
            </button>
          );
        })}
      </div>
      <div className="emoji-hint">
        {finished ? "" : `${unlocked}/${clips.length} clips unlocked — a wrong guess unlocks another`}
      </div>
    </div>
  );
}
