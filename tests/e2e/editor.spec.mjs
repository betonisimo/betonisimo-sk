import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// Hard stop: these tests create/delete fixtures, and must never run on a live database.
const dbUrl = new URL(process.env.DATABASE_URL || "");
if (dbUrl.hostname !== "127.0.0.1" || dbUrl.port !== "55439" || dbUrl.username !== "editor_test") throw new Error("Set DATABASE_URL to the isolated local editor database.");
const db = new PrismaClient();
const photo = "/og-image.jpg";
const errors = [];
test.afterAll(async () => db.$disconnect());
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false })));
  await page.goto("/auth/signin");
  await page.getByPlaceholder("ADMIN_ID").fill("editor-local-test");
  await page.getByPlaceholder("ACCESS_CODE").fill("editor-local-test-only");
  await page.getByRole("button", { name: "Execute_Login" }).click();
  await expect(page).toHaveURL(/\/admin\/editor/);
});
test.afterEach(() => expect(errors).toEqual([]));

async function selectText(page, text) {
  await page.locator(".bn-editor").evaluate((element, value) => {
    element.focus();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const offset = node.textContent.indexOf(value);
      if (offset !== -1) {
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset + value.length);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.dispatchEvent(new Event("selectionchange"));
        return;
      }
    }
    throw new Error("Text not found: " + value);
  }, text);
}

async function fixtureImage(page, name, altName = "imageAlts") {
  // Pre-existing media fixture: Blob upload is deliberately not contacted by E2E.
  await page.locator(`input[name="${name}"]`).evaluate((input, value) => { input.value = value; }, photo);
  await page.locator(`input[name="${altName}"]`).evaluate((input, value) => { input.value = value; }, altName === "imageAlts" ? JSON.stringify({ [photo]: "Testovací plot" }) : "Testovací plot");
}

for (const [folder, model, label] of [["collections", "collection", "vzor"], ["accessories", "accessory", "doplnok"]]) {
  test(`shared catalog: create, edit, stable URL and confirmed delete – ${folder}`, async ({ page }) => {
    const title = `E2E ${label} ${Date.now()}`;
    await page.goto(`/admin/${folder}/new`);
    await page.getByLabel("Názov", { exact: false }).first().fill(title);
    await page.getByLabel("Podnadpis *", { exact: true }).fill("Podnadpis");
    await page.getByLabel("Popis *", { exact: true }).fill("Popis pre verejnú stránku.");
    if (model === "accessory") await page.getByLabel("Cena (€) *").fill("19.95");
    else await expect(page.locator('input[name="price"]')).toHaveCount(0);
    await fixtureImage(page, "gallery");
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#/);
    let item = await db[model].findFirstOrThrow({ where: { title } });
    const slug = item.slug;
    expect(item.mainImage).toBe(photo);
    if (model === "accessory") expect(item.price.toString()).toBe("19.95");
    await page.goto(`/admin/${folder}/${item.id}`);
    await page.getByLabel("Názov", { exact: false }).first().fill(title + " upravené");
    await page.getByLabel("Popis fotografie (alt)").fill("Upravený alt");
    await page.getByLabel("Nadpis vo vyhľadávaní (meta title)").fill("SEO katalóg");
    await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#/);
    item = await db[model].findUniqueOrThrow({ where: { id: item.id } });
    expect(item.slug).toBe(slug);
    expect((await db.strankaObsah.findUniqueOrThrow({ where: { sekcia: `seo-${model}-${item.id}` } })).obsah.imageAlts[photo]).toBe("Upravený alt");
    await page.goto(`/admin/${folder}/${item.id}`);
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Vymazať", exact: true }).click();
    expect(await db[model].findUnique({ where: { id: item.id } })).not.toBeNull();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Vymazať", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/editor#/);
    expect(await db[model].findUnique({ where: { id: item.id } })).toBeNull();
  });
}

test("legacy article: inline link create/edit/remove, formatting, image alt, save and server rendering", async ({ page }) => {
  const original = await db.blogPost.create({ data: { title: "E2E pôvodný článok", slug: "e2e-legacy-" + Date.now(), excerpt: "Úvod článku", coverImage: photo, coverAlt: "Plot", status: "PUBLISHED", publishedAt: new Date("2026-09-01T12:00:00Z"), blocks: [
    { type: "heading2", text: "Pôvodný nadpis" }, { type: "paragraph", text: "Vyberte kvalitný betónový plot pre svoj dom." },
    { type: "list", text: "Kvalita\nŽivotnosť" }, { type: "image", url: photo, alt: "Pôvodné foto", caption: "Podpis" },
  ] } });
  await page.goto(`/admin/blog/${original.id}`);
  await expect(page.getByRole("textbox", { name: "Obsah – blokový editor" })).toBeVisible();
  await expect(page.locator(".editor-photo img")).toHaveAttribute("src", photo);
  await selectText(page, "betónový plot");
  await page.getByRole("button", { name: "Odkaz na označený text", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Adresa odkazu", { exact: true }).fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Uložiť odkaz" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  await page.getByLabel("Adresa odkazu", { exact: true }).fill("/katalog");
  await page.getByRole("button", { name: "Uložiť odkaz" }).click();
  await expect(page.locator(".bn-editor").getByRole("link", { name: "betónový plot" })).toHaveAttribute("href", "/katalog");
  await selectText(page, "betónový plot");
  await page.keyboard.press("Control+k");
  await page.getByLabel("Adresa odkazu", { exact: true }).fill("/doplnky");
  await page.getByRole("button", { name: "Uložiť odkaz" }).click();
  await selectText(page, "betónový plot");
  await page.getByRole("button", { name: "Odkaz na označený text", exact: true }).click();
  await page.getByRole("button", { name: "Odstrániť odkaz" }).click();
  await expect(page.locator(".bn-editor a")).toHaveCount(0);
  await selectText(page, "betónový plot");
  await page.keyboard.press("Control+b");
  await selectText(page, "betónový plot");
  await page.getByRole("button", { name: "Odkaz na označený text", exact: true }).click();
  await page.getByLabel("Adresa odkazu", { exact: true }).fill("/katalog");
  await page.getByRole("button", { name: "Uložiť odkaz" }).click();
  await page.getByLabel("Alternatívny popis (alt) *", { exact: true }).fill("Nový alt fotografie");
  await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);
  const saved = await db.blogPost.findUniqueOrThrow({ where: { id: original.id } });
  expect(saved.blocks.version).toBe(2);
  expect(saved.slug).toBe(original.slug);
  expect(saved.publishedAt.toISOString()).toBe(original.publishedAt.toISOString());
  const response = await page.request.get("/blog/" + saved.slug);
  const html = await response.text();
  expect(response.status()).toBe(200);
  expect(html).toContain('href="/katalog"');
  expect(html).toContain("<strong>betónový plot</strong>");
  expect(html).toContain('alt="Nový alt fotografie"');
  expect(html).toContain("Pôvodný nadpis");
  await page.goto(`/admin/blog/${original.id}`);
  await expect(page.locator(".bn-editor a")).toHaveAttribute("href", "/katalog");
});

test("blog: create draft, publish, unpublish and delete; draft never appears in public sitemap", async ({ page }) => {
  const title = "E2E nový článok " + Date.now();
  await page.goto("/admin/blog/new");
  await page.getByLabel("Názov článku *", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Uložiť koncept", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);
  const post = await db.blogPost.findFirstOrThrow({ where: { title } });
  expect(post.status).toBe("DRAFT");
  expect((await page.request.get("/blog/" + post.slug)).status()).toBe(404);
  expect(await (await page.request.get("/sitemap.xml")).text()).not.toContain(post.slug);
  await page.goto("/admin/blog/" + post.id);
  await page.getByLabel("Krátky úvod pre kartu článku").fill("Úvod nového článku.");
  await page.getByRole("textbox", { name: "Obsah – blokový editor" }).fill("Text nového článku.");
  await fixtureImage(page, "coverImage", "coverAlt");
  await page.getByRole("button", { name: "Publikovať článok" }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);
  expect((await page.request.get("/blog/" + post.slug)).status()).toBe(200);
  expect(await (await page.request.get("/sitemap.xml")).text()).toContain(post.slug);
  await page.goto("/admin/blog/" + post.id);
  await page.getByRole("button", { name: "Presunúť medzi koncepty" }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);
  expect((await page.request.get("/blog/" + post.slug)).status()).toBe(404);
  await page.goto("/admin/blog/" + post.id);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Vymazať", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);
  expect(await db.blogPost.findUnique({ where: { id: post.id } })).toBeNull();
});

test("realization: legacy fallback, rich save, original gallery, metadata and stable URL", async ({ page }) => {
  const project = await db.project.create({ data: { title: "E2E realizácia", slug: "e2e-project-" + Date.now(), category: "Moderné línie", description: "Pôvodný text realizácie.", mainImage: photo, images: [photo], location: "Jelka" } });
  const before = await (await page.request.get("/projekt/" + project.slug)).text();
  expect(before).toContain(project.description);
  await page.goto("/admin/projects/" + project.id);
  await expect(page.getByRole("textbox", { name: "Obsah – blokový editor" })).toContainText(project.description);
  await page.getByRole("textbox", { name: "Obsah – blokový editor" }).fill("Nový popis realizácie so zachovanou galériou.");
  await page.getByLabel("Nadpis vo vyhľadávaní (meta title)").fill("SEO realizácia");
  await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/editor#realizacie/);
  const saved = await db.project.findUniqueOrThrow({ where: { id: project.id } });
  expect(saved.content.version).toBe(2);
  expect(saved.images).toEqual([photo]);
  expect(saved.description).toBe("Nový popis realizácie so zachovanou galériou.");
  expect(saved.slug).toBe(project.slug);
  const html = await (await page.request.get("/projekt/" + saved.slug)).text();
  expect(html).toContain("Nový popis realizácie");
  expect(html).toContain("<title>SEO realizácia</title>");
});

test("mobile: no horizontal overflow, slash menu and photo controls remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/blog/new");
  const editor = page.getByRole("textbox", { name: "Obsah – blokový editor" });
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", /interactive-widget=resizes-content/);
  await editor.fill("/");
  await expect(page.getByRole("option", { name: /Nadpis 2/ })).toBeVisible();
  await page.getByRole("option", { name: /Nadpis 2/ }).click();
  await page.keyboard.type("Mobilny nadpis");
  await expect(page.locator(".bn-editor h2")).toContainText("Mobilny nadpis");
  await page.getByRole("button", { name: "Fotografia", exact: true }).click();
  await expect(page.getByLabel("Alternatívny popis (alt) *", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/editor-mobile.png", fullPage: true });
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.goto("/admin/accessories/1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("realization: create and confirmed delete using the shared editor", async ({ page }) => {
  const title = "E2E nová realizácia " + Date.now();
  await page.goto("/admin/projects/new");
  await page.getByLabel("Názov realizácie *").fill(title);
  await page.getByLabel("Kategória / štýl *").fill("Moderné línie");
  await page.getByRole("textbox", { name: "Obsah – blokový editor" }).fill("Popis novej realizácie.");
  await fixtureImage(page, "mainImage", "mainImageAlt");
  await page.getByRole("button", { name: "Uložiť zmeny", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/editor#realizacie/);
  const project = await db.project.findFirstOrThrow({ where: { title } });
  expect(project.content.version).toBe(2);
  await page.goto("/admin/projects/" + project.id);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Vymazať", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/editor#realizacie/);
  expect(await db.project.findUnique({ where: { id: project.id } })).toBeNull();
});

test("block ordering and undo keep the same content", async ({ page }) => {
  const post = await db.blogPost.create({ data: { title: "E2E poradie", slug: "e2e-order-" + Date.now(), excerpt: "", coverImage: "", coverAlt: "", blocks: [{ type: "paragraph", text: "Prvy odsek" }, { type: "paragraph", text: "Druhy odsek" }] } });
  await page.goto("/admin/blog/" + post.id);
  await expect(page.getByRole("textbox", { name: "Obsah – blokový editor" })).toBeVisible();
  await page.locator('.bn-block-content[data-content-type="paragraph"]').filter({ hasText: "Druhy odsek" }).click();
  await page.locator('.bn-block-content[data-content-type="paragraph"]').filter({ hasText: "Druhy odsek" }).hover();
  await page.getByRole("button", { name: "Otvoriť menu bloku" }).click();
  await page.getByRole("menuitem", { name: "Posunúť vyššie" }).click();
  await expect(page.locator('.bn-block-content[data-content-type="paragraph"]').first()).toHaveText("Druhy odsek");
  await page.getByRole("button", { name: "Späť (Ctrl+Z)" }).click();
  await expect(page.locator('.bn-block-content[data-content-type="paragraph"]').first()).toHaveText("Prvy odsek");
  await page.getByRole("button", { name: "Znova (Ctrl+Shift+Z)" }).click();
  await expect(page.locator('.bn-block-content[data-content-type="paragraph"]').first()).toHaveText("Druhy odsek");
});

test("upload is compressed, saving is locked in flight, failure is visible and retry remains possible", async ({ page }) => {
  await page.goto("/admin/blog/new");
  await page.getByLabel("Názov článku *").fill("Neuložený test nahrávania");
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  let observed;
  const arrived = new Promise((resolve) => { observed = resolve; });
  await page.route("**/admin/blog/new", async (route) => {
    if (route.request().method() === "POST" && route.request().headers()["next-action"]) {
      const body = route.request().postDataBuffer();
      observed(body);
      await pending;
      await route.abort("failed");
    } else await route.continue();
  });
  await page.getByLabel("Nahrať fotografie: coverImage").setInputFiles("public/og-image.jpg");
  const body = await arrived;
  try {
    expect(body.toString("latin1")).toContain("image/webp");
    expect(body.length).toBeLessThan(1024 * 1024);
    await expect(page.getByRole("button", { name: "Uložiť koncept", exact: true })).toBeDisabled();
    await expect(page.getByRole("status")).toContainText("Nahrávajú");
  } finally { finish(); }
  await expect(page.locator('p[role="alert"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Uložiť koncept", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Pridať fotografiu", exact: true })).toBeEnabled();
});
