import { prisma } from "@/lib/prisma";
import { updateProject, deleteProject } from "@/actions/adminActions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import ImagePicker from "@/components/admin/ImagePicker";
import MultiImagePicker from "@/components/admin/MultiImagePicker";
import SeoFields from "@/components/admin/SeoFields";
import { getSeo } from "@/lib/seo";

export default async function EditProjectPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const project = await prisma.project.findUnique({
    where: { id: Number(id) }
  });

  if (!project) return <div className="pt-40 text-center font-black uppercase tracking-widest text-red-600 text-xs">Projekt nebol nájdený // 404</div>;
  const seo = await getSeo("project", project.id);

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
    const result = await updateProject(id, data);
    if (!result.success) throw new Error(result.error || "Projekt sa nepodarilo uložiť.");
    revalidatePath("/admin/editor");
    revalidatePath("/realizacie");
    revalidatePath(`/projekt/${project.slug}`);
    redirect("/admin/editor#realizacie");
  }

  async function handleDelete() {
    "use server";
    await deleteProject(id);
    revalidatePath("/admin/editor");
    revalidatePath("/realizacie");
    redirect("/admin/editor#realizacie");
  }

  return (
    /* УМЕНЬШЕННЫЙ ОТСТУП: pt-24 для мобилок, md:pt-32 для десктопа */
    <div className="min-h-screen bg-[#F2F2F2] pt-24 md:pt-32 pb-24 px-6 font-sans text-black selection:bg-red-600 selection:text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* BACK LINK */}
        <Link 
          href="/admin/editor#realizacie" 
          className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-red-600 mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
          // Späť_do_editora
        </Link>

        <div className="bg-white border border-black rounded-none shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>

          <form action={handleSave}>
            
            {/* ГЛАВНОЕ ФОТО */}
            <div className="border-b border-black">
              <div className="bg-slate-50 p-4 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-black flex justify-between items-center">
                <span>// Titulná_fotografia</span>
                <span className="text-[8px] font-mono text-black">ID: {id}</span>
              </div>
              <ImagePicker defaultValue={project.mainImage} defaultAlt={seo.imageAlts?.[project.mainImage] || ""} />
            </div>

            <div className="p-8 md:p-14 space-y-10">
              
              {/* HEADER */}
              <div className="border-l-4 border-red-600 pl-8">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                  Upraviť <span className="text-red-600">Projekt</span>
                </h1>
              </div>

              {/* INPUT GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Názov projektu</label>
                  <input 
                    name="title" 
                    defaultValue={project.title} 
                    required
                    className="w-full bg-slate-50 border-b-2 border-slate-200 px-4 py-3 text-black font-bold uppercase focus:border-red-600 focus:bg-white outline-none transition-all" 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Štýl / Kategória</label>
                  <input 
                    name="category" 
                    defaultValue={project.category} 
                    required
                    className="w-full bg-slate-50 border-b-2 border-slate-200 px-4 py-3 text-black font-bold uppercase focus:border-red-600 focus:bg-white outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lokalita</label>
                  <input 
                    name="location" 
                    defaultValue={project.location || ""} 
                    className="w-full bg-slate-50 border-b-2 border-slate-200 px-4 py-3 text-black font-bold uppercase focus:border-red-600 focus:bg-white outline-none transition-all" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Popis</label>
                  <textarea 
                    name="description" 
                    defaultValue={project.description} 
                    required
                    rows={5} 
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-black font-medium focus:border-red-600 focus:bg-white outline-none transition-all resize-none" 
                  />
                </div>

                {/* ГАЛЕРЕЯ */}
                <div className="md:col-span-2 pt-8 border-t border-slate-100">
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono mb-6">// Foto_Galéria</label>
                   <MultiImagePicker defaultValue={project.images || []} defaultAlts={seo.imageAlts || {}} />
                </div>
              </div>

              <SeoFields seo={seo} />

              {/* ACTION BUTTONS */}
              <div className="pt-10 mt-10 border-t border-black flex flex-col sm:flex-row justify-between items-center gap-6">
                <button 
                  formAction={handleDelete}
                  className="w-full sm:w-auto px-6 py-4 text-[#dc2626] font-black uppercase text-[9px] tracking-[0.3em] hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Zmazať_Záznam
                </button>
                
                <button 
                  type="submit" 
                  className="w-full sm:w-auto group relative px-14 py-5 bg-black text-white font-black uppercase text-[11px] tracking-[0.3em] overflow-hidden transition-all shadow-xl active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    <Save size={18} /> Uložiť_Zmeny
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
