import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { createCityPageService } from "../../src/lib/city-page-service.js";
import { CITY_PAGE_KIND, CITY_URL_KIND } from "../../src/lib/city-pages.js";

const target = new URL(process.env.DATABASE_URL || "");
if (target.hostname !== "127.0.0.1" || target.port !== "55440" || target.username !== "catalog_url_test" || target.pathname !== "/catalog_urls_test") throw new Error("Use only the isolated catalog_urls_test database on 127.0.0.1:55440.");
const db = new PrismaClient();
const service = createCityPageService({ db, getSession: async () => ({ user: { name: "Test admin" } }), revalidate: () => {} });
test.use({ baseURL: process.env.CITY_PAGES_TEST_BASE_URL || "http://localhost:3110" });
test.setTimeout(120000);
test.afterAll(() => db.$disconnect());

test("city catalog: select/save/reload/duplicate, live catalog updates, deleted items and clearing", async ({ page, browser }, testInfo) => {
  const suffix = Date.now();
  const products = [];
  const cityIds = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(/https:\/\/(?:cdn-cookieyes\.com|www\.googletagmanager\.com|www\.facebook\.com)\//, (route) => route.abort());
  const stored = async (id) => (await db.strankaObsah.findUniqueOrThrow({ where: { id } })).obsah;
  const save = async () => { await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click(); await expect(page).toHaveURL(/\/admin\/city-pages$/); };
  try {
    for (const [index, name] of ["Prvý vzor", "Druhý vzor", "Nevybraný vzor"].entries()) {
      products.push(await db.collection.create({ data: { title: `${name} ${suffix}`, slug: `city-catalog-${suffix}-${index}`, subtitle: "Podnadpis", description: "Popis vzoru.", mainImage: "/og-image.jpg", gallery: ["/og-image.jpg"] } }));
    }
    const title = `Betónové ploty Trnava katalóg ${suffix}`;
    const city = await service.save({ title, status: "PUBLISHED", blocks: { version: 2, blocks: [{ type: "paragraph", content: "Obsah stránky mesta s vybranými vzormi." }] } });
    expect(city.success).toBe(true); cityIds.push(city.id);
    expect(await (await page.request.get(`/${city.slug}`)).text()).not.toContain('id="kolekcie"');

    await page.goto("/auth/signin");
    await page.getByPlaceholder("ADMIN_ID").fill("editor-local-test");
    await page.getByPlaceholder("ACCESS_CODE").fill("editor-local-test-only");
    await page.getByRole("button", { name: "Execute_Login" }).click();
    await expect(page).toHaveURL(/\/admin\/editor/);
    await page.goto(`/admin/city-pages/${city.id}`);
    await page.getByLabel("Hľadať vzor", { exact: true }).fill(`prvy vzor ${suffix}`);
    await expect(page.getByRole("checkbox")).toHaveCount(1);
    await page.getByRole("checkbox", { name: `Zobraziť vzor ${products[0].title}`, exact: true }).check();
    await page.getByLabel("Hľadať vzor", { exact: true }).fill("");
    await page.getByRole("checkbox", { name: `Zobraziť vzor ${products[1].title}`, exact: true }).check();
    await expect(page.getByRole("status").filter({ hasText: "Vybrané vzory: 2" })).toBeVisible();
    await page.getByRole("button", { name: "Náhľad obsahu", exact: true }).click();
    await expect(page.locator(`a[href="/katalog/${products[0].slug}"]`)).toHaveCount(1);
    await expect(page.locator(`a[href="/katalog/${products[2].slug}"]`)).toHaveCount(0);
    await page.getByRole("button", { name: "Zavrieť náhľad", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 900 });
    const picker = page.getByRole("heading", { name: "Vzory z katalógu", exact: true }).locator("..");
    await picker.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await picker.screenshot({ path: testInfo.outputPath("city-catalog-picker.png") });
    await save();
    expect((await stored(city.id)).collectionIds).toEqual(products.slice(0, 2).map((product) => product.id));
    await page.goto(`/admin/city-pages/${city.id}`);
    for (const product of products.slice(0, 2)) await expect(page.getByRole("checkbox", { name: `Zobraziť vzor ${product.title}`, exact: true })).toBeChecked();
    let html = await (await page.request.get(`/${city.slug}`)).text();
    for (const product of products.slice(0, 2)) expect(html).toContain(`href="/katalog/${product.slug}"`);
    expect(html).not.toContain(`href="/katalog/${products[2].slug}"`);
    const noScript = await browser.newContext({ javaScriptEnabled: false, baseURL: new URL(page.url()).origin });
    try {
      await noScript.route(/https:\/\/(?:cdn-cookieyes\.com|www\.googletagmanager\.com|www\.facebook\.com)\//, (route) => route.abort());
      const publicPage = await noScript.newPage();
      await publicPage.goto(`/${city.slug}`);
      await expect(publicPage.locator(`a[href="/katalog/${products[0].slug}"]`)).toBeVisible();
    } finally { await noScript.close(); }

    // An older cached form may omit the new field; it must not erase the selection.
    const previous = await stored(city.id);
    const { collectionIds: _selection, ...oldInput } = previous;
    expect((await service.save({ ...oldInput, id: city.id })).success).toBe(true);
    expect((await stored(city.id)).collectionIds).toEqual(previous.collectionIds);
    await page.goto("/admin/city-pages");
    await page.getByRole("button", { name: `Duplikovať ${title}`, exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages\/\d+$/);
    const copyId = Number(new URL(page.url()).pathname.split("/").at(-1)); cityIds.push(copyId);
    expect((await stored(copyId)).collectionIds).toEqual(previous.collectionIds);
    await page.getByLabel("Názov stránky *", { exact: true }).fill(`Betónové ploty Senec katalóg ${suffix}`);
    await page.getByRole("checkbox", { name: `Zobraziť vzor ${products[0].title}`, exact: true }).uncheck();
    await page.getByRole("button", { name: "Publikovať stránku", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    const copy = await stored(copyId);
    expect(copy.collectionIds).toEqual([products[1].id]);
    expect((await stored(city.id)).collectionIds).toEqual(previous.collectionIds);

    await page.goto(`/admin/collections/${products[0].id}`);
    const updatedTitle = `Aktualizovaný vzor ${suffix}`;
    await page.getByLabel("Názov *", { exact: true }).fill(updatedTitle);
    await page.locator('input[name="gallery"]').evaluate((input) => { input.value = "/Untitled.png"; });
    await page.locator('input[name="imageAlts"]').evaluate((input) => { input.value = JSON.stringify({ "/Untitled.png": "Nová fotografia vzoru" }); });
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#/);
    const currentProduct = await db.collection.findUniqueOrThrow({ where: { id: products[0].id } });
    html = await (await page.request.get(`/${city.slug}`)).text();
    expect(html).toContain(updatedTitle);
    expect(html).toContain(`href="/katalog/${currentProduct.slug}"`);
    expect(html).not.toContain(`href="/katalog/${products[0].slug}"`);
    expect(html).toContain("Nová fotografia vzoru");
    expect(html).toContain("Untitled.png");
    await page.goto(`/${city.slug}`);
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator("#kolekcie").scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator("#kolekcie").screenshot({ path: testInfo.outputPath("city-catalog-public.png") });

    await page.goto(`/admin/collections/${products[1].id}`);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Vymazať", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#/);
    expect(await (await page.request.get(`/${city.slug}`)).text()).not.toContain(`href="/katalog/${products[1].slug}"`);
    expect(await (await page.request.get(`/${copy.slug}`)).text()).not.toContain('id="kolekcie"');
    await page.goto(`/admin/city-pages/${city.id}`);
    await page.getByRole("button", { name: "Zrušiť výber", exact: true }).click();
    await save();
    expect((await stored(city.id)).collectionIds).toEqual([]);
    expect(await (await page.request.get(`/${city.slug}`)).text()).not.toContain('id="kolekcie"');
    const invalid = await service.save({ ...await stored(city.id), id: city.id, collectionIds: "[-1]" });
    expect(invalid.success).toBe(false);
    expect((await stored(city.id)).collectionIds).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await db.strankaObsah.deleteMany({ where: { stranka: CITY_URL_KIND, OR: cityIds.map((pageId) => ({ obsah: { path: ["pageId"], equals: pageId } })) } });
    await db.strankaObsah.deleteMany({ where: { stranka: CITY_PAGE_KIND, id: { in: cityIds } } });
    await db.collection.deleteMany({ where: { id: { in: products.map((product) => product.id) } } });
    await db.strankaObsah.deleteMany({ where: { OR: products.flatMap((product) => [
      { sekcia: { in: [`seo-collection-${product.id}`, `collection-specifications-${product.id}`] } },
      { stranka: "catalog-urls-collection", obsah: { path: ["itemId"], equals: product.id } },
    ]) } });
  }
});
