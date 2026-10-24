import { GoogleGenAI } from "@google/genai";
import type { Level, SnapResult } from "./types";

const MODEL = "gemma-4-26b-a4b-it";

const TENSE_LABEL: Record<Level, string> = {
  present: "present tense",
  past: "past tense",
  future: "future tense (using 'will')",
};

function buildPrompt(level: Level): string {
  return `You are a vision-based English vocabulary tutor for absolute beginner (A1) French speakers in Gabon.

Look at the photo and identify exactly ONE main object, the most obvious one in the image.

Respond with ONLY valid JSON, no markdown code fences, no text before or after, matching exactly this schema:

{
  "objectEn": "string",
  "objectFr": "string",
  "ipa": "string",
  "sentences": [
    { "en": "string", "fr": "string" }
  ],
  "exercises": [
    { "prompt": "string with ____", "answer": "string", "options": ["string"] }
  ]
}

Rules:
- Identify exactly one main object, the most evident one in the image.
- Use absolute beginner (A1) vocabulary.
- Write exactly three sentences, all in the ${TENSE_LABEL[level]}, describing realistic everyday use of the object (not abstract textbook examples).
- Write exactly two exercises, each with three options and exactly one correct answer.
- If no object is identifiable, return "objectEn": "unknown" and leave other fields as reasonable empty defaults.
- Output ONLY the JSON object. No markdown, no commentary.`;
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

/** base64Image: no "data:image/...;base64," prefix */
export async function identifyObject(
  base64Image: string,
  mimeType: string,
  level: Level
): Promise<SnapResult> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: buildPrompt(level) },
        ],
      },
    ],
  });

  const rawText = response.text ?? "";
  const jsonStr = extractJson(rawText);
  const parsed = JSON.parse(jsonStr) as SnapResult;

  return { ...parsed, level };
}
