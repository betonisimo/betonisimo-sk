import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const baseUrl = SITE_URL;

export default async function sitemap() {
  const now = new Date();

  // ����������� ��������
  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
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
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    // �������� ������ �� ����
    const [collections, projects, accessories, posts] =
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
        prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        }),
      ]);

    // ���������
    const collectionUrls = collections.map((collection) => ({
      url: `${baseUrl}/katalog/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    // �������
    const projectUrls = projects.map((project) => ({
      url: `${baseUrl}/projekt/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    // ����������
    const accessoryUrls = accessories.map((accessory) => ({
      url: `${baseUrl}/doplnky/${accessory.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const blogUrls = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [
      ...staticPages,
      ...collectionUrls,
      ...accessoryUrls,
      ...projectUrls,
      ...blogUrls,
    ];

  } catch (error) {
    console.error("������ ��������� sitemap:", error);

    // ���� ���� ����������, ���������� ����������� ��������
    return staticPages;
  }
}
