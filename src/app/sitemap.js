import { prisma } from "@/lib/prisma";
import { loadSitemap } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  return loadSitemap(prisma);
}
