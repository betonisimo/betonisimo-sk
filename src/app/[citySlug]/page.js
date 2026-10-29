import Image from "next/image";
import { notFound } from "next/navigation";
import RichContent from "@/components/content/RichContent";
import { getPublishedCityPage, getCityPageCollections } from "@/lib/city-page-data";
import StyleGrid from "@/components/home/StyleGrid";
import { contentText } from "@/lib/rich-content";
import { pageMetadata } from "@/lib/seo";

// Generate new pages on first visit and refresh their HTML after admin edits.
export const revalidate = 3600;
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const { citySlug } = await params;
  const page = await getPublishedCityPage(citySlug);
  if (!page) return { title: "Stránka sa nenašla", robots: { index: false, follow: false } };
  const metadata = pageMetadata({ title: page.seoTitle, description: page.seoDescription }, {
    title: `${page.title} | BETONISSIMO.SK`,
    description: page.excerpt || contentText(page.blocks).slice(0, 160),
    path: `/${page.slug}`,
  });
  if (page.coverImage) metadata.openGraph.images = [{ url: page.coverImage, alt: page.coverAlt }];
  return { ...metadata, robots: { index: true, follow: true } };
}

export default async function CityPage({ params }) {
  const { citySlug } = await params;
  const page = await getPublishedCityPage(citySlug);
  if (!page) notFound();
  const collections = await getCityPageCollections(page.collectionIds);
  return <article className="min-h-screen bg-slate-50 pb-20 pt-28 text-slate-950 md:pt-36">
    <header className="mx-auto max-w-5xl px-6 pb-10 md:pb-14">
      <h1 className="break-words text-4xl font-black leading-tight tracking-tight [overflow-wrap:anywhere] md:text-6xl">{page.title}</h1>
      {page.excerpt && <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">{page.excerpt}</p>}
    </header>
    {page.coverImage && <div className="relative mx-auto mb-12 aspect-[16/9] max-w-6xl bg-slate-200 md:mb-16">
      <Image src={page.coverImage} alt={page.coverAlt} fill priority sizes="(max-width: 1200px) 100vw, 1152px" className="object-cover" />
    </div>}
    <div className="mx-auto max-w-3xl px-6"><RichContent content={page.blocks} /></div>
    <StyleGrid collections={collections} />
  </article>;
}
