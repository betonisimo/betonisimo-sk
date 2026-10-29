"use server";

import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/actions/uploadActions";
import { cleanCatalog, cleanProject, validId } from "@/lib/admin-item-validation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { getSeoMany, seoSection, writeSeo } from "@/lib/seo";
import { COLLECTION_SPECIFICATIONS_PREFIX, collectionSpecificationsSection, parseCollectionSpecifications } from "@/lib/collection-specifications";
import { CATALOG_PATHS, URL_TAKEN, catalogTransaction, prepareCatalogUrl, rememberCatalogUrls } from "@/lib/catalog-urls";

/**
 * СОХРАНЕНИЕ ОБЩЕГО КОНТЕНТА (Hero, Footer, About и т.д.)
 */
export async function saveContent(stranka, sekcia, obsah) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized access! Nice try.");

  try {
    const updated = await prisma.strankaObsah.upsert({
      where: { sekcia: sekcia },
      update: { obsah: obsah },
      create: {
        stranka: stranka,
        sekcia: sekcia,
        obsah: obsah
      }
    });

    // Сбрасываем кэш, чтобы изменения были видны мгновенно
    revalidatePath("/");
    revalidatePath("/admin/editor");
    revalidatePath("/kontakt");
    revalidatePath("/admin/kontakt");
    revalidatePath("/", "layout");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Chyba pri ukladaní do DB:", error);
    return { success: false, error: error.message };
  }
}

/**
 * ЭКШЕН ДЛЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ (Vercel Blob)
 */
export async function uploadImageAction(formData) {
  return uploadImage(formData);
}

/**
 * ПОЛУЧЕНИЕ КОНТЕНТА (Оставляем открытым для посетителей)
 */
export async function getContent(stranka, sekcia) {
  try {
    const data = await prisma.strankaObsah.findUnique({
      where: { sekcia: sekcia }
    });
    return data ? data.obsah : null;
  } catch (error) {
    console.error("Chyba pri načítaní z DB:", error);
    return null;
  }
}

const itemPaths = { collection: "/katalog", accessory: "/doplnky", project: "/projekt" };

function refreshItem(kind, slug) {
  revalidatePath("/");
  revalidatePath(kind === "project" ? "/realizacie" : itemPaths[kind]);
  if (slug) revalidatePath(`${itemPaths[kind]}/${slug}`);
  if (Object.hasOwn(CATALOG_PATHS, kind)) revalidatePath(`${itemPaths[kind]}/[slug]`, "page");
  if (kind === "collection") {
    revalidatePath("/[citySlug]", "page");
    revalidatePath("/admin/city-pages/new");
    revalidatePath("/admin/city-pages/[id]", "page");
  }
  revalidatePath("/admin/editor");
  revalidatePath("/sitemap.xml");
}

async function saveItem(kind, id, input) {
  if (!await getServerSession()) return { success: false, error: "Prihláste sa do administrácie." };
  try {
    const data = kind === "project" ? cleanProject(input) : cleanCatalog(input, kind);
    const specifications = kind === "collection" ? parseCollectionSpecifications(input) : undefined;
    const itemId = id == null ? null : validId(id);
    const isCatalog = Object.hasOwn(CATALOG_PATHS, kind);
    if (itemId == null && !isCatalog) {
      const base = data.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || kind;
      let slug = base;
      let suffix = 2;
      while (await prisma[kind].findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${suffix++}`;
      data.slug = slug;
    }
    const persist = async (tx) => {
      const url = isCatalog ? await prepareCatalogUrl(tx, kind, { id: itemId, title: data.title }) : null;
      if (url) data.slug = url.slug;
      const saved = itemId == null ? await tx[kind].create({ data }) : await tx[kind].update({ where: { id: itemId }, data });
      if (url) await rememberCatalogUrls(tx, kind, saved.id, [url.previousSlug, saved.slug]);
      if (specifications) {
        const sekcia = collectionSpecificationsSection(saved.id);
        await tx.strankaObsah.upsert({
          where: { sekcia },
          update: { obsah: specifications },
          create: { stranka: "collection", sekcia, obsah: specifications },
        });
      }
      await writeSeo(tx, kind, saved.id, input, kind === "project" ? [data.mainImage, ...data.images] : data.gallery);
      return saved;
    };
    const item = isCatalog ? await catalogTransaction(prisma, persist) : await prisma.$transaction(persist);
    refreshItem(kind, item.slug);
    return { success: true, data: { id: item.id, slug: item.slug } };
  } catch (error) {
    if (error.code) {
      console.error("Item save failed:", error.code);
      return { success: false, error: error.code === "P2002"
        ? Object.hasOwn(CATALOG_PATHS, kind) ? URL_TAKEN : "Záznam s touto adresou už existuje. Skúste uloženie znova."
        : "Záznam sa nepodarilo uložiť. Skontrolujte databázu a skúste znova." };
    }
    return { success: false, error: error.message || "Záznam sa nepodarilo uložiť." };
  }
}

async function removeItem(kind, id) {
  if (!await getServerSession()) return { success: false, error: "Prihláste sa do administrácie." };
  try {
    const itemId = validId(id);
    const [item] = await prisma.$transaction([
      prisma[kind].delete({ where: { id: itemId } }),
      prisma.strankaObsah.deleteMany({ where: { sekcia: { in: [seoSection(kind, itemId), ...(kind === "collection" ? [collectionSpecificationsSection(itemId)] : [])] } } }),
    ]);
    refreshItem(kind, item.slug);
    return { success: true };
  } catch {
    return { success: false, error: "Záznam sa nepodarilo vymazať. Skúste to znova." };
  }
}

export async function createCollection(data) { return saveItem("collection", null, data); }
export async function updateCollection(id, data) { return saveItem("collection", id, data); }
export async function deleteCollection(id) { return removeItem("collection", id); }
export async function createAccessory(data) { return saveItem("accessory", null, data); }
export async function updateAccessory(id, data) { return saveItem("accessory", id, data); }
export async function deleteAccessory(id) { return removeItem("accessory", id); }
export async function createProject(data) { return saveItem("project", null, data); }
export async function updateProject(id, data) { return saveItem("project", id, data); }
export async function deleteProject(id) { return removeItem("project", id); }

export async function getCollections() {
  try {
    const items = await prisma.collection.findMany({ orderBy: { id: "asc" } });
    const seo = await getSeoMany("collection", items.map((item) => item.id));
    return items.map((item) => ({ ...item, seo: seo.get(seoSection("collection", item.id)) || {} }));
  } catch (error) {
    console.error("Chyba pri načítaní vzorov:", error);
    return [];
  }
}

export async function getAccessories() {
  try {
    const items = await prisma.accessory.findMany({ orderBy: { id: "asc" } });
    const seo = await getSeoMany("accessory", items.map((item) => item.id));
    return items.map((item) => ({ ...item, price: item.price.toString(), seo: seo.get(seoSection("accessory", item.id)) || {} }));
  } catch (error) {
    console.error("Chyba pri načítaní doplnkov:", error);
    return [];
  }
}

export async function deleteAllCollectionsAction() {
  if (!await getServerSession()) throw new Error("Unauthorized");
  try {
    await prisma.$transaction([
      prisma.collection.deleteMany({}),
      prisma.strankaObsah.deleteMany({ where: { OR: [
        { sekcia: { startsWith: "seo-collection-" } },
        { sekcia: { startsWith: COLLECTION_SPECIFICATIONS_PREFIX } },
      ] } }),
    ]);
    revalidatePath("/katalog", "layout");
    refreshItem("collection");
    return { success: true };
  } catch { return { success: false, error: "Vzory sa nepodarilo vymazať." }; }
}
