import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { permanentRedirect } from "next/navigation";
import { CATALOG_PATHS, findCatalogItemBySlug } from "./catalog-urls.js";

async function catalogBySlug(kind, slug) {
  const item = await findCatalogItemBySlug(prisma, kind, slug);
  if (item && item.slug !== slug) permanentRedirect(`${CATALOG_PATHS[kind]}/${encodeURIComponent(item.slug)}`);
  return item;
}

// Deduplicate metadata/page reads within one render, without caching admin edits
// across requests or requiring a new invalidation strategy.
export const getCollectionBySlug = cache((slug) => catalogBySlug("collection", slug));
export const getAccessoryBySlug = cache((slug) => catalogBySlug("accessory", slug));
export const getProjectBySlug = cache((slug) => prisma.project.findUnique({ where: { slug } }));
