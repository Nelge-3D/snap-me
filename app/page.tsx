"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { compressImage } from "@/lib/compressImage";
import type { SnapResult } from "@/lib/types";
import { SpeakButton } from "@/components/SpeakButton";
import { ExerciseCard } from "@/components/ExerciseCard";
import { LevelSelector } from "@/components/LevelSelector";
import {
  DAILY_SNAP_QUOTA,
  addXp,
  canSnapToday,
  getLevelServerSnapshot,
  getLevelSnapshot,
  getRemainingSnapsServerSnapshot,
  getRemainingSnapsSnapshot,
  getXpServerSnapshot,
  getXpSnapshot,
  recordSnap,
  saveSnapToHistory,
  subscribeProgress,
} from "@/lib/storage";

type Status = "idle" | "compressing" | "thinking" | "done" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<SnapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapKey, setSnapKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const xp = useSyncExternalStore(
    subscribeProgress,
    getXpSnapshot,
    getXpServerSnapshot
  );
  const remainingSnaps = useSyncExternalStore(
    subscribeProgress,
    getRemainingSnapsSnapshot,
    getRemainingSnapsServerSnapshot
  );
  const level = useSyncExternalStore(
    subscribeProgress,
    getLevelSnapshot,
    getLevelServerSnapshot
  );

  function handleCorrectExercise() {
    addXp(10);
  }

  async function handleFile(file: File) {
    if (!canSnapToday()) {
      setError("Tu as utilisé tes 5 photos du jour. Reviens demain !");
      setStatus("error");
      return;
    }

    setError(null);
    setResult(null);
    setStatus("compressing");

    try {
      const { base64, mimeType } = await compressImage(file);
      setPreview(`data:${mimeType};base64,${base64}`);

      setStatus("thinking");
      const res = await fetch("/api/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          level,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur inconnue");
      }

      const data: SnapResult = await res.json();
      recordSnap();
      saveSnapToHistory({
        ...data,
        id: crypto.randomUUID(),
        imageDataUrl: `data:${mimeType};base64,${base64}`,
        createdAt: Date.now(),
      });
      setResult(data);
      setSnapKey((k) => k + 1);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const isBusy = status === "compressing" || status === "thinking";

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <header className="mb-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Snap <span className="text-accent">Me</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-accent">
              ⭐ {xp} XP
            </span>
            <Link
              href="/carnet"
              aria-label="Ouvrir le carnet"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm"
            >
              📖
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          Photographie un objet autour de toi, apprends son nom en anglais.
        </p>
      </header>

      <main className="flex w-full max-w-sm flex-1 flex-col items-center gap-6">
        {!result && (
          <>
            <LevelSelector current={level} xp={xp} />

            <div className="flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-surface">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Photo prise"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-6 text-center text-sm text-muted">
                  Ta photo apparaîtra ici
                </span>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            <button
              type="button"
              disabled={isBusy || remainingSnaps === 0}
              onClick={() => inputRef.current?.click()}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform active:scale-95 disabled:opacity-60"
              aria-label="Prendre une photo"
            >
              {isBusy ? (
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
              ) : (
                <span className="text-2xl">📸</span>
              )}
            </button>

            <p className="text-xs text-muted">
              {remainingSnaps > 0
                ? `${remainingSnaps}/${DAILY_SNAP_QUOTA} photos aujourd'hui`
                : "Quota du jour épuisé"}
            </p>

            <p className="h-5 text-sm text-muted">
              {status === "compressing" && "Compression de la photo..."}
              {status === "thinking" && "Gemma 4 regarde ta photo..."}
              {status === "error" && (
                <span className="text-red-400">{error}</span>
              )}
            </p>
          </>
        )}

        {result && (
          <div className="flex w-full flex-col gap-5">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={result.objectEn}
                className="aspect-square w-full rounded-3xl object-cover"
              />
            )}

            <div className="flex items-center gap-4 rounded-2xl bg-surface p-5">
              <div className="flex-1">
                <p className="text-sm text-muted">{result.objectFr}</p>
                <h2 className="text-3xl font-bold text-accent">
                  {result.objectEn}
                </h2>
                <p className="mt-1 font-mono text-sm text-muted">
                  {result.ipa}
                </p>
              </div>
              <SpeakButton text={result.objectEn} />
            </div>

            <div className="flex flex-col gap-3">
              {result.sentences.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl bg-surface p-4"
                >
                  <div className="flex-1">
                    <p className="text-base">{s.en}</p>
                    <p className="text-sm text-muted">{s.fr}</p>
                  </div>
                  <SpeakButton text={s.en} size="sm" />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {result.exercises.map((exercise, i) => (
                <ExerciseCard
                  key={`${snapKey}-${i}`}
                  exercise={exercise}
                  onCorrect={handleCorrectExercise}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-2 flex h-12 items-center justify-center rounded-full border border-accent/50 text-accent transition-colors active:bg-accent/10"
            >
              Reprendre une photo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
