"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function text(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function imageUrl(value) {
  const url = text(value, 2000);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".public.blob.vercel-storage.com") ? url : "";
  } catch {
    return "";
  }
}

function linkUrl(value) {
  const url = text(value, 2000);
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? url : "";
  } catch {
    return "";
  }
}

function cleanBlocks(input) {
  if (!Array.isArray(input) || input.length > 100) throw new Error("Článok môže mať najviac 100 blokov.");

  return input.map((block) => {
    if (block?.type === "image") {
      return {
        type: "image",
        url: imageUrl(block.url),
        alt: text(block.alt, 180),
        caption: text(block.caption, 300),
      };
    }
    if (block?.type === "link") {
      return { type: "link", label: text(block.label, 180), url: linkUrl(block.url) };
    }
    if (!["paragraph", "heading2", "heading3", "list"].includes(block?.type)) {
      throw new Error("Neznámy typ bloku.");
    }
    return { type: block.type, text: text(block.text, 10000) };
  }).filter((block) => {
    if (block.type === "image") return Boolean(block.url);
    if (block.type === "link") return Boolean(block.url && block.label);
    return Boolean(block.text);
  });
}

function cleanPost(input) {
  const status = input?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const data = {
    title: text(input?.title, 160),
    excerpt: text(input?.excerpt, 320),
    coverImage: imageUrl(input?.coverImage),
    coverAlt: text(input?.coverAlt, 180),
    seoTitle: text(input?.seoTitle, 100) || null,
    seoDescription: text(input?.seoDescription, 320) || null,
    blocks: cleanBlocks(input?.blocks),
    status,
  };

  if (!data.title) throw new Error("Zadajte názov článku.");
  if (status === "PUBLISHED") {
    if (!data.excerpt || !data.coverImage || !data.coverAlt) {
      throw new Error("Na publikovanie vyplňte úvod, hlavnú fotografiu a jej alternatívny popis.");
    }
    if (!data.blocks.some((block) => block.type === "paragraph")) {
      throw new Error("Článok musí obsahovať aspoň jeden odsek textu.");
    }
    if (data.blocks.some((block) => block.type === "image" && !block.alt)) {
      throw new Error("Každá fotografia v článku potrebuje alternatívny popis.");
    }
  }
  return data;
}

function slugFromTitle(title) {
  return title.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "clanok";
}

function refreshBlog(slug) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
}

export async function saveBlogPost(input) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const data = cleanPost(input);
    const id = input?.id == null ? null : Number(input.id);
    if (id !== null && (!Number.isInteger(id) || id <= 0)) throw new Error("Neplatné ID článku.");

    if (id !== null) {
      const previous = await prisma.blogPost.findUnique({ where: { id } });
      if (!previous) throw new Error("Článok neexistuje.");
      const post = await prisma.blogPost.update({
        where: { id },
        data: {
          ...data,
          publishedAt: data.status === "PUBLISHED" ? (previous.publishedAt || new Date()) : previous.publishedAt,
        },
      });
      refreshBlog(post.slug);
      return { success: true, id: post.id, slug: post.slug };
    }

    const base = slugFromTitle(data.title);
    let slug = base;
    let suffix = 2;
    while (await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${base}-${suffix++}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        ...data,
        slug,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    refreshBlog(post.slug);
    return { success: true, id: post.id, slug: post.slug };
  } catch (error) {
    console.error("Chyba pri ukladaní článku:", error);
    return { success: false, error: error.message || "Článok sa nepodarilo uložiť." };
  }
}

export async function deleteBlogPost(id) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const postId = Number(id);
    if (!Number.isInteger(postId) || postId <= 0) throw new Error("Neplatné ID článku.");
    const post = await prisma.blogPost.delete({ where: { id: postId } });
    refreshBlog(post.slug);
    return { success: true };
  } catch (error) {
    console.error("Chyba pri mazaní článku:", error);
    return { success: false, error: error.message || "Článok sa nepodarilo vymazať." };
  }
}
