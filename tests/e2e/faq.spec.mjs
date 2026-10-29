import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { VZORY_FAQ_SECTION } from "../../src/lib/vzory-faq.js";

// These tests write fixtures, never real site content or production settings.
const target = new URL(process.env.DATABASE_URL || "");
if (target.hostname !== "127.0.0.1" || target.port !== "55439" || target.username !== "editor_test" || target.pathname !== "/editor_test") {
  throw new Error("Use the isolated local editor_test database on port 55439.");
}
const db = new PrismaClient();
test.use({ baseURL: process.env.FAQ_TEST_BASE_URL || "http://localhost:3100" });
test.afterAll(() => db.$disconnect());

test("one shared FAQ: admin save/reload/reorder/delete, SSR on every vzor, no FAQ on doplnky", async ({ page, browser }, testInfo) => {
  test.setTimeout(120000);
  await page.route(/https:\/\/(?:cdn-cookieyes\.com|www\.googletagmanager\.com|www\.facebook\.com)\//, (route) => route.abort());
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const suffix = Date.now();
  const record = { title: "Testovací vzor", subtitle: "Podnadpis", description: "Popis vzoru s technickými údajmi.", mainImage: "/og-image.jpg", gallery: ["/og-image.jpg"] };
  const originalFaq = await db.strankaObsah.findUnique({ where: { sekcia: VZORY_FAQ_SECTION } });
  const collections = [];
  let accessory;
  try {
    for (const name of ["a", "b"]) collections.push(await db.collection.create({ data: { ...record, slug: `e2e-faq-${suffix}-${name}` } }));
    accessory = await db.accessory.create({ data: { ...record, slug: `e2e-faq-doplnok-${suffix}`, price: "19.95" } });
    await db.strankaObsah.upsert({
      where: { sekcia: VZORY_FAQ_SECTION },
      update: { obsah: { items: [] } },
      create: { stranka: "global", sekcia: VZORY_FAQ_SECTION, obsah: { items: [] } },
    });
    const before = await page.request.get(`/katalog/${collections[0].slug}`);
    expect(before.ok()).toBe(true);
    expect(await before.text()).not.toContain('id="vzory-faq-title"');

    await page.goto("/admin/faq");
    await expect(page).toHaveURL(/\/auth\/signin/);
    await page.getByPlaceholder("ADMIN_ID").fill("editor-local-test");
    await page.getByPlaceholder("ACCESS_CODE").fill("editor-local-test-only");
    await page.getByRole("button", { name: "Execute_Login" }).click();
    await expect(page).toHaveURL(/\/admin\/editor/);
    await page.goto("/admin");
    await page.getByRole("link", { name: /FAQ pre vzory/ }).click();
    await expect(page.getByRole("heading", { name: "FAQ pre vzory" })).toBeVisible();

    const firstQuestion = "Ako si môžem objednať vzor?";
    const firstAnswer = "Napíšte nám.\n\nDohodneme si ďalšie podrobnosti.";
    const secondQuestion = "Ako prebieha doprava a montáž?";
    const secondAnswer = 'Podrobnosti dohodneme individuálne.\n<script>window.__faqExecuted = true</script>';
    await page.getByRole("button", { name: "Pridať otázku", exact: true }).click();
    await page.getByLabel("Otázka 1 *", { exact: true }).fill(firstQuestion);
    await page.getByLabel("Odpoveď 1 *", { exact: true }).fill(firstAnswer);
    await page.getByRole("button", { name: "Pridať otázku", exact: true }).click();
    await page.getByLabel("Otázka 2 *", { exact: true }).fill(secondQuestion);
    await page.getByLabel("Odpoveď 2 *", { exact: true }).fill(secondAnswer);
    await page.getByRole("button", { name: "Pridať otázku", exact: true }).click();
    await page.getByRole("button", { name: "Odstrániť otázku 3", exact: true }).click();
    await page.getByRole("button", { name: "Presunúť otázku 2 vyššie", exact: true }).click();
    await expect(page.getByLabel("Otázka 1 *", { exact: true })).toHaveValue(secondQuestion);
    await expect(page.getByLabel("Odpoveď 2 *", { exact: true })).toHaveValue(firstAnswer);
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "FAQ bolo uložené" })).toBeVisible();

    const stored = await db.strankaObsah.findUniqueOrThrow({ where: { sekcia: VZORY_FAQ_SECTION } });
    expect(stored.obsah.items).toEqual([
      { question: secondQuestion, answer: secondAnswer },
      { question: firstQuestion, answer: firstAnswer },
    ]);
    expect(await db.strankaObsah.count({ where: { sekcia: VZORY_FAQ_SECTION } })).toBe(1);
    for (const collection of collections) {
      const response = await page.request.get(`/katalog/${collection.slug}`);
      expect(response.ok()).toBe(true);
      const html = await response.text();
      expect(html).toContain('id="vzory-faq-title"');
      expect(html).toContain(firstQuestion);
      expect(html).toContain(secondQuestion);
      expect(html).toContain("&lt;script&gt;window.__faqExecuted = true&lt;/script&gt;");
      expect(html).not.toContain('"@type":"FAQPage"');
    }
    expect(await (await page.request.get(`/doplnky/${accessory.slug}`)).text()).not.toContain('id="vzory-faq-title"');
    expect(await (await page.request.get("/katalog")).text()).not.toContain('id="vzory-faq-title"');

    await page.goto(`/katalog/${collections[0].slug}`);
    const faq = page.getByRole("region", { name: "Často kladené otázky" });
    await expect(faq.locator("details")).toHaveCount(2);
    const firstSummary = faq.locator("summary").first();
    await firstSummary.focus();
    await page.keyboard.press("Enter");
    await expect(faq.locator("details").first()).toHaveAttribute("open", "");
    expect(await page.evaluate(() => window.__faqExecuted)).toBeUndefined();
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await faq.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(firstSummary).toBeInViewport();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await faq.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("faq-mobile.png") });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await faq.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("faq-desktop.png") });

    const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    try {
      const publicPage = await noScript.newPage();
      await publicPage.goto(new URL(`/katalog/${collections[1].slug}`, page.url()).toString());
      const publicFaq = publicPage.getByRole("region", { name: "Často kladené otázky" });
      await expect(publicFaq).toContainText(firstAnswer);
      await publicFaq.locator("summary").first().click();
      await expect(publicFaq.locator("details").first()).toHaveAttribute("open", "");
    } finally { await noScript.close(); }

    await page.goto("/admin/faq");
    await expect(page.getByLabel("Otázka 1 *", { exact: true })).toHaveValue(secondQuestion);
    await page.getByRole("button", { name: "Presunúť otázku 1 nižšie", exact: true }).click();
    await expect(page.getByLabel("Otázka 1 *", { exact: true })).toHaveValue(firstQuestion);
    const updatedAnswer = "Aktualizovaná spoločná odpoveď pre každý vzor.";
    await page.getByLabel("Odpoveď 1 *", { exact: true }).fill(updatedAnswer);
    await page.getByRole("button", { name: "Odstrániť otázku 2", exact: true }).click();
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "FAQ bolo uložené" })).toBeVisible();
    for (const collection of collections) {
      const html = await (await page.request.get(`/katalog/${collection.slug}`)).text();
      expect(html).toContain(updatedAnswer);
      expect(html).not.toContain(secondQuestion);
    }
    await page.getByRole("button", { name: "Odstrániť otázku 1", exact: true }).click();
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "FAQ bolo uložené" })).toBeVisible();
    for (const collection of collections) {
      expect(await (await page.request.get(`/katalog/${collection.slug}`)).text()).not.toContain('id="vzory-faq-title"');
    }
    expect(errors).toEqual([]);
  } finally {
    if (originalFaq) await db.strankaObsah.upsert({
      where: { sekcia: VZORY_FAQ_SECTION },
      update: { stranka: originalFaq.stranka, obsah: originalFaq.obsah },
      create: { stranka: originalFaq.stranka, sekcia: VZORY_FAQ_SECTION, obsah: originalFaq.obsah },
    });
    else await db.strankaObsah.deleteMany({ where: { sekcia: VZORY_FAQ_SECTION } });
    await db.collection.deleteMany({ where: { id: { in: collections.map((item) => item.id) } } });
    if (accessory) await db.accessory.delete({ where: { id: accessory.id } });
  }
});
