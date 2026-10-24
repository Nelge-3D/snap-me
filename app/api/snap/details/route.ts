import { generateDetails } from "@/lib/gemma";
import type { Level } from "@/lib/types";

// Appel 2 (texte seul, pas d'image) : tâche plus simple pour le modèle, donc
// nettement plus rapide que l'appel vision. 300s par prudence.
export const maxDuration = 300;

const VALID_LEVELS: Level[] = ["present", "past", "future"];

export async function POST(request: Request) {
  let body: { objectEn?: string; objectFr?: string; level?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { objectEn, objectFr } = body;
  const level: Level = VALID_LEVELS.includes(body.level as Level)
    ? (body.level as Level)
    : "present";

  if (!objectEn) {
    return Response.json({ error: "objectEn is required" }, { status: 400 });
  }

  try {
    const result = await generateDetails(objectEn, objectFr ?? "", level);
    return Response.json(result);
  } catch (err) {
    console.error("Gemma call failed (details):", err);
    return Response.json(
      { error: "Could not generate sentences. Please try again." },
      { status: 502 }
    );
  }
}
