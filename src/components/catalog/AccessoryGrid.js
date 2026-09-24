import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, PackageOpen } from "lucide-react";

function formatPrice(price) {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price));
}

export default function AccessoryGrid({ accessories }) {
  return (
    <section className="border-b border-slate-200 bg-[#f8fafc] py-24 font-sans lg:py-40">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-20 flex flex-col gap-10 border-l-4 border-[#dc2626] pl-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="mb-6 block text-[10px] font-black uppercase tracking-[0.4em] text-[#dc2626]">
              Katalóg doplnkov
            </span>
            <h1 className="text-5xl font-black uppercase leading-[0.85] tracking-tighter text-slate-900 md:text-8xl">
              Vyberte si <br />
              naše <span className="text-[#dc2626]">doplnky</span>
            </h1>
          </div>
          <p className="max-w-sm text-sm font-medium uppercase leading-relaxed tracking-tight text-slate-500">
            {"// Funkčné a dizajnové prvky pre vaše oplotenie."} <br />
            {"// Precízne spracovanie a dlhá životnosť."}
          </p>
        </div>

        {accessories?.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {accessories.map((accessory, index) => (
              <Link
                href={`/doplnky/${accessory.slug}`}
                key={accessory.id}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2px] border border-slate-200/50 bg-slate-900 transition-shadow duration-500 hover:shadow-2xl"
              >
                <Image
                  src={accessory.mainImage || "/og-image.jpg"}
                  alt={accessory.seo?.imageAlts?.[accessory.mainImage] || `${accessory.title} - doplnok k oploteniu`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="z-0 object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />

                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-80" />

                <div className="absolute left-6 top-6 z-20 rounded-[2px] bg-black/40 px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-white/70 backdrop-blur-sm transition-colors duration-500 group-hover:bg-[#dc2626] group-hover:text-white">
                  DP_{String(index + 1).padStart(2, "0")}
                </div>

                <div className="relative z-20 flex flex-col p-6 md:p-8">
                  <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-white transition-transform duration-500 group-hover:-translate-y-1 md:text-4xl">
                    {accessory.title}
                  </h2>
                  <p className="mb-4 mt-3 text-[9px] font-black uppercase tracking-[0.3em] text-[#dc2626] drop-shadow-md">
                    {accessory.subtitle}
                  </p>

                  <div className="mb-5 w-fit rounded-[2px] bg-white px-3 py-2 text-xl font-black tracking-tight text-slate-900">
                    {formatPrice(accessory.price)}
                  </div>

                  <ul className="mb-6 space-y-2">
                    {["Kompatibilné riešenie", "Odolné materiály", "Precízne spracovanie"].map((text) => (
                      <li key={text} className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/80">
                        <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-[1px] bg-[#dc2626] text-white">
                          <Check size={8} strokeWidth={4} />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>

                  <div className="flex w-fit items-center gap-3 border-t border-white/20 pt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-colors duration-300 group-hover:text-[#dc2626]">
                    Zobraziť detail
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>

                <span className="absolute bottom-0 left-0 z-30 h-[3px] w-0 bg-[#dc2626] transition-all duration-500 ease-out group-hover:w-full" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-slate-300 bg-white p-10 text-center">
            <PackageOpen size={40} className="mb-4 text-[#dc2626]" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Doplnky pripravujeme</h2>
            <p className="mt-2 text-sm text-slate-500">Ponuku doplnkov čoskoro rozšírime.</p>
          </div>
        )}
      </div>
    </section>
  );
}
