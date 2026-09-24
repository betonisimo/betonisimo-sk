import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { blogReadingMinutes, formatBlogDate, getPublishedBlogPost } from "@/lib/blog";
import BlogBody from "@/components/blog/BlogBody";
import BlogCard from "@/components/blog/BlogCard";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) return { title: "Článok sa nenašiel", robots: { index: false } };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = `/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "sk_SK",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: [{ url: post.coverImage, alt: post.coverAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [post.coverImage] },
  };
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", id: { not: post.id } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 2,
    select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, coverAlt: true, publishedAt: true, createdAt: true },
  });
  const date = post.publishedAt || post.createdAt;
  const absoluteUrl = new URL(`/blog/${post.slug}`, SITE_URL).toString();
  const absoluteImage = new URL(post.coverImage, SITE_URL).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteImage,
    datePublished: date.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: absoluteUrl,
    author: { "@type": "Organization", name: "BETONISSIMO.SK" },
    publisher: { "@type": "Organization", name: "BETONISSIMO.SK" },
    inLanguage: "sk-SK",
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 pt-28 text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article>
        <header className="mx-auto max-w-5xl px-6">
          <nav aria-label="Navigácia v blogu" className="mb-10 text-xs font-bold text-slate-500">
            <Link href="/blog" className="inline-flex items-center gap-2 hover:text-red-600"><ArrowLeft size={16} /> Všetky články</Link>
          </nav>
          <p className="mb-5 text-xs font-black uppercase tracking-[0.25em] text-red-600">Blog / Rady a inšpirácie</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">{post.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">{post.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-slate-200 pt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <time dateTime={date.toISOString()}>{formatBlogDate(date)}</time>
            <span className="inline-flex items-center gap-2"><Clock3 size={15} aria-hidden="true" /> {blogReadingMinutes(post.blocks)} min čítania</span>
          </div>
        </header>

        <div className="relative mx-auto mt-10 aspect-[16/10] max-w-6xl bg-slate-200 md:aspect-[16/8]">
          <Image src={post.coverImage} alt={post.coverAlt} fill priority sizes="(max-width: 1200px) 100vw, 1152px" className="object-cover" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
          <BlogBody blocks={post.blocks} />
          <div className="mt-16 border-l-4 border-red-600 bg-white p-7 shadow-sm md:p-10">
            <h2 className="text-2xl font-black uppercase tracking-tight">Plánujete nový plot?</h2>
            <p className="mt-3 leading-7 text-slate-600">Napíšte nám o svojom projekte. Radi vám poradíme s výberom a pripravíme cenovú ponuku.</p>
            <Link href="/kontakt" className="mt-7 inline-flex items-center gap-3 bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-950">Požiadať o cenovú ponuku <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl border-t border-slate-200 px-6 pt-14" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-8 text-3xl font-black uppercase tracking-tight">Ďalšie články</h2>
          <div className="grid gap-7 md:grid-cols-2">{related.map((item) => <BlogCard key={item.id} post={item} />)}</div>
        </section>
      )}
    </div>
  );
}
