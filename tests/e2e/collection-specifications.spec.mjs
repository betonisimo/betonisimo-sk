import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const dbUrl = new URL(process.env.DATABASE_URL || "");
if (dbUrl.hostname !== "127.0.0.1" || dbUrl.port !== "55439" || dbUrl.username !== "editor_test") throw new Error("Use the isolated local editor database.");
const db = new PrismaClient();
test.afterAll(() => db.$disconnect());

test("vzor specifications save, reload and render independently; new vzory and doplnky keep their own forms", async ({ page }) => {
  await page.route(/https:\/\/(?:cdn-cookieyes\.com|www\.googletagmanager\.com)\//, (route) => route.abort());
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const slugPrefix = `e2e-specifications-${Date.now()}`;
  const common = { title: "Testovací vzor", subtitle: "Podnadpis", description: "Popis vzoru", mainImage: "/og-image.jpg", gallery: ["/og-image.jpg"] };
  const first = await db.collection.create({ data: { ...common, slug: `${slugPrefix}-a` } });
  const second = await db.collection.create({ data: { ...common, slug: `${slugPrefix}-b` } });
  const globalBefore = await db.strankaObsah.findUnique({ where: { sekcia: "vyhody" } });
  let createdId;
  try {
    const before = await (await page.request.get(`/katalog/${second.slug}`)).text();
    expect(before).toContain("Technical_Specifications");
    await page.goto("/auth/signin");
    await page.getByPlaceholder("ADMIN_ID").fill("editor-local-test");
    await page.getByPlaceholder("ACCESS_CODE").fill("editor-local-test-only");
    await page.getByRole("button", { name: "Execute_Login" }).click();
    await expect(page).toHaveURL(/\/admin\/editor/);

    await page.goto(`/admin/collections/${first.id}`);
    await page.getByLabel("Nadpis bloku *", { exact: true }).fill("Technické údaje Q1");
    await page.getByLabel("Názov údaja 1 *", { exact: true }).fill("Rozmery panela");
    await page.getByLabel("Hodnota údaja 1 *", { exact: true }).fill("200 × 50 cm");
    await page.getByLabel("Názov údaja 4 *", { exact: true }).fill("Montáž");
    await page.getByLabel("Hodnota údaja 4 *", { exact: true }).fill("Podľa dohody");
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#kolekcie/);
    const saved = await db.strankaObsah.findUniqueOrThrow({ where: { sekcia: `collection-specifications-${first.id}` } });
    expect(saved.obsah.title).toBe("Technické údaje Q1");
    expect(saved.obsah.items[0]).toEqual({ label: "Rozmery panela", value: "200 × 50 cm" });
    expect(await db.strankaObsah.findUnique({ where: { sekcia: `collection-specifications-${second.id}` } })).toBeNull();
    expect(await db.strankaObsah.findUnique({ where: { sekcia: "vyhody" } })).toEqual(globalBefore);
    const html = await (await page.request.get(`/katalog/${first.slug}`)).text();
    expect(html).toContain("Technické údaje Q1");
    expect(html).toContain("200 × 50 cm");
    expect(html).toContain("Podľa dohody");
    expect(await (await page.request.get(`/katalog/${second.slug}`)).text()).not.toContain("200 × 50 cm");
    await page.goto(`/admin/collections/${first.id}`);
    await expect(page.getByLabel("Hodnota údaja 1 *", { exact: true })).toHaveValue("200 × 50 cm");
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Vymazať", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#kolekcie/);
    expect(await db.strankaObsah.findUnique({ where: { sekcia: `collection-specifications-${first.id}` } })).toBeNull();

    await page.goto("/admin/collections/new");
    await expect(page.getByLabel("Nadpis bloku *", { exact: true })).toHaveValue("Technical_Specifications");
    const newTitle = `Nový vzor s údajmi ${slugPrefix}`;
    await page.getByLabel("Názov *", { exact: true }).fill(newTitle);
    await page.getByLabel("Podnadpis *", { exact: true }).fill("Podnadpis");
    await page.getByLabel("Popis *", { exact: true }).fill("Popis nového vzoru");
    await page.getByLabel("Nadpis bloku *", { exact: true }).fill("Vlastnosti nového vzoru");
    await page.locator('input[name="gallery"]').evaluate((input) => { input.value = "/og-image.jpg"; });
    await page.locator('input[name="imageAlts"]').evaluate((input) => { input.value = JSON.stringify({ "/og-image.jpg": "Vzor" }); });
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#kolekcie/);
    const created = await db.collection.findFirstOrThrow({ where: { title: newTitle } });
    createdId = created.id;
    expect((await db.strankaObsah.findUniqueOrThrow({ where: { sekcia: `collection-specifications-${created.id}` } })).obsah.title).toBe("Vlastnosti nového vzoru");
    await page.goto(`/admin/collections/${created.id}`);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Vymazať", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#kolekcie/);
    await page.goto("/admin/accessories/new");
    await expect(page.locator('input[name="specificationsTitle"]')).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  } finally {
    const ids = [first.id, second.id, createdId].filter(Boolean);
    await db.collection.deleteMany({ where: { id: { in: ids } } });
    await db.strankaObsah.deleteMany({ where: { sekcia: { in: ids.flatMap((id) => [`collection-specifications-${id}`, `seo-collection-${id}`]) } } });
  }
});
