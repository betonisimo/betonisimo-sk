export default function SeoFields({ seo = {} }) {
  return (
    <section className="space-y-5 border-t border-slate-200 pt-8">
      <div>
        <h2 className="text-xl font-black text-slate-900">SEO stránky</h2>
        <p className="mt-1 text-sm text-slate-500">
          Nadpis a popis platia pre celú stránku, nie pre jednotlivé odseky. Ak ich nevyplníte, použijú sa doterajšie automatické hodnoty.
        </p>
      </div>
      <div>
        <label htmlFor="seoTitle" className="mb-2 block text-sm font-bold text-slate-700">Nadpis vo vyhľadávaní (meta title)</label>
        <input id="seoTitle" name="seoTitle" maxLength={100} defaultValue={seo.title || ""} placeholder="Napr. Betónový plot Nová bridlica | BETONISSIMO.SK" className="w-full rounded-[2px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-red-600" />
      </div>
      <div>
        <label htmlFor="seoDescription" className="mb-2 block text-sm font-bold text-slate-700">Popis vo vyhľadávaní (meta description)</label>
        <textarea id="seoDescription" name="seoDescription" maxLength={320} rows={3} defaultValue={seo.description || ""} placeholder="Stručne a výstižne opíšte túto stránku." className="w-full rounded-[2px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-red-600" />
      </div>
    </section>
  );
}
