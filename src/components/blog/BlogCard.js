import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatBlogDate } from "@/lib/blog";

export default function BlogCard({ post, priority = false }) {
  const date = post.publishedAt || post.createdAt;

  return (
    <article className="group flex h-full flex-col border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100" aria-label={`Čítať článok: ${post.title}`}>
        <Image src={post.coverImage} alt={post.coverAlt} fill priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <time dateTime={date.toISOString()} className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">{formatBlogDate(date)}</time>
        <h2 className="mb-4 text-2xl font-black leading-tight tracking-tight text-slate-950">
          <Link href={`/blog/${post.slug}`} className="hover:text-red-600">{post.title}</Link>
        </h2>
        <p className="mb-8 line-clamp-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="mt-auto inline-flex items-center gap-2 self-start border-b-2 border-red-600 pb-1 text-xs font-black uppercase tracking-[0.14em] text-slate-950 transition-colors hover:text-red-600">
          Čítať článok <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
