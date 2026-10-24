"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { SpeakButton } from "@/components/SpeakButton";
import {
  deleteSnapFromHistory,
  getSnapsServerSnapshot,
  getSnapsSnapshot,
  subscribeProgress,
} from "@/lib/storage";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Carnet() {
  const snaps = useSyncExternalStore(
    subscribeProgress,
    getSnapsSnapshot,
    getSnapsServerSnapshot
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = snaps.find((s) => s.id === selectedId) ?? null;

  function handleDelete(id: string) {
    deleteSnapFromHistory(id);
    setSelectedId(null);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <header className="mb-8 flex w-full max-w-sm items-center gap-3">
        <Link
          href="/"
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Mon <span className="text-accent">carnet</span>
        </h1>
      </header>

      <main className="w-full max-w-sm flex-1">
        {snaps.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-8 text-center">
            <p className="text-muted">
              Ton carnet est vide pour l&apos;instant.
            </p>
            <Link href="/" className="text-sm font-medium text-accent">
              Prendre ta première photo →
            </Link>
          </div>
        )}

        {!selected && snaps.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {snaps.map((snap) => (
              <button
                key={snap.id}
                type="button"
                onClick={() => setSelectedId(snap.id)}
                className="flex flex-col overflow-hidden rounded-2xl bg-surface text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={snap.imageDataUrl}
                  alt={snap.objectEn}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-3">
                  <p className="font-semibold text-accent">{snap.objectEn}</p>
                  <p className="text-xs text-muted">
                    {formatDate(snap.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="flex w-full flex-col gap-5">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="self-start text-sm text-muted"
            >
              ← Retour à la liste
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.imageDataUrl}
              alt={selected.objectEn}
              className="aspect-square w-full rounded-3xl object-cover"
            />

            <div className="flex items-center gap-4 rounded-2xl bg-surface p-5">
              <div className="flex-1">
                <p className="text-sm text-muted">{selected.objectFr}</p>
                <h2 className="text-3xl font-bold text-accent">
                  {selected.objectEn}
                </h2>
                <p className="mt-1 font-mono text-sm text-muted">
                  {selected.ipa}
                </p>
              </div>
              <SpeakButton text={selected.objectEn} />
            </div>

            <div className="flex flex-col gap-3">
              {selected.sentences.map((s, i) => (
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

            <button
              type="button"
              onClick={() => handleDelete(selected.id)}
              className="mt-2 flex h-12 items-center justify-center rounded-full border border-red-500/40 text-red-400 transition-colors active:bg-red-500/10"
            >
              Supprimer ce snap
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
