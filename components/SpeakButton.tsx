"use client";

import { useState } from "react";
import { speak } from "@/lib/speak";
import type { KokoroProgress } from "@/lib/kokoro";

export function SpeakButton({
  text,
  size = "md",
}: {
  text: string;
  size?: "sm" | "md";
}) {
  const [playing, setPlaying] = useState(false);
  const [loadingPct, setLoadingPct] = useState<number | null>(null);

  async function handleClick() {
    if (playing) return;
    setPlaying(true);
    await speak(text, (p: KokoroProgress) => {
      if (p.status === "progress" && typeof p.progress === "number") {
        setLoadingPct(Math.round(p.progress));
      } else if (p.status === "ready" || p.status === "done") {
        setLoadingPct(null);
      }
    });
    setPlaying(false);
    setLoadingPct(null);
  }

  const dimension = size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={playing}
      aria-label={
        loadingPct !== null
          ? `Chargement de la voix, ${loadingPct}%`
          : `Écouter "${text}"`
      }
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent transition-colors active:bg-accent/30 disabled:opacity-60 ${dimension}`}
    >
      {loadingPct !== null ? (
        <span className="text-[0.65em]">{loadingPct}%</span>
      ) : playing ? (
        <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
      ) : (
        "🔊"
      )}
    </button>
  );
}
