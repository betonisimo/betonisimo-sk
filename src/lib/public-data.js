import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Deduplicate metadata/page reads within one render, without caching admin edits
// across requests or requiring a new invalidation strategy.
export const getCollectionBySlug = cache((slug) => prisma.collection.findUnique({ where: { slug } }));
export const getAccessoryBySlug = cache((slug) => prisma.accessory.findUnique({ where: { slug } }));
export const getProjectBySlug = cache((slug) => prisma.project.findUnique({ where: { slug } }));
