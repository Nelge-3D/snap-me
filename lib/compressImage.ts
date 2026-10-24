/** Resizes to max 768px on the longest side and re-encodes as JPEG q0.7, client-side. */
export async function compressImage(
  file: File
): Promise<{ base64: string; mimeType: string }> {
  const bitmap = await createImageBitmap(file);

  const MAX_SIDE = 768;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const mimeType = "image/jpeg";
  const dataUrl = canvas.toDataURL(mimeType, 0.7);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);

  return { base64, mimeType };
}
