import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, ShieldCheck, Box } from "lucide-react";
import ProjectGallery from "@/components/portfolio/ProjectGallery";

// 1. АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ МЕТАДАННЫХ ДЛЯ КАЖДОГО ПРОЕКТА
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!project) return { title: "Projekt nenájdený | Beton-SK" };

  // Формируем SEO-заголовок, учитывающий локацию (Город)
  const locationText = project.location ? `v meste ${project.location}` : "na Slovensku";
  const title = `Realizácia: ${project.title} | BETONISSIMO.SK`;  
  // Обрезаем описание для Google (макс 160 символов)
  const description = project.description?.substring(0, 155) + "..." || `Pozrite si našu najnovšiu realizáciu betónového plotu ${locationText}. Prémiová kvalita a rýchla montáž.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      // Если есть фото, подтягиваем его в WhatsApp/Facebook, иначе дефолтное
      images: [
        {
          url: project.mainImage || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
  };
}

export default async function ProjectPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const project = await prisma.project.findUnique({
    where: { slug: slug },
  });

  if (!project) notFound();

  // 2. SCHEMA.ORG ДЛЯ ПРОЕКТА (CreativeWork / ImageGallery)
  // Это говорит Google: "Эй, это выполненная работа с кучей фоток"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.description,
    "image": project.mainImage || "https://beton-sk.vercel.app/og-image.jpg",
    "creator": {
      "@type": "Organization",
      "name": "BART Complex s.r.o."
    },
    "locationCreated": {
      "@type": "Place",
      "name": project.location || "Slovensko"
    },
    "genre": project.category || "Oplotenie"
  };

  return (
    <>
      {/* Внедряем JSON-LD скрыто от пользователя, только для роботов */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="bg-[#f8fafc] min-h-screen pt-32 md:pt-44 pb-24 font-sans text-slate-900 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
          
          {/* ВЕРХНЯЯ НАВИГАЦИЯ */}
          <Link 
            href="/realizacie" 
            className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#dc2626] mb-16 transition-colors duration-[800ms] group rounded-[2px]"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform duration-[800ms] ease-out" /> 
            Späť na zoznam projektov
          </Link>

          {/* ОСНОВНОЙ КОНТЕНТ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 border-t border-slate-200 pt-12 md:pt-16">
            
            {/* ЛЕВАЯ КОЛОНКА */}
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-[#dc2626]/10 text-[#dc2626] px-3 py-1 text-[10px] font-black uppercase tracking-[0.4em] rounded-[2px]">
                    // PROJEKT_ID: {project.id.toString().slice(-3).padStart(3, '0')}
                  </span>
                </div>
                {/* h1 остается главным ключом страницы */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] break-words">
                  {project.title}
                </h1>
              </div>

              <div className="max-w-3xl">
                <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium italic border-l-4 border-[#dc2626] pl-6 md:pl-8 whitespace-pre-wrap rounded-l-[2px]">
                  {project.description}
                </p>
              </div>
            </div>

            {/* ПРАВАЯ КОЛОНКА */}
            <div className="lg:col-span-4 relative z-10">
              <div className="relative bg-white p-8 md:p-10 rounded-[2px] shadow-xl transition-shadow duration-[800ms] hover:shadow-2xl overflow-hidden flex flex-col h-full">
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-100 pb-4 mb-10">
                  Technické údaje
                </h3>
                
                <div className="space-y-8 flex-1 relative z-10">
                  <div className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-[2px] shrink-0 transition-colors duration-[800ms] group-hover/item:bg-[#dc2626]/10">
                      <MapPin className="text-[#dc2626]" size={18} strokeWidth={2} />
                    </div>
                    <div className="pt-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokalita</p>
                      <p className="font-bold uppercase text-sm text-slate-900">{project.location || "Slovensko"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-[2px] shrink-0 transition-colors duration-[800ms] group-hover/item:bg-[#dc2626]/10">
                      <Box className="text-[#dc2626]" size={18} strokeWidth={2} />
                    </div>
                    <div className="pt-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategória</p>
                      <p className="font-bold uppercase text-sm text-slate-900">{project.category || "Oplotenie"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-[2px] shrink-0 transition-colors duration-[800ms] group-hover/item:bg-[#dc2626]/10">
                      <Calendar className="text-[#dc2626]" size={18} strokeWidth={2} />
                    </div>
                    <div className="pt-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dátum</p>
                      <p className="font-bold uppercase text-sm text-slate-900">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString('sk-SK') : "2024"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-[2px] shrink-0 transition-colors duration-[800ms] group-hover/item:bg-[#dc2626]/10">
                      <ShieldCheck className="text-[#dc2626]" size={18} strokeWidth={2} />
                    </div>
                    <div className="pt-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Záruka</p>
                      <p className="font-bold uppercase text-sm text-slate-900">10 ROKOV</p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 relative z-10">
                  <div className="bg-slate-900 text-white p-4 text-center text-[10px] font-black uppercase tracking-[0.3em] rounded-[2px] shadow-inner transition-colors duration-[800ms] hover:bg-black">
                    Certifikovaná kvalita
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ГАЛЕРЕЯ */}
          <div className="mt-24 border-t-2 border-slate-200 pt-16 relative">
            <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-black px-6 py-3 uppercase tracking-[0.4em] -translate-y-1/2 rounded-[2px] shadow-lg">
              Dokumentácia
            </div>
            
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-[#dc2626] pl-6 md:pl-8 rounded-l-[2px]">
                 <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                   Galéria realizácie
                 </h2>
              </div>
              
              <ProjectGallery images={project.images} title={project.title} />
            </div>
          </div>

          {/* ФУТЕР */}
          <div className="mt-32 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between gap-8 items-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                Elite Industrial Design System — All rights reserved
              </p>
              <Link 
                href="/kontakt" 
                className="group relative px-12 py-5 bg-[#dc2626] text-white font-black uppercase text-[10px] tracking-[0.3em] overflow-hidden rounded-[2px] shadow-lg hover:shadow-2xl transition-all duration-[800ms] block text-center"
              >
                <span className="relative z-10">Cenová ponuka</span>
                <span className="absolute inset-0 bg-slate-900 translate-y-full group-hover:translate-y-0 transition-transform duration-[800ms] ease-out z-0"></span>
              </Link>
          </div>
        </div>
      </div>
    </>
  );
}