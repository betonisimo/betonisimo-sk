import { SITE_URL } from "./site-url.js";
import { loadPublishedCityPages } from "./city-pages.js";

const staticPaths = ["/", "/katalog", "/realizacie", "/kontakt", "/doplnky", "/blog"];

export function buildSitemap({ collections, projects, accessories, posts, cityPages = [] }) {
  const item = (prefix, record, lastModified) => ({
    url: `${SITE_URL}/${prefix}/${encodeURIComponent(record.slug)}`,
    ...(lastModified ? { lastModified } : {}),
  });

  return [
    ...staticPaths.map((path) => ({ url: new URL(path, SITE_URL).toString() })),
    // These models have no reliable updatedAt; omitting lastmod is intentional.
    ...collections.map((record) => item("katalog", record)),
    ...projects.map((record) => item("projekt", record)),
    ...accessories.map((record) => item("doplnky", record, record.updatedAt)),
    ...posts.map((record) => item("blog", record, record.updatedAt)),
    ...cityPages.filter((page) => page.status === "PUBLISHED").map((page) => ({ url: `${SITE_URL}/${encodeURIComponent(page.slug)}`, lastModified: page.updatedAt })),
  ];
}

export async function loadSitemap(db) {
  const [collections, projects, accessories, posts, cityPages] = await Promise.all([
    db.collection.findMany({ select: { slug: true } }),
    db.project.findMany({ select: { slug: true } }),
    db.accessory.findMany({ select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    loadPublishedCityPages(db),
  ]);

  // Let failures return 5xx so crawlers retry, not a successful truncated sitemap.
  return buildSitemap({ collections, projects, accessories, posts, cityPages });
}
