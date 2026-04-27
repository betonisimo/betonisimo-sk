"use client";
import Link from "next/link";
import { Check, ArrowUpRight, Grid3X3 } from "lucide-react";

// ДОБАВИЛИ ПРОПС limit
export default function StyleGrid({ collections, limit }) {
  if (!collections || collections.length === 0) return null;

  // Если передан лимит (например, 8), обрезаем массив. Если нет — показываем все.
  const displayCollections = limit ? collections.slice(0, limit) : collections;
  
  // Проверяем, есть ли еще коллекции, чтобы показать кнопку
  const hasMore = limit && collections.length > limit;

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
          {displayCollections.map((col, idx) => (
            <Link
              href={`/katalog/${col.slug}`}
              key={col.id}
              className="group relative flex flex-col justify-end aspect-[4/5] bg-slate-900 border border-slate-200/50 rounded-[2px] overflow-hidden transition-shadow duration-500 hover:shadow-2xl"
            >
              {/* BACKGROUND IMAGE */}
              <img
                src={col.mainImage || '/uploads/default.webp'}
                alt={`Betónový plot - katalog ${col.title}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover filter grayscale transition-all duration-700 ease-in-out group-hover:grayscale-0 group-hover:scale-110 z-0"
              />

              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-80 z-10 pointer-events-none"></div>

              {/* ID MARKER */}
              <div className="absolute top-6 left-6 text-[10px] font-mono font-bold text-white/70 tracking-widest bg-black/40 px-2 py-1 rounded-[2px] backdrop-blur-sm z-20 transition-colors duration-500 group-hover:bg-[#dc2626] group-hover:text-white">
                LN_0{idx + 1}
              </div>

              {/* CONTENT AREA */}
              <div className="relative z-20 p-6 md:p-8 flex flex-col">
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none transition-transform duration-500 group-hover:-translate-y-1">
                  {col.title}
                </h3>
                <p className="text-[#dc2626] text-[9px] font-black uppercase tracking-[0.3em] mt-3 mb-6 drop-shadow-md">
                  {col.subtitle || "Standard Line"}
                </p>

                <ul className="space-y-2 mb-6">
                  {["Individuálne riešenie", "Dlhá životnosť", "Top kvalita"].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/80">
                      <div className="flex items-center justify-center w-3 h-3 bg-[#dc2626] text-white rounded-[1px] shrink-0">
                        <Check size={8} strokeWidth={4} />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-3 pt-4 border-t border-white/20 text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:text-[#dc2626] transition-colors duration-300 w-fit">
                  Zobraziť detaily
                  <ArrowUpRight
                    size={16}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* PROGRESS BAR */}
              <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#dc2626] group-hover:w-full transition-all duration-500 ease-out z-30"></span>
            </Link>
          ))}
        </div>

        {/* КНОПКА "СМОТРЕТЬ ВСЕ" (появляется только если карточек больше лимита) */}
        {hasMore && (
          <div className="mt-16 pt-16 border-t border-slate-200 flex justify-center">
            <Link 
              href="/katalog" 
              className="group relative inline-flex items-center justify-center bg-white text-slate-900 border-2 border-slate-900 px-10 py-5 rounded-[2px] font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:text-white overflow-hidden shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Grid3X3 size={16} /> Zobraziť kompletný katalóg
              </span>
              <div className="absolute inset-0 bg-slate-900 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}