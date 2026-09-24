import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatBlogDate } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-28 text-slate-950 md:px-6 md:pt-40">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600"><ArrowLeft size={18} /> Administrácia</Link>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div><p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">Obsah webu</p><h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-6xl">Blog</h1><p className="mt-3 text-slate-600">Tu vytvoríte a upravíte články nezávisle od hlavnej stránky.</p></div>
          <Link href="/admin/blog/new" className="inline-flex items-center gap-2 bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-950"><Plus size={18} /> Nový článok</Link>
        </div>

        {posts.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="flex flex-col gap-5 border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                <div className="relative aspect-[16/10] w-full shrink-0 bg-slate-100 sm:w-36">
                  {post.coverImage && <Image src={post.coverImage} alt={post.coverAlt || ""} fill sizes="144px" className="object-cover" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={`mb-2 self-start px-2 py-1 text-[10px] font-black uppercase tracking-wider ${post.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>{post.status === "PUBLISHED" ? "Publikované" : "Koncept"}</span>
                  <h2 className="text-lg font-black leading-snug">{post.title}</h2>
                  <p className="mt-2 text-xs text-slate-500">{post.status === "PUBLISHED" && post.publishedAt ? `Publikované ${formatBlogDate(post.publishedAt)}` : `Upravené ${formatBlogDate(post.updatedAt)}`}</p>
                  <div className="mt-auto flex flex-wrap gap-4 pt-5 text-xs font-black uppercase tracking-wider">
                    <Link href={`/admin/blog/${post.id}`} className="text-red-600 hover:underline">Upraviť</Link>
                    {post.status === "PUBLISHED" && <Link href={`/blog/${post.slug}`} target="_blank" className="inline-flex items-center gap-1 text-slate-700 hover:text-red-600">Otvoriť <ArrowUpRight size={14} /></Link>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-l-4 border-red-600 bg-white p-8 shadow-sm"><h2 className="text-xl font-black">Zatiaľ tu nie sú žiadne články.</h2><p className="mt-2 text-slate-600">Začnite prvým článkom a publikujte ho, keď bude hotový.</p></div>
        )}
      </div>
    </div>
  );
}
