import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { CITY_PAGE_KIND, CITY_RESERVED_SLUGS, cleanCityPage, parseCitySlug, citySlugFromTitle, numberedCitySlug, cityPageId, cityPageFromRecord, loadPublishedCityPages, parseCityCollectionIds } from "../src/lib/city-pages.js";
import { loadCityCollections } from "../src/lib/city-page-catalog.js";
import { createCityPageService } from "../src/lib/city-page-service.js";
import { buildSitemap } from "../src/lib/sitemap.js";

const blocks = { version: 2, blocks: [{ type: "paragraph", content: "Predaj a montáž betónových plotov v Trnave." }] };

test("city catalog selection accepts only bounded unique IDs, supports older pages and explicit clearing", () => {
  assert.deepEqual(parseCityCollectionIds("[2,1,2]"), [2, 1]);
  for (const value of ["bad JSON", {}, [0], [-1], [1.5], ["2"], [true], [null], Array(101).fill(1)]) assert.throws(() => parseCityCollectionIds(value));
  assert.deepEqual(cleanCityPage({ title: "Trnava", collectionIds: "[]" }).collectionIds, []);
  assert.equal(Object.hasOwn(cleanCityPage({ title: "Trnava" }), "collectionIds"), false);
  assert.deepEqual(cityPageFromRecord({ id: 1, stranka: CITY_PAGE_KIND, obsah: { version: 1, title: "Trnava", slug: "trnava" } }).collectionIds, []);
});

test("city cards resolve current catalog data, preserve selection order and skip deleted products", async () => {
  let calls = 0;
  const current = { id: 1, title: "Nové meno", mainImage: "/Untitled.png", slug: "novy-adres", subtitle: "Nový podnadpis" };
  const db = { collection: { findMany: async ({ where }) => { calls++; assert.deepEqual(where.id.in, [2, 1, 99]); return [current, { id: 2, title: "Druhý vzor", slug: "druhy" }]; } } };
  assert.deepEqual(await loadCityCollections(db, undefined), []);
  assert.equal(calls, 0);
  const products = await loadCityCollections(db, [2, 1, 99]);
  assert.deepEqual(products.map((product) => product.id), [2, 1]);
  assert.equal(products[1], current);
  assert.equal(products[1].slug, "novy-adres");
});

test("city URLs are human-readable root slugs and cannot replace existing routes or paths", async () => {
  assert.equal(citySlugFromTitle("Betónové ploty Trnava"), "betonove-ploty-trnava");
  assert.equal(parseCitySlug(" Betónové ploty Senec "), "betonove-ploty-senec");
  const routes = (await readdir(new URL("../src/app/", import.meta.url), { withFileTypes: true })).filter((entry) => entry.isDirectory() && !entry.name.startsWith("["));
  const publicDirs = (await readdir(new URL("../public/", import.meta.url), { withFileTypes: true })).filter((entry) => entry.isDirectory());
  for (const { name } of [...routes, ...publicDirs]) assert.ok(CITY_RESERVED_SLUGS.has(name), `Reserve /${name} before adding city pages.`);
  for (const slug of ["katalog", "blog", "admin", "uploads", "https://example.com", "../foo", "x/y", "//evil.test", "a?b", "%2fx", "a_b", "a".repeat(161)]) assert.throws(() => parseCitySlug(slug));
  assert.equal(numberedCitySlug("a".repeat(160), 12).length, 160);
});

test("drafts need only a title; publication validates real text, image alt and safe links", () => {
  const draft = cleanCityPage({ title: "Trnava" });
  assert.equal(draft.status, "DRAFT");
  assert.equal(draft.requestedSlug, null);
  assert.equal(cleanCityPage({ title: "Trnava", blocks, status: "PUBLISHED" }).status, "PUBLISHED");
  assert.throws(() => cleanCityPage({ title: "Trnava", status: "PUBLISHED" }), /odsek/);
  assert.throws(() => cleanCityPage({ title: "Trnava", blocks, status: "PUBLISHED", coverImage: "/og-image.jpg" }), /alt/);
  assert.throws(() => cleanCityPage({ title: "Trnava", coverImage: "javascript:alert(1)" }), /fotografie/);
  assert.throws(() => cleanCityPage({ title: "Trnava", blocks: { version: 2, blocks: [{ type: "paragraph", content: [{ type: "link", href: "javascript:alert(1)", content: "bad" }] }] } }), /Odkaz/);
  const manual = cleanCityPage({ title: "Trnava", urlMode: "manual", slug: "Betónové ploty Senec" });
  assert.equal(manual.requestedSlug, "betonove-ploty-senec");
  for (const value of [0, -1, "bad", 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => cityPageId(value));
});

test("anonymous callers and invalid admin requests cannot save, duplicate, delete or invalidate pages", async () => {
  for (const session of [null, {}, { user: { name: "Admin" } }]) {
    let dbCalls = 0;
    const paths = [];
    const service = createCityPageService({ db: { $transaction() { dbCalls++; throw new Error("Unexpected database access"); } }, getSession: async () => session, revalidate: (...args) => paths.push(args) });
    assert.equal((await service.save(session?.user ? { title: "" } : { title: "Trnava" })).success, false);
    assert.equal((await service.duplicate(session?.user ? "bad" : 1)).success, false);
    assert.equal((await service.remove(session?.user ? 0 : 1)).success, false);
    assert.equal(dbCalls, 0);
    assert.deepEqual(paths, []);
  }
});

test("storage failures do not leak database details or invalidate public pages", async (t) => {
  t.mock.method(console, "error", () => {});
  const paths = [];
  const service = createCityPageService({ db: { $transaction() { throw new Error("private connection password"); } }, getSession: async () => ({ user: {} }), revalidate: (...args) => paths.push(args) });
  const result = await service.save({ title: "Trnava" });
  assert.equal(result.success, false);
  assert.doesNotMatch(result.error, /private|password|connection/);
  assert.deepEqual(paths, []);
});

test("city sitemap contains only published root URLs with real update dates; errors propagate", async () => {
  const updatedAt = new Date("2026-10-29T12:00:00Z");
  const row = { id: 10, stranka: CITY_PAGE_KIND, updatedAt, obsah: { version: 1, title: "Trnava", slug: "betonove-ploty-trnava", status: "PUBLISHED", blocks } };
  const db = { strankaObsah: { findMany: async (query) => {
    assert.deepEqual(query.where, { stranka: CITY_PAGE_KIND, obsah: { path: ["status"], equals: "PUBLISHED" } });
    return [row];
  } } };
  const cityPages = await loadPublishedCityPages(db);
  const sitemap = buildSitemap({ collections: [], projects: [], accessories: [], posts: [], cityPages: [...cityPages, { ...cityPages[0], slug: "draft", status: "DRAFT" }] });
  assert.equal(sitemap.length, 7);
  assert.equal(sitemap.at(-1).url, "https://www.betonissimo.sk/betonove-ploty-trnava");
  assert.equal(sitemap.at(-1).lastModified, updatedAt);
  assert.equal(cityPageFromRecord({ ...row, stranka: "global" }), null);
  db.strankaObsah.findMany = async () => { throw new Error("offline"); };
  await assert.rejects(loadPublishedCityPages(db), /offline/);
});
