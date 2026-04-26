"use client";
import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";

export default function StyleGrid({ collections }) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-24 lg:py-40 bg-[#f8fafc] border-b border-slate-200 font-sans" id="kolekcie">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 border-l-4 border-[#dc2626] pl-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em]">
                Katalóg línií
              </span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-[0.85]">
              Vyberte si <br />
              svoju <span className="text-[#dc2626]">kolekciu</span>
            </h2>
          </div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-tight max-w-sm leading-relaxed">
            // Každý štýl definuje charakter vášho domova. <br />
            // Od moderných línií po prírodný kameň.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {collections.map((col, idx) => (
            <div
              key={col.id}
              // Строгий радиус 2px, тень при наведении, бордер НЕ МЕНЯЕТСЯ
              className="bg-white flex flex-col border border-slate-200 rounded-[2px] transition-shadow duration-500 hover:shadow-2xl group relative overflow-hidden"
            >
              {/* IMAGE AREA */}
              <div className="relative aspect-[4/5] bg-slate-900 rounded-t-[2px] overflow-hidden">
                <img
                  src={col.mainImage || '/uploads/default.webp'}
                  alt={`Betónový plot - kolekcia ${col.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover filter grayscale transition-all duration-700 ease-in-out group-hover:!grayscale-0 group-hover:scale-110"
                />

                {/* ОВЕРЛЕЙ: При наведении opacity падает до 30% (или даже 0%), чтобы цвет был 100% чистым */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-20 pointer-events-none"></div>

                {/* ID MARKER */}
                <div className="absolute top-6 left-6 text-[10px] font-mono font-bold text-white/70 tracking-widest bg-black/40 px-2 py-1 rounded-[2px] backdrop-blur-sm z-10 transition-colors duration-500 group-hover:bg-red-600/90 group-hover:text-white">
                  LN_0{idx + 1}
                </div>

                {/* Названия */}
                <div className="absolute bottom-8 left-6 right-6 z-10">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none transition-transform duration-500 group-hover:-translate-y-1">
                    {col.title}
                  </h3>
                  <p className="text-[#dc2626] text-[9px] font-black uppercase tracking-[0.3em] mt-3 drop-shadow-md">
                    {col.subtitle || "Standard Line"}
                  </p>
                </div>
              </div>

              {/* CONTENT AREA */}
              <div className="p-6 md:p-8 flex flex-col flex-1 bg-white relative z-10">
                <ul className="space-y-4 mb-8 flex-1">
                  {["Individuálne riešenie", "Dlhá životnosť", "Top kvalita"].map((text, i) => (
                    <li key={i} className="flex items-start gap-4 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                      <div className="mt-0.5 flex items-center justify-center w-4 h-4 bg-[#dc2626] text-white rounded-[2px] shrink-0">
                        <Check size={10} strokeWidth={4} />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>

                {/* КНОПКА */}
                <Link
                  href={`/kolekcia/${col.slug}`}
                  className="group/btn flex items-center justify-between pt-5 border-t border-slate-100 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 hover:text-[#dc2626] transition-colors duration-300"
                >
                  Zobraziť detaily
                  <ArrowUpRight
                    size={16}
                    className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300"
                  />
                </Link>
              </div>

              {/* PROGRESS BAR */}
              <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#dc2626] group-hover:w-full transition-all duration-500 ease-out z-20"></span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}