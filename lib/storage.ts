// Persistance locale uniquement : pas de base de données, pas d'authentification.
import type { Level, Progress, Snap } from "./types";

const STORAGE_KEY = "snapme:progress";
export const DAILY_SNAP_QUOTA = 5;
export const MAX_STORED_SNAPS = 50; // garde-fou contre un localStorage qui déborde

const EMPTY_SNAPS: Snap[] = [];

const LEVEL_ORDER: Level[] = ["present", "past", "future"];
export const LEVEL_THRESHOLDS: Record<Level, number> = {
  present: 0,
  past: 50,
  future: 150,
};

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

// Cache mémoire : readRawProgress() renvoie la même référence d'objet tant que
// le contenu du localStorage n'a pas changé. Indispensable pour
// useSyncExternalStore, qui sinon croirait le store modifié à chaque rendu.
let cache: { raw: string | null; progress: Progress } | null = null;

function readRawProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (cache && cache.raw === raw) return cache.progress;

  let progress: Progress;
  try {
    progress = raw
      ? ({ ...defaultProgress(), ...JSON.parse(raw) } as Progress)
      : defaultProgress();
  } catch {
    progress = defaultProgress();
  }

  cache = { raw, progress };
  return progress;
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
  let raw: string | null = null;
  try {
    raw = JSON.stringify(progress);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, raw);
    }
  } catch {
    // Stockage plein ou indisponible : on continue sans bloquer l'utilisateur.
  }
  cache = { raw, progress };
  emitProgressChange();
}

export function isLevelUnlocked(level: Level, xp: number): boolean {
  return xp >= LEVEL_THRESHOLDS[level];
}

export function getUnlockedLevels(xp: number): Level[] {
  return LEVEL_ORDER.filter((l) => isLevelUnlocked(l, xp));
}

/** Ajoute de l'XP et fait progresser automatiquement le niveau courant s'il
 * vient d'être débloqué (sans jamais le rétrograder). */
export function addXp(amount: number): Progress {
  const current = getProgress();
  const xp = current.xp + amount;
  const unlocked = getUnlockedLevels(xp);
  const bestUnlocked = unlocked[unlocked.length - 1] ?? "present";
  const level =
    LEVEL_ORDER.indexOf(bestUnlocked) > LEVEL_ORDER.indexOf(current.level)
      ? bestUnlocked
      : current.level;
  const updated = { ...current, xp, level };
  saveProgress(updated);
  return updated;
}

/** Change le niveau de pratique courant ; ignoré si ce niveau n'est pas encore débloqué. */
export function setLevel(level: Level): Progress {
  const current = getProgress();
  if (!isLevelUnlocked(level, current.xp)) return current;
  const updated = { ...current, level };
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

/** Ajoute un snap en tête du carnet, en limitant le nombre d'entrées conservées. */
export function saveSnapToHistory(snap: Snap): Progress {
  const current = getProgress();
  const snaps = [snap, ...current.snaps].slice(0, MAX_STORED_SNAPS);
  const updated = { ...current, snaps };
  saveProgress(updated);
  return updated;
}

export function deleteSnapFromHistory(id: string): Progress {
  const current = getProgress();
  const updated = {
    ...current,
    snaps: current.snaps.filter((s) => s.id !== id),
  };
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

export function getSnapsSnapshot(): Snap[] {
  return getProgress().snaps;
}

export function getSnapsServerSnapshot(): Snap[] {
  return EMPTY_SNAPS;
}

export function getLevelSnapshot(): Level {
  return getProgress().level;
}

export function getLevelServerSnapshot(): Level {
  return "present";
}
