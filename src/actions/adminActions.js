"use server";

import { prisma } from "@/lib/prisma";
import { put } from '@vercel/blob';
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

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
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized: Only admins can upload images.");

  try {
    const file = formData.get('file');
    if (!file) throw new Error("Súbor nebol nájdený");

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

/**
 * КОЛЛЕКЦИИ (СТИЛИ)
 */
export async function getCollections() { // Открыто для посетителей
  try {
    return await prisma.collection.findMany({ orderBy: { id: 'asc' } });
  } catch (error) {
    return [];
  }
}

export async function createCollection(data) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const baseSlug = data.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.collection.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newCollection = await prisma.collection.create({
      data: { ...data, slug: finalSlug },
    });

    revalidatePath("/");
    return { success: true, data: newCollection };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateCollection(id, data) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const updated = await prisma.collection.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        mainImage: data.mainImage,
        description: data.description,
      },
    });
    revalidatePath("/");
    revalidatePath(`/kolekcia/${updated.slug}`);
    return { success: true, data: updated };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteCollection(id) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    await prisma.collection.delete({ where: { id: Number(id) } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * ПРОЕКТЫ (РЕАЛИЗАЦИИ)
 */
export async function createProject(data) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const baseSlug = data.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.project.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    let parsedImages = Array.isArray(data.images) ? data.images : JSON.parse(data.images || "[]");
    
    const newProject = await prisma.project.create({
      data: { ...data, slug: finalSlug, images: parsedImages },
    });
    
    revalidatePath("/realizacie");
    return { success: true, data: newProject };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateProject(id, data) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    let parsedImages = Array.isArray(data.images) ? data.images : JSON.parse(data.images || "[]");

    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: { ...data, images: parsedImages },
    });

    revalidatePath("/realizacie");
    revalidatePath(`/projekt/${updatedProject.slug}`);
    return { success: true, data: updatedProject };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    await prisma.project.delete({ where: { id: Number(id) } });
    revalidatePath("/realizacie");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Удаление всех коллекций
export async function deleteAllCollectionsAction() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    await prisma.collection.deleteMany({});
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}