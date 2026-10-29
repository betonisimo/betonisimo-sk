import { parseCityCollectionIds } from "./city-pages.js";

// Resolve IDs against the current catalog. Never store copies of product names,
// photographs or URLs in a city page, and silently omit products since deleted.
export async function loadCityCollections(db, value) {
  const ids = parseCityCollectionIds(value);
  if (!ids.length) return [];
  const rows = await db.collection.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, subtitle: true, slug: true, mainImage: true },
  });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}
