"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveAnalyticsScripts(content) {
  try {
    await prisma.globalSettings.upsert({
      where: { key: "analytics_scripts" },
      update: { value: content },
      create: { key: "analytics_scripts", value: content },
    });
    revalidatePath("/", "layout"); // Обновляем сайт, чтобы скрипты подхватились
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}