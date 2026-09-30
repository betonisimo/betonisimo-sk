"use client";
import imageCompression from "browser-image-compression";
import { uploadImage } from "@/actions/uploadActions";

export async function uploadEditorImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file?.type)) throw new Error("Vyberte JPG, PNG alebo WebP.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Zdrojová fotografia môže mať najviac 20 MB.");
  const compressed = await imageCompression(file, { maxSizeMB: 0.9, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp" });
  const payload = new FormData();
  payload.append("file", compressed, "photograph.webp");
  let result;
  try { result = await uploadImage(payload); }
  catch { throw new Error("Fotografiu sa nepodarilo odoslať. Skontrolujte pripojenie a skúste znova."); }
  if (!result.success || !result.url) throw new Error(result.error || "Nahrávanie zlyhalo.");
  return result.url;
}
