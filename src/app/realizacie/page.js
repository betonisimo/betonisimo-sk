import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Portfólio Realizácií | Elite Industrial",
  description: "Technická dokumentácia našich dokončených projektov betónových oplotení.",
};

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-44 pb-32 font-sans text-black">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* HEADER SEKCE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10 border-l-4 border-[#dc2626] pl-6 md:pl-8">
          <div className="max-w-3xl">
            <p className="text-[#dc2626] font-black uppercase tracking-[0.5em] text-[10px] mb-6">
              Archív_Projektov / 2020 - 2026
            </p>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
              Naša stopa <br />
              <span className="text-slate-300">v teréne</span>
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-mono text-slate-400 uppercase leading-relaxed tracking-widest">
              // Total_Projects: {projects.length} <br />
              // Status: Operational <br />
              // Quality_Check: Passed
            </p>
          </div>
        </div>

        {/* GRID REALIZÁCIÍ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project, idx) => (
            <Link
              href={`/projekt/${project.slug}`}
              key={project.id}
              // БЕЗ БОРДЕРОВ, ROUNDED-2PX, ТЕНЬ ПРИ НАВЕДЕНИИ
              className="group relative flex flex-col bg-white rounded-[2px] transition-shadow duration-[800ms] ease-out shadow-md hover:shadow-2xl overflow-hidden"
            >
              {/* IMAGE CONTAINER */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 rounded-t-[2px]">
                {project.mainImage ? (
                  <img
                    src={project.mainImage}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    // ЧИСТАЯ АНИМАЦИЯ 800MS (Масштаб + Гарантия цвета)
                    className="w-full h-full object-cover filter  scale-100 transition-all duration-[800ms] ease-in-out group-hover:!-0 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Image_Not_Found
                  </div>
                )}

                {/* ЛЕГКИЙ ОВЕРЛЕЙ (Рассеивается при наведении для взрыва цвета) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-70 transition-opacity duration-[800ms] group-hover:opacity-0 pointer-events-none z-10"></div>

                {/* ID MARKER */}
                <div className="absolute top-0 right-0 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono px-3 py-1.5 rounded-bl-[2px] transition-colors duration-[800ms] group-hover:bg-[#dc2626] z-20">
                  PRJ_{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </div>
              </div>

              {/* CONTENT AREA */}
              <div className="p-8 flex flex-col flex-1 bg-white relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-[2px] bg-[#dc2626] rounded-[2px] transition-all duration-[800ms] group-hover:w-10"></div>
                  <span className="text-[9px] font-black text-[#dc2626] uppercase tracking-[0.3em]">
                    {project.category}
                  </span>
                </div>

                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-8 group-hover:text-[#dc2626] transition-colors duration-[800ms]">
                  {project.title}
                </h4>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                  {project.location && (
                    <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest gap-2">
                      <MapPin size={12} className="text-[#dc2626]" />
                      {project.location}
                    </div>
                  )}
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-[#dc2626] group-hover:translate-x-2 transition-all duration-[800ms] ease-out" />
                </div>
              </div>

              {/* PROGRESS BAR СНИЗУ */}
              <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#dc2626] group-hover:w-full transition-all duration-[800ms] ease-out z-20"></span>
            </Link>
          ))}
        </div>

        {/* BOTTOM DECO */}
        <div className="mt-32 pt-12 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">End_of_Catalogue</span>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              // ROUNDED-2PX даже на мелких декоративных элементах
              <div key={i} className="w-2 h-2 bg-[#dc2626] rounded-[2px]"></div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}