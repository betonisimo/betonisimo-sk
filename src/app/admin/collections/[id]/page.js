import { prisma } from "@/lib/prisma";
import { updateCollection, deleteCollection } from "@/actions/adminActions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import GalleryPicker from "@/components/admin/GalleryPicker"; // ИМПОРТ НОВОГО КОМПОНЕНТА

export default async function EditCollectionPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const collection = await prisma.collection.findUnique({
    where: { id: Number(id) }
  });

  if (!collection) return <div>katalog nebol nájdeni</div>;

  async function handleSave(formData) {
    "use server";
    const data = {
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
      gallery: formData.get("gallery"), // БЕРЕМ СТРОКУ ИЗ GALLERY PICKER
      description: formData.get("description"),
    };
    await updateCollection(id, data);
    revalidatePath("/admin/editor");
    revalidatePath(`/katalog/${collection.slug}`);
    redirect("/admin/editor#kolekcie");
  }

  async function handleDelete() {
    "use server";
    await deleteCollection(id);
    revalidatePath("/admin/editor");
    redirect("/admin/editor#kolekcie");
  }

  // Подготавливаем картинки: если есть массив, берем его, иначе берем mainImage как первый элемент
  const defaultGallery = collection.gallery?.length > 0 
    ? collection.gallery 
    : (collection.mainImage ? [collection.mainImage] : []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-black">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/editor#kolekcie" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-medium transition-colors">
          <ArrowLeft size={20} /> Späť do editora
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <form action={handleSave}>
            
            {/* ИСПОЛЬЗУЕМ НОВЫЙ GALLERY PICKER С ДАННЫМИ ИЗ БАЗЫ */}
            <div className="border-b border-slate-200 bg-slate-50 p-6">
               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Galéria obrázkov</label>
               <GalleryPicker defaultImages={defaultGallery} />
            </div>

            <div className="p-8 md:p-12 space-y-6">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h1 className="text-3xl font-black text-slate-900">Upraviť kolekciu</h1>
                  <p className="text-slate-500">Zmeňte detaily a technológiu výroby</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Názov kolekcie</label>
                  <input 
                    name="title" 
                    defaultValue={collection.title} 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Podnadpis (Krátky popis)</label>
                  <input 
                    name="subtitle" 
                    defaultValue={collection.subtitle} 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Technológia (Dlhý text)</label>
                  <textarea 
                    name="description" 
                    defaultValue={collection.description} 
                    required
                    rows={8} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 transition-all outline-none" 
                  />
                </div>
              </div>

              {/* Кнопки */}
              <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
                <button 
                  formAction={handleDelete}
                  className="px-6 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={20} /> Vymazať
                </button>
                
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-lg flex items-center gap-2"
                >
                  <Save size={20} /> Uložiť zmeny
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}