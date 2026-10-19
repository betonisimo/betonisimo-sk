import { test, expect } from "@playwright/test";

// Read-only smoke tests against a running local site; no admin login or database writes.
test.use({
  baseURL: process.env.GALLERY_BASE_URL || "http://127.0.0.1:3000",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function transform(photo) {
  return photo.locator("..").evaluate((wrapper) => {
    const matrix = new DOMMatrix(getComputedStyle(wrapper).transform);
    return { scale: matrix.a, x: matrix.e, y: matrix.f };
  });
}

async function pinch(session, page, center, from, to) {
  // Separate gestures from the viewer's intentional double-tap shortcut.
  await page.waitForTimeout(350);
  const points = (radius) => [
    { x: center.x - radius, y: center.y, id: 1 },
    { x: center.x + radius, y: center.y, id: 2 },
  ];
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: points(from) });
  for (let step = 1; step <= 10; step++) {
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: points(from + (to - from) * step / 10) });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

for (const gallery of [
  { name: "Vzory", listing: "/katalog", prefix: "/katalog/", opener: "Zväčšiť fotografiu" },
  { name: "Doplnky", listing: "/doplnky", prefix: "/doplnky/", opener: "Zväčšiť fotografiu" },
  { name: "Realizácie", listing: "/realizacie", prefix: "/projekt/", opener: "Zväčšiť fotografiu 1" },
]) {
  test(`${gallery.name}: pinch, pan, zoom reset and existing navigation`, async ({ page, context }) => {
    await page.route(/https:\/\/(?:cdn-cookieyes\.com|www\.googletagmanager\.com)\//, (route) => route.abort());
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(gallery.listing);
    const links = [...new Set(await page.locator(`a[href^="${gallery.prefix}"]`).evaluateAll((items) => items.map((item) => item.getAttribute("href"))))];
    expect(links.length, "The local catalog needs at least one record with a photo").toBeGreaterThan(0);
    await page.goto(links.at(-1));
    await page.getByRole("button", { name: gallery.opener, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /^Fotografie:/ });
    const photo = dialog.locator(".yarl__slide_image");
    await expect(photo).toBeVisible();
    await expect.poll(() => photo.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    const initialScroll = await page.evaluate(() => window.scrollY);
    const box = await photo.boundingBox();
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const session = await context.newCDPSession(page);

    await pinch(session, page, center, 35, 130);
    await expect.poll(async () => (await transform(photo)).scale).toBeGreaterThan(1.4);
    const enlarged = await transform(photo);
    await page.waitForTimeout(350);
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...center, id: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: center.x + 60, y: center.y + 20, id: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(async () => Math.abs((await transform(photo)).x - enlarged.x)).toBeGreaterThan(10);
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);

    await pinch(session, page, center, 130, 15);
    await expect.poll(async () => (await transform(photo)).scale).toBeCloseTo(1, 2);

    const next = dialog.getByRole("button", { name: "Nasledujúca fotografia", exact: true }).filter({ visible: true });
    if (await next.count()) {
      await pinch(session, page, center, 35, 130);
      await expect.poll(async () => (await transform(photo)).scale).toBeGreaterThan(1.4);
      const firstSrc = await photo.getAttribute("src");
      await next.click();
      await expect(photo).not.toHaveAttribute("src", firstSrc);
      await expect.poll(async () => (await transform(photo)).scale).toBeCloseTo(1, 2);
      await dialog.getByRole("button", { name: "Predchádzajúca fotografia", exact: true }).filter({ visible: true }).click();
      await expect(photo).toHaveAttribute("src", firstSrc);
    }

    await dialog.getByRole("button", { name: "Zavrieť fotografiu", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button", { name: gallery.opener, exact: true }).click();
    await expect(photo).toBeVisible();
    await expect.poll(async () => (await transform(photo)).scale).toBeCloseTo(1, 2);
    expect(errors).toEqual([]);
    await session.detach();
  });
}
