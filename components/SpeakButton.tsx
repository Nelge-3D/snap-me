"use client";

import { useState } from "react";
import { speak, type SpeakEvent } from "@/lib/speak";

type State = { phase: "idle" | SpeakEvent["phase"]; progress?: number };

const LABELS: Record<State["phase"], string> = {
  idle: "",
  loading: "Chargement de la voix",
  generating: "Préparation de la voix",
  playing: "Lecture en cours",
};

export function SpeakButton({
  text,
  size = "md",
}: {
  text: string;
  size?: "sm" | "md";
}) {
  const [state, setState] = useState<State>({ phase: "idle" });

  async function handleClick() {
    if (state.phase !== "idle") return;
    // Retour immédiat au toucher : on sait tout de suite que ça travaille.
    setState({ phase: "generating" });
    await speak(text, (event) =>
      setState({ phase: event.phase, progress: event.progress })
    );
    setState({ phase: "idle" });
  }

  const busy = state.phase === "loading" || state.phase === "generating";
  const dimension = size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg";
  const spinner = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state.phase !== "idle"}
      aria-busy={busy}
      aria-label={
        state.phase === "idle"
          ? `Écouter "${text}"`
          : state.phase === "loading" && state.progress !== undefined
            ? `${LABELS.loading}, ${state.progress}%`
            : LABELS[state.phase]
      }
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent transition-colors active:bg-accent/30 disabled:opacity-80 ${dimension}`}
    >
      {state.phase === "loading" && state.progress !== undefined ? (
        <span className="text-[0.65em] font-medium">{state.progress}%</span>
      ) : busy ? (
        <span
          className={`animate-spin rounded-full border-2 border-accent/30 border-t-accent ${spinner}`}
        />
      ) : state.phase === "playing" ? (
        <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
      ) : (
        "🔊"
      )}
    </button>
  );
}
