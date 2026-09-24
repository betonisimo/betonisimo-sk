import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPublishedBlogPost = cache(async (slug) => {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
});

export function formatBlogDate(date) {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Bratislava",
  }).format(date);
}

export function blogReadingMinutes(blocks) {
  const words = (Array.isArray(blocks) ? blocks : [])
    .filter((block) => block?.type !== "image")
    .map((block) => block?.text || "")
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}
