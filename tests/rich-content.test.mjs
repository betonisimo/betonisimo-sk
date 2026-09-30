import test from "node:test";
import assert from "node:assert/strict";
import { normalizeContent, contentText, flattenBlocks, safeLink, safeImage, validatePublishedContent } from "../src/lib/rich-content.js";
import { validateImageFile } from "../src/lib/image-validation.js";

const legacy = [
  { type: "heading2", text: "Nadpis" },
  { type: "paragraph", text: "Prvý odsek.\nDruhý riadok." },
  { type: "link", url: "/katalog", label: "Naše vzory" },
  { type: "list", text: "Jeden\nDva" },
  { type: "image", url: "/og-image.jpg", alt: "Plot", caption: "Podpis" },
  { type: "heading3", text: "Podnadpis" },
];
test("legacy conversion preserves every supported block and its order", () => {
  const doc = normalizeContent(legacy, { strict: true });
  assert.deepEqual(doc.blocks.map((b) => b.type), ["heading", "paragraph", "paragraph", "bulletListItem", "bulletListItem", "photo", "heading"]);
  assert.equal(doc.blocks[2].content[0].href, "/katalog");
  assert.deepEqual(doc.blocks[5].props, { url: "/og-image.jpg", alt: "Plot", caption: "Podpis" });
  assert.match(contentText(doc), /Prvý odsek\.\nDruhý riadok\./);
  assert.deepEqual(normalizeContent(doc), doc);
  validatePublishedContent(doc);
});
test("rich text, links and nested lists survive a JSON round trip", () => {
  const doc = normalizeContent({ version: 2, blocks: [
    { type: "paragraph", content: [
      { type: "text", text: "Výber ", styles: { bold: true } },
      { type: "link", href: "https://example.com", content: [{ type: "text", text: "plotu", styles: { italic: true } }] },
    ] },
    { type: "numberedListItem", props: { start: 3 }, content: "Tri", children: [{ type: "bulletListItem", content: "Vnorený" }] },
  ] }, { strict: true });
  assert.deepEqual(normalizeContent(JSON.parse(JSON.stringify(doc))), doc);
  assert.equal(doc.blocks[0].content[0].styles.bold, true);
  assert.equal(doc.blocks[0].content[1].content[0].styles.italic, true);
  assert.equal(contentText(doc), "Výber plotu\nTri\nVnorený");
  assert.equal(flattenBlocks(doc).length, 3);
});
test("old realization text opens as a paragraph without losing line breaks", () => {
  assert.equal(contentText(normalizeContent(null, { fallback: "Prvý\nDruhý" })), "Prvý\nDruhý");
});
test("unsafe links/images cannot be stored or rendered", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,x", "//evil.test", "/\\evil.test", "https://a.test/\nx", "https://user:pass@a.test"]) assert.equal(safeLink(url), "");
  for (const url of ["/katalog", "https://example.com/a?b=1", "#sekcia"]) assert.equal(safeLink(url), url);
  assert.equal(safeImage("https://evil.test/file.svg"), "");
  assert.equal(safeImage("https://store.public.blob.vercel-storage.com/a.webp"), "https://store.public.blob.vercel-storage.com/a.webp");
  const input = { version: 2, blocks: [{ type: "paragraph", content: [{ type: "link", href: "javascript:alert(1)", content: "keep text" }] }] };
  assert.throws(() => normalizeContent(input, { strict: true }), /Odkaz/);
  assert.equal(contentText(input), "keep text");
  assert.equal(normalizeContent(input).blocks[0].content[0].type, "text");
});
test("publication checks include nested image alt and actual paragraph text", () => {
  assert.throws(() => validatePublishedContent(normalizeContent(null)), /odsek/);
  const input = { version: 2, blocks: [{ type: "paragraph", content: "Text", children: [{ type: "photo", props: { url: "/og-image.jpg", alt: "" } }] }] };
  assert.throws(() => validatePublishedContent(input), /alt/);
});
test("unknown format and excessive depth/count fail without silently saving partial content", () => {
  assert.throws(() => normalizeContent({ version: 99, blocks: [] }, { strict: true }), /formát/);
  assert.throws(() => normalizeContent({ version: 2, blocks: [{ type: "html", content: "<script/>" }] }, { strict: true }), /typ/);
  assert.throws(() => normalizeContent({ version: 2, blocks: Array.from({ length: 501 }, () => ({ type: "paragraph", content: "x" })) }, { strict: true }), /500 blokov/);
  let nested = { type: "paragraph", content: "Text" };
  for (let i = 0; i < 10; i++) nested = { type: "paragraph", content: "Text", children: [nested] };
  assert.throws(() => normalizeContent({ version: 2, blocks: [nested] }, { strict: true }), /úrovní/);
});
test("upload validation rejects disguised files, wrong MIME and oversize images", async () => {
  const png = new File([new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])], "photo.png", { type: "image/png" });
  assert.equal(await validateImageFile(png), "png");
  await assert.rejects(validateImageFile(new File(["<svg/>"], "photo.png", { type: "image/png" })), /skutočné/);
  await assert.rejects(validateImageFile(new File([await png.arrayBuffer()], "fake.jpg", { type: "image/jpeg" })), /skutočné/);
  await assert.rejects(validateImageFile(new File([new Uint8Array(3 * 1024 * 1024 + 1)], "big.png", { type: "image/png" })), /veľký/);
});
