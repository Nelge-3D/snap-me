// Test manuel : un seul appel à Gemma 4 avec une vraie image, affichage de la réponse brute.
// Usage : node scripts/test-vision.mjs chemin/vers/photo.jpg [present|past|future]
import { readFileSync } from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: path.join(import.meta.dirname, "..", ".env.local") });

const imagePath = process.argv[2];
const level = process.argv[3] ?? "present";

if (!imagePath) {
  console.error("Usage: node scripts/test-vision.mjs <chemin-image> [present|past|future]");
  process.exit(1);
}

const TENSE_LABEL = {
  present: "present tense",
  past: "past tense",
  future: "future tense (using 'will')",
};

const buildPrompt = (tense) => `You are a vision-based English vocabulary tutor for absolute beginner (A1) French speakers in Gabon.

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
- Write exactly three sentences, all in the ${TENSE_LABEL[tense]}, describing realistic everyday use of the object (not abstract textbook examples).
- Write exactly two exercises, each with three options and exactly one correct answer.
- If no object is identifiable, return "objectEn": "unknown" and leave other fields as reasonable empty defaults.
- Output ONLY the JSON object. No markdown, no commentary.`;

function extractJson(raw) {
  const withoutFences = raw.replace(/```json/gi, "").replace(/```/g, "");
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return withoutFences.slice(start, end + 1);
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY manquant dans .env.local");
    process.exit(1);
  }

  const imageBytes = readFileSync(imagePath);
  const base64Image = imageBytes.toString("base64");
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : "image/jpeg";

  const ai = new GoogleGenAI({ apiKey });

  const model = "gemma-4-26b-a4b-it";
  console.log(`--- Appel à ${model} (niveau: ${level}) ---`);

  const response = await ai.models.generateContent({
    model,
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

  console.log("\n=== RÉPONSE BRUTE DU MODÈLE ===\n");
  console.log(rawText);

  console.log("\n=== APRÈS NETTOYAGE / PARSING ===\n");
  try {
    const jsonStr = extractJson(rawText);
    const parsed = JSON.parse(jsonStr);
    console.log(JSON.stringify(parsed, null, 2));
    console.log("\n✅ Parsing JSON réussi.");
  } catch (err) {
    console.error("\n❌ Échec du parsing JSON:", err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Erreur d'appel API:", err);
  process.exit(1);
});
