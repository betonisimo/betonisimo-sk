import { prisma } from "@/lib/prisma";

const baseUrl = "https://betonissimo.sk";

export default async function sitemap() {
  const now = new Date();

  // Статические страницы
  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/realizacie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/doplnky`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  try {
    // Получаем данные из базы
    const [collections, projects, accessories] =
      await Promise.all([
        prisma.collection.findMany({
          select: { slug: true },
        }),

        prisma.project.findMany({
          select: { slug: true },
        }),

        prisma.accessory.findMany({
          select: { slug: true },
        }),
      ]);

    // Коллекции
    const collectionUrls = collections.map((collection) => ({
      url: `${baseUrl}/katalog/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    // Проекты
    const projectUrls = projects.map((project) => ({
      url: `${baseUrl}/projekt/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    // Аксессуары
    const accessoryUrls = accessories.map((accessory) => ({
      url: `${baseUrl}/doplnky/${accessory.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [
      ...staticPages,
      ...collectionUrls,
      ...accessoryUrls,
      ...projectUrls,
    ];

  } catch (error) {
    console.error("Ошибка генерации sitemap:", error);

    // Если база недоступна, возвращаем статические страницы
    return staticPages;
  }
}