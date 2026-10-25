import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SITE_URL } from "../src/lib/site-url.js";
import { accessoryProductJsonLd, organizationJsonLd, ORGANIZATION_ID, ORGANIZATION_LOGO, serializeJsonLd } from "../src/lib/structured-data.js";
import { buildSitemap, loadSitemap } from "../src/lib/sitemap.js";
import robots from "../src/app/robots.js";
import nextConfig from "../next.config.mjs";

const accessory = {
  slug: "zahradna-figurka-krokodil",
  title: "Betónový hroch",
  description: "Záhradná figúrka a zábrana",
  price: { toString: () => "99.9" }, // Prisma Decimal boundary
  mainImage: "/uploads/hroch.webp",
  gallery: ["/uploads/hroch.webp", "https://images.example.com/hroch-2.webp"],
};

test("Organization references an actual logo asset and the visible phone", async () => {
  const schema = organizationJsonLd({ phone: "+421 952 515 556" });
  assert.equal(schema["@id"], ORGANIZATION_ID);
  assert.equal(schema.logo, ORGANIZATION_LOGO);
  assert.equal(schema.telephone, "+421 952 515 556");
  assert.equal(organizationJsonLd({ phone: "0911 640 097", showPhone: false }).telephone, undefined);
  const asset = await readFile(new URL(`../public${new URL(schema.logo).pathname}`, import.meta.url));
  assert.equal(asset.subarray(1, 4).toString(), "PNG");
  assert.ok(asset.readUInt32BE(16) >= 112 && asset.readUInt32BE(20) >= 112);
});

test("JSON-LD escapes script terminators without changing database text", () => {
  const data = { description: '</script><script>alert("test")</script> & plot' };
  const json = serializeJsonLd(data);
  assert.equal(json.includes("<"), false);
  assert.deepEqual(JSON.parse(json), data);
});

test("a priced accessory uses one real Offer and its canonical URL", () => {
  const schema = accessoryProductJsonLd(accessory);
  assert.equal(schema["@type"], "Product");
  assert.equal(schema.url, `${SITE_URL}/doplnky/${accessory.slug}`);
  assert.equal(schema.offers["@type"], "Offer");
  assert.equal(schema.offers.url, schema.url);
  assert.equal(schema.offers.price, "99.9");
  assert.equal(schema.offers.priceCurrency, "EUR");
  assert.deepEqual(schema.offers.seller, { "@id": ORGANIZATION_ID });
  assert.deepEqual(schema.image, [`${SITE_URL}/uploads/hroch.webp`, "https://images.example.com/hroch-2.webp"]);
  for (const field of ["review", "aggregateRating"]) assert.equal(schema[field], undefined);
  for (const field of ["lowPrice", "highPrice", "offerCount", "availability", "shippingDetails", "hasMerchantReturnPolicy"]) {
    assert.equal(schema.offers[field], undefined);
  }
});

test("missing or invalid prices do not become artificial zero-price offers", () => {
  for (const price of [undefined, null, "", " ", "NaN", -1, "na dotaz", "99,90", "1.234"]) {
    assert.equal(accessoryProductJsonLd({ ...accessory, price }), null);
  }
  // A deliberately stored zero is different from coercing a missing price to zero.
  assert.equal(accessoryProductJsonLd({ ...accessory, price: 0 }).offers.price, "0");
});

test("invalid legacy images cannot crash or inject a Product image URL", () => {
  const schema = accessoryProductJsonLd({ ...accessory, mainImage: "http://[", gallery: ["javascript:alert(1)", "/real.webp"] });
  assert.deepEqual(schema.image, [`${SITE_URL}/real.webp`]);
});

test("sitemap uses canonical HTTPS/www URLs, encoded slugs and real update dates only", () => {
  const updatedAt = new Date("2026-10-20T12:00:00Z");
  const entries = buildSitemap({
    collections: [{ slug: "q13-hladky-modern" }],
    projects: [{ slug: "projekt s medzerou" }],
    accessories: [{ slug: accessory.slug, updatedAt }],
    posts: [{ slug: "rada", updatedAt }],
  });
  assert.equal(entries.length, 10);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  assert.ok(entries.every((entry) => new URL(entry.url).origin === SITE_URL));
  assert.ok(entries.some((entry) => entry.url.endsWith("/projekt/projekt%20s%20medzerou")));
  assert.ok(entries.slice(0, 8).every((entry) => !("lastModified" in entry)));
  assert.ok(entries.slice(8).every((entry) => entry.lastModified === updatedAt));
  assert.ok(entries.every((entry) => !/\/(admin|auth|api)(?:\/|$)/.test(new URL(entry.url).pathname)));
});

test("sitemap includes only published blog posts and does not disguise database outages", async () => {
  const db = Object.fromEntries(["collection", "project", "accessory", "blogPost"].map((model) => [model, {
    findMany: async (query) => {
      if (model === "blogPost") assert.deepEqual(query.where, { status: "PUBLISHED" });
      if (model === "accessory") assert.equal(query.select.updatedAt, true);
      return [];
    },
  }]));
  assert.equal((await loadSitemap(db)).length, 6);
  db.collection.findMany = async () => { throw new Error("database unavailable"); };
  await assert.rejects(loadSitemap(db), /database unavailable/);
});

test("robots allows content and sign-in noindex, but blocks admin/API crawling", async () => {
  const value = robots();
  assert.equal(value.sitemap, `${SITE_URL}/sitemap.xml`);
  assert.equal(value.rules.allow, "/");
  assert.deepEqual(value.rules.disallow, ["/admin", "/api/"]);
  const headers = await nextConfig.headers();
  assert.deepEqual(headers.map((rule) => rule.source), ["/admin/:path*", "/auth/:path*", "/api/:path*"]);
  assert.ok(headers.every((rule) => rule.headers.some((header) => header.key === "X-Robots-Tag" && header.value === "noindex, nofollow")));
});

test("the legacy missing logo URL redirects directly to the real local logo", async () => {
  assert.deepEqual(await nextConfig.redirects(), [{ source: "/logo.png", destination: "/Untitled.png", permanent: true }]);
});
