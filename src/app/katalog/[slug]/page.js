import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getContent } from "@/actions/adminActions";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import CollectionGallery from "@/components/catalog/CollectionGallery"; // Убедись, что путь правильный
import { getSeo, imageAlt } from "@/lib/seo";
import { collectionSpecificationsSection, resolveCollectionSpecifications } from "@/lib/collection-specifications";

// 1. АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ МЕТАДАННЫХ ДЛЯ КАЖДОГО СТИЛЯ
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const collection = await prisma.collection.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!collection) return { title: "Katalóg nenájdený | Beton-SK" };

  const seo = await getSeo("collection", collection.id);
  const title = seo.title || `Katalóg: ${collection.title} | BETONISSIMO.SK`;
  const description = seo.description || (collection.description?.trim() ? collection.description.trim().slice(0, 155) : `Objavte našu prémiovú kolekciu betónových plotov ${collection.title}. ${collection.subtitle}.`);
  const url = `/katalog/${encodeURIComponent(collection.slug)}`;

  return {
    alternates: { canonical: url },
    title: { absolute: title },
    description: description,
    openGraph: {
      title: title,
      description: description,
      url,
      images: [
        {
          url: collection.mainImage || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: imageAlt(seo, collection.mainImage, `Betónový plot ${collection.title}`),
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
  const [seo, benefitsData, storedSpecifications] = await Promise.all([
    getSeo("collection", collection.id),
    getContent("global", "vyhody"),
    getContent("collection", collectionSpecificationsSection(collection.id)),
  ]);
  const specifications = resolveCollectionSpecifications(storedSpecifications, benefitsData);

  // Собираем картинки
  const allImages = collection.gallery?.length > 0
    ? collection.gallery
    : [collection.mainImage || "/uploads/default.webp"];

  return (
      <div className="bg-[#f8fafc] min-h-screen lg:h-screen pt-24 pb-8 selection:bg-red-100 font-sans lg:overflow-hidden flex flex-col">
        <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-8 flex-1 flex flex-col h-full">

          {/* NAVIGÁCIA - Industrial Style */}
          <Link
            href="/katalog"
            className="group inline-flex items-center gap-4 text-[10px] font-black text-slate-400 mb-6 hover:text-[#dc2626] transition-all tracking-[0.3em] uppercase shrink-0"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            {"// Späť_do_katalógu"}
          </Link>

          {/* SPLIT SCREEN LAYOUT */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 flex-1 h-full min-h-0">

            {/* LAVA ČASŤ: Галерея (Слайдер) */}
            <div className="lg:w-[55%] xl:w-[60%] h-[60vh] lg:h-full min-h-0 flex flex-col mb-4 lg:mb-0">
              <CollectionGallery images={allImages} title={collection.title} imageAlts={seo.imageAlts || {}} />
            </div>

            {/* PRAVÁ ČASŤ: Контент */}
            <div className="lg:w-[45%] xl:w-[40%] h-auto lg:h-full overflow-y-visible lg:overflow-y-auto pr-0 lg:pr-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pb-10">

              <div className="space-y-10">
                {/* Заголовок */}
                <div className="space-y-4">
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
                    <Zap size={14} className="shrink-0 text-[#dc2626] fill-[#dc2626]" />
                    <span className="min-w-0 break-words">{specifications.title}</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-6 relative z-10">
                    {specifications.items.map((item, index) => (
                      <div key={index} className={`flex min-w-0 flex-col gap-1 ${index > 1 ? "pt-4 border-t border-slate-100" : ""}`}>
                        <span className="break-words text-[9px] text-slate-400 uppercase font-black tracking-widest">{item.label}</span>
                        <span className={`break-words text-base font-black uppercase tracking-tighter font-mono ${index === 0 ? "text-slate-900" : index === 3 ? "max-w-full text-white bg-[#dc2626] px-2 py-1 rounded-[2px] w-fit" : "text-[#dc2626]"}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
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

                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
  );
}
