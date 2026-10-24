import { GoogleGenAI } from "@google/genai";
import type { GenerateContentParameters } from "@google/genai";
import type { DetailsResult, Exercise, IdentifyResult, Level } from "./types";

const MODEL = "gemma-4-26b-a4b-it";

const TENSE_LABEL: Record<Level, string> = {
  present: "present tense",
  past: "past tense",
  future: "future tense (using 'will')",
};

// Appel 1 : identification seule, image + quelques dizaines de tokens de
// sortie. Rapide, pour afficher le mot à l'utilisateur sans attendre le reste.
function buildIdentifyPrompt(): string {
  return `You are a vision-based English vocabulary tutor for absolute beginner (A1) French speakers in Gabon.

Look at the photo and identify exactly ONE main object, the most evident one in the image.

Rules:
- Prefer a tangible, physical, nameable object (something a learner could
  point to and hold) over a person, body part, or face, even if a person is
  also visible. Only identify a person if no other object is present.
- Use absolute beginner (A1) vocabulary.
- If no object is identifiable, return "objectEn": "unknown" and leave other fields empty.

Respond with ONLY valid JSON, no markdown code fences, no text before or after, matching exactly this schema:

{ "objectEn": "string", "objectFr": "string", "ipa": "string" }

Output ONLY the JSON object. No markdown, no commentary.`;
}

// Appel 2 : texte seul (pas d'image), déclenché juste après avec le mot déjà
// identifié. Tâche plus simple pour le modèle, donc nettement plus rapide.
function buildDetailsPrompt(
  objectEn: string,
  objectFr: string,
  level: Level
): string {
  return `You are an English vocabulary tutor for absolute beginner (A1) French speakers in Gabon.

The student just learned the English word "${objectEn}" (French: "${objectFr}").

Respond with ONLY valid JSON, no markdown code fences, no text before or after, matching exactly this schema:

{
  "sentences": [ { "en": "string", "fr": "string" } ],
  "exercises": [ { "prompt": "string with ____", "answer": "string", "options": ["string"] } ]
}

Rules:
- Write exactly three sentences, all in the ${TENSE_LABEL[level]}, describing realistic everyday use of "${objectEn}" (not abstract textbook examples).
- Write exactly two fill-in-the-blank exercises built around "${objectEn}", each with three options and exactly one correct answer.
- Use absolute beginner (A1) vocabulary.
- Output ONLY the JSON object. No markdown, no commentary.`;
}

/**
 * Gemma est un petit modèle sans sortie structurée garantie : JSON.parse ne
 * dit rien sur la forme du JSON. On ne fait confiance à rien de ce qu'il
 * renvoie sans l'avoir vérifié champ par champ.
 */
function sanitizeIdentify(parsed: unknown): IdentifyResult {
  const p = (parsed ?? {}) as Record<string, unknown>;
  const str = (v: unknown, fallback = "") =>
    typeof v === "string" ? v : fallback;

  return {
    objectEn: str(p.objectEn, "unknown"),
    objectFr: str(p.objectFr),
    ipa: str(p.ipa),
  };
}

function sanitizeDetails(parsed: unknown): DetailsResult {
  const p = (parsed ?? {}) as Record<string, unknown>;
  const str = (v: unknown, fallback = "") =>
    typeof v === "string" ? v : fallback;

  const sentences = Array.isArray(p.sentences)
    ? p.sentences
        .filter(
          (s): s is Record<string, unknown> => !!s && typeof s === "object"
        )
        .map((s) => ({ en: str(s.en), fr: str(s.fr) }))
        .filter((s) => s.en.length > 0)
    : [];

  const exercises: Exercise[] = Array.isArray(p.exercises)
    ? p.exercises
        .filter(
          (e): e is Record<string, unknown> => !!e && typeof e === "object"
        )
        .map((e) => ({
          prompt: str(e.prompt),
          answer: str(e.answer),
          options: Array.isArray(e.options)
            ? e.options.map((o) => str(o)).filter(Boolean)
            : [],
        }))
        .filter((e) => e.prompt && e.answer && e.options.includes(e.answer))
    : [];

  return { sentences, exercises };
}

function extractJson(raw: string): string {
  const withoutFences = raw.replace(/```json/gi, "").replace(/```/g, "");
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return withoutFences.slice(start, end + 1);
}

/** true pour une erreur serveur transitoire (5xx) ou de forme inconnue (réseau). */
function isRetryable(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  const match = message.match(/"code"\s*:\s*(\d+)/);
  if (!match) return true;
  return Number(match[1]) >= 500;
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

async function generateWithRetry(request: GenerateContentParameters) {
  const ai = getClient();
  // Une erreur serveur transitoire (observée en test : 500 "Internal error")
  // ne doit pas coûter toute la demande à l'utilisateur : on retente une fois.
  try {
    return await ai.models.generateContent(request);
  } catch (err) {
    if (!isRetryable(err)) throw err;
    console.warn("Appel Gemma échoué, nouvelle tentative :", err);
    return await ai.models.generateContent(request);
  }
}

/** base64Image: no "data:image/...;base64," prefix */
export async function identifyObject(
  base64Image: string,
  mimeType: string
): Promise<IdentifyResult> {
  const start = Date.now();
  const response = await generateWithRetry({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: buildIdentifyPrompt() },
        ],
      },
    ],
  });
  console.log(`[gemma] identify: ${Date.now() - start}ms`);

  const jsonStr = extractJson(response.text ?? "");
  return sanitizeIdentify(JSON.parse(jsonStr));
}

export async function generateDetails(
  objectEn: string,
  objectFr: string,
  level: Level
): Promise<DetailsResult> {
  const start = Date.now();
  const response = await generateWithRetry({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: buildDetailsPrompt(objectEn, objectFr, level) }],
      },
    ],
  });
  console.log(`[gemma] details: ${Date.now() - start}ms`);

  const jsonStr = extractJson(response.text ?? "");
  return sanitizeDetails(JSON.parse(jsonStr));
}
