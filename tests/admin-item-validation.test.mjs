import test from "node:test";
import assert from "node:assert/strict";
import { cleanCatalog, cleanProject, validId } from "../src/lib/admin-item-validation.js";
const input = { title: "Vzor", subtitle: "Podnadpis", description: "Popis", gallery: "/og-image.jpg", price: "12,50" };
test("catalog uses first photo as cover and only accessories have a price", () => {
  const collection = cleanCatalog(input, "collection");
  assert.equal(collection.mainImage, "/og-image.jpg");
  assert.equal("price" in collection, false);
  assert.equal(cleanCatalog(input, "accessory").price, "12.50");
});
test("server rejects missing fields, invalid prices and invalid image URLs", () => {
  for (const price of ["-1", "NaN", "1.005", "100000000", ""]) assert.throws(() => cleanCatalog({ ...input, price }, "accessory"), /cenu/);
  assert.equal(cleanCatalog({ ...input, price: "0" }, "accessory").price, "0");
  assert.throws(() => cleanCatalog({ ...input, title: "" }, "collection"), /Vyplňte/);
  assert.throws(() => cleanCatalog({ ...input, gallery: "" }, "collection"), /fotografiu/);
  assert.throws(() => cleanCatalog({ ...input, gallery: "javascript:alert(1)" }, "collection"), /adresa/);
  for (const value of ["bad", 0, -1, 2.5]) assert.throws(() => validId(value), /ID/);
});
test("realization stores rich content and matching plain-text SEO fallback", () => {
  const content = { version: 2, blocks: [{ type: "paragraph", content: [{ type: "text", text: "Bohatý text", styles: { bold: true } }] }] };
  const project = cleanProject({ title: "Projekt", category: "Štýl", location: "Jelka", mainImage: "/og-image.jpg", images: '["/og-image.jpg"]', content });
  assert.equal(project.description, "Bohatý text");
  assert.equal(project.content.blocks[0].content[0].styles.bold, true);
  assert.deepEqual(project.images, ["/og-image.jpg"]);
});
