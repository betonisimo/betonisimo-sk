import { randomUUID } from "node:crypto";
import { catalogTransaction as transactionWithRetry, suggestedCatalogSlug } from "./catalog-urls.js";
import { CITY_PAGE_KIND, CITY_URL_KIND, CITY_RESERVED_SLUGS, CityPageError, cityPageId, citySlugFromTitle, numberedCitySlug, cityUrlSection, cleanCityPage, cityPageFromRecord } from "./city-pages.js";
import { loadCityCollections } from "./city-page-catalog.js";

export function createCityPageService({ db, getSession, revalidate, now = () => new Date() }) {
  async function currentPage(tx, id) {
    const page = cityPageFromRecord(await tx.strankaObsah.findUnique({ where: { id } }));
    if (!page) throw new CityPageError("Stránka neexistuje. Obnovte zoznam stránok.");
    return page;
  }

  async function chooseSlug(tx, data, previous) {
    const base = citySlugFromTitle(data.title);
    let slug = data.requestedSlug || suggestedCatalogSlug(data.title, previous, "stranka");
    let number = 2;
    while (true) {
      const record = await tx.strankaObsah.findUnique({ where: { sekcia: cityUrlSection(slug) } });
      const available = !CITY_RESERVED_SLUGS.has(slug) && (!record || (previous?.slug === slug && record.obsah?.pageId === previous.id));
      if (available) return slug;
      if (data.requestedSlug) throw new CityPageError("Táto URL sa už používa alebo bola použitá v minulosti. Vyberte inú adresu.");
      slug = numberedCitySlug(base, number++);
    }
  }

  async function rememberUrl(tx, slug, pageId) {
    const sekcia = cityUrlSection(slug);
    const previous = await tx.strankaObsah.findUnique({ where: { sekcia } });
    if (previous) {
      if (previous.obsah?.pageId !== pageId) throw new CityPageError("Táto URL je rezervovaná pre inú stránku.");
    } else await tx.strankaObsah.create({ data: { stranka: CITY_URL_KIND, sekcia, obsah: { pageId } } });
  }

  async function persist(tx, data, previous = null) {
    const slug = await chooseSlug(tx, data, previous);
    const { requestedSlug: _requestedSlug, ...fields } = data;
    const collections = await loadCityCollections(tx, data.collectionIds ?? previous?.collectionIds);
    const timestamp = now().toISOString();
    const obsah = {
      ...fields, collectionIds: collections.map((collection) => collection.id), version: 1, slug,
      createdAt: previous?.createdAt || timestamp,
      publishedAt: previous?.publishedAt || (data.status === "PUBLISHED" ? timestamp : null),
    };
    const row = previous
      ? await tx.strankaObsah.update({ where: { id: previous.id }, data: { obsah } })
      : await tx.strankaObsah.create({ data: { stranka: CITY_PAGE_KIND, sekcia: `${CITY_PAGE_KIND}-${randomUUID()}`, obsah } });
    for (const address of new Set([previous?.slug, slug].filter(Boolean))) await rememberUrl(tx, address, row.id);
    return { id: row.id, slug };
  }

  function refresh(id) {
    revalidate("/admin/city-pages");
    revalidate(`/admin/city-pages/${id}`);
    revalidate("/[citySlug]", "page");
    revalidate("/sitemap.xml");
  }

  async function guarded(work) {
    try {
      if (!(await getSession())?.user) return { success: false, error: "Prihláste sa do administrácie." };
      const result = await work();
      refresh(result.id);
      return { success: true, ...result };
    } catch (error) {
      if (error instanceof CityPageError) return { success: false, error: error.message };
      console.error("City page operation failed:", error.code || error.name);
      return { success: false, error: "Zmeny sa nepodarilo uložiť. Skúste to znova." };
    }
  }

  return {
    save(input) {
      return guarded(async () => {
        const data = cleanCityPage(input);
        const id = input?.id == null ? null : cityPageId(input.id);
        return transactionWithRetry(db, async (tx) => persist(tx, data, id == null ? null : await currentPage(tx, id)));
      });
    },
    duplicate(value) {
      return guarded(async () => {
        const id = cityPageId(value);
        return transactionWithRetry(db, async (tx) => {
          const source = await currentPage(tx, id);
          const data = cleanCityPage({ ...source, title: `${source.title.slice(0, 152).trimEnd()} – kópia`, status: "DRAFT", urlMode: "auto" });
          return persist(tx, data);
        });
      });
    },
    remove(value) {
      return guarded(async () => {
        const id = cityPageId(value);
        return transactionWithRetry(db, async (tx) => {
          const previous = await currentPage(tx, id);
          await tx.strankaObsah.delete({ where: { id } });
          // Keep URL reservations so a historical address cannot be given to another page.
          return { id, slug: previous.slug };
        });
      });
    },
  };
}
