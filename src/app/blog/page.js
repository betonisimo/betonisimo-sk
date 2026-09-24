import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BlogCard from "@/components/blog/BlogCard";
import { getSeo, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const seo = await getSeo("page", "blog");
  return pageMetadata(seo, {
    title: "Blog o betónových plotoch | BETONISSIMO.SK",
    description: "Praktické rady, tipy a inšpirácie k výberu, montáži a údržbe betónových plotov od BETONISSIMO.SK.",
    path: "/blog",
  });
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, coverAlt: true, publishedAt: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 pt-20 text-slate-950">
      <header className="bg-slate-950 px-6 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-red-500">Rady · Inšpirácie · Realizácia</p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-tighter md:text-7xl">Blog o betónových <span className="text-red-600">plotoch</span></h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">Praktické skúsenosti a užitočné informácie, ktoré vám pomôžu pri výbere oplotenia.</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20" aria-label="Články">
        {posts.length ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => <BlogCard key={post.id} post={post} priority={index === 0} />)}
          </div>
        ) : (
          <div className="border-l-4 border-red-600 bg-white p-8 shadow-sm md:p-12">
            <h2 className="text-2xl font-black uppercase tracking-tight">Články pripravujeme</h2>
            <p className="mt-3 max-w-xl text-slate-600">Čoskoro tu nájdete rady a inšpirácie o betónových plotoch. Dovtedy si môžete pozrieť naše vzory.</p>
            <Link href="/katalog" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-slate-950">Pozrieť vzory <ArrowRight size={18} /></Link>
          </div>
        )}
      </section>
    </div>
  );
}
