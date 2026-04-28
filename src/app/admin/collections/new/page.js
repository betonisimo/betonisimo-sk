"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCollection } from "@/actions/adminActions";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import GalleryPicker from "@/components/admin/GalleryPicker";

export default function NewCollectionPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false); // Стейт для блокировки кнопки

  async function handleSubmit(event) {
    event.preventDefault(); // Останавливаем стандартную перезагрузку страницы

    if (isSaving) return; // Защита: если уже сохраняем, игнорируем новые клики
    setIsSaving(true); // Блокируем кнопку

    const formData = new FormData(event.target);
    const data = {
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
      gallery: formData.get("gallery"),
      description: formData.get("description"),
    };

    try {
      await createCollection(data);
      router.refresh(); // Сбрасываем кэш, чтобы новые данные появились в админке
      router.push("/admin/editor#kolekcie"); // Перенаправляем пользователя
    } catch (error) {
      console.error("Chyba:", error);
      alert("Nastala chyba pri ukladaní.");
      setIsSaving(false); // Разблокируем кнопку, если произошла ошибка
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-32 md:pt-44 pb-24 px-6 font-sans text-black">
      <div className="max-w-4xl mx-auto">
        
        <Link 
          href="/admin/editor#kolekcie" 
          className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black mb-12 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
          Back_to_System / Collections
        </Link>

        <div className="bg-white border border-black rounded-none shadow-2xl overflow-hidden">
          {/* Меняем action на onSubmit */}
          <form onSubmit={handleSubmit}>
            
            <div className="border-b border-black">
              <div className="bg-slate-50 p-4 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-black font-mono">
                // Galéria_Katalogu
              </div>
              <div className="p-6">
                <GalleryPicker defaultImages={[]} />
              </div>
            </div>

            <div className="p-8 md:p-16 space-y-12">
              <div className="border-l-4 border-red-600 pl-8">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                  Nový <span className="text-red-600">katalog</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                  Definovanie nového dizajnového štýlu do katalógu
                </p>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Názov kolekcie</label>
                    <input 
                      name="title" 
                      required 
                      placeholder="NAPR. MODERNÉ LÍNIE" 
                      className="w-full bg-slate-50 border-b-2 border-slate-200 px-0 py-4 text-black font-bold uppercase focus:border-red-600 outline-none transition-all placeholder:text-slate-200" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Podnadpis (Slogan)</label>
                    <input 
                      name="subtitle" 
                      required 
                      placeholder="NAPR. MINIMALIZMUS A ČISTOTA" 
                      className="w-full bg-slate-50 border-b-2 border-slate-200 px-0 py-4 text-black font-bold uppercase focus:border-red-600 outline-none transition-all placeholder:text-slate-200" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Technický popis (katalog Info)</label>
                  <textarea 
                    name="description" 
                    required 
                    rows={8} 
                    placeholder="DETAILNÁ ŠPECIFIKÁCIA ARCHITEKTONICKÉHO RIEŠENIA..." 
                    className="w-full bg-slate-50 border border-slate-200 p-6 text-black font-medium focus:border-red-600 outline-none transition-all placeholder:text-slate-200 resize-none" 
                  />
                </div>
              </div>

              <div className="pt-12 mt-12 border-t border-black flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="group relative px-12 py-6 bg-black text-white font-black uppercase text-xs tracking-[0.3em] overflow-hidden transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {/* Меняем иконку и текст в зависимости от стейта */}
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                    {isSaving ? "Vytváram..." : "Vytvoriť kolekciu"}
                  </span>
                  {/* Прячем красный фон при наведении, если кнопка заблокирована */}
                  {!isSaving && <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}