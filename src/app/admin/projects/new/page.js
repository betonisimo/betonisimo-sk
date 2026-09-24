import { createProject } from "@/actions/adminActions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import ImagePicker from "@/components/admin/ImagePicker";
import MultiImagePicker from "@/components/admin/MultiImagePicker";
import SeoFields from "@/components/admin/SeoFields";

export default function NewProjectPage() {

  async function handleSave(formData) {
    "use server";
    const data = {
      title: formData.get("title"),
      category: formData.get("category"),
      location: formData.get("location"),
      description: formData.get("description"),
      mainImage: formData.get("mainImage"),
      images: formData.get("images"), 
      mainImageAlt: formData.get("mainImageAlt"),
      imageAlts: formData.get("imageAlts"),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
    };
    const result = await createProject(data);
    if (!result.success) throw new Error(result.error || "Projekt sa nepodarilo uložiť.");
    
    revalidatePath("/");
    revalidatePath("/realizacie");
    revalidatePath("/admin/editor");
    redirect("/admin/editor#realizacie");
  }

  return (
    /* ИСПРАВЛЕНО: pt-32 для мобильных, md:pt-48 для десктопа */
    <div className="min-h-screen bg-[#F2F2F2] pt-32 md:pt-48 pb-24 px-6 font-sans text-black selection:bg-red-600 selection:text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* BACK LINK */}
        <Link 
          href="/admin/editor#realizacie" 
          className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-red-600 mb-10 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
          // Terminal_Back / Editor_Exit
        </Link>

        <div className="bg-white border border-black rounded-none shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>

          <form action={handleSave}>
            
            {/* ГЛАВНОЕ ФОТО */}
            <div className="border-b border-black">
              <div className="bg-slate-50 p-4 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-black flex justify-between items-center">
                <span>// Titulná_fotografia_projektu</span>
                <span className="text-[8px] opacity-50 font-mono text-black">Status: Awaiting_Data</span>
              </div>
              <ImagePicker defaultValue="" />
            </div>

            <div className="p-8 md:p-16 space-y-12">
              {/* HEADER */}
              <div className="border-l-4 border-red-600 pl-8">
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
                  Nová <br />
                  <span className="text-red-600">Realizácia</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-6">
                  System_Entry: Pridanie nového záznamu do portfólia
                </p>
              </div>

              {/* INPUT GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Názov projektu</label>
                  <input 
                    name="title" 
                    required 
                    placeholder="NAPR. OPLOTENIE_DOMU_DUN_STREDA" 
                    className="w-full bg-slate-50 border-b-2 border-slate-200 px-4 py-4 text-black font-bold uppercase focus:border-red-600 focus:bg-white outline-none transition-all placeholder:text-slate-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Kategória / Štýl</label>
                  <input 
                    name="category" 
                    required 
                    placeholder="MODERNÉ LÍNIE" 
                    className="w-full bg-slate-50 border-b-2 border-slate-200 px-4 py-4 text-black font-bold uppercase focus:border-red-600 focus:bg-white outline-none transition-all placeholder:text-slate-200" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Lokalita</label>
                  <input 
                    name="location" 
                    placeholder="MESTO" 
                    className="w-full bg-slate-50 border-b-2 border-slate-200 px-4 py-4 text-black font-bold uppercase focus:border-red-600 focus:bg-white outline-none transition-all placeholder:text-slate-200" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Technický popis</label>
                  <textarea 
                    name="description" 
                    required 
                    rows={6} 
                    placeholder="DETAILNÁ ŠPECIFIKÁCIA REALIZÁCIE..." 
                    className="w-full bg-slate-50 border border-slate-200 p-6 text-black font-medium focus:border-red-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 resize-none" 
                  />
                </div>

                {/* GALÉRIA */}
                <div className="md:col-span-2 pt-10 border-t border-black">
                   <div className="mb-6 flex items-center justify-between">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">// Foto_Galéria_Projektu</label>
                      <span className="text-[9px] text-slate-300 font-mono italic">Limit: 12_Images</span>
                   </div>
                   <MultiImagePicker defaultValue={[]} />
                </div>
              </div>

              <SeoFields />

              {/* SAVE BUTTON */}
              <div className="pt-12 mt-12 border-t border-black flex justify-end">
                <button 
                  type="submit" 
                  className="group relative px-16 py-6 bg-black text-white font-black uppercase text-xs tracking-[0.4em] overflow-hidden transition-all shadow-xl active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    <Save size={18} /> Save
                  </span>
                  <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
