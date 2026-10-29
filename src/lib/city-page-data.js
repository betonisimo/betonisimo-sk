import { cache } from "react";
import { permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CITY_PAGE_KIND, CITY_RESERVED_SLUGS, cityUrlSection, cityPageFromRecord } from "./city-pages.js";
import { loadCityCollections } from "./city-page-catalog.js";
import { getSeoMany, seoSection } from "./seo.js";

export const getCityCatalogOptions = cache(() => prisma.collection.findMany({
  orderBy: { id: "asc" },
  select: { id: true, title: true, subtitle: true, slug: true, mainImage: true },
}));

export async function getCityPageCollections(ids) {
  const collections = await loadCityCollections(prisma, ids);
  const seo = await getSeoMany("collection", collections.map((collection) => collection.id));
  return collections.map((collection) => ({ ...collection, seo: seo.get(seoSection("collection", collection.id)) || {} }));
}

export async function getAdminCityPage(id) {
  return cityPageFromRecord(await prisma.strankaObsah.findUnique({ where: { id } }));
}

export async function getAdminCityPages() {
  const rows = await prisma.strankaObsah.findMany({ where: { stranka: CITY_PAGE_KIND }, orderBy: { updatedAt: "desc" } });
  return rows.map(cityPageFromRecord);
}

export const getPublishedCityPage = cache(async (slug) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160 || CITY_RESERVED_SLUGS.has(slug)) return null;
  const address = await prisma.strankaObsah.findUnique({ where: { sekcia: cityUrlSection(slug) } });
  const id = address?.obsah?.pageId;
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const page = await getAdminCityPage(id);
  if (page?.status !== "PUBLISHED") return null;
  if (page.slug !== slug) permanentRedirect(`/${page.slug}`);
  return page;
});
