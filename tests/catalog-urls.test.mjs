import test from "node:test";
import assert from "node:assert/strict";
import { slugFromTitle, suggestedCatalogSlug, prepareCatalogUrl, rememberCatalogUrls, findCatalogItemBySlug, catalogUrlSection, catalogTransaction } from "../src/lib/catalog-urls.js";

function fixture() {
  const records = new Map();
  const aliases = new Map();
  const db = { collection: {
    async findUnique({ where }) { return [...records.values()].find((item) => where.id != null ? item.id === where.id : item.slug === where.slug) || null; },
  }, strankaObsah: {
    async findUnique({ where }) { return aliases.get(where.sekcia) || null; },
    async create({ data }) { aliases.set(data.sekcia, data); return data; },
  } };
  db.accessory = { findUnique: async () => null };
  return { db, records, aliases };
}

test("full Slovak title produces a descriptive slug and never a path or external URL", () => {
  assert.equal(slugFromTitle("Dizajnové betónové ploty Q1 Drevo"), "dizajnove-betonove-ploty-q1-drevo");
  for (const value of ["https://example.com", "/katalog/vzor", "../vzor", "a\\b", "a?b", "a#b", "%2Fvzor", "a_b"]) {
    assert.match(slugFromTitle(value), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
  assert.equal(suggestedCatalogSlug(""), "");
});

test("existing short URLs migrate from the full title; posted manual slugs are ignored", async () => {
  const { db, records } = fixture();
  records.set(1, { id: 1, title: "Dizajnové betónové ploty Q1 Drevo", slug: "q1-drevo" });
  assert.deepEqual(await prepareCatalogUrl(db, "collection", { id: 1, title: records.get(1).title, requestedSlug: "//evil.test" }), { slug: "dizajnove-betonove-ploty-q1-drevo", previousSlug: "q1-drevo" });
  await assert.rejects(prepareCatalogUrl(db, "collection", { id: 2 }), /neexistuje/);
});

test("automatic URLs avoid active and historic addresses and retain their suffix on later saves", async () => {
  const { db, records, aliases } = fixture();
  records.set(1, { id: 1, title: "Vzor", slug: "vzor" });
  aliases.set(catalogUrlSection("collection", "vzor-2"), { obsah: { itemId: 99 } });
  assert.equal((await prepareCatalogUrl(db, "collection", { id: null, title: "Vzor" })).slug, "vzor-3");
  records.set(3, { id: 3, title: "Vzor", slug: "vzor-3" });
  records.delete(1);
  assert.equal((await prepareCatalogUrl(db, "collection", { id: 3, title: "Vzor" })).slug, "vzor-3");
  assert.equal(suggestedCatalogSlug("Vzor", records.get(3)), "vzor-3");
  assert.equal((await prepareCatalogUrl(db, "collection", { id: 3, title: "Nový vzor" })).slug, "novy-vzor");
});

test("long duplicate titles keep bounded URLs, and a model number is not confused with an assigned suffix", async () => {
  const { db, records } = fixture();
  const title = "a".repeat(160);
  records.set(1, { id: 1, title, slug: title });
  const { slug } = await prepareCatalogUrl(db, "collection", { id: null, title });
  assert.equal(slug.length, 160);
  assert.ok(slug.endsWith("-2"));
  records.set(2, { id: 2, title, slug });
  assert.equal((await prepareCatalogUrl(db, "collection", { id: 2, title })).slug, slug);
  assert.equal(suggestedCatalogSlug("Plot", { title: "Plot 2", slug: "plot-2" }), "plot");
});

test("every old address resolves by stable ID directly to the latest URL, then disappears with the item", async () => {
  const { db, records } = fixture();
  records.set(1, { id: 1, slug: "a" });
  await rememberCatalogUrls(db, "collection", 1, ["a", "b"]);
  records.set(1, { id: 1, slug: "b" });
  await rememberCatalogUrls(db, "collection", 1, ["b", "c"]);
  records.set(1, { id: 1, title: "C", slug: "c" });
  for (const slug of ["a", "b", "c"]) assert.equal((await findCatalogItemBySlug(db, "collection", slug)).slug, "c");
  assert.equal(await findCatalogItemBySlug(db, "accessory", "a"), null);
  assert.equal((await prepareCatalogUrl(db, "collection", { id: 1, title: "A" })).slug, "a-2");
  await assert.rejects(rememberCatalogUrls(db, "collection", 2, ["a"]), /nepodarilo/);
  records.delete(1);
  assert.equal(await findCatalogItemBySlug(db, "collection", "a"), null);
  assert.equal((await prepareCatalogUrl(db, "collection", { id: null, title: "C" })).slug, "c-2");
});

test("serialization conflicts retry the complete transaction, other errors do not", async () => {
  let attempts = 0;
  const db = { async $transaction(action, options) {
    assert.equal(options.isolationLevel, "Serializable");
    if (++attempts < 3) throw Object.assign(new Error("retry"), { code: attempts === 1 ? "P2034" : "P2002" });
    return action();
  } };
  assert.equal(await catalogTransaction(db, () => "saved"), "saved");
  assert.equal(attempts, 3);
  await assert.rejects(catalogTransaction({ $transaction: () => { throw new Error("offline"); } }, () => {}), /offline/);
  let failures = 0;
  await assert.rejects(catalogTransaction({ $transaction: () => { failures++; throw Object.assign(new Error("conflict"), { code: "P2034" }); } }, () => {}), /conflict/);
  assert.equal(failures, 3);
});
