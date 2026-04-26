import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beton-sk.vercel.app";

  try {
    // Безопасный запрос: просим только slug (он точно есть в базе)
    const collections = await prisma.collection.findMany({
      select: { slug: true },
    });

    const projects = await prisma.project.findMany({
      select: { slug: true },
    });

    // 1. Статические страницы
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/realizacie`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/kontakt`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];

    // 2. Коллекции
    const collectionUrls = collections.map((collection) => ({
      url: `${baseUrl}/kolekcia/${collection.slug}`,
      lastModified: new Date(), // Просто ставим текущую дату
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    // 3. Проекты
    const projectUrls = projects.map((project) => ({
      url: `${baseUrl}/projekt/${project.slug}`,
      lastModified: new Date(), // Просто ставим текущую дату
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    return [...staticPages, ...collectionUrls, ...projectUrls];

  } catch (error) {
    console.error("Ошибка при генерации sitemap:", error);
    // Если база данных недоступна, возвращаем хотя бы главные страницы
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/realizacie`, lastModified: new Date() },
      { url: `${baseUrl}/kontakt`, lastModified: new Date() }
    ];
  }
}