type CompressedImage = { base64: string; mimeType: string };

async function resize(bitmap: ImageBitmap, maxSide: number): Promise<CompressedImage> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
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

/**
 * Produit deux versions de la photo à partir d'un seul décodage :
 * - `apiImage` (512px) : envoyée à Gemma 4, pour un upload plus léger sur un
 *   réseau lent et moins de tokens image à prétraiter côté modèle.
 * - `thumbnail` (768px) : affichée à l'écran et sauvegardée dans le carnet,
 *   où la qualité visuelle compte davantage que la vitesse réseau.
 */
export async function compressImage(file: File): Promise<{
  apiImage: CompressedImage;
  thumbnail: CompressedImage;
}> {
  const bitmap = await createImageBitmap(file);
  const [apiImage, thumbnail] = await Promise.all([
    resize(bitmap, 512),
    resize(bitmap, 768),
  ]);
  return { apiImage, thumbnail };
}
