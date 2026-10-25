// Read-only integration check. Never migrates, seeds or edits the configured DB.
import assert from "node:assert/strict";
import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";
import { SITE_URL } from "../src/lib/site-url.js";
import { ORGANIZATION_LOGO } from "../src/lib/structured-data.js";

const base = new URL(process.argv[2] || "http://localhost:3000");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a loopback test server only.");
assert.ok(["http:", "https:"].includes(base.protocol));
assert.equal(base.username + base.password + base.search + base.hash, "");
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
assert.ok(process.env.DATABASE_URL, "DATABASE_URL is missing.");

const db = new PrismaClient({ log: [] });
const schemas = (html) => [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));
const canonical = (html) => /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
const noindex = (html) => /<meta name="robots" content="[^"]*noindex/.test(html);
const request = (path, options) => fetch(new URL(path, base), { signal: AbortSignal.timeout(30000), ...options });

try {
  const [collections, projects, accessories, posts] = await Promise.all([
    db.collection.findMany({ select: { slug: true } }),
    db.project.findMany({ select: { slug: true } }),
    db.accessory.findMany({ select: { slug: true, price: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } }),
  ]);
  const paths = [
    "/", "/katalog", "/realizacie", "/kontakt", "/doplnky", "/blog",
    ...collections.map((item) => `/katalog/${encodeURIComponent(item.slug)}`),
    ...projects.map((item) => `/projekt/${encodeURIComponent(item.slug)}`),
    ...accessories.map((item) => `/doplnky/${encodeURIComponent(item.slug)}`),
    ...posts.map((item) => `/blog/${encodeURIComponent(item.slug)}`),
  ];
  for (const path of paths) {
    const response = await request(path);
    assert.equal(response.status, 200, `HTTP status: ${path}`);
    const html = await response.text();
    assert.equal(new URL(canonical(html)).href, new URL(path, SITE_URL).href, `Canonical: ${path}`);
    assert.equal(noindex(html), false, `Unexpected noindex: ${path}`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `H1 count: ${path}`);
    assert.equal((html.match(/<main[\s>]/g) || []).length, 1, `Main landmark count: ${path}`);
    const data = schemas(html);
    assert.equal(data.find((schema) => schema["@type"] === "Organization")?.logo, ORGANIZATION_LOGO);
    if (path.startsWith("/doplnky/")) {
      const slug = decodeURIComponent(path.slice("/doplnky/".length));
      const record = accessories.find((item) => item.slug === slug);
      const product = data.find((schema) => schema["@type"] === "Product");
      assert.ok(product, `Product missing: ${path}`);
      assert.equal(product.offers["@type"], "Offer");
      assert.equal(product.offers.price, record.price.toString());
      assert.equal(product.offers.priceCurrency, "EUR");
      assert.equal(product.offers.url, new URL(path, SITE_URL).href);
      assert.equal(product.review, undefined);
      assert.equal(product.aggregateRating, undefined);
    }
    console.log(`PASS ${path}`);
  }

  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).href);
  assert.deepEqual(locations.sort(), paths.map((path) => new URL(path, SITE_URL).href).sort());
  assert.equal(new Set(locations).size, paths.length);

  const signin = await request("/auth/signin");
  assert.equal(signin.status, 200);
  assert.ok(noindex(await signin.text()));
  assert.equal(signin.headers.get("x-robots-tag"), "noindex, nofollow");
  const admin = await request("/admin/editor", { redirect: "manual" });
  assert.ok([302, 303, 307, 308].includes(admin.status));
  assert.equal(new URL(admin.headers.get("location"), base).pathname, "/auth/signin");
  const api = await request("/api/auth/providers");
  assert.equal(api.status, 200);
  assert.equal(api.headers.get("x-robots-tag"), "noindex, nofollow");

  const legacyLogo = await request("/logo.png", { redirect: "manual" });
  assert.equal(legacyLogo.status, 308);
  assert.equal(new URL(legacyLogo.headers.get("location"), base).pathname, "/Untitled.png");
  const logo = await request("/Untitled.png");
  assert.equal(logo.status, 200);
  assert.ok(logo.headers.get("content-type").startsWith("image/png"));
  const robots = await request("/robots.txt");
  assert.equal(robots.status, 200);
  assert.ok((await robots.text()).includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
  console.log(`PASS ${paths.length} public pages, complete sitemap, auth noindex/access control, API headers, logo and robots.`);
} catch (error) {
  // Do not expose Prisma initialization details or env values in diagnostics.
  console.error(error instanceof assert.AssertionError ? `FAIL ${error.message}` : `FAIL ${error.code || error.name}`);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
