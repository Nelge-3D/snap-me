"use client";

import { useState } from "react";
import { speak } from "@/lib/speak";

export function SpeakButton({
  text,
  size = "md",
}: {
  text: string;
  size?: "sm" | "md";
}) {
  const [playing, setPlaying] = useState(false);

  async function handleClick() {
    if (playing) return;
    setPlaying(true);
    await speak(text);
    setPlaying(false);
  }

  const dimension = size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={playing}
      aria-label={`Écouter "${text}"`}
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent transition-colors active:bg-accent/30 disabled:opacity-60 ${dimension}`}
    >
      {playing ? "..." : "🔊"}
    </button>
  );
}
