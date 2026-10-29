import { normalizeContent, safeImage, validatePublishedContent } from "./rich-content.js";
import { slugFromTitle } from "./catalog-urls.js";

export const CITY_PAGE_KIND = "seo-city-page";
export const CITY_URL_KIND = "seo-city-url";
export const CITY_RESERVED_SLUGS = new Set(["admin", "api", "auth", "blog", "cookies", "doplnky", "gdpr", "katalog", "kontakt", "projekt", "realizacie", "robots", "sitemap", "uploads"]);

export class CityPageError extends Error {}

export function parseCityCollectionIds(value) {
  if (value == null) return [];
  let ids = value;
  if (typeof value === "string") {
    try { ids = JSON.parse(value); } catch { throw new CityPageError("Neplatný výber vzorov z katalógu."); }
  }
  if (!Array.isArray(ids) || ids.length > 100 || ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    throw new CityPageError("Vyberte najviac 100 platných vzorov z katalógu.");
  }
  return [...new Set(ids)];
}

export function cityPageId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new CityPageError("Neplatné ID stránky.");
  return id;
}

export function citySlugFromTitle(title) {
  return slugFromTitle(title).slice(0, 160).replace(/-+$/g, "") || "stranka";
}

export function numberedCitySlug(base, number) {
  const suffix = number === 1 ? "" : `-${number}`;
  return base.slice(0, 160 - suffix.length).replace(/-+$/g, "") + suffix;
}

export function parseCitySlug(value) {
  if (typeof value !== "string" || /[\\/.:?#%]/.test(value)) throw new CityPageError("Zadajte iba poslednú časť URL, bez domény, lomiek a parametrov.");
  const slug = value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!slug || slug.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new CityPageError("URL môže obsahovať najviac 160 znakov: písmená, číslice a spojovníky.");
  if (CITY_RESERVED_SLUGS.has(slug)) throw new CityPageError("Táto URL je vyhradená inej časti webu. Vyberte inú adresu.");
  return slug;
}

export function cityUrlSection(slug) {
  return `${CITY_URL_KIND}-${slug}`;
}

function field(value, max, label) {
  if (value == null) return "";
  if (typeof value !== "string" || value.trim().length > max) throw new CityPageError(`${label}: skontrolujte text (najviac ${max} znakov).`);
  return value.trim();
}

export function cleanCityPage(input) {
  const data = {
    title: field(input?.title, 160, "Názov"),
    excerpt: field(input?.excerpt, 320, "Úvod"),
    coverImage: safeImage(input?.coverImage),
    coverAlt: field(input?.coverAlt, 180, "Alt fotografie"),
    seoTitle: field(input?.seoTitle, 100, "Meta title"),
    seoDescription: field(input?.seoDescription, 320, "Meta description"),
    status: input?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    urlMode: input?.urlMode === "manual" ? "manual" : "auto",
  };
  if (!data.title) throw new CityPageError("Zadajte názov stránky.");
  if (input && Object.hasOwn(input, "collectionIds")) data.collectionIds = parseCityCollectionIds(input.collectionIds);
  if (input?.coverImage && !data.coverImage) throw new CityPageError("Neplatná adresa hlavnej fotografie.");
  try {
    data.blocks = normalizeContent(input?.blocks, { strict: true });
    if (data.status === "PUBLISHED") {
      if (data.coverImage && !data.coverAlt) throw new Error("Doplňte alternatívny popis hlavnej fotografie (alt).");
      validatePublishedContent(data.blocks);
    }
  } catch (error) { throw new CityPageError(error.message); }
  return { ...data, requestedSlug: data.urlMode === "manual" ? parseCitySlug(input?.slug) : null };
}

export function cityPageFromRecord(row) {
  if (!row || row.stranka !== CITY_PAGE_KIND) return null;
  const data = row.obsah;
  if (data?.version !== 1 || typeof data.title !== "string" || typeof data.slug !== "string") throw new Error("Invalid stored city page.");
  return { ...data, collectionIds: parseCityCollectionIds(data.collectionIds), id: row.id, updatedAt: row.updatedAt };
}

export async function loadPublishedCityPages(db) {
  const rows = await db.strankaObsah.findMany({
    where: { stranka: CITY_PAGE_KIND, obsah: { path: ["status"], equals: "PUBLISHED" } },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(cityPageFromRecord);
}
