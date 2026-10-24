import { identifyObject } from "@/lib/gemma";

// Appel 1 (identification seule) : quelques dizaines de tokens de sortie,
// donc nettement plus rapide qu'une réponse complète. 300s par prudence,
// mais la mesure réelle est loggée côté serveur ([gemma] identify: ...ms).
export const maxDuration = 300;

export async function POST(request: Request) {
  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;

  if (!imageBase64 || !mimeType) {
    return Response.json(
      { error: "imageBase64 and mimeType are required" },
      { status: 400 }
    );
  }

  try {
    const result = await identifyObject(imageBase64, mimeType);

    if (result.objectEn === "unknown") {
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
    console.error("Gemma call failed (identify):", err);
    return Response.json(
      { error: "Could not identify the object. Please try again." },
      { status: 502 }
    );
  }
}
