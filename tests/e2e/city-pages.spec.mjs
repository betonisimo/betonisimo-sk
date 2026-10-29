import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { CITY_PAGE_KIND, CITY_URL_KIND, citySlugFromTitle } from "../../src/lib/city-pages.js";
import { createCityPageService } from "../../src/lib/city-page-service.js";

const target = new URL(process.env.DATABASE_URL || "");
if (target.hostname !== "127.0.0.1" || target.port !== "55440" || target.username !== "catalog_url_test" || target.pathname !== "/catalog_urls_test") throw new Error("Use only the isolated catalog_urls_test database on 127.0.0.1:55440.");
const db = new PrismaClient();
const service = createCityPageService({ db, getSession: async () => ({ user: { name: "Test admin" } }), revalidate: () => {} });
test.use({ baseURL: process.env.CITY_PAGES_TEST_BASE_URL || "http://localhost:3110" });
test.setTimeout(120000);
test.afterAll(() => db.$disconnect());

async function cleanup(ids) {
  await db.strankaObsah.deleteMany({ where: { stranka: CITY_URL_KIND, OR: ids.map((pageId) => ({ obsah: { path: ["pageId"], equals: pageId } })) } });
  await db.strankaObsah.deleteMany({ where: { stranka: CITY_PAGE_KIND, id: { in: ids } } });
}
async function stored(id) { return (await db.strankaObsah.findUniqueOrThrow({ where: { id } })).obsah; }
async function selectText(page, value) {
  await page.locator(".bn-editor").evaluate((element, text) => {
    element.focus();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const start = node.textContent.indexOf(text);
      if (start < 0) continue;
      const range = document.createRange();
      range.setStart(node, start); range.setEnd(node, start + text.length);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
      return;
    }
    throw new Error("Fixture text not found.");
  }, value);
}
async function coverFixture(page, photo, alt) {
  await page.locator('input[name="coverImage"]').evaluate((input, value) => { input.value = value; }, photo);
  await page.locator('input[name="coverAlt"]').evaluate((input, value) => { input.value = value; }, alt);
}
test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/(?:cdn-cookieyes\.com|www\.googletagmanager\.com|www\.facebook\.com)\//, (route) => route.abort());
  await page.goto("/auth/signin");
  await page.getByPlaceholder("ADMIN_ID").fill("editor-local-test");
  await page.getByPlaceholder("ACCESS_CODE").fill("editor-local-test-only");
  await page.getByRole("button", { name: "Execute_Login" }).click();
  await expect(page).toHaveURL(/\/admin\/editor/);
});

test("create → draft → publish → duplicate → edit city/photos → publish → rename → unpublish → delete", async ({ page, browser }, testInfo) => {
  const suffix = Date.now();
  const title = `Betónové ploty Trnava ${suffix}`;
  const ids = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const blogCount = await db.blogPost.count();
  try {
    await page.goto("/admin");
    await page.getByRole("link", { name: /SEO stránky miest/ }).click();
    await page.getByRole("link", { name: "Nová stránka", exact: true }).click();
    await page.getByLabel("Názov stránky *", { exact: true }).fill(title);
    const firstSlug = citySlugFromTitle(title);
    await expect(page.getByLabel("URL adresa *", { exact: true })).toHaveValue(firstSlug);
    await page.getByRole("button", { name: "Uložiť koncept", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    const row = await db.strankaObsah.findFirstOrThrow({ where: { stranka: CITY_PAGE_KIND, obsah: { path: ["title"], equals: title } } });
    ids.push(row.id);
    const unpublished = await page.request.get(`/${firstSlug}`);
    expect(unpublished.status()).toBe(404);
    expect(await unpublished.text()).toMatch(/noindex/);
    expect(await (await page.request.get("/sitemap.xml")).text()).not.toContain(`/${firstSlug}</loc>`);

    // Existing local media and rich blocks, with no upload to the real Blob store.
    const rich = { version: 2, blocks: [
      { type: "paragraph", content: [ { type: "text", text: "Montáž v Trnave. " }, { type: "text", text: "Kvalitné ploty", styles: { bold: true } }, { type: "text", text: " " }, { type: "link", href: "/katalog", content: "Naše vzory" }, { type: "text", text: " <script>window.__cityExecuted=true</script>" } ] },
      { type: "heading", props: { level: 2 }, content: "Naše realizácie" },
      { type: "bulletListItem", content: "Doprava" }, { type: "bulletListItem", content: "Montáž" },
      { type: "photo", props: { url: "/og-image.jpg", alt: "Plot v Trnave", caption: "Fotografia realizácie" } },
    ] };
    await db.strankaObsah.update({ where: { id: row.id }, data: { obsah: { ...row.obsah, blocks: rich } } });
    await page.goto(`/admin/city-pages/${row.id}`);
    await expect(page.getByRole("textbox", { name: "Obsah – blokový editor" })).toContainText("Montáž v Trnave.");
    await page.getByLabel("Krátky úvod", { exact: true }).fill("Betónové ploty a montáž v Trnave a okolí.");
    await page.getByLabel("Nadpis vo vyhľadávaní (meta title)").fill("Betónové ploty Trnava – vlastný SEO titulok");
    await page.getByLabel("Popis vo vyhľadávaní (meta description)").fill("Popis stránky pre Trnavu.");
    await page.getByRole("button", { name: "Náhľad obsahu", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Naše realizácie", exact: true }).last()).toBeVisible();
    await page.getByRole("button", { name: "Zavrieť náhľad", exact: true }).click();
    await coverFixture(page, "/og-image.jpg", "Hlavná fotografia Trnava");
    await page.getByRole("button", { name: "Publikovať stránku", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    const original = await stored(row.id);
    expect(original.status).toBe("PUBLISHED");
    const published = await page.request.get(`/${firstSlug}`);
    expect(published.status()).toBe(200);
    const html = await published.text();
    expect(html).toContain(`<link rel="canonical" href="https://www.betonissimo.sk/${firstSlug}"`);
    expect(html).toContain(`<meta property="og:url" content="https://www.betonissimo.sk/${firstSlug}"`);
    expect(html).toContain("<title>Betónové ploty Trnava – vlastný SEO titulok</title>");
    expect(html).toContain("Plot v Trnave");
    expect(html).toContain("&lt;script&gt;window.__cityExecuted=true&lt;/script&gt;");
    expect(html).not.toMatch(/name="robots" content="[^"]*noindex/);
    expect(html).not.toContain('"@type":"BlogPosting"');
    expect(await (await page.request.get("/sitemap.xml")).text()).toContain(`/${firstSlug}</loc>`);
    for (const path of ["/", "/katalog", "/doplnky", "/realizacie", "/blog", "/kontakt"]) expect(await (await page.request.get(path)).text()).not.toContain(`href="/${firstSlug}"`);

    const noScript = await browser.newContext({ javaScriptEnabled: false, baseURL: new URL(page.url()).origin });
    try {
      await noScript.route(/https:\/\/(?:cdn-cookieyes\.com|www\.googletagmanager\.com|www\.facebook\.com)\//, (route) => route.abort());
      const publicPage = await noScript.newPage();
      await publicPage.goto(`/${firstSlug}`);
      await expect(publicPage.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(publicPage.getByRole("link", { name: "Naše vzory", exact: true })).toBeVisible();
      await expect(publicPage.getByRole("img", { name: "Plot v Trnave", exact: true })).toBeVisible();
    } finally { await noScript.close(); }

    await page.getByRole("button", { name: `Duplikovať ${title}`, exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages\/\d+$/);
    const copyId = Number(new URL(page.url()).pathname.split("/").at(-1));
    ids.push(copyId);
    expect(copyId).not.toBe(row.id);
    const copy = await stored(copyId);
    expect(copy.status).toBe("DRAFT");
    expect(copy.blocks).toEqual(original.blocks);
    expect(copy.coverImage).toBe(original.coverImage);
    expect(copy.seoTitle).toBe(original.seoTitle);
    expect(copy.slug).not.toBe(firstSlug);
    expect((await page.request.get(`/${copy.slug}`)).status()).toBe(404);
    expect(await (await page.request.get("/sitemap.xml")).text()).not.toContain(`/${copy.slug}</loc>`);

    const copyTitle = `Betónové ploty Senec ${suffix}`;
    const copySlug = `betonove-ploty-senec-${suffix}`;
    await page.getByLabel("Názov stránky *", { exact: true }).fill(copyTitle);
    await expect(page.getByLabel("URL adresa *", { exact: true })).toHaveValue(copySlug);
    await page.getByLabel("Krátky úvod", { exact: true }).fill("Informácie pre Senec.");
    await page.getByLabel("Nadpis vo vyhľadávaní (meta title)").fill("SEO Senec");
    await selectText(page, "Montáž v Trnave.");
    await page.keyboard.type("Montáž v Senci.");
    await page.getByLabel("Alternatívny popis (alt) *", { exact: true }).fill("Plot v Senci");
    await coverFixture(page, "/Untitled.png", "Nová fotografia Senec");
    await page.getByRole("button", { name: "Publikovať stránku", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    expect((await stored(copyId)).coverImage).toBe("/Untitled.png");
    expect(await stored(row.id)).toEqual(original);
    const copyHtml = await (await page.request.get(`/${copySlug}`)).text();
    expect(copyHtml).toContain("Montáž v Senci.");
    expect(copyHtml).toContain("Plot v Senci");
    expect(await (await page.request.get("/sitemap.xml")).text()).toContain(`/${copySlug}</loc>`);

    const renamed = `betonove-ploty-senec-okolie-${suffix}`;
    await page.goto(`/admin/city-pages/${copyId}`);
    await page.getByLabel("URL adresa *", { exact: true }).fill(renamed);
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    for (const agent of ["Mozilla/5.0", "Googlebot"]) {
      const old = await page.request.get(`/${copySlug}`, { maxRedirects: 0, headers: { "User-Agent": agent } });
      expect(old.status()).toBe(308);
      expect(new URL(old.headers().location, old.url()).pathname).toBe(`/${renamed}`);
    }
    const newSitemap = await (await page.request.get("/sitemap.xml")).text();
    expect(newSitemap).toContain(`/${renamed}</loc>`);
    expect(newSitemap).not.toContain(`/${copySlug}</loc>`);
    await page.goto(`/${renamed}`);
    expect(await page.evaluate(() => window.__cityExecuted)).toBeUndefined();
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.screenshot({ path: testInfo.outputPath("city-page-public.png"), fullPage: true });
    await page.goto(`/admin/city-pages/${copyId}`);
    await page.getByRole("button", { name: "Presunúť medzi koncepty", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    for (const slug of [copySlug, renamed]) expect((await page.request.get(`/${slug}`, { maxRedirects: 0 })).status()).toBe(404);
    expect(await (await page.request.get("/sitemap.xml")).text()).not.toContain(`/${renamed}</loc>`);
    await page.goto(`/admin/city-pages/${copyId}`);
    await page.getByRole("button", { name: "Publikovať stránku", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    expect((await page.request.get(`/${renamed}`)).status()).toBe(200);
    await page.goto(`/admin/city-pages/${copyId}`);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Vymazať", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    expect((await page.request.get(`/${renamed}`, { maxRedirects: 0 })).status()).toBe(404);
    expect((await page.request.get(`/${firstSlug}`)).status()).toBe(200);
    expect(await db.blogPost.count()).toBe(blogCount);
    expect(errors).toEqual([]);
  } finally { await cleanup(ids); }
});

test("custom URL validation protects existing routes and automatic URLs resolve duplicates", async ({ page }) => {
  const ids = [];
  const title = `Betónové ploty Bratislava ${Date.now()}`;
  const first = await service.save({ title, status: "DRAFT" });
  expect(first.success).toBe(true); ids.push(first.id);
  try {
    await page.goto("/admin/city-pages/new");
    await page.getByLabel("Názov stránky *", { exact: true }).fill(title);
    const url = page.getByLabel("URL adresa *", { exact: true });
    for (const slug of ["katalog", first.slug]) {
      await url.fill(slug);
      await page.getByRole("button", { name: "Uložiť koncept", exact: true }).click();
      await expect(page.locator('p[role="alert"]')).toContainText(slug === "katalog" ? "vyhradená" : "už používa");
    }
    await url.fill("../escape");
    await url.evaluate((input) => input.removeAttribute("pattern"));
    await page.getByRole("button", { name: "Uložiť koncept", exact: true }).click();
    await expect(page.locator('p[role="alert"]')).toContainText("poslednú časť URL");
    await page.getByRole("button", { name: "Vytvoriť URL z názvu", exact: true }).click();
    await page.getByRole("button", { name: "Uložiť koncept", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/city-pages$/);
    const second = await db.strankaObsah.findFirstOrThrow({ where: { stranka: CITY_PAGE_KIND, obsah: { path: ["slug"], equals: `${first.slug}-2` } } });
    ids.push(second.id);
    expect(second.obsah.status).toBe("DRAFT");
    expect((await page.request.get(`/${first.slug}-2`)).status()).toBe(404);
    expect((await page.request.get("/katalog")).status()).toBe(200);
  } finally { await cleanup(ids); }
});

test("parallel duplicates have independent IDs and URLs; unrelated site settings are protected", async () => {
  const ids = [];
  const original = await service.save({ title: `Betónové ploty Senica ${Date.now()}`, status: "PUBLISHED", blocks: { version: 2, blocks: [{ type: "paragraph", content: "Obsah stránky pre Senicu." }] } });
  expect(original.success).toBe(true); ids.push(original.id);
  const unrelated = await db.strankaObsah.create({ data: { stranka: "global", sekcia: `city-test-unrelated-${Date.now()}`, obsah: { text: "Keep me" } } });
  try {
    const copies = await Promise.all([service.duplicate(original.id), service.duplicate(original.id)]);
    expect(copies.every((copy) => copy.success)).toBe(true);
    ids.push(...copies.filter((copy) => copy.success).map((copy) => copy.id));
    expect(new Set(copies.map((copy) => copy.slug)).size).toBe(2);
    for (const copy of copies) expect((await stored(copy.id)).status).toBe("DRAFT");
    expect((await service.save({ id: unrelated.id, title: "Overwrite?" })).success).toBe(false);
    expect((await service.duplicate(unrelated.id)).success).toBe(false);
    expect((await service.remove(unrelated.id)).success).toBe(false);
    expect((await db.strankaObsah.findUniqueOrThrow({ where: { id: unrelated.id } })).obsah).toEqual({ text: "Keep me" });
  } finally { await cleanup(ids); await db.strankaObsah.delete({ where: { id: unrelated.id } }); }
});
