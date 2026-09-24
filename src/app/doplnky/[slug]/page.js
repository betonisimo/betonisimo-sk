import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { getContent } from "@/actions/adminActions";
import CollectionGallery from "@/components/catalog/CollectionGallery";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";
import { getSeo, imageAlt } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const accessory = await prisma.accessory.findUnique({ where: { slug } });

  if (!accessory) return { title: "Doplnok nebol nájdený | BETONISSIMO.SK" };

  const seo = await getSeo("accessory", accessory.id);
  const title = seo.title || `${accessory.title} – doplnok k oploteniu | BETONISSIMO.SK`;
  const description = seo.description || accessory.description?.slice(0, 155) || `${accessory.title} – kvalitný doplnok k betónovému oploteniu.`;
  const url = `/doplnky/${encodeURIComponent(accessory.slug)}`;

  return {
    alternates: { canonical: url },
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{
        url: accessory.mainImage || "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: imageAlt(seo, accessory.mainImage, accessory.title),
      }],
    },
  };
}

export default async function AccessoryPage({ params }) {
  const { slug } = await params;
  const accessory = await prisma.accessory.findUnique({ where: { slug } });

  if (!accessory) notFound();
  const seo = await getSeo("accessory", accessory.id);

  const benefitsData = await getContent("global", "vyhody");
  const benefits = benefitsData || {
    b1_title: "Odborné poradenstvo", b1_val: "ZDARMA",
    b2_title: "Overená kvalita", b2_val: "GARANCIA",
    b3_title: "Dostupnosť", b3_val: "NA DOTAZ",
    b4_title: "Montáž", b4_val: "DOHODOU",
  };

  const images = accessory.gallery?.length > 0
    ? accessory.gallery
    : [accessory.mainImage || "/og-image.jpg"];
  const price = accessory.price.toString();
  const formattedPrice = new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: accessory.title,
    image: accessory.mainImage || `${SITE_URL}/og-image.jpg`,
    description: accessory.description,
    brand: {
      "@type": "Brand",
      name: "BETONISSIMO.SK",
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "BART Complex s.r.o.",
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex min-h-screen flex-col bg-[#f8fafc] pb-8 pt-24 font-sans selection:bg-red-100 lg:h-screen lg:overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1600px] flex-1 flex-col px-6 lg:px-8">
          <Link
            href="/doplnky"
            className="group mb-6 inline-flex shrink-0 items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 transition-all hover:text-[#dc2626]"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-2" />
            {"// Späť_na_doplnky"}
          </Link>

          <div className="flex h-full min-h-0 flex-1 flex-col gap-8 lg:flex-row lg:gap-16">
            <div className="mb-4 flex h-[60vh] min-h-0 flex-col lg:mb-0 lg:h-full lg:w-[55%] xl:w-[60%]">
              <CollectionGallery images={images} title={accessory.title} imageAlts={seo.imageAlts || {}} />
            </div>

            <div className="h-auto overflow-y-visible pb-10 pr-0 lg:h-full lg:w-[45%] lg:overflow-y-auto lg:pr-4 xl:w-[40%]">
              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.5em] text-[#dc2626]">{"// Accessory_Module"}</p>
                  <h1 className="text-4xl font-black uppercase leading-[0.85] tracking-tighter text-slate-900 md:text-6xl lg:text-7xl">
                    {accessory.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="h-[2px] w-12 bg-slate-200" />
                    <p className="text-lg font-bold uppercase tracking-tight text-slate-400 italic">
                      {accessory.subtitle}
                    </p>
                  </div>

                  <div className="flex w-fit items-center gap-3 rounded-[2px] bg-slate-900 px-5 py-3 text-white shadow-lg">
                    <ShoppingBag size={18} className="text-[#dc2626]" />
                    <span className="text-2xl font-black tracking-tight">{formattedPrice}</span>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-slate-600">
                    {accessory.description}
                  </p>
                </div>

                <div className="relative mt-8 overflow-hidden rounded-[2px] border-l-4 border-[#dc2626] bg-white p-6 shadow-lg">
                  <div className="absolute right-0 top-0 p-4 opacity-[0.03]">
                    <ShieldCheck size={100} strokeWidth={1} />
                  </div>
                  <h2 className="mb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                    <Zap size={14} className="fill-[#dc2626] text-[#dc2626]" /> Accessory_Specifications
                  </h2>

                  <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-6">
                    {[
                      [benefits.b1_title, benefits.b1_val],
                      [benefits.b2_title, benefits.b2_val],
                      [benefits.b3_title, benefits.b3_val],
                      [benefits.b4_title, benefits.b4_val],
                    ].map(([label, value], index) => (
                      <div key={label} className={`flex flex-col gap-1 ${index > 1 ? "border-t border-slate-100 pt-4" : ""}`}>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                        <span className="font-mono text-base font-black uppercase tracking-tighter text-[#dc2626]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-8 2xl:flex-row">
                  <Link
                    href="/kontakt"
                    className="group relative inline-flex flex-1 items-center justify-center overflow-hidden rounded-[2px] bg-slate-900 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-[#dc2626] active:scale-95"
                  >
                    <span className="relative z-10">Mám záujem o doplnok</span>
                    <span className="absolute inset-0 translate-y-full bg-[#dc2626] transition-transform duration-500 group-hover:translate-y-0" />
                  </Link>
                  <div className="flex items-center justify-center rounded-[2px] border border-slate-200 bg-white px-4 py-4">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                      Cena: <span className="ml-2 font-black text-slate-900">{formattedPrice}</span>
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
