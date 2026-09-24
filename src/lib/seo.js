import { cache } from "react";
import { prisma } from "@/lib/prisma";

const SEO_KINDS = new Set(["page", "collection", "accessory", "project"]);

export function seoSection(kind, id) {
  if (!SEO_KINDS.has(kind) || !/^[a-z0-9-]+$/.test(String(id))) {
    throw new Error("Invalid SEO section");
  }
  return `seo-${kind}-${id}`;
}

export const getSeo = cache(async (kind, id) => {
  const record = await prisma.strankaObsah.findUnique({
    where: { sekcia: seoSection(kind, id) },
    select: { obsah: true },
  });
  const value = record?.obsah;
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
});

export async function getSeoMany(kind, ids) {
  if (!ids.length) return new Map();
  const sections = ids.map((id) => seoSection(kind, id));
  const rows = await prisma.strankaObsah.findMany({
    where: { sekcia: { in: sections } },
    select: { sekcia: true, obsah: true },
  });
  return new Map(rows.map((row) => [row.sekcia, row.obsah || {}]));
}

export function imageAlt(seo, url, fallback) {
  const alt = seo?.imageAlts?.[url];
  return typeof alt === "string" && alt.trim() ? alt.trim() : fallback;
}

export function pageMetadata(seo, { title, description, path }) {
  const finalTitle = seo.title || title;
  const finalDescription = seo.description || description;
  return {
    title: { absolute: finalTitle },
    description: finalDescription,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "sk_SK",
      siteName: "Betonissimo",
      title: finalTitle,
      description: finalDescription,
      url: path,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Betónové ploty Betonissimo" }],
    },
  };
}

export function seoText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseImageAlts(value, imageUrls) {
  let parsed;
  try {
    parsed = typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    parsed = {};
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return Object.fromEntries(
    imageUrls
      .filter((url) => typeof url === "string" && url)
      .map((url) => [url, seoText(parsed[url], 180)])
      .filter(([, alt]) => alt)
  );
}

export async function writeSeo(tx, kind, id, input, imageUrls = []) {
  const sekcia = seoSection(kind, id);
  const imageAlts = parseImageAlts(input?.imageAlts, imageUrls);
  const mainAlt = seoText(input?.mainImageAlt, 180);
  if (kind === "project" && imageUrls[0] && mainAlt) imageAlts[imageUrls[0]] = mainAlt;
  const obsah = {
    title: seoText(input?.seoTitle, 100),
    description: seoText(input?.seoDescription, 320),
    imageAlts,
  };
  await tx.strankaObsah.upsert({
    where: { sekcia },
    update: { obsah },
    create: { stranka: kind, sekcia, obsah },
  });
}
