import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";

export default function PortfolioPreview({ projects }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-24 lg:py-36 bg-black text-white overflow-hidden relative border-t border-neutral-900 font-sans" id="realizacie">
      
      {/* BACKGROUND DECO TEXT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[18vw] font-black text-white/[0.02] leading-none select-none pointer-events-none -translate-y-1/4 uppercase tracking-tighter">
        Works
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8 border-l-4 border-[#dc2626] pl-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em]">
                Portfólio realizácií
              </span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
              Posledné <br />
              <span className="text-neutral-700">Projekty</span>
            </h2>
          </div>
          
          <Link 
            href="/realizacie" 
            className="group bg-white text-black hover:bg-[#dc2626] hover:text-white px-10 py-5 font-black uppercase tracking-[0.3em] text-[10px] transition-colors duration-300 shrink-0 rounded-[2px]"
          >
            Všetky realizácie
          </Link>
        </div>

        {/* GRID PROJEKTOV */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.slice(0, 6).map((project, idx) => (
            <Link 
              href={`/projekt/${project.slug}`} 
              key={project.id} 
              className="group relative bg-[#050505] rounded-[2px] transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.1)] overflow-hidden flex flex-col"
            >
              {/* ТЕХНИЧЕСКИЙ ИНДЕКС */}
              <div className="absolute top-6 left-6 z-20 text-[10px] font-mono font-bold text-white/50 bg-black/40 px-2 py-1 rounded-[2px] backdrop-blur-sm group-hover:bg-[#dc2626] group-hover:text-white transition-colors duration-500 uppercase tracking-widest">
                // Ref_{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
              </div>

              {/* КНОПКА ПЕРЕХОДА */}
              <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                <ArrowUpRight size={24} className="text-[#dc2626]" />
              </div>

              {/* ИЗОБРАЖЕНИЕ */}
              <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden rounded-[2px]">
                <img
                  src={project.mainImage}
                  // СУПЕР SEO-ХАК ДЛЯ ЛОКАЛЬНЫХ КЛИЕНТОВ:
                  alt={`Betónový plot ${project.location ? 'montáž ' + project.location : ''} - ${project.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover filter  scale-100 transition-all duration-[800ms] ease-in-out group-hover:!-0 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 transition-opacity duration-[800ms] group-hover:opacity-30 pointer-events-none"></div>
                
                {/* ИНФО О ПРОЕКТЕ */}
                <div className="absolute bottom-8 left-6 right-6 space-y-4 z-10 pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-px bg-[#dc2626]"></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#dc2626] drop-shadow-md">
                      {project.category || "Realizácia"}
                    </span>
                  </div>
                  
                  {/* ПОМЕНЯЛИ h4 НА h3 ДЛЯ ПРАВИЛЬНОЙ SEO-ИЕРАРХИИ */}
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none group-hover:-translate-y-1 transition-transform duration-500">
                    {project.title}
                  </h3>

                  <div className="flex items-center text-white/50 text-[10px] font-black uppercase tracking-widest gap-2 pt-2">
                    <MapPin size={12} className="text-[#dc2626]" />
                    {/* Локация остается видимой для пользователей */}
                    {project.location}
                  </div>
                </div>
              </div>

              {/* ДЕКОРАТИВНЫЙ БАР СНИЗУ */}
              <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#dc2626] group-hover:w-full transition-all duration-[800ms] ease-out z-20"></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}