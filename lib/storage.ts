// Persistance locale uniquement : pas de base de données, pas d'authentification.
import type { Progress } from "./types";

const STORAGE_KEY = "snapme:progress";
export const DAILY_SNAP_QUOTA = 5;

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultProgress(): Progress {
  return {
    xp: 0,
    level: "present",
    snapsToday: 0,
    lastSnapDate: todayString(),
    snaps: [],
  };
}

function readRawProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) } as Progress;
  } catch {
    return defaultProgress();
  }
}

/** Lit la progression et applique la réinitialisation quotidienne du quota si besoin. */
export function getProgress(): Progress {
  const progress = readRawProgress();
  const today = todayString();
  if (progress.lastSnapDate !== today) {
    const reset = { ...progress, snapsToday: 0, lastSnapDate: today };
    saveProgress(reset);
    return reset;
  }
  return progress;
}

function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Stockage plein ou indisponible : on continue sans bloquer l'utilisateur.
  }
  emitProgressChange();
}

export function addXp(amount: number): Progress {
  const updated = { ...getProgress() };
  updated.xp += amount;
  saveProgress(updated);
  return updated;
}

export function canSnapToday(): boolean {
  return getProgress().snapsToday < DAILY_SNAP_QUOTA;
}

export function recordSnap(): Progress {
  const current = getProgress();
  const updated = { ...current, snapsToday: current.snapsToday + 1 };
  saveProgress(updated);
  return updated;
}

// Synchronisation avec React via useSyncExternalStore : la progression peut être
// modifiée par n'importe quel composant, sans passer par un effet + setState.
const progressListeners = new Set<() => void>();

function emitProgressChange(): void {
  for (const listener of progressListeners) listener();
}

export function subscribeProgress(listener: () => void): () => void {
  progressListeners.add(listener);
  return () => progressListeners.delete(listener);
}

export function getXpSnapshot(): number {
  return getProgress().xp;
}

export function getXpServerSnapshot(): number {
  return 0;
}

export function getRemainingSnapsSnapshot(): number {
  return Math.max(0, DAILY_SNAP_QUOTA - getProgress().snapsToday);
}

export function getRemainingSnapsServerSnapshot(): number {
  return DAILY_SNAP_QUOTA;
}
