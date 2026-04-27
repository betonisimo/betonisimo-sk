import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getContent } from "@/actions/adminActions";

export default async function Hero() {
  // Получаем данные из БД
  const heroData = await getContent("domov", "hero");

  // Дефолтные значения (Elite Industrial 2.0)
  const d = heroData || {
    subtitle: "Tradičná slovenská kvalita // Od 2009", show_subtitle: true,
    title_white: "PRÉMIOVÉ",
    title_red: "BETÓNOVÉ",
    title_end: "PLOTY",
    description: "Zvyšujeme hodnotu vašej nehnuteľnosti plotmi, ktoré vydržia generácie.",
    bg_image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070",
    cta1_text: "Prezrieť katalógu", cta1_link: "/katalog", show_cta1: true,
    cta2_text: "Cenová ponuka", cta2_link: "/kontakt", show_cta2: true,
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden font-sans">
      
      {/* Background with Industrial Grayscale Filter */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={d.bg_image} 
          alt="Betónové ploty"
          fill
          priority
          className="object-cover opacity-60 grayscale scale-105 animate-slow-zoom" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px] z-[1]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-[2]"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mt-20"> 
        
        {d.show_subtitle && (
          <div className="inline-flex items-center gap-4 mb-8">
              <div className="h-[2px] w-12 bg-[#dc2626]"></div>
              <span className="text-white font-mono text-[10px] md:text-xs tracking-[0.5em] uppercase">
                  {d.subtitle}
              </span>
              <div className="h-[2px] w-12 bg-[#dc2626]"></div>
          </div>
        )}
        
        <h1 className="text-5xl md:text-7xl lg:text-[110px] font-black text-white leading-[0.9] tracking-tighter uppercase mb-10 drop-shadow-2xl">
          {d.title_white} <br />
          <span className="text-[#dc2626]">{d.title_red}</span> {d.title_end}
        </h1>
        
        <p className="mt-8 text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-12 uppercase tracking-tight">
          {d.description}
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {d.show_cta1 && (
              <Link href={d.cta1_link} className="px-12 py-5 bg-[#dc2626] text-white text-[10px] font-black uppercase tracking-[0.3em] !rounded-[2px] hover:bg-white hover:text-black transition-all duration-300">
                <span className="flex items-center gap-3">{d.cta1_text} <ArrowRight size={16} /></span>
              </Link>
            )}
            
            {d.show_cta2 && (
              <Link href={d.cta2_link} className="px-12 py-5 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] !rounded-[2px] hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                {d.cta2_text}
              </Link>
            )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slow-zoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s linear infinite alternate;
        }
      `}} />
    </section>
  );
}