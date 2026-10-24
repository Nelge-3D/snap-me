// Synthèse vocale. Tente Kokoro (qualité, 100% navigateur), retombe sur
// window.speechSynthesis en cas d'échec ou de navigateur non supporté
// (ex: WebGPU indisponible sur Firefox). Ne bloque jamais l'interface.

import { generateKokoroAudioUrl, type KokoroProgress } from "./kokoro";

function getVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const onVoicesChanged = () => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", onVoicesChanged);
    // Filet de sécurité si l'évènement ne se déclenche jamais.
    setTimeout(() => resolve(synth.getVoices()), 500);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const byLangPrefix = (prefix: string) =>
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  return byLangPrefix("en-gb") ?? byLangPrefix("en") ?? voices[0] ?? null;
}

/** Repli : résout toujours, même en cas d'échec ou d'absence de support. */
async function speakWithBrowserTts(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const synth = window.speechSynthesis;
  const voices = await getVoices(synth);
  const voice = pickVoice(voices);

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
// suivants sur le même mot soient instantanés : on ne la révoque donc jamais
// ici, contrairement à un usage à usage unique.
function playBlobUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    audio.play().catch(reject);
  });
}

/**
 * Lit `text` à voix haute. Tente Kokoro en priorité (meilleure qualité,
 * 100% navigateur), et retombe silencieusement sur window.speechSynthesis
 * en cas d'échec. Ne bloque jamais l'interface : résout toujours.
 */
export async function speak(
  text: string,
  onKokoroProgress?: (p: KokoroProgress) => void
): Promise<void> {
  try {
    const url = await generateKokoroAudioUrl(text, onKokoroProgress);
    await playBlobUrl(url);
  } catch (err) {
    console.warn("Kokoro indisponible, repli sur la voix du navigateur:", err);
    await speakWithBrowserTts(text);
  }
}
