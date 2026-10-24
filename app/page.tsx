"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { compressImage } from "@/lib/compressImage";
import type { DetailsResult, IdentifyResult } from "@/lib/types";
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

type Status =
  | "idle"
  | "compressing"
  | "identifying"
  | "detailing"
  | "done"
  | "error";

// Gemma 4 peut mettre plusieurs secondes à répondre : on fait tourner des
// messages plutôt que de laisser un texte figé, pour que l'attente se sente
// vivante même quand elle est réellement longue.
const THINKING_MESSAGES = [
  "Gemma 4 regarde ta photo...",
  "Elle identifie l'objet...",
  "La patience, un pas de plus vers l'anglais...",
  "Presque prêt...",
];

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [identified, setIdentified] = useState<IdentifyResult | null>(null);
  const [details, setDetails] = useState<DetailsResult | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapKey, setSnapKey] = useState(0);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);
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

  useEffect(() => {
    if (status !== "identifying") return;
    const interval = setInterval(() => {
      setThinkingMessageIndex((i) =>
        Math.min(i + 1, THINKING_MESSAGES.length - 1)
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [status]);

  async function fetchDetails(
    idData: IdentifyResult,
    thumbnailDataUrl: string
  ) {
    setDetailsError(null);
    setStatus("detailing");
    try {
      const res = await fetch("/api/snap/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectEn: idData.objectEn,
          objectFr: idData.objectFr,
          level,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur inconnue");
      }

      const detData: DetailsResult = await res.json();
      setDetails(detData);
      setStatus("done");

      saveSnapToHistory({
        ...idData,
        ...detData,
        level,
        id: crypto.randomUUID(),
        imageDataUrl: thumbnailDataUrl,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error(err);
      // Le mot est déjà affiché : un échec ici ne doit pas tout effacer.
      setDetailsError(
        err instanceof Error ? err.message : "Erreur inconnue"
      );
      setStatus("done");
    }
  }

  async function handleFile(file: File) {
    if (!canSnapToday()) {
      setError("Tu as utilisé tes 5 photos du jour. Reviens demain !");
      setStatus("error");
      return;
    }

    setError(null);
    setDetailsError(null);
    setIdentified(null);
    setDetails(null);
    setThinkingMessageIndex(0);
    setStatus("compressing");

    try {
      const { apiImage, thumbnail } = await compressImage(file);
      const thumbnailDataUrl = `data:${thumbnail.mimeType};base64,${thumbnail.base64}`;
      setPreview(thumbnailDataUrl);

      setStatus("identifying");
      const res = await fetch("/api/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: apiImage.base64,
          mimeType: apiImage.mimeType,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur inconnue");
      }

      const idData: IdentifyResult = await res.json();
      recordSnap();
      setIdentified(idData);
      setSnapKey((k) => k + 1);

      await fetchDetails(idData, thumbnailDataUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setPreview(null);
    setIdentified(null);
    setDetails(null);
    setDetailsError(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const isBusy = status === "compressing" || status === "identifying";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center px-4 py-10 sm:py-16">
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

      <main
        className={`flex w-full max-w-sm flex-1 flex-col items-center gap-6 ${
          !identified ? "justify-center" : ""
        }`}
      >
        {!identified && (
          <>
            <LevelSelector current={level} xp={xp} />

            {preview && (
              <div className="aspect-square w-full max-w-xs overflow-hidden rounded-3xl border border-white/10 bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Photo prise"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

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

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={isBusy || remainingSnaps === 0}
                onClick={() => inputRef.current?.click()}
                className="flex h-32 w-32 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xl shadow-accent/30 transition-transform active:scale-95 disabled:opacity-60"
                aria-label="Prendre une photo"
              >
                {isBusy ? (
                  <span className="h-10 w-10 animate-spin rounded-full border-4 border-accent-foreground/40 border-t-accent-foreground" />
                ) : (
                  <span className="text-5xl">📸</span>
                )}
              </button>
              {!isBusy && (
                <p className="text-base font-medium">Prendre une photo</p>
              )}
            </div>

            <p className="text-xs text-muted">
              {remainingSnaps > 0
                ? `${remainingSnaps}/${DAILY_SNAP_QUOTA} photos aujourd'hui`
                : "Quota du jour épuisé"}
            </p>

            <p className="h-5 text-sm text-muted">
              {status === "compressing" && "Compression de la photo..."}
              {status === "identifying" &&
                THINKING_MESSAGES[thinkingMessageIndex]}
              {status === "error" && (
                <span className="text-red-400">{error}</span>
              )}
            </p>
          </>
        )}

        {identified && (
          <div className="flex w-full flex-col gap-5">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={identified.objectEn}
                className="aspect-square w-full rounded-3xl object-cover"
              />
            )}

            <div className="flex items-center gap-4 rounded-2xl bg-surface p-5">
              <div className="flex-1">
                <p className="text-sm text-muted">{identified.objectFr}</p>
                <h2 className="text-3xl font-bold text-accent">
                  {identified.objectEn}
                </h2>
                <p className="mt-1 text-sm text-muted">{identified.ipa}</p>
              </div>
              <SpeakButton text={identified.objectEn} />
            </div>

            {status === "detailing" && (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-2xl bg-surface"
                  />
                ))}
              </div>
            )}

            {detailsError && (
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-4 text-center">
                <p className="text-sm text-red-400">{detailsError}</p>
                <button
                  type="button"
                  onClick={() => preview && fetchDetails(identified, preview)}
                  className="text-sm font-medium text-accent"
                >
                  Réessayer
                </button>
              </div>
            )}

            {details && (
              <>
                <div className="flex flex-col gap-3">
                  {details.sentences.map((s, i) => (
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
                  {details.exercises.map((exercise, i) => (
                    <ExerciseCard
                      key={`${snapKey}-${i}`}
                      exercise={exercise}
                      onCorrect={handleCorrectExercise}
                    />
                  ))}
                </div>
              </>
            )}

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
