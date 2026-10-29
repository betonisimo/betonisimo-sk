import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin, Plus } from "lucide-react";
import { getAdminCityPages } from "@/lib/city-page-data";
import { formatBlogDate } from "@/lib/blog";
import DuplicateCityPageButton from "@/components/admin/DuplicateCityPageButton";

export const dynamic = "force-dynamic";

export default async function AdminCityPages() {
  const pages = await getAdminCityPages();
  return <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-28 text-slate-950 md:px-6 md:pt-40">
    <div className="mx-auto max-w-6xl">
      <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600"><ArrowLeft size={18} /> Administrácia</Link>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div><p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">Obsah webu</p><h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-6xl">SEO stránky miest</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Vytvárajte stránky pre jednotlivé mestá. Publikované stránky sa automaticky pridajú do sitemap.</p></div>
        <Link href="/admin/city-pages/new" className="inline-flex items-center gap-2 bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-950"><Plus size={18} /> Nová stránka</Link>
      </div>
      {pages.length ? <div className="grid gap-5 md:grid-cols-2">
        {pages.map((page) => <article key={page.id} className="flex min-w-0 flex-col gap-5 border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
          <div className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center bg-slate-100 sm:w-32">
            {page.coverImage ? <Image src={page.coverImage} alt={page.coverAlt || ""} fill sizes="(max-width: 640px) 100vw, 128px" className="object-cover" /> : <MapPin size={32} className="text-slate-300" />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className={`mb-2 self-start px-2 py-1 text-[10px] font-black uppercase tracking-wider ${page.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>{page.status === "PUBLISHED" ? "Publikované" : "Koncept"}</span>
            <h2 className="break-words text-lg font-black leading-snug">{page.title}</h2>
            <p className="mt-2 break-all text-xs text-slate-500">/{page.slug}</p>
            <p className="mt-2 text-xs text-slate-500">Upravené {formatBlogDate(page.updatedAt)}</p>
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-5 text-xs font-black uppercase tracking-wider">
              <Link href={`/admin/city-pages/${page.id}`} className="text-red-600 hover:underline">Upraviť</Link>
              <DuplicateCityPageButton id={page.id} title={page.title} />
              {page.status === "PUBLISHED" && <Link href={`/${page.slug}`} target="_blank" className="inline-flex items-center gap-1 text-slate-700 hover:text-red-600">Otvoriť <ArrowUpRight size={14} /></Link>}
            </div>
          </div>
        </article>)}
      </div> : <div className="border-l-4 border-red-600 bg-white p-8 shadow-sm"><h2 className="text-xl font-black">Zatiaľ tu nie sú žiadne stránky miest.</h2><p className="mt-2 text-slate-600">Vytvorte prvú stránku alebo neskôr duplikujte existujúcu a upravte jej obsah.</p></div>}
    </div>
  </div>;
}
