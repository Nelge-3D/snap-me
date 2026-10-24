import { identifyObject } from "@/lib/gemma";
import type { Level } from "@/lib/types";

// Un appel vision à Gemma 4 dépasse régulièrement les 10s par défaut du plan Hobby.
export const maxDuration = 60;

const VALID_LEVELS: Level[] = ["present", "past", "future"];

export async function POST(request: Request) {
  let body: { imageBase64?: string; mimeType?: string; level?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;
  const level: Level = VALID_LEVELS.includes(body.level as Level)
    ? (body.level as Level)
    : "present";

  if (!imageBase64 || !mimeType) {
    return Response.json(
      { error: "imageBase64 and mimeType are required" },
      { status: 400 }
    );
  }

  try {
    const result = await identifyObject(imageBase64, mimeType, level);

    if (result.objectEn === "unknown" || result.sentences.length === 0) {
      return Response.json(
        {
          error:
            "Aucun objet reconnu. Réessaie avec un seul objet bien visible.",
        },
        { status: 422 }
      );
    }

    return Response.json(result);
  } catch (err) {
    console.error("Gemma call failed:", err);
    return Response.json(
      { error: "Could not identify the object. Please try again." },
      { status: 502 }
    );
  }
}
