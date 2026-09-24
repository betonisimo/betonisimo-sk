"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { seoSection, seoText } from "@/lib/seo";
import { revalidatePath } from "next/cache";

const PAGE_PATHS = {
  home: "/",
  katalog: "/katalog",
  doplnky: "/doplnky",
  realizacie: "/realizacie",
  kontakt: "/kontakt",
  blog: "/blog",
};

export async function savePageSeo(key, input) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const path = PAGE_PATHS[key];
  if (!path) return { success: false, error: "Neznáma stránka." };

  try {
    const sekcia = seoSection("page", key);
    const obsah = {
      title: seoText(input?.title, 100),
      description: seoText(input?.description, 320),
    };
    await prisma.strankaObsah.upsert({
      where: { sekcia },
      update: { obsah },
      create: { stranka: "seo", sekcia, obsah },
    });
    revalidatePath(path);
    revalidatePath("/admin/editor");
    return { success: true };
  } catch {
    return { success: false, error: "SEO nastavenia sa nepodarilo uložiť." };
  }
}
