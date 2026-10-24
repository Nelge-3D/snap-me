// Chargement paresseux de Kokoro-82M (TTS open-weights, 100% navigateur).
// Jamais chargé au montage : seulement au premier clic sur un bouton d'écoute.

import type { KokoroTTS } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const VOICE = "bf_lily"; // accent britannique, plus proche de l'anglais enseigné localement

export type KokoroProgress = {
  status: string;
  progress?: number; // 0-100
};

let instancePromise: Promise<KokoroTTS> | null = null;

// Le modèle est mis en cache (instancePromise), mais générer l'audio d'un
// texte est lui-même coûteux (inférence neuronale) : sans ce cache, cliquer
// deux fois sur "flower" relance toute la synthèse vocale à chaque fois,
// alors que le résultat est strictement identique. On garde l'URL de blob en
// mémoire pour que le deuxième clic (et les suivants) soit instantané.
const audioCache = new Map<string, string>();

function loadKokoro(
  onProgress?: (p: KokoroProgress) => void
): Promise<KokoroTTS> {
  if (!instancePromise) {
    instancePromise = import("kokoro-js")
      .then(({ KokoroTTS }) =>
        KokoroTTS.from_pretrained(MODEL_ID, {
          dtype: "q8",
          device: "wasm",
          progress_callback: (p: { status: string; progress?: number }) => {
            onProgress?.({ status: p.status, progress: p.progress });
          },
        })
      )
      .catch((err) => {
        instancePromise = null; // permet de réessayer au prochain clic
        throw err;
      });
  }
  return instancePromise;
}

/**
 * Génère l'audio et renvoie une URL de blob à lire, en réutilisant le
 * résultat d'un appel précédent pour le même texte. Rejette si Kokoro est
 * indisponible.
 */
export async function generateKokoroAudioUrl(
  text: string,
  onProgress?: (p: KokoroProgress) => void
): Promise<string> {
  const cached = audioCache.get(text);
  if (cached) return cached;

  const tts = await loadKokoro(onProgress);
  const audio = await tts.generate(text, { voice: VOICE });
  const url = URL.createObjectURL(audio.toBlob());
  audioCache.set(text, url);
  return url;
}
