import { identifyObject } from "@/lib/gemma";
import type { Level } from "@/lib/types";

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
    return Response.json(result);
  } catch (err) {
    console.error("Gemma call failed:", err);
    return Response.json(
      { error: "Could not identify the object. Please try again." },
      { status: 502 }
    );
  }
}
