"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createAccessory } from "@/actions/adminActions";
import GalleryPicker from "@/components/admin/GalleryPicker";
import SeoFields from "@/components/admin/SeoFields";

export default function NewAccessoryPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const result = await createAccessory({
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
      price: formData.get("price"),
      gallery: formData.get("gallery"),
      description: formData.get("description"),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
      imageAlts: formData.get("imageAlts"),
    });

    if (!result.success) {
      alert(result.error || "Doplnok sa nepodarilo uložiť.");
      setIsSaving(false);
      return;
    }

    router.push("/admin/editor#doplnky");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] px-6 pb-24 pt-32 font-sans text-black md:pt-44">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/editor#doplnky"
          className="group mb-12 inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 transition-colors hover:text-black"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-2" />
          Back_to_System / Doplnky
        </Link>

        <div className="overflow-hidden border border-black bg-white shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="border-b border-black">
              <div className="border-b border-black bg-slate-50 p-4 font-mono text-[9px] font-black uppercase tracking-widest text-slate-400">
                {"// Galéria_Doplnku"}
              </div>
              <div className="p-6">
                <GalleryPicker defaultImages={[]} />
              </div>
            </div>

            <div className="space-y-12 p-8 md:p-16">
              <div className="border-l-4 border-red-600 pl-8">
                <h1 className="text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">
                  Nový <span className="text-red-600">doplnok</span>
                </h1>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Pridanie nového príslušenstva do katalógu
                </p>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Názov doplnku</label>
                    <input
                      name="title"
                      required
                      placeholder="NAPR. LED OSVETLENIE"
                      className="w-full border-b-2 border-slate-200 bg-slate-50 px-0 py-4 font-bold uppercase text-black outline-none transition-all placeholder:text-slate-200 focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Podnadpis</label>
                    <input
                      name="subtitle"
                      required
                      placeholder="NAPR. MODERNÉ OSVETLENIE PLOTU"
                      className="w-full border-b-2 border-slate-200 bg-slate-50 px-0 py-4 font-bold uppercase text-black outline-none transition-all placeholder:text-slate-200 focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Cena (€)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    required
                    placeholder="0.00"
                    className="w-full border-b-2 border-slate-200 bg-slate-50 px-0 py-4 text-2xl font-black text-black outline-none transition-all placeholder:text-slate-200 focus:border-red-600 md:w-1/2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Popis doplnku</label>
                  <textarea
                    name="description"
                    required
                    rows={8}
                    placeholder="DETAILNÝ POPIS DOPLNKU, MATERIÁLU A POUŽITIA..."
                    className="w-full resize-none border border-slate-200 bg-slate-50 p-6 font-medium text-black outline-none transition-all placeholder:text-slate-200 focus:border-red-600"
                  />
                </div>
              </div>

              <SeoFields />

              <div className="mt-12 flex justify-end border-t border-black pt-12">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="group relative overflow-hidden bg-black px-12 py-6 text-xs font-black uppercase tracking-[0.3em] text-white transition-all disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Ukladám..." : "Vytvoriť doplnok"}
                  </span>
                  {!isSaving && <span className="absolute inset-0 translate-y-full bg-red-600 transition-transform duration-500 group-hover:translate-y-0" />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
