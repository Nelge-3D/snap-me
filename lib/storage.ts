// Persistance locale uniquement : pas de base de données, pas d'authentification.
import type { Progress } from "./types";

const STORAGE_KEY = "snapme:progress";

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

export function getProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) } as Progress;
  } catch {
    return defaultProgress();
  }
}

function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Stockage plein ou indisponible : on continue sans bloquer l'utilisateur.
  }
  emitXpChange();
}

export function addXp(amount: number): Progress {
  const updated = { ...getProgress() };
  updated.xp += amount;
  saveProgress(updated);
  return updated;
}

// Synchronisation avec React via useSyncExternalStore (le xp peut être modifié
// par n'importe quel composant, sans passer par un effet qui déclencherait un setState).
const xpListeners = new Set<() => void>();

function emitXpChange(): void {
  for (const listener of xpListeners) listener();
}

export function subscribeXp(listener: () => void): () => void {
  xpListeners.add(listener);
  return () => xpListeners.delete(listener);
}

export function getXpSnapshot(): number {
  return getProgress().xp;
}

export function getXpServerSnapshot(): number {
  return 0;
}
