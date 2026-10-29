export const CATALOG_PATHS = { collection: "/katalog", accessory: "/doplnky" };
export const URL_TAKEN = "URL adresu sa nepodarilo automaticky vytvoriť. Skúste uloženie znova.";

export function slugFromTitle(title) {
  return String(title || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function slugCandidate(base, number = 1) {
  const suffix = number === 1 ? "" : `-${number}`;
  return base.slice(0, 160 - suffix.length).replace(/-+$/g, "") + suffix;
}

export function suggestedCatalogSlug(title, current, fallback = "") {
  const base = slugFromTitle(title) || fallback;
  const candidate = slugCandidate(base);
  if (current?.slug === candidate) return candidate;
  // Keep a previously assigned numeric suffix while the normalized title stays
  // the same, even if a lower-numbered address later becomes available.
  if (current?.slug && (slugFromTitle(current.title) || fallback) === base) {
    const number = Number(current.slug.match(/-(\d+)$/)?.[1]);
    if (Number.isSafeInteger(number) && number >= 2 && slugCandidate(base, number) === current.slug) return current.slug;
  }
  return candidate;
}

export function catalogUrlSection(kind, slug) {
  if (!Object.hasOwn(CATALOG_PATHS, kind)) throw new Error("Neplatný typ záznamu.");
  return `catalog-url-${kind}-${slug}`;
}

async function urlIsTaken(tx, kind, slug) {
  const [item, alias] = await Promise.all([
    tx[kind].findUnique({ where: { slug }, select: { id: true } }),
    tx.strankaObsah.findUnique({ where: { sekcia: catalogUrlSection(kind, slug) }, select: { id: true } }),
  ]);
  return Boolean(item || alias);
}

// Run inside the same serializable transaction as the item and its SEO settings.
export async function prepareCatalogUrl(tx, kind, { id, title }) {
  const current = id == null ? null : await tx[kind].findUnique({ where: { id }, select: { slug: true, title: true } });
  if (id != null && !current) throw new Error("Záznam neexistuje. Obnovte stránku.");
  const base = slugFromTitle(title) || kind;
  let slug = suggestedCatalogSlug(title, current, kind);
  let suffix = 2;
  while (slug !== current?.slug && await urlIsTaken(tx, kind, slug)) {
    slug = slugCandidate(base, suffix++);
  }
  return { slug, previousSlug: current?.slug };
}

// Reserve current and past addresses, including after deletion. Never give an old
// permanently redirected address to a different item or reuse it as a canonical.
export async function rememberCatalogUrls(tx, kind, id, slugs) {
  for (const slug of new Set(slugs.filter(Boolean))) {
    const sekcia = catalogUrlSection(kind, slug);
    const existing = await tx.strankaObsah.findUnique({ where: { sekcia }, select: { obsah: true } });
    if (existing) {
      if (existing.obsah?.itemId !== id) throw new Error(URL_TAKEN);
    } else {
      await tx.strankaObsah.create({ data: { stranka: `catalog-urls-${kind}`, sekcia, obsah: { itemId: id } } });
    }
  }
}

export async function findCatalogItemBySlug(db, kind, slug) {
  const item = await db[kind].findUnique({ where: { slug } });
  if (item) return item;
  const alias = await db.strankaObsah.findUnique({ where: { sekcia: catalogUrlSection(kind, slug) }, select: { obsah: true } });
  const id = alias?.obsah?.itemId;
  return Number.isSafeInteger(id) && id > 0 ? db[kind].findUnique({ where: { id } }) : null;
}

export async function catalogTransaction(db, action) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(action, { isolationLevel: "Serializable" });
    } catch (error) {
      if (!["P2034", "P2002"].includes(error.code) || attempt >= 2) throw error;
    }
  }
}
