// Synthèse vocale en deux vitesses. La voix du navigateur démarre tout de
// suite et ne télécharge rien ; Kokoro (meilleure qualité, 100% navigateur)
// prend le relais dès que son modèle de 92 Mo est chargé. Sur téléphone en
// données mobiles, on ne le télécharge pas sans prévenir.

import {
  generateKokoroAudioUrl,
  hasKokoroAudio,
  isKokoroLoaded,
  preloadKokoro,
  type KokoroProgress,
} from "./kokoro";

export type SpeakPhase = "loading" | "generating" | "playing";
export type SpeakEvent = { phase: SpeakPhase; progress?: number };

let cachedVoices: SpeechSynthesisVoice[] = [];

function getVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  if (cachedVoices.length > 0) return Promise.resolve(cachedVoices);

  return new Promise((resolve) => {
    const finish = () => {
      cachedVoices = synth.getVoices();
      resolve(cachedVoices);
    };
    if (synth.getVoices().length > 0) {
      finish();
      return;
    }
    const onVoicesChanged = () => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      finish();
    };
    synth.addEventListener("voiceschanged", onVoicesChanged);
    // Filet de sécurité si l'évènement ne se déclenche jamais.
    setTimeout(finish, 500);
  });
}

// Les voix installées sur l'appareil démarrent plus vite que celles qui
// passent par le réseau, et l'accent britannique passe avant le reste.
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;
  const rank = (v: SpeechSynthesisVoice) =>
    (v.localService ? 0 : 2) + (v.lang.toLowerCase().startsWith("en-gb") ? 0 : 1);
  return [...pool].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}

function hasBrowserTts(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

/** Résout toujours, même en cas d'échec ou d'absence de support. */
async function speakWithBrowserTts(text: string): Promise<void> {
  if (!hasBrowserTts()) return;

  const synth = window.speechSynthesis;
  const voice = pickVoice(await getVoices(synth));

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-GB";
    }
    utterance.rate = 0.9;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    synth.cancel();
    synth.speak(utterance);
  });
}

// L'URL est mise en cache par texte (voir kokoro.ts) pour que les clics
// suivants sur le même mot soient instantanés : on ne la révoque donc jamais.
function playBlobUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    audio.play().catch(reject);
  });
}

type NetworkInformationLike = { saveData?: boolean; type?: string };

// Télécharger 92 Mo sans prévenir coûte cher en données mobiles. On le fait
// seulement en Wi-Fi ou câble, ou sur un ordinateur quand le type de réseau
// est inconnu. Mode économie de données activé : jamais.
function canPreloadModel(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & {
    connection?: NetworkInformationLike;
  }).connection;
  if (connection?.saveData) return false;
  if (connection?.type) {
    return connection.type === "wifi" || connection.type === "ethernet";
  }
  return window.matchMedia?.("(pointer: fine)").matches ?? false;
}

// Générer une phrase avec Kokoro peut prendre plusieurs secondes sur un
// téléphone. Au-delà de ce délai, la voix du navigateur prend le relais et
// Kokoro finit en arrière-plan : la prochaine écoute de ce texte sera instantanée.
const KOKORO_MAX_WAIT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Lit `text` à voix haute sans jamais bloquer l'interface : résout toujours.
 * - Kokoro prêt (ou audio déjà en cache) : voix Kokoro, avec un délai maximal.
 * - Sinon : voix du navigateur tout de suite, et chargement de Kokoro en
 *   arrière-plan quand la connexion s'y prête.
 * - Aucune voix de navigateur disponible : on attend Kokoro, avec progression.
 */
export async function speak(
  text: string,
  onEvent?: (event: SpeakEvent) => void
): Promise<void> {
  const browserTts = hasBrowserTts();
  const kokoroReady = isKokoroLoaded() || hasKokoroAudio(text);

  if (kokoroReady || !browserTts) {
    onEvent?.({ phase: kokoroReady ? "generating" : "loading" });
    try {
      const generation = generateKokoroAudioUrl(text, (p: KokoroProgress) => {
        if (p.status === "progress" && typeof p.progress === "number") {
          onEvent?.({ phase: "loading", progress: Math.round(p.progress) });
        }
      });
      const url = browserTts
        ? await withTimeout(generation, KOKORO_MAX_WAIT_MS)
        : await generation;
      if (url) {
        onEvent?.({ phase: "playing" });
        await playBlobUrl(url);
        return;
      }
    } catch (err) {
      console.warn("Kokoro indisponible, repli sur la voix du navigateur:", err);
    }
  } else if (canPreloadModel()) {
    preloadKokoro();
  }

  onEvent?.({ phase: "playing" });
  await speakWithBrowserTts(text);
}
