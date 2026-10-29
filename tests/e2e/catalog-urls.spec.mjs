import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { catalogTransaction, prepareCatalogUrl, rememberCatalogUrls, slugFromTitle } from "../../src/lib/catalog-urls.js";

const target = new URL(process.env.DATABASE_URL || "");
if (target.hostname !== "127.0.0.1" || target.port !== "55440" || target.username !== "catalog_url_test" || target.pathname !== "/catalog_urls_test") {
  throw new Error("Use only the isolated catalog_urls_test database on 127.0.0.1:55440.");
}
const db = new PrismaClient();
const photo = "/og-image.jpg";
test.use({ baseURL: process.env.CATALOG_URL_TEST_BASE_URL || "http://localhost:3110" });
test.setTimeout(120000);
test.afterAll(() => db.$disconnect());

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/(?:cdn-cookieyes\.com|www\.googletagmanager\.com|www\.facebook\.com)\//, (route) => route.abort());
  await page.goto("/auth/signin");
  await page.getByPlaceholder("ADMIN_ID").fill("editor-local-test");
  await page.getByPlaceholder("ACCESS_CODE").fill("editor-local-test-only");
  await page.getByRole("button", { name: "Execute_Login" }).click();
  await expect(page).toHaveURL(/\/admin\/editor/);
});

for (const [kind, folder, path] of [["collection", "collections", "/katalog"], ["accessory", "accessories", "/doplnky"]]) {
  test(`${kind}: automatic URL from title, direct 308 history, canonical/sitemap/links and automatic duplicate suffixes`, async ({ page, browser }, testInfo) => {
    const suffix = `${kind}-${Date.now()}`;
    const legacySlug = `q1-drevo-${suffix}`;
    const common = { title: `Dizajnové betónové ploty Q1 Drevo ${suffix}`, subtitle: "Podnadpis", description: "Pôvodný obsah zostáva zachovaný.", mainImage: photo, gallery: [photo] };
    const item = await db[kind].create({ data: { ...common, slug: legacySlug, ...(kind === "accessory" ? { price: "19.95" } : {}) } });
    const otherTitle = `Iný záznam ${suffix}`;
    const other = await db[kind].create({ data: { ...common, title: otherTitle, slug: slugFromTitle(otherTitle), ...(kind === "accessory" ? { price: "5" } : {}) } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const save = async () => {
      await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
      await expect(page).toHaveURL(/\/admin\/editor#/);
    };
    const edit = () => page.goto(`/admin/${folder}/${item.id}`);
    const urlInput = () => page.getByLabel("URL adresa", { exact: false });
    const redirectTo = async (old, current) => {
      for (const userAgent of ["Mozilla/5.0", "Googlebot"]) {
        const response = await page.request.get(`${path}/${old}`, { maxRedirects: 0, headers: { "User-Agent": userAgent } });
        expect(response.status()).toBe(308);
        expect(new URL(response.headers().location, response.url()).pathname).toBe(`${path}/${current}`);
      }
    };
    try {
      expect((await page.request.get(`${path}/${legacySlug}`)).status()).toBe(200);
      const anonymous = await browser.newContext();
      try {
        const response = await anonymous.request.get(new URL(`/admin/${folder}/${item.id}`, page.url()).href, { maxRedirects: 0 });
        expect(response.status()).toBe(307);
      } finally { await anonymous.close(); }

      await edit();
      await expect(urlInput()).toHaveValue(slugFromTitle(common.title));
      await expect(urlInput()).toHaveAttribute("readonly", "");
      await expect(page.getByRole("button", { name: "Použiť názov", exact: true })).toHaveCount(0);
      await page.getByLabel("Názov *", { exact: true }).fill(common.title + " upravené");
      const generated = slugFromTitle(common.title + " upravené");
      await expect(urlInput()).toHaveValue(generated);
      await page.getByLabel("Nadpis vo vyhľadávaní (meta title)").fill("Vlastný SEO nadpis");
      await page.getByLabel("Popis fotografie (alt)").fill("Detail betónového plotu");
      await save();
      const saved = await db[kind].findUniqueOrThrow({ where: { id: item.id } });
      expect(saved.slug).toBe(generated);
      expect(saved.description).toBe(common.description);
      expect(saved.gallery).toEqual([photo]);
      await redirectTo(legacySlug, generated);

      let finalSlug = `betonovy-plot-vlastny-${suffix}`;
      await edit();
      await page.getByLabel("Názov *", { exact: true }).fill(`Betónový plot vlastný ${suffix}`);
      await expect(urlInput()).toHaveValue(finalSlug);
      await save();
      await redirectTo(legacySlug, finalSlug);
      await redirectTo(generated, finalSlug);
      const response = await page.request.get(`${path}/${finalSlug}`);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain(`<link rel="canonical" href="https://www.betonissimo.sk${path}/${finalSlug}"`);
      expect(html).toContain(`<meta property="og:url" content="https://www.betonissimo.sk${path}/${finalSlug}"`);
      expect(html).toContain("<title>Vlastný SEO nadpis</title>");
      const sitemap = await (await page.request.get("/sitemap.xml")).text();
      expect(sitemap).toContain(`${path}/${finalSlug}</loc>`);
      expect(sitemap).not.toContain(`${path}/${legacySlug}</loc>`);
      expect(sitemap).not.toContain(`${path}/${generated}</loc>`);
      const list = await (await page.request.get(path)).text();
      expect(list).toContain(`href="${path}/${finalSlug}"`);
      expect(list).not.toContain(`href="${path}/${legacySlug}"`);

      await edit();
      await expect(urlInput()).toHaveValue(finalSlug);
      const intermediateSlug = finalSlug;
      await page.getByLabel("Názov *", { exact: true }).fill(otherTitle);
      await save();
      const duplicateSlug = `${other.slug}-2`;
      expect((await db[kind].findUniqueOrThrow({ where: { id: item.id } })).slug).toBe(duplicateSlug);
      await edit();
      await expect(urlInput()).toHaveValue(duplicateSlug);
      await save();
      expect((await db[kind].findUniqueOrThrow({ where: { id: item.id } })).slug).toBe(duplicateSlug);
      await edit();
      await page.getByLabel("Názov *", { exact: true }).fill(`Q1 Drevo ${suffix}`);
      await save();
      finalSlug = `${legacySlug}-2`;
      expect((await db[kind].findUniqueOrThrow({ where: { id: item.id } })).slug).toBe(finalSlug);
      for (const old of [legacySlug, generated, intermediateSlug, duplicateSlug]) await redirectTo(old, finalSlug);
      expect((await db.strankaObsah.findUniqueOrThrow({ where: { sekcia: `seo-${kind}-${item.id}` } })).obsah.title).toBe("Vlastný SEO nadpis");

      await edit();
      const field = urlInput();
      for (const width of [320, 390, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await field.scrollIntoViewIfNeeded();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await page.screenshot({ path: testInfo.outputPath(`${kind}-url-field.png`) });
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: "Vymazať", exact: true }).click();
      await expect(page).toHaveURL(/\/admin\/editor#/);
      for (const slug of [legacySlug, generated, intermediateSlug, duplicateSlug, finalSlug]) expect((await page.request.get(`${path}/${slug}`, { maxRedirects: 0 })).status()).toBe(404);
      expect(errors).toEqual([]);
    } finally {
      await db[kind].deleteMany({ where: { id: { in: [item.id, other.id] } } });
      await db.strankaObsah.deleteMany({ where: { OR: [
        { sekcia: `seo-${kind}-${item.id}` },
        { sekcia: `collection-specifications-${item.id}` },
        { stranka: `catalog-urls-${kind}`, obsah: { path: ["itemId"], equals: item.id } },
      ] } });
    }
  });
}

test("new catalog entry: readonly URL follows the title and the server ignores a tampered field", async ({ page }) => {
  const title = `Dizajnové betónové ploty Q1 Drevo ${Date.now()}`;
  let item;
  try {
    await page.goto("/admin/collections/new");
    await page.getByLabel("Názov *", { exact: true }).fill(title);
    await page.getByLabel("Podnadpis *", { exact: true }).fill("Podnadpis");
    await page.getByLabel("Popis *", { exact: true }).fill("Popis nového vzoru.");
    const slug = page.getByLabel("URL adresa", { exact: false });
    await expect(slug).toHaveValue(slugFromTitle(title));
    await expect(slug).toHaveAttribute("readonly", "");
    await page.getByLabel("Názov *", { exact: true }).fill(title + " nové");
    const expected = slugFromTitle(title + " nové");
    await expect(slug).toHaveValue(expected);
    await expect(page.locator("#catalog-url-preview")).toHaveText(`https://www.betonissimo.sk/katalog/${expected}`);
    await slug.evaluate((input) => { input.readOnly = false; input.value = "../escape"; });
    await page.locator('input[name="gallery"]').evaluate((input) => { input.value = "/og-image.jpg"; });
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#/);
    item = await db.collection.findUniqueOrThrow({ where: { slug: expected } });
    expect(item.title).toBe(title + " nové");
    expect((await page.request.get(`/katalog/${expected}`)).status()).toBe(200);
  } finally {
    if (item) {
      await db.collection.delete({ where: { id: item.id } });
      await db.strankaObsah.deleteMany({ where: { OR: [
        { sekcia: `seo-collection-${item.id}` },
        { sekcia: `collection-specifications-${item.id}` },
        { stranka: "catalog-urls-collection", obsah: { path: ["itemId"], equals: item.id } },
      ] } });
    }
  }
});

test("concurrent writes cannot assign one URL to two items", async () => {
  const title = `Konkurentné ${Date.now()}`;
  const slug = slugFromTitle(title);
  const create = () => catalogTransaction(db, async (tx) => {
    const url = await prepareCatalogUrl(tx, "collection", { id: null, title });
    const item = await tx.collection.create({ data: { title, slug: url.slug, subtitle: "Podnadpis", description: "Popis", mainImage: photo, gallery: [photo] } });
    await rememberCatalogUrls(tx, "collection", item.id, [url.slug]);
    return item;
  });
  try {
    const results = await Promise.allSettled([create(), create()]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(2);
    const items = await db.collection.findMany({ where: { slug: { in: [slug, `${slug}-2`] } } });
    expect(items).toHaveLength(2);
    expect(new Set(items.map((item) => item.slug)).size).toBe(2);
  } finally {
    await db.collection.deleteMany({ where: { slug: { in: [slug, `${slug}-2`] } } });
    await db.strankaObsah.deleteMany({ where: { sekcia: { in: [`catalog-url-collection-${slug}`, `catalog-url-collection-${slug}-2`] } } });
  }
});
