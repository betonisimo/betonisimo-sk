"use server";

import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { validateImageFile } from "@/lib/image-validation";

export async function uploadImage(formData) {
  if (!await getServerSession()) return { success: false, error: "Prihláste sa do administrácie." };
  try {
    const file = formData.get("file");
    const extension = await validateImageFile(file);
    const blob = await put(`editor/${crypto.randomUUID()}.${extension}`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Image upload failed:", error.message);
    return { success: false, error: error.message || "Obrázok sa nepodarilo nahrať." };
  }
}
