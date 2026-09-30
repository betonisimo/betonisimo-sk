// Opt-in fixtures for an isolated LOCAL database only. Never imports the project's .env.
import { PrismaClient } from "@prisma/client";
const url = new URL(process.env.DATABASE_URL || "");
if (url.hostname !== "127.0.0.1" || url.port !== "55439" || url.username !== "editor_test") throw new Error("Refusing to seed anything except the isolated editor test database.");
const db = new PrismaClient();
try {
  const photo = "/og-image.jpg";
  const common = { title: "Test editor", subtitle: "Test podnadpis", description: "Starý popis", mainImage: photo, gallery: [photo] };
  for (const kind of ["collection", "accessory"]) {
    await db[kind].upsert({ where: { slug: "editor-test" }, update: {}, create: { ...common, slug: "editor-test", ...(kind === "accessory" ? { price: "12.50" } : {}) } });
  }
  await db.project.upsert({ where: { slug: "editor-legacy" }, update: {}, create: { title: "Stará realizácia", slug: "editor-legacy", category: "Moderné línie", location: "Jelka", description: "Pôvodný text realizácie.\nDruhý riadok zostáva zachovaný.", mainImage: photo, images: [photo] } });
  await db.blogPost.upsert({ where: { slug: "editor-legacy" }, update: {}, create: {
    title: "Pôvodný článok", slug: "editor-legacy", excerpt: "Úvod pôvodného článku", coverImage: photo, coverAlt: "Betónový plot", status: "PUBLISHED", publishedAt: new Date("2026-09-01T12:00:00Z"),
    blocks: [{ type: "heading2", text: "Pôvodný nadpis" }, { type: "paragraph", text: "Pôvodný odsek o betónových plotoch." }, { type: "link", url: "/katalog", label: "Naše vzory" }, { type: "list", text: "Kvalita\nŽivotnosť" }, { type: "image", url: photo, alt: "Fotografia plotu", caption: "Pôvodný podpis" }],
  } });
  console.log("Local editor fixtures ready.");
} finally { await db.$disconnect(); }
