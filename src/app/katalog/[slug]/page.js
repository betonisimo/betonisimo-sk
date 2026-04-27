import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getContent } from "@/actions/adminActions";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import CollectionGallery from "@/components/catalog/CollectionGallery"; // Убедись, что путь правильный

// 1. АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ МЕТАДАННЫХ ДЛЯ КАЖДОГО СТИЛЯ
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const collection = await prisma.collection.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!collection) return { title: "Katalóg nenájdený | Beton-SK" };

  const title = `Katalóg: ${collection.title} | BETONISSIMO.SK`;
  const description = collection.description?.substring(0, 155) + "..." || `Objavte našu prémiovú kolekciu betónových plotov ${collection.title}. ${collection.subtitle}. Kvalita a dizajn, ktorý vydrží.`;

  return {
    metadataBase: new URL('https://betonissimo.sk'),
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: collection.mainImage || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Betónový plot ${collection.title}`,
        },
      ],
    },
  };
}

export default async function CollectionPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const collection = await prisma.collection.findUnique({
    where: { slug: slug },
  });

  if (!collection) notFound();

  const benefitsData = await getContent("global", "vyhody");
  const b = benefitsData || {
    b1_title: "Zameranie plotu", b1_val: "ZDARMA",
    b2_title: "Odborné poradenstvo", b2_val: "ZDARMA",
    b3_title: "Cenová kalkulácia", b3_val: "ZDARMA",
    b4_title: "Akciová zľava", b4_val: "-15%"
  };

  // Собираем картинки
  const allImages = collection.gallery?.length > 0
    ? collection.gallery
    : [collection.mainImage || "/uploads/default.webp"];

  // 2. SCHEMA.ORG ДЛЯ ПРОДУКТА
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Betónový plot - ${collection.title}`,
    "image": collection.mainImage || "https://betonissimo.sk/og-image.jpg",
    "description": collection.description,
    "brand": {
      "@type": "Brand",
      "name": "BETONISSIMO.SK"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "BART Complex s.r.o."
      }
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ГЛАВНЫЙ КОНТЕЙНЕР: min-h-screen для мобилок, h-screen для ПК */}
      <div className="bg-[#f8fafc] min-h-screen lg:h-screen pt-24 pb-8 selection:bg-red-100 font-sans lg:overflow-hidden flex flex-col">
        <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-8 flex-1 flex flex-col h-full">

          {/* NAVIGÁCIA - Industrial Style */}
          <Link
            href="/katalog"
            className="group inline-flex items-center gap-4 text-[10px] font-black text-slate-400 mb-6 hover:text-[#dc2626] transition-all tracking-[0.3em] uppercase shrink-0"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            // Späť_do_katalógu
          </Link>

          {/* SPLIT SCREEN LAYOUT */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 flex-1 h-full min-h-0">

            {/* LAVA ČASŤ: Галерея (Слайдер) */}
            <div className="lg:w-[55%] xl:w-[60%] h-[60vh] lg:h-full min-h-0 flex flex-col mb-4 lg:mb-0">
              <CollectionGallery images={allImages} title={collection.title} />
            </div>

            {/* PRAVÁ ČASŤ: Контент */}
            <div className="lg:w-[45%] xl:w-[40%] h-auto lg:h-full overflow-y-visible lg:overflow-y-auto pr-0 lg:pr-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pb-10">

              <div className="space-y-10">
                {/* Заголовок */}
                <div className="space-y-4">
                  <p className="text-[#dc2626] font-black uppercase tracking-[0.5em] text-[10px] mb-2">// Collection_Module</p>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
                    {collection.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="h-[2px] w-12 bg-slate-200"></div>
                    <p className="text-lg font-bold text-slate-400 uppercase tracking-tight italic">
                      {collection.subtitle}
                    </p>
                  </div>
                </div>

                {/* Описание */}
                <div className="prose prose-slate max-w-none">
                  {/* whitespace-pre-wrap сохраняет абзацы из базы */}
                  <p className="text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {collection.description}
                  </p>
                </div>

                {/* ŠTANDARD KVALITY - Технический блок */}
                <div className="bg-white p-6 rounded-[2px] shadow-lg border-l-4 border-[#dc2626] relative overflow-hidden mt-8">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <ShieldCheck size={100} strokeWidth={1} />
                  </div>

                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center gap-3">
                    <Zap size={14} className="text-[#dc2626] fill-[#dc2626]" /> Technical_Specifications
                  </h3>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-6 relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{b.b1_title}</span>
                      <span className="text-base font-black text-slate-900 uppercase tracking-tighter font-mono">{b.b1_val}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{b.b2_title}</span>
                      <span className="text-base font-black text-[#dc2626] uppercase tracking-tighter font-mono">{b.b2_val}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{b.b3_title}</span>
                      <span className="text-base font-black text-[#dc2626] uppercase tracking-tighter font-mono">{b.b3_val}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{b.b4_title}</span>
                      <span className="text-base font-black text-white bg-[#dc2626] px-2 py-1 rounded-[2px] w-fit font-mono">
                        {b.b4_val}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="pt-8 flex flex-col 2xl:flex-row gap-4">
                  <Link
                    href="/kontakt"
                    className="group relative inline-flex items-center justify-center bg-slate-900 text-white px-8 py-5 rounded-[2px] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl hover:bg-[#dc2626] active:scale-95 overflow-hidden flex-1"
                  >
                    <span className="relative z-10">Mám záujem o realizáciu</span>
                    <div className="absolute inset-0 bg-[#dc2626] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </Link>

                  <div className="flex items-center px-4 py-4 border border-slate-200 bg-white rounded-[2px] justify-center">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.2em]">
                      Status: <span className="text-green-500 font-black ml-2">Available</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}