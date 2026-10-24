// Synthèse vocale. Pour l'instant : window.speechSynthesis uniquement.
// Kokoro (priorité 3) viendra se brancher devant cette fonction sans changer son contrat.

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

/** Ne bloque jamais l'interface : résout même en cas d'échec ou d'absence de support. */
export async function speak(text: string): Promise<void> {
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
