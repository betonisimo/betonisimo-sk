import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getContent } from "@/actions/adminActions";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

// 1. АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ МЕТАДАННЫХ ДЛЯ КАЖДОГО СТИЛЯ
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const collection = await prisma.collection.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!collection) return { title: "Kolekcia nenájdená | Beton-SK" };

  // SEO-Заголовок с ключевыми словами
  const title = `Betónový plot: Kolekcia ${collection.title} | Beton-SK`;
  
  // Описание для Google (до 160 символов)
  const description = collection.description?.substring(0, 155) + "..." || `Objavte našu prémiovú kolekciu betónových plotov ${collection.title}. ${collection.subtitle}. Kvalita a dizajn, ktorý vydrží.`;

  return {
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

  // 2. SCHEMA.ORG ДЛЯ ПРОДУКТА (СКАЖЕМ GOOGLE, ЧТО ЭТО МОЖНО КУПИТЬ)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Betónový plot - Kolekcia ${collection.title}`,
    "image": collection.mainImage || "https://beton-sk.vercel.app/og-image.jpg",
    "description": collection.description,
    "brand": {
      "@type": "Brand",
      "name": "Beton-SK"
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
      {/* Скрытый JSON-LD код для поисковых роботов */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="bg-[#f8fafc] min-h-screen pt-32 pb-20 selection:bg-red-100 font-sans">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          {/* NAVIGÁCIA - Industrial Style */}
          <Link 
            href="/#kolekcie" 
            className="group inline-flex items-center gap-4 text-[10px] font-black text-slate-400 mb-12 hover:text-[#dc2626] transition-all tracking-[0.3em] uppercase"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
            // Späť_na_kolekcie
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            
            {/* LAVA ČASŤ: Media & Specs */}
            <div className="lg:col-span-5 space-y-8">
              {/* HLAVNÝ OBRÁZOK S MARKERMI */}
              <div className="relative group">
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#dc2626] z-10"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#dc2626] z-10"></div>
                
                <div className="relative aspect-square overflow-hidden bg-slate-200 rounded-[2px] shadow-2xl">
                  <img
                    src={collection.mainImage}
                    // 3. ДОБАВИЛИ КЛЮЧЕВОЕ СЛОВО "Betónový plot" ДЛЯ GOOGLE IMAGES
                    alt={`Prémiový betónový plot - Kolekcia ${collection.title}`}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
              
              {/* ŠTANDARD KVALITY - Technický blok */}
              <div className="bg-white p-8 rounded-[2px] shadow-xl border-l-4 border-[#dc2626] relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <ShieldCheck size={120} strokeWidth={1} />
                 </div>
                 
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 flex items-center gap-3">
                  <Zap size={14} className="text-[#dc2626] fill-[#dc2626]" /> Technical_Specifications
                </h3>

                <div className="grid grid-cols-2 gap-y-8 gap-x-10 relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{b.b1_title}</span>
                    <span className="text-lg font-black text-slate-900 uppercase tracking-tighter font-mono">{b.b1_val}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{b.b2_title}</span>
                    <span className="text-lg font-black text-[#dc2626] uppercase tracking-tighter font-mono">{b.b2_val}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{b.b3_title}</span>
                    <span className="text-lg font-black text-[#dc2626] uppercase tracking-tighter font-mono">{b.b3_val}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{b.b4_title}</span>
                    <span className="text-lg font-black text-white bg-[#dc2626] px-3 py-1 rounded-[2px] w-fit font-mono">
                      {b.b4_val}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRAVÁ ČASŤ: Content */}
            <div className="lg:col-span-7 pt-4">
              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-[#dc2626] font-black uppercase tracking-[0.5em] text-[10px] mb-2">// Collection_Module</p>
                  <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
                    {collection.title}
                  </h1>
                  <div className="flex items-center gap-4">
                      <div className="h-[2px] w-12 bg-slate-200"></div>
                      <p className="text-xl font-bold text-slate-400 uppercase tracking-tight italic">
                        {collection.subtitle}
                      </p>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-xl text-slate-600 leading-relaxed font-medium">
                    {collection.description}
                  </p>
                </div>

                <div className="pt-10 flex flex-col sm:flex-row gap-6">
                  <Link 
                    href="/kontakt" 
                    className="group relative inline-flex items-center justify-center bg-slate-900 text-white px-12 py-6 rounded-[2px] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl hover:bg-[#dc2626] active:scale-95 overflow-hidden"
                  >
                    <span className="relative z-10">Mám záujem o realizáciu</span>
                    <div className="absolute inset-0 bg-[#dc2626] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </Link>
                  
                  <div className="flex items-center px-6 py-4 border border-slate-200 bg-white rounded-[2px]">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.2em]">
                          Status: <span className="text-green-500 font-black">Available_For_Order</span>
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