import { contentText, normalizeContent, safeImage, validatePublishedContent } from "./rich-content.js";

const field = (value, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";
export function validId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error("Neplatné ID záznamu.");
  return id;
}
function images(value, json = false) {
  const list = Array.isArray(value) ? value : json ? JSON.parse(value || "[]") : String(value || "").split(",").filter(Boolean);
  if (!Array.isArray(list) || list.length > 100) throw new Error("Neplatný zoznam fotografií.");
  return [...new Set(list.map((url) => {
    const clean = safeImage(url);
    if (!clean) throw new Error("Neplatná adresa fotografie.");
    return clean;
  }))];
}

export function cleanCatalog(input, kind) {
  const gallery = images(input.gallery);
  const mainImage = gallery[0] || safeImage(input.mainImage);
  const result = { title: field(input.title), subtitle: field(input.subtitle, 300), description: field(input.description, 50000), mainImage, gallery };
  if (!result.title || !result.subtitle || !result.description) throw new Error("Vyplňte názov, podnadpis a popis.");
  if (!mainImage) throw new Error("Pridajte aspoň jednu fotografiu.");
  if (kind === "accessory") {
    const price = String(input.price ?? "").trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) > 99999999.99) throw new Error("Zadajte platnú cenu od 0 do 99 999 999,99 €.");
    result.price = price;
  }
  return result;
}

export function cleanProject(input) {
  const content = normalizeContent(input.content, { strict: true, fallback: input.description || "" });
  validatePublishedContent(content);
  const result = { title: field(input.title), category: field(input.category), location: field(input.location) || null, description: contentText(content), content, mainImage: safeImage(input.mainImage), images: images(input.images, true) };
  if (!result.title || !result.category || !result.mainImage) throw new Error("Vyplňte názov, kategóriu a hlavnú fotografiu realizácie.");
  return result;
}
