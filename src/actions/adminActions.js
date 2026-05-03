"use server";

import { prisma } from "@/lib/prisma";
import { put } from '@vercel/blob';
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

/** 
 * ==========================================
 * POMOCNÉ FUNKCIE (UTILITIES) - DRY Princíp
 * ==========================================
 */

// Centralizované čistenie cache pre celú aplikáciu
function purgeCache() {
  revalidatePath("/", "layout");
}

// Bezpečná kontrola administrátora
async function requireAdmin() {
  const session = await getServerSession();
  if (!session) throw new Error("Neautorizovaný prístup. Vyžaduje sa prihlásenie.");
  return session;
}

// Optimalizovaný generátor unikátnych URL (Slug)
async function generateUniqueSlug(model, title) {
  const baseSlug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let finalSlug = baseSlug;
  let counter = 1;
  const MAX_ATTEMPTS = 50; // Ochrana proti nekonečnému cyklu

  while (await model.findUnique({ where: { slug: finalSlug }, select: { id: true } })) {
    if (counter > MAX_ATTEMPTS) throw new Error("Nepodarilo sa vygenerovať unikátny slug.");
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  return finalSlug;
}

// Parser pre galériu obrázkov
function parseGalleryString(galleryData) {
  if (typeof galleryData === 'string') {
    return galleryData.split(',').filter(url => url.trim() !== "");
  }
  return [];
}


/** 
 * ==========================================
 * SPRÁVA OBSAHU (Hero, Footer, About...)
 * ==========================================
 */
export async function saveContent(stranka, sekcia, obsah) {
  await requireAdmin();

  try {
    const updated = await prisma.strankaObsah.upsert({
      where: { sekcia: sekcia },
      update: { obsah: obsah },
      create: { stranka, sekcia, obsah }
    });

    purgeCache();
    return { success: true, data: updated };
  } catch (error) {
    console.error("Chyba pri ukladaní do DB:", error);
    return { success: false, error: "Systémová chyba pri ukladaní dát." };
  }
}


/** 
 * ==========================================
 * UPLOAD OBRÁZKOV (Vercel Blob)
 * ==========================================
 */
export async function uploadImageAction(formData) {
  await requireAdmin();

  try {
    const file = formData.get('file');
    if (!file) throw new Error("Súbor nebol nájdený.");

    // Bezpečnostná validácia: max 5MB a iba obrázky
    const MAX_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_SIZE) throw new Error("Súbor je príliš veľký (max 5MB).");
    if (!file.type.startsWith('image/')) throw new Error("Povolené sú iba obrázky (JPG, PNG, WEBP).");

    const blob = await put(file.name, file, { 
      access: 'public',
      addRandomSuffix: true
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Upload Error:", error);
    return { success: false, error: error.message };
  }
}


/** 
 * ==========================================
 * VEREJNÉ DÁTA (Bez overenia)
 * ==========================================
 */
export async function getContent(stranka, sekcia) {
  try {
    const data = await prisma.strankaObsah.findUnique({
      where: { sekcia: sekcia },
      select: { obsah: true } // Ťaháme len to, čo potrebujeme
    });
    return data ? data.obsah : null;
  } catch (error) {
    console.error("Chyba pri načítaní z DB:", error);
    return null;
  }
}

export async function getCollections(lightweight = false) {
  try {
    return await prisma.collection.findMany({ 
      orderBy: { id: 'desc' }, // Nové záznamy hore
      // Ak je lightweight true, neťaháme ťažký text a galériu (šetrí dáta)
      select: lightweight ? {
        id: true,
        title: true,
        subtitle: true,
        slug: true,
        mainImage: true,
      } : undefined
    });
  } catch (error) {
    return [];
  }
}


/** 
 * ==========================================
 * KOLEKCIE (Katalóg)
 * ==========================================
 */
export async function createCollection(data) {
  await requireAdmin();

  try {
    const finalSlug = await generateUniqueSlug(prisma.collection, data.title);
    const galleryArray = parseGalleryString(data.gallery);
    const mainImage = galleryArray.length > 0 ? galleryArray[0] : (data.mainImage || "");

    const newCollection = await prisma.collection.create({
      data: { 
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        mainImage: mainImage,
        gallery: galleryArray,
        slug: finalSlug 
      },
    });
    
    purgeCache();
    return { success: true, data: newCollection };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateCollection(id, data) {
  await requireAdmin();

  try {
    const galleryArray = parseGalleryString(data.gallery);
    const mainImage = galleryArray.length > 0 ? galleryArray[0] : (data.mainImage || "");

    const updated = await prisma.collection.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        mainImage: mainImage,
        gallery: galleryArray,
      },
    });
    
    purgeCache();
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCollection(id) {
  await requireAdmin();

  try {
    await prisma.collection.delete({ where: { id: Number(id) } });
    purgeCache();
    return { success: true };
  } catch (error) {
    return { success: false, error: "Nepodarilo sa vymazať kolekciu." };
  }
}

export async function deleteAllCollectionsAction() {
  await requireAdmin();

  try {
    await prisma.collection.deleteMany({});
    purgeCache();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


/** 
 * ==========================================
 * PROJEKTY (Realizácie)
 * ==========================================
 */
export async function createProject(data) {
  await requireAdmin();

  try {
    const finalSlug = await generateUniqueSlug(prisma.project, data.title);
    const parsedImages = Array.isArray(data.images) ? data.images : JSON.parse(data.images || "[]");
    
    const newProject = await prisma.project.create({
      data: { ...data, slug: finalSlug, images: parsedImages },
    });
    
    purgeCache();
    return { success: true, data: newProject };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateProject(id, data) {
  await requireAdmin();

  try {
    const parsedImages = Array.isArray(data.images) ? data.images : JSON.parse(data.images || "[]");

    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: { ...data, images: parsedImages },
    });

    purgeCache();
    return { success: true, data: updatedProject };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id) {
  await requireAdmin();

  try {
    await prisma.project.delete({ where: { id: Number(id) } });
    purgeCache();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}